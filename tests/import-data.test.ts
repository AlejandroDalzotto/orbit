import { afterEach, expect, spyOn, test } from "bun:test";
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useCommitImport, useImportTemplates, usePreviewImport } from "../src/hooks/use-imports";
import { command } from "../src/lib/commands";
import { IMPORT_PAGE_SIZE, MAX_IMPORT_BYTES, importLabels, readImportFile } from "../src/lib/import-utils";
import { accountKeys, analyticsKeys, categoryKeys, currencyKeys, itemKeys, movementKeys, netWorthKeys, purchaseKeys, settingsKeys, shopKeys } from "../src/lib/query-keys";
import type { ImportKind } from "../src/types/generated/ImportKind";
import type { ImportPreview } from "../src/types/generated/ImportPreview";
import type { ImportRequest } from "../src/types/generated/ImportRequest";
import type { ImportResult } from "../src/types/generated/ImportResult";
import type { ImportTemplate } from "../src/types/generated/ImportTemplate";
import type { AccountFilter } from "../src/types/generated/AccountFilter";
import type { MovementFilter } from "../src/types/generated/MovementFilter";

const clients: QueryClient[] = [];
const restores: (() => void)[] = [];
afterEach(() => {
  for (const restore of restores.splice(0)) restore();
  for (const client of clients.splice(0)) client.clear();
});

function createClient() {
  // Hooks must override automatic retries even if the app defaults allow them.
  const client = new QueryClient({ defaultOptions: {
    queries: { retry: false, gcTime: Infinity },
    mutations: { retry: 2, retryDelay: 0, gcTime: Infinity },
  } });
  clients.push(client);
  return client;
}

function renderHook<T>(client: QueryClient, hook: () => T): T {
  let result: T;
  function Probe() { result = hook(); return null; }
  renderToString(createElement(QueryClientProvider, { client }, createElement(Probe)));
  return result!;
}

const kinds: ImportKind[] = ["accounts", "categories", "items", "movements", "purchases"];
const accountFilter: AccountFilter = { activeOnly: false, search: null, sort: { field: "name", direction: "ASC" }, pagination: { limit: 25, offset: 0 } };
const movementFilter: MovementFilter = { search: null, accountId: null, categoryId: null, movementType: null, currencyCode: null, dateFrom: null, dateTo: null, limit: 25, offset: 0 };
const changedKeys = [
  accountKeys.list(accountFilter), accountKeys.list({ ...accountFilter, search: "CSV", pagination: { limit: 25, offset: 25 } }),
  accountKeys.choices(accountFilter), accountKeys.detail(1), netWorthKeys.all, analyticsKeys.all,
  categoryKeys.catalog(), itemKeys.catalog(), purchaseKeys.byItem(1), purchaseKeys.byMovement(1),
  movementKeys.list(movementFilter), movementKeys.list({ ...movementFilter, accountId: 1, offset: 25 }), movementKeys.expenses(movementFilter),
];
const unchangedKeys = [shopKeys.catalog(), currencyKeys.catalog(), settingsKeys.all, ["imports", "templates"]];

function seed(client: QueryClient) {
  for (const key of [...changedKeys, ...unchangedKeys]) client.setQueryData(key, []);
}

function expectInvalidation(client: QueryClient, success: boolean) {
  for (const key of changedKeys) expect(client.getQueryState(key)?.isInvalidated).toBe(success);
  for (const key of unchangedKeys) expect(client.getQueryState(key)?.isInvalidated).toBe(false);
}

test("CSV file utilities preserve valid content, decode UTF-8 strictly and enforce the byte limit before reading", async () => {
  expect(MAX_IMPORT_BYTES).toBe(5 * 1024 * 1024);
  expect(IMPORT_PAGE_SIZE).toBe(20);
  expect(Object.keys(importLabels).sort()).toEqual([...kinds].sort());
  const csv = 'name;description\r\n"Té, café";"Línea uno\nLínea dos con ""comillas"""\r\n';
  expect(await readImportFile(new File([`\ufeff${csv}`], "bom.csv", { type: "text/csv" }))).toBe(csv);
  expect(await readImportFile(new File([csv], "plain.csv"))).toBe(csv);
  expect(await readImportFile(new File([], "empty.csv"))).toBe(""); // Parsing/empty-row errors belong to Rust.
  const exact = new File([new Uint8Array(MAX_IMPORT_BYTES).fill(0x61)], "exact.csv");
  expect((await readImportFile(exact)).length).toBe(MAX_IMPORT_BYTES);
  const tooLarge = new File([new Uint8Array(MAX_IMPORT_BYTES + 1)], "large.csv");
  const read = spyOn(tooLarge, "arrayBuffer");
  restores.push(() => read.mockRestore());
  await expect(readImportFile(tooLarge)).rejects.toThrow("límite de 5 MiB");
  expect(read).not.toHaveBeenCalled();
  await expect(readImportFile(new File([new Uint8Array([0xc3, 0x28])], "invalid.csv"))).rejects.toThrow("UTF-8");
  const unreadable = new File(["name"], "unreadable.csv");
  const failure = spyOn(unreadable, "arrayBuffer").mockRejectedValue(new Error("read failed"));
  restores.push(() => failure.mockRestore());
  await expect(readImportFile(unreadable)).rejects.toThrow("No se pudo leer el CSV como UTF-8");
});

test("Real template/preview hooks route typed DTOs without committing, mutating cache or retrying failed previews", async () => {
  const client = createClient();
  seed(client);
  // Keep the template query empty so its real queryFn can be fetched after SSR.
  client.removeQueries({ queryKey: ["imports", "templates"] });
  const request: ImportRequest = { kind: "items", csv: "name,brand,description\nTé,Local,Caja\n" };
  const preview: ImportPreview = { kind: "items", columns: ["name", "brand", "description"], rows: [{ rowNumber: 2, values: ["Té", "Local", "Caja"], errors: [] }], totalRows: 1, validRows: 1, errors: [], canCommit: true };
  const templates: ImportTemplate[] = [{ kind: "items", columns: [{ name: "name", dataType: "text", required: true, description: "Nombre", example: "Té" }], exampleCsv: request.csv }];
  const templateSpy = spyOn(command.imports, "templates").mockResolvedValue(templates);
  const previewSpy = spyOn(command.imports, "preview").mockResolvedValue(preview);
  const commitSpy = spyOn(command.imports, "commit");
  restores.push(() => templateSpy.mockRestore(), () => previewSpy.mockRestore(), () => commitSpy.mockRestore());
  renderHook(client, useImportTemplates);
  const query = client.getQueryCache().find({ queryKey: ["imports", "templates"], exact: true })!;
  expect(await query.fetch()).toEqual(templates);
  expect(query.options).toMatchObject({ staleTime: Infinity });
  expect(templateSpy).toHaveBeenCalledTimes(1);
  const hook = renderHook(client, usePreviewImport);
  expect(await hook.mutateAsync(request)).toEqual(preview);
  expect(previewSpy.mock.calls[0]?.[0]).toEqual(request);
  expectInvalidation(client, false);
  const error = new Error("No se pudo validar el CSV.");
  previewSpy.mockRejectedValue(error);
  await expect(hook.mutateAsync(request)).rejects.toBe(error);
  expect(previewSpy).toHaveBeenCalledTimes(2);
  expect(commitSpy).not.toHaveBeenCalled();
  expectInvalidation(client, false);
});

test("Real commit hook invalidates all dependent server-data variants for every kind, but failures never retry or invalidate", async () => {
  const commitSpy = spyOn(command.imports, "commit");
  restores.push(() => commitSpy.mockRestore());
  for (const kind of kinds) {
    const client = createClient();
    seed(client);
    const request: ImportRequest = { kind, csv: "UI hook contract fixture, not parsed by this test\n" };
    const result: ImportResult = { kind, importedRows: 1, createdMovements: kind === "movements" ? 1 : 0, createdPurchases: kind === "purchases" ? 1 : 0 };
    commitSpy.mockResolvedValue(result);
    const hook = renderHook(client, useCommitImport);
    expect(await hook.mutateAsync(request)).toEqual(result);
    expect(commitSpy.mock.calls.at(-1)?.[0]).toEqual(request);
    expectInvalidation(client, true);
    seed(client);
    const error = new Error(`No se importó ninguna fila (${kind}).`);
    commitSpy.mockRejectedValue(error);
    const callsBefore = commitSpy.mock.calls.length;
    await expect(hook.mutateAsync(request)).rejects.toBe(error);
    expect(commitSpy.mock.calls.length).toBe(callsBefore + 1);
    expect(client.getMutationCache().getAll().at(-1)?.state.error).toBe(error);
    expectInvalidation(client, false);
  }
  expect(commitSpy).toHaveBeenCalledTimes(10);
});

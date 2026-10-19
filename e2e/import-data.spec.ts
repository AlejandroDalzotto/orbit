import { readFile } from "node:fs/promises";
import type { Locator, Page } from "@playwright/test";
import { test, expect, navigate, readMock, expectIpc } from "./helpers/fixtures";
import { configureImportMock, importSamples, installImportMock, readImportMock, releaseImportMock } from "./helpers/import-mock";
import type { ImportKind } from "../src/types/generated/ImportKind";

// UI integration only: canned IPC DTOs do not validate Rust parsing/transactions.
test.setTimeout(15_000);

async function openImport(page: Page, from = "Movimientos") {
  await navigate(page, from);
  await page.getByRole("button", { name: "Importar CSV", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Importar datos CSV", exact: true });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByLabel("Archivo CSV", { exact: true })).toBeEnabled();
  return dialog;
}

async function upload(dialog: Locator, kind: ImportKind, name = `${kind}.csv`, csv = importSamples[kind].request.csv) {
  await dialog.getByLabel("Archivo CSV", { exact: true }).setInputFiles({ name, mimeType: "text/csv", buffer: Buffer.from(csv) });
}

const previewRegion = (dialog: Locator) => dialog.getByRole("region", { name: "Vista previa CSV", exact: true });
const confirmButton = (dialog: Locator) => dialog.getByRole("button", { name: "Confirmar importación", exact: true });
const consent = (dialog: Locator) => dialog.getByRole("checkbox", { name: /Revisé la vista previa/ });

async function expectCounts(page: Page, preview: number, commit = 0) {
  await expect.poll(async () => (await readImportMock(page)).counts).toEqual({ templates: 1, preview, commit });
}

test("Settings: download real templates for each dataset; file selection previews only; discard and Escape never commit", async ({ app }) => {
  await installImportMock(app);
  let dialog = await openImport(app, "Configuración");
  for (const kind of ["accounts", "categories", "items", "purchases", "movements"] as const) {
    await dialog.getByLabel("Tipo de registros").selectOption(kind);
    const downloadPromise = app.waitForEvent("download");
    await dialog.getByRole("button", { name: "Descargar ejemplo CSV", exact: true }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe(`orbit-${kind}-ejemplo.csv`);
    expect(await download.failure()).toBeNull();
    const path = await download.path();
    expect(path).not.toBeNull();
    expect(await readFile(path!)).toEqual(Buffer.from(`\ufeff${importSamples[kind].template.exampleCsv}`));
    await upload(dialog, kind);
    await expect(previewRegion(dialog)).toContainText("1 de 1 registros válidos");
    await expectIpc(app, "preview_csv_import", { request: importSamples[kind].request });
    await expect(confirmButton(dialog)).toBeDisabled();
  }
  await expectCounts(app, 5);
  await consent(dialog).check();
  await expect(confirmButton(dialog)).toBeEnabled();
  await dialog.getByRole("button", { name: "Descartar y cerrar", exact: true }).click();
  await expect(dialog).toHaveCount(0);
  dialog = await openImport(app);
  await upload(dialog, "movements");
  await expect(previewRegion(dialog)).toBeVisible();
  await consent(dialog).check();
  await app.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expectCounts(app, 6);
});

test("Every import dataset shows explicit data types with distinct, consistent badge colors", async ({ app }) => {
  await installImportMock(app);
  const dialog = await openImport(app);
  const labels = { text: "Texto", integer: "Entero · ID", decimal: "Decimal", date: "Fecha", enum: "Enum" } as const;
  const colors = new Map<string, string>();
  for (const kind of ["accounts", "categories", "items", "movements", "purchases"] as const) {
    await dialog.getByLabel("Tipo de registros").selectOption(kind);
    const table = dialog.getByRole("table", { name: /Especificación de columnas CSV/ });
    await expect(table.getByRole("columnheader", { name: "Tipo de dato", exact: true })).toBeVisible();
    for (const column of importSamples[kind].template.columns) {
      const row = table.getByRole("row").filter({ has: app.locator('th[scope="row"] > code').getByText(column.name, { exact: true }) });
      const badge = row.getByText(labels[column.dataType], { exact: true });
      await badge.scrollIntoViewIfNeeded();
      await expect(badge).toBeVisible();
      await expect(badge).toHaveAttribute("title", /.+/);
      const color = await badge.evaluate((element) => getComputedStyle(element).color);
      if (colors.has(column.dataType)) expect(color).toBe(colors.get(column.dataType));
      colors.set(column.dataType, color);
    }
  }
  expect(colors.size).toBe(5);
  expect(new Set(colors.values()).size).toBe(5);
  await expectCounts(app, 0);
});

test("Movement import requires consent, sends the exact CSV, and refreshes the warmed ledger and wallet", async ({ app }) => {
  await installImportMock(app);
  const before = await readMock(app);
  const balance = before.state.accounts.find((row) => row.id === 1)!.balance;
  const dialog = await openImport(app);
  await expect(confirmButton(dialog)).toBeDisabled();
  await expect(dialog.getByRole("table", { name: "Especificación de columnas CSV de Movimientos" })).toContainText("ID SQLite de cuenta activa existente");
  await upload(dialog, "movements", "gastos.csv");
  const preview = previewRegion(dialog);
  await expect(preview).toContainText("Vista previa · gastos.csv");
  const table = preview.getByRole("table", { name: "Registros CSV mapeados para confirmar" });
  await expect(table.getByRole("columnheader", { name: "account_id", exact: true })).toBeVisible();
  await expect(table.getByRole("row").filter({ hasText: "Compra CSV importada" })).toContainText("12.50");
  await expect(table.getByRole("row").filter({ hasText: "Compra CSV importada" })).toContainText("Válida");
  await expectCounts(app, 1);
  await expectIpc(app, "preview_csv_import", { request: importSamples.movements.request });
  expect((await readMock(app)).state.movements).toEqual(before.state.movements);
  await expect(confirmButton(dialog)).toBeDisabled();
  await consent(dialog).check();
  await expect(confirmButton(dialog)).toBeEnabled();
  await consent(dialog).uncheck();
  await expect(confirmButton(dialog)).toBeDisabled();
  await consent(dialog).check();
  await confirmButton(dialog).click();
  await expect(dialog.getByRole("heading", { name: "Importación completada" })).toBeVisible();
  await expect(dialog.getByRole("status")).toContainText("Movimientos de dinero creados: 1. Líneas de compra creadas: 0.");
  await expectCounts(app, 1, 1);
  await expectIpc(app, "commit_csv_import", { request: importSamples.movements.request });
  // The header and success footer both say Cerrar; scope to the footer.
  await dialog.locator("footer").getByRole("button", { name: "Cerrar", exact: true }).click();
  await expect(app.getByRole("button", { name: /Compra CSV importada.*Ver detalle/ })).toBeVisible();
  const after = await readMock(app);
  expect(after.state.movements).toHaveLength(before.state.movements.length + 1);
  expect(after.state.accounts.find((row) => row.id === 1)!.balance).toBe(balance - 1250);
  expect(after.calls.filter((call) => call.command === "get_movements").length).toBeGreaterThan(1);
  await navigate(app, "Billetera");
  const card = app.getByRole("listitem").filter({ has: app.getByRole("button", { name: "Ver detalles de Cuenta diaria", exact: true }) });
  await expect(card).toContainText("1.814,05 ARS");
  expect((await readMock(app)).calls.filter((call) => call.command === "get_accounts").length).toBeGreaterThan(before.calls.filter((call) => call.command === "get_accounts").length);
});

test("Preview row errors and command rejection block consent and commit with actionable errors", async ({ app }) => {
  const message = "La cuenta no existe o está inactiva.";
  const invalid = { ...importSamples.movements.preview, validRows: 0, canCommit: false, errors: [{ rowNumber: 2, message }], rows: [{ ...importSamples.movements.preview.rows[0], errors: [message] }] };
  await installImportMock(app, { preview: invalid });
  const dialog = await openImport(app);
  await upload(dialog, "movements");
  const preview = previewRegion(dialog);
  await expect(preview).toContainText("0 de 1 registros válidos");
  await expect(preview.getByRole("alert")).toContainText(`Fila 2: ${message}`);
  await expect(preview.getByRole("table").getByRole("row").filter({ hasText: "Compra CSV importada" })).toContainText(message);
  await expect(consent(dialog)).toBeDisabled();
  await expect(confirmButton(dialog)).toBeDisabled();
  await expectCounts(app, 1);
  await configureImportMock(app, { previewError: "No se pudo validar el CSV. Fila 1: falta name." });
  await upload(dialog, "movements");
  await expect(dialog.getByRole("alert")).toContainText("Fila 1: falta name.");
  await expect(previewRegion(dialog)).toHaveCount(0);
  await expect(confirmButton(dialog)).toBeDisabled();
  await dialog.getByRole("button", { name: "Descartar y cerrar", exact: true }).click();
  await expect(dialog).toHaveCount(0);
  await expectCounts(app, 2);
});

test("Changing dataset or file clears stale preview, pagination and consent before a new preview resolves", async ({ app }) => {
  const original = importSamples.items.preview;
  const many = { ...original, totalRows: 21, validRows: 21, rows: Array.from({ length: 21 }, (_, index) => ({ rowNumber: index + 2, values: [`Artículo CSV ${index + 1}`, "Local", ""], errors: [] })) };
  await installImportMock(app, { preview: many });
  const dialog = await openImport(app);
  await dialog.getByLabel("Tipo de registros").selectOption("items");
  await upload(dialog, "items", "muchos.csv", `name,brand,description\n${many.rows.map((row) => row.values.join(",")).join("\n")}\n`);
  await expect(previewRegion(dialog)).toContainText("21 de 21 registros válidos");
  const pages = dialog.getByRole("navigation", { name: "Páginas de vista previa" });
  await pages.getByRole("button", { name: "Siguiente", exact: true }).click();
  await expect(pages).toContainText("21–21 de 21");
  await consent(dialog).check();
  await configureImportMock(app, { preview: original, hold: "preview" });
  // Reusing the filename also exercises resetting the native file input value.
  await upload(dialog, "items", "muchos.csv");
  await expectCounts(app, 2);
  await expect(previewRegion(dialog)).toHaveCount(0);
  await expect(confirmButton(dialog)).toBeDisabled();
  await releaseImportMock(app);
  await expect(previewRegion(dialog)).toContainText("Té CSV");
  await expect(pages).toHaveCount(0);
  await expect(consent(dialog)).not.toBeChecked();
  await consent(dialog).check();
  await dialog.getByLabel("Tipo de registros").selectOption("purchases");
  await expect(previewRegion(dialog)).toHaveCount(0);
  await expect(consent(dialog)).toHaveCount(0);
  await expect(confirmButton(dialog)).toBeDisabled();
  await expectCounts(app, 2);
  await configureImportMock(app, { preview: importSamples.purchases.preview, hold: null });
  await upload(dialog, "purchases");
  await expect(previewRegion(dialog)).toContainText("Las compras heredan fecha, moneda y comercio del gasto");
  await expect(consent(dialog)).not.toBeChecked();
  await expectIpc(app, "preview_csv_import", { request: importSamples.purchases.request });
  await expectCounts(app, 3);
});

test("Commit failure never auto-retries and requires explicit revalidation and fresh consent", async ({ app }) => {
  await installImportMock(app, { commitError: "No se importó ninguna fila. Fila 2: La cuenta está inactiva." });
  const before = await readMock(app);
  const dialog = await openImport(app);
  await upload(dialog, "movements");
  await expect(previewRegion(dialog)).toBeVisible();
  await consent(dialog).check();
  await confirmButton(dialog).click();
  await expect(dialog.getByRole("alert")).toContainText("No se importó ninguna fila. Fila 2");
  await expect(dialog.getByText("No se reintenta la importación automáticamente.", { exact: false })).toBeVisible();
  await expect(confirmButton(dialog)).toBeDisabled();
  await expect(consent(dialog)).toBeDisabled();
  await expectCounts(app, 1, 1);
  expect((await readMock(app)).state.movements).toEqual(before.state.movements);
  await configureImportMock(app, { commitError: null, hold: "preview" });
  await dialog.getByRole("button", { name: "Volver a validar", exact: true }).click();
  await expectCounts(app, 2, 1);
  await expect(confirmButton(dialog)).toBeDisabled();
  await releaseImportMock(app);
  await expect(consent(dialog)).toBeEnabled();
  await expect(consent(dialog)).not.toBeChecked();
  await expect(confirmButton(dialog)).toBeDisabled();
  await consent(dialog).check();
  await confirmButton(dialog).click();
  await expect(dialog.getByRole("heading", { name: "Importación completada" })).toBeVisible();
  await expectCounts(app, 2, 2);
  const calls = (await readImportMock(app)).calls.filter((call) => call.command !== "get_import_templates");
  expect(calls.map((call) => call.command)).toEqual(["preview_csv_import", "commit_csv_import", "preview_csv_import", "commit_csv_import"]);
  expect(calls.map((call) => call.args)).toEqual(Array(4).fill({ request: importSamples.movements.request }));
});

test("Invalid UTF-8 and oversized files fail locally without preview or commit IPC", async ({ app }) => {
  await installImportMock(app);
  const dialog = await openImport(app);
  const file = dialog.getByLabel("Archivo CSV", { exact: true });
  await file.setInputFiles({ name: "latin1.csv", mimeType: "text/csv", buffer: Buffer.from([0x6e, 0x61, 0x6d, 0x65, 0x0a, 0xc3, 0x28]) });
  await expect(dialog.getByRole("alert")).toContainText("No se pudo leer el CSV como UTF-8");
  await expectCounts(app, 0);
  await expect(previewRegion(dialog)).toHaveCount(0);
  await expect(confirmButton(dialog)).toBeDisabled();
  await file.setInputFiles({ name: "grande.csv", mimeType: "text/csv", buffer: Buffer.alloc(5 * 1024 * 1024 + 1, 0x61) });
  await expect(dialog.getByRole("alert")).toContainText("límite de 5 MiB");
  await expectCounts(app, 0);
  await upload(dialog, "movements");
  await expect(previewRegion(dialog)).toBeVisible();
  await expect(dialog.getByRole("alert")).toHaveCount(0);
  await expectCounts(app, 1);
});

test("Pending preview and commit prevent Escape, close, file changes and double submission", async ({ app }) => {
  await installImportMock(app, { hold: "preview" });
  const dialog = await openImport(app);
  await upload(dialog, "movements");
  await expectCounts(app, 1);
  await expect(dialog).toHaveAttribute("aria-busy", "true");
  await expect(dialog.getByRole("button", { name: "Cerrar", exact: true })).toBeDisabled();
  await expect(dialog.getByRole("button", { name: "Descartar y cerrar", exact: true })).toBeDisabled();
  await expect(dialog.getByLabel("Archivo CSV", { exact: true })).toBeDisabled();
  await expect(dialog.getByLabel("Tipo de registros")).toBeDisabled();
  await expect(confirmButton(dialog)).toBeDisabled();
  await app.keyboard.press("Escape");
  await expect(dialog).toBeVisible();
  await releaseImportMock(app);
  await expect(previewRegion(dialog)).toBeVisible();
  await configureImportMock(app, { hold: "commit" });
  await consent(dialog).check();
  // Use trusted Edge pointer events, not synthetic same-task DOM clicks.
  await confirmButton(dialog).dblclick();
  await expect(dialog).toHaveAttribute("aria-busy", "true");
  await expect(dialog.getByRole("button", { name: "Importando…", exact: true })).toBeDisabled();
  await expect(consent(dialog)).toBeDisabled();
  await expect(dialog.getByLabel("Archivo CSV", { exact: true })).toBeDisabled();
  await expect(dialog.getByLabel("Tipo de registros")).toBeDisabled();
  await expect(dialog.getByRole("button", { name: "Cerrar", exact: true })).toBeDisabled();
  await expect(dialog.getByRole("button", { name: "Descartar y cerrar", exact: true })).toBeDisabled();
  await app.keyboard.press("Escape");
  await expect(dialog).toBeVisible();
  await releaseImportMock(app);
  await expect(dialog.getByRole("heading", { name: "Importación completada" })).toBeVisible();
  await app.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  // Regression: a trusted Edge double-click currently reaches IPC twice before
  // React renders the disabled state. Keep this assertion red until app code is fixed.
  expect((await readImportMock(app)).counts).toEqual({ templates: 1, preview: 1, commit: 1 });
});

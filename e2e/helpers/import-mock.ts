import type { Page } from "@playwright/test";
import type { ImportKind } from "../../src/types/generated/ImportKind";
import type { ImportDataType } from "../../src/types/generated/ImportDataType";
import type { ImportPreview } from "../../src/types/generated/ImportPreview";
import type { ImportRequest } from "../../src/types/generated/ImportRequest";
import type { ImportResult } from "../../src/types/generated/ImportResult";
import type { ImportTemplate } from "../../src/types/generated/ImportTemplate";
import type { IpcCall, MockState } from "./tauri-mock";

type Sample = { request: ImportRequest; preview: ImportPreview; template: ImportTemplate };

const columnTypes: Record<string, ImportDataType> = {
  name: "text", brand: "text", description: "text", notes: "text", currency_code: "text",
  account_type: "enum", type: "enum", date: "date",
  account_id: "integer", category_id: "integer", shop_id: "integer", to_account_id: "integer", parent_id: "integer", movement_id: "integer", item_id: "integer",
  amount: "decimal", to_amount: "decimal", initial_balance: "decimal", unit_price: "decimal", quantity: "decimal",
};

// Canned UI responses, not a CSV parser or SQLite/atomicity test. The real parser,
// validation, and rollback cases live in src-tauri/src/imports.rs Rust tests.
function sample(kind: ImportKind, columns: string[], values: string[], required: string[], descriptions: Record<string, string> = {}): Sample {
  const csv = `${columns.join(",")}\n${values.join(",")}\n`;
  return {
    request: { kind, csv },
    preview: { kind, columns, rows: [{ rowNumber: 2, values, errors: [] }], totalRows: 1, validRows: 1, errors: [], canCommit: true },
    template: { kind, exampleCsv: csv, columns: columns.map((name, index) => ({ name, dataType: columnTypes[name], required: required.includes(name), description: descriptions[name] ?? name, example: values[index] })) },
  };
}

export const importSamples: Record<ImportKind, Sample> = {
  accounts: sample("accounts", ["name", "account_type", "currency_code", "description", "initial_balance"], ["Caja CSV", "cash", "ARS", "Billetera", "0"], ["name", "account_type", "currency_code"]),
  categories: sample("categories", ["name", "type", "parent_id"], ["Categoría CSV", "expense", ""], ["name", "type"]),
  items: sample("items", ["name", "brand", "description"], ["Té CSV", "Local", "Caja de té"], ["name"]),
  movements: sample("movements", ["date", "type", "account_id", "amount", "currency_code", "description", "notes", "category_id", "shop_id", "to_account_id", "to_amount"], ["2026-02-04", "expense", "1", "12.50", "ARS", "Compra CSV importada", "Importado de CSV", "", "", "", ""], ["date", "type", "account_id", "amount"], { account_id: "ID SQLite de cuenta activa existente", amount: "Importe mayor positivo en moneda de origen" }),
  purchases: sample("purchases", ["movement_id", "item_id", "quantity", "unit_price", "notes"], ["1", "1", "1.5", "2.50", "Importado de CSV"], ["movement_id", "item_id", "quantity", "unit_price"]),
};

export type ImportMockOptions = {
  preview?: ImportPreview;
  previewError?: string | null;
  commitError?: string | null;
  hold?: "preview" | "commit" | null;
};
type ImportSnapshot = {
  calls: IpcCall[];
  counts: { templates: number; preview: number; commit: number };
  options: ImportMockOptions;
};
interface ImportWindow extends Window {
  __TAURI_INTERNALS__: { invoke: (command: string, args?: Record<string, unknown>) => Promise<unknown> };
  __orbitMock: { calls: IpcCall[]; state: MockState };
  __importMock: ImportSnapshot & { release?: () => void };
}

// Called through page.evaluate only AFTER the shared app fixture has installed
// its runtime. Wrapping preserves all existing handlers and fixture diagnostics.
export async function installImportMock(page: Page, options: ImportMockOptions = {}) {
  await page.evaluate(({ samples, options }) => {
    const browser = window as unknown as ImportWindow;
    if (browser.__importMock) throw new Error("Import mock already installed");
    const original = browser.__TAURI_INTERNALS__.invoke;
    const control: ImportWindow["__importMock"] = { calls: [], counts: { templates: 0, preview: 0, commit: 0 }, options };
    browser.__importMock = control;
    browser.__TAURI_INTERNALS__.invoke = async (command, args = {}) => {
      if (!["get_import_templates", "preview_csv_import", "commit_csv_import"].includes(command)) return original(command, args);
      const call = { command, args: structuredClone(args) };
      control.calls.push(call);
      browser.__orbitMock.calls.push(call);
      if (command === "get_import_templates") {
        control.counts.templates++;
        return structuredClone(Object.values(samples).map((entry) => entry.template));
      }
      const phase = command === "preview_csv_import" ? "preview" : "commit";
      control.counts[phase]++;
      const request = args.request as ImportRequest;
      if (control.options.hold === phase) await new Promise<void>((resolve) => {
        const previous = control.release;
        control.release = () => { previous?.(); resolve(); };
      });
      if (phase === "preview") {
        if (control.options.previewError) throw { message: control.options.previewError };
        return structuredClone(control.options.preview ?? samples[request.kind].preview);
      }
      if (control.options.commitError) throw { message: control.options.commitError };
      // One deliberately fixed created row is enough to verify real UI cache
      // invalidation against the existing wallet/ledger handlers; no CSV parsing.
      if (request.kind === "movements") {
        const state = browser.__orbitMock.state;
        state.movements.push({
          ...state.movements[0], id: state.nextId++, accountId: 1, accountName: "Cuenta diaria", type: "expense", amount: 1250,
          currencyCode: "ARS", date: "2026-02-04", description: "Compra CSV importada", notes: "Importado de CSV",
          categoryId: null, shopId: null, toAccountId: null, toAccountName: null, toAmount: null, toCurrencyCode: null, transferGroupId: null,
        });
      }
      const result: ImportResult = { kind: request.kind, importedRows: 1, createdMovements: request.kind === "movements" ? 1 : 0, createdPurchases: request.kind === "purchases" ? 1 : 0 };
      return result;
    };
  }, { samples: importSamples, options });
}

export async function readImportMock(page: Page): Promise<ImportSnapshot> {
  return page.evaluate(() => {
    const { calls, counts, options } = (window as unknown as ImportWindow).__importMock;
    return { calls, counts, options };
  });
}

export async function configureImportMock(page: Page, options: ImportMockOptions) {
  await page.evaluate((options) => Object.assign((window as unknown as ImportWindow).__importMock.options, options), options);
}

export async function releaseImportMock(page: Page) {
  await page.evaluate(() => {
    const control = (window as unknown as ImportWindow).__importMock;
    if (!control.release) throw new Error("No pending import command to release");
    control.release();
    delete control.release;
  });
}

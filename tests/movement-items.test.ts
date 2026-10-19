import { afterEach, expect, spyOn, test } from "bun:test";
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { QueryClient, QueryClientProvider, QueryObserver } from "@tanstack/react-query";
import { command } from "../src/lib/commands";
import { itemKeys, movementKeys, purchaseKeys } from "../src/lib/query-keys";
import { useAddCatalogPurchase } from "../src/hooks/use-catalog";
import { LedgerPurchaseForm } from "../src/components/ledger-purchase-form";
import { catalogPricePoints } from "../src/components/catalog-price-chart";
import { catalogMinorUnits } from "../src/components/catalog-utils";
import type { Currency } from "../src/types/generated/Currency";
import type { Movement } from "../src/types/generated/Movement";
import type { Purchase } from "../src/types/generated/Purchase";

const clients: QueryClient[] = [];
const restores: (() => void)[] = [];
afterEach(() => {
  for (const restore of restores.splice(0)) restore();
  for (const client of clients.splice(0)) client.clear();
});
function createClient() {
  const client = new QueryClient({ defaultOptions: {
    queries: { retry: false, staleTime: Infinity, gcTime: Infinity }, mutations: { retry: false },
  } });
  clients.push(client);
  return client;
}
const currency: Currency = { code: "ARS", name: "Peso argentino", symbol: "$", decimalPlaces: 2, isActive: true };
const movement: Movement = {
  id: 1, accountId: 1, accountName: "Cuenta diaria", type: "expense", amount: 12345, currencyCode: "ARS",
  date: "2026-02-03", description: "Compra semanal", notes: null, categoryId: 1, shopId: 1,
  toAccountId: null, toAccountName: null, toAmount: null, toCurrencyCode: null, transferGroupId: null, createdAt: "2026-01-01",
};
const purchase: Purchase = {
  id: 100, movementId: 1, itemId: 1, itemName: "Café", quantity: 1.5, unitPrice: 29, totalPrice: 43,
  currencyCode: "ARS", date: "2026-02-03", shopName: "Mercado local", notes: null,
};

function purchaseMutation(client: QueryClient) {
  let result!: ReturnType<typeof useAddCatalogPurchase>;
  function Probe() { result = useAddCatalogPurchase(); return null; }
  renderToString(createElement(QueryClientProvider, { client }, createElement(Probe)));
  return result;
}

test("purchase success invalidates both histories, items and movements, and refetches open detail lines", async () => {
  const client = createClient();
  const keys = [purchaseKeys.byMovement(1), purchaseKeys.byItem(1), itemKeys.catalog(), movementKeys.all];
  for (const key of keys) client.setQueryData(key, []);
  let lines: Purchase[] = [];
  let reads = 0;
  const observer = new QueryObserver(client, {
    queryKey: purchaseKeys.byMovement(1), queryFn: async () => { reads++; return lines; },
  });
  const unsubscribe = observer.subscribe(() => {});
  restores.push(unsubscribe);
  const add = spyOn(command.purchases, "addOne").mockImplementation(async () => { lines = [purchase]; return purchase; });
  restores.push(() => add.mockRestore());
  const entry = { movementId: 1, itemId: 1, quantity: 1.5, unitPrice: 29, notes: null };
  expect(await purchaseMutation(client).mutateAsync(entry)).toEqual(purchase);
  expect(add).toHaveBeenCalledWith(entry);
  expect(reads).toBe(1);
  expect(client.getQueryData(purchaseKeys.byMovement(1))).toEqual([purchase]);
  for (const key of keys.slice(1)) expect(client.getQueryCache().find({ queryKey: key, exact: true })!.state.isInvalidated).toBe(true);
});

test("failed purchase preserves cache and returns a useful error for retry", async () => {
  const client = createClient();
  client.setQueryData(purchaseKeys.byMovement(1), []);
  const error = new Error("No se pudo vincular el artículo.");
  const add = spyOn(command.purchases, "addOne").mockRejectedValue(error);
  restores.push(() => add.mockRestore());
  await expect(purchaseMutation(client).mutateAsync({ movementId: 1, itemId: 1, quantity: 1, unitPrice: 29, notes: null })).rejects.toBe(error);
  expect(client.getQueryData(purchaseKeys.byMovement(1))).toEqual([]);
  expect(client.getQueryCache().find({ queryKey: purchaseKeys.byMovement(1), exact: true })!.state.isInvalidated).toBe(false);
});

test("picker omits archived items and blocks prices without trustworthy currency metadata", () => {
  const client = createClient();
  client.setQueryData(itemKeys.catalog(), [
    { id: 1, name: "Café activo", brand: "Local", isArchived: false },
    { id: 2, name: "Café archivado", brand: null, isArchived: true },
  ]);
  for (const currencies of [[], [{ ...currency, decimalPlaces: -1 }], [{ ...currency, decimalPlaces: 1.5 }]]) {
    const markup = renderToString(createElement(QueryClientProvider, { client }, createElement(LedgerPurchaseForm, {
      movement, currencies, onSaved() {}, onCancel() {}, onBusyChange() {},
    })));
    expect(markup).toContain("Café activo");
    expect(markup).not.toContain("Café archivado");
    expect(markup).toContain("No hay metadatos de precisión");
    expect(markup).toMatch(/<input[^>]*disabled=""[^>]*value=""/);
    expect(markup).toMatch(/<button[^>]*disabled=""[^>]*>Guardar vínculo/);
  }
});

test("price conversion honors zero/three decimal currencies and exact safe integer boundaries", () => {
  expect(catalogMinorUnits("0,29", 2)).toBe(29);
  expect(catalogMinorUnits("123", 0)).toBe(123);
  expect(catalogMinorUnits("1.234", 3)).toBe(1234);
  expect(catalogMinorUnits("90071992547409,91", 2)).toBe(Number.MAX_SAFE_INTEGER);
  expect(() => catalogMinorUnits("1,1", 0)).toThrow();
  expect(() => catalogMinorUnits("1,2345", 3)).toThrow();
  expect(() => catalogMinorUnits("90071992547409,92", 2)).toThrow();
});

test("chart sorts dates, chooses the last same-day line, and never combines currencies or shops", () => {
  const rows: Purchase[] = [
    { ...purchase, id: 102, unitPrice: 31 },
    { ...purchase, id: 101, date: "2026-01-05", unitPrice: 25 },
    purchase,
    { ...purchase, id: 103, currencyCode: "USD", unitPrice: 250 },
    { ...purchase, id: 104, shopName: null, unitPrice: 900 },
    { ...purchase, id: 105, shopName: "Sin tienda", unitPrice: 999 },
  ];
  expect(catalogPricePoints(rows, "ARS", "Mercado local")).toEqual([
    { time: "2026-01-05", value: 25 }, { time: "2026-02-03", value: 31 },
  ]);
  expect(catalogPricePoints(rows, "USD", "Mercado local")).toEqual([{ time: "2026-02-03", value: 250 }]);
  expect(catalogPricePoints(rows, "ARS", null)).toEqual([{ time: "2026-02-03", value: 900 }]);
  expect(catalogPricePoints(rows, "ARS", "Sin tienda")).toEqual([{ time: "2026-02-03", value: 999 }]);
  expect(catalogPricePoints([], "ARS", null)).toEqual([]);
  expect(rows[0].id).toBe(102);
});

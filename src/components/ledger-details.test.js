import { afterEach, expect, spyOn, test } from "bun:test";
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { command } from "../lib/commands";
import { analyticsKeys, currencyKeys, purchaseKeys } from "../lib/query-keys";
import { useMovementPurchases } from "../hooks/use-movements";
import { LedgerPurchases } from "./ledger-purchases";
import { LedgerDetails } from "./ledger-details";
import { LedgerForm } from "./ledger-form";
import { ledgerField, LedgerError } from "./ledger-ui";
import { formatMinor, parseMinorAmount } from "./ledger-utils";
import MovementsView from "../views/movements-view";
import AnalyticsView from "../views/analytics-view";
import WalletView from "../views/wallet-view";
import { walletField, walletLabel, walletPrimary } from "./wallet-ui";
import { catalogField, catalogLabel } from "./catalog-ui";

const clients = [];
const spies = [];
afterEach(() => {
  for (const spy of spies.splice(0)) spy.mockRestore();
  for (const client of clients.splice(0)) client.clear();
});

function createClient() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, staleTime: Infinity, gcTime: Infinity } } });
  clients.push(client); return client;
}
function render(client, Component, props = {}) {
  return renderToString(createElement(QueryClientProvider, { client }, createElement(Component, props))).replace(/<!--.*?-->/g, "");
}
const currencies = [{ code: "USD", name: "Dollar", symbol: "$", decimalPlaces: 2, isActive: true }];
const purchase = { id: 42, movementId: 9, itemId: 7, itemName: "Café", quantity: 1.5, unitPrice: 299, totalPrice: 448, currencyCode: "USD", date: "2026-10-18", shopName: "Mercado", notes: "Detalle de la compra" };
const movement = { id: 9, accountId: 1, accountName: "Cash", type: "expense", amount: 500, currencyCode: "USD", date: "2026-10-18", description: "Compras", notes: null, categoryId: null, shopId: null, toAccountId: null, toAccountName: null, toAmount: null, toCurrencyCode: null, transferGroupId: null, createdAt: "2026-10-18" };

test("purchase hook uses the shared movement key and typed byMovement command", async () => {
  const client = createClient();
  spies.push(spyOn(command.purchases, "byMovement").mockResolvedValue([purchase]));
  function Probe() { useMovementPurchases(9); return null; }
  render(client, Probe);
  const query = client.getQueryCache().find({ queryKey: purchaseKeys.byMovement(9), exact: true });
  expect(await query.fetch()).toEqual([purchase]);
  expect(command.purchases.byMovement).toHaveBeenCalledWith(9);
});

test("read-only lines show backend quantities, exact unit prices, totals and notes without recomputing", () => {
  const client = createClient(); client.setQueryData(purchaseKeys.byMovement(9), [purchase]);
  const markup = render(client, LedgerPurchases, { movementId: 9, currencies });
  for (const text of ["Café", "1,5", "2,99 USD", "4,48 USD", "Mercado", "Detalle de la compra", "sólo lectura"]) expect(markup).toContain(text);
  expect(markup).not.toContain("Eliminar línea"); expect(markup).not.toContain("Registrar compra");
});

test("purchase detail has distinct loading, empty and retryable error states", async () => {
  const client = createClient();
  expect(render(client, LedgerPurchases, { movementId: 9, currencies })).toContain("Cargando líneas de compra");
  client.setQueryData(purchaseKeys.byMovement(9), []);
  expect(render(client, LedgerPurchases, { movementId: 9, currencies })).toContain("no tiene líneas de compra vinculadas");
  spies.push(spyOn(command.purchases, "byMovement").mockRejectedValue(new Error("No se pudieron leer las líneas.")));
  const query = client.getQueryCache().find({ queryKey: purchaseKeys.byMovement(9), exact: true });
  await expect(query.fetch()).rejects.toThrow("No se pudieron leer las líneas.");
  const markup = render(client, LedgerPurchases, { movementId: 9, currencies });
  expect(markup).toContain('role="alert"'); expect(markup).toContain("No se pudieron leer las líneas."); expect(markup).toContain("Reintentar");
});

test("movement details show linked lines only for expenses", () => {
  const client = createClient(); client.setQueryData(purchaseKeys.byMovement(9), [purchase]);
  const props = { movement, currencies, categories: [], shops: [], canEdit: true, onClose() {}, onEdit() {}, onDeleted() {} };
  expect(render(client, LedgerDetails, props)).toContain("Líneas de compra");
  expect(render(client, LedgerDetails, { ...props, movement: { ...movement, type: "income" } })).not.toContain("Líneas de compra");
});

test("headings are light dim mono with one primary-ink word and transparent page backgrounds", () => {
  const client = createClient();
  client.setQueryData(analyticsKeys.all, { monthly: [], categories: [], netWorth: [] });
  client.setQueryData(currencyKeys.catalog(), currencies);
  for (const [View, word] of [[MovementsView, "Movimientos"], [AnalyticsView, "Analítica"]]) {
    const markup = render(client, View);
    expect(markup).toContain("bg-transparent"); expect(markup).toContain("font-mono text-4xl font-light"); expect(markup).toContain(`class="block text-primary">${word}</span>`);
    expect(markup).not.toContain("#b5b8ff"); expect(markup).not.toContain("#ffc77a"); expect(markup).not.toContain("#090909");
  }
});

test("dialog and form use shared theme surfaces and do not suggest unsupported account activation", () => {
  const markup = render(createClient(), LedgerForm, { accounts: [], categories: [], currencies, shops: [], onClose() {}, onSaved() {} });
  expect(markup).toContain("bg-surface"); expect(ledgerField).toContain("field");
  expect(markup).toContain("creala en Cuentas"); expect(markup).not.toContain("activarla");
  const error = renderToString(createElement(LedgerError, { error: "Error de prueba" }));
  expect(error).toContain("text-error"); expect(error).not.toContain("#ff897d");
});

test("secondary view text uses opaque muted ink while primary headings retain financial ink", () => {
  const client = createClient();
  client.setQueryData(analyticsKeys.all, { monthly: [], categories: [], netWorth: [] });
  client.setQueryData(currencyKeys.catalog(), currencies);
  for (const View of [WalletView, MovementsView, AnalyticsView]) {
    const markup = render(client, View);
    expect(markup).toMatch(/<p class="[^"]*text-muted[^"]*">Orbit \/ /);
    expect(markup).toMatch(/<h1 class="[^"]*text-muted[^"]*">/);
    expect(markup).toMatch(/<span class="(?:block )?text-primary">/);
    const textMarkup = markup.replace(/<svg\b[\s\S]*?<\/svg>/g, "");
    expect(textMarkup).not.toMatch(/text-primary\/(?:[1-5]\d|60)(?![\d.])/);
  }
});

test("field helpers keep labels and placeholders readable without dimming primary input or button text", () => {
  for (const label of [walletLabel, catalogLabel]) {
    expect(label.split(" ")).toContain("text-muted");
    expect(label).not.toContain("text-primary/");
  }
  for (const field of [walletField, catalogField, ledgerField]) {
    expect(field.split(" ")).toContain("placeholder:text-muted");
    expect(field).not.toMatch(/placeholder:text-(?:primary|muted)\//);
  }
  expect(walletField.split(" ")).toContain("text-primary");
  expect(walletField.split(" ")).toContain("focus-visible:ring-primary");
  expect(walletPrimary.split(" ")).toContain("text-on-primary");
});

test("exact money conversion still handles currency precision and safe-integer boundaries", () => {
  expect(parseMinorAmount("0,29", currencies[0])).toBe(29);
  expect(parseMinorAmount("90071992547409.91", currencies[0])).toBe(Number.MAX_SAFE_INTEGER);
  expect(() => parseMinorAmount("90071992547409.92", currencies[0])).toThrow();
  expect(() => parseMinorAmount("1.001", currencies[0])).toThrow();
  expect(formatMinor(900719925474099199n, "USD", currencies)).toBe("9.007.199.254.740.991,99 USD");
});

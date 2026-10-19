import { afterEach, expect, spyOn, test } from "bun:test";
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { command } from "../lib/commands";
import { mutationInvalidationKeys, purchaseKeys } from "../lib/query-keys";
import { useDeleteCatalogPurchase } from "../hooks/use-catalog";
import { CatalogPurchaseHistory } from "./catalog-purchase-history";
import { CatalogPage } from "./catalog-ui";

const clients = [];
const spies = [];

afterEach(() => {
  for (const spy of spies.splice(0)) spy.mockRestore();
  for (const client of clients.splice(0)) client.clear();
});

function createClient() {
  const client = new QueryClient({ defaultOptions: {
    queries: { retry: false, staleTime: Infinity, gcTime: Infinity },
    mutations: { retry: false, gcTime: Infinity },
  } });
  clients.push(client);
  return client;
}

function renderHook(client, useHook) {
  let result;
  function Probe() {
    result = useHook();
    return null;
  }
  renderToString(createElement(QueryClientProvider, { client }, createElement(Probe)));
  return result;
}

const item = { id: 7, name: "Leche", brand: null, description: null, isArchived: false, purchaseCount: 1, createdAt: "2026-10-18" };
const purchase = { id: 42, itemId: 7, itemName: "Leche", movementId: 9, quantity: 1.5, unitPrice: 200, totalPrice: 300, currencyCode: "USD", date: "2026-10-18", shopName: "Mercado", notes: null };

function renderHistory(client, props = {}) {
  client.setQueryData(purchaseKeys.byItem(item.id), [purchase]);
  client.setQueryData(["currencies", "catalog"], [{ code: "USD", name: "Dollar", symbol: "$", decimalPlaces: 2, isActive: true }]);
  return renderToString(createElement(QueryClientProvider, { client }, createElement(CatalogPurchaseHistory, {
    item, purchaseOpen: false, deletePurchaseId: null, disabled: false,
    onPurchaseOpenChange() {}, onDeletePurchaseChange() {}, onClose() {}, ...props,
  }))).replace(/<!--.*?-->/g, "");
}

test("purchase deletion stays pending, calls only the purchase command, and invalidates every catalog root", async () => {
  const client = createClient();
  const keys = [...mutationInvalidationKeys.catalog, purchaseKeys.byItem(7), purchaseKeys.byMovement(9), ["accounts"]];
  for (const key of keys) client.setQueryData(key, []);
  let complete;
  const purchaseDelete = spyOn(command.purchases, "deleteOne").mockImplementation(() => new Promise((resolve) => { complete = resolve; }));
  const movementDelete = spyOn(command.movements, "deleteOne");
  const movementUpdate = spyOn(command.movements, "updateOne");
  spies.push(purchaseDelete, movementDelete, movementUpdate);
  const pending = renderHook(client, useDeleteCatalogPurchase).mutateAsync(42);
  await new Promise((resolve) => setTimeout(resolve, 0));
  expect(client.getMutationCache().getAll()[0].state.status).toBe("pending");
  expect(purchaseDelete).toHaveBeenCalledWith(42);
  complete();
  await pending;
  for (const key of keys) {
    expect(client.getQueryCache().find({ queryKey: key, exact: true }).state.isInvalidated).toBe(key[0] !== "accounts");
  }
  expect(movementDelete).not.toHaveBeenCalled();
  expect(movementUpdate).not.toHaveBeenCalled();
});

test("failed purchase deletion retains the server error and does not invalidate existing data", async () => {
  const client = createClient();
  client.setQueryData(purchaseKeys.byItem(7), [purchase]);
  const error = new Error("No se pudo eliminar la línea.");
  spies.push(spyOn(command.purchases, "deleteOne").mockRejectedValue(error));
  await expect(renderHook(client, useDeleteCatalogPurchase).mutateAsync(42)).rejects.toBe(error);
  expect(client.getMutationCache().getAll()[0].state.error).toBe(error);
  expect(client.getQueryData(purchaseKeys.byItem(7))).toEqual([purchase]);
  expect(client.getQueryCache().find({ queryKey: purchaseKeys.byItem(7), exact: true }).state.isInvalidated).toBe(false);
});

test("inline confirmation identifies the line and explicitly preserves the expense amount", () => {
  const markup = renderHistory(createClient(), { deletePurchaseId: 42 });
  expect(markup).toContain("¿Eliminar esta línea de compra?");
  expect(markup).toContain("Línea #42");
  expect(markup).toContain("gasto #9");
  expect(markup).toContain("El movimiento de gasto no se elimina y su importe NO cambia.");
  expect(markup).toContain("Confirmar eliminación");
  expect(markup).toContain("Cancelar");
  expect(markup).not.toContain("role=\"dialog\"");
});

test("deletion remains available for archived-item history", () => {
  const markup = renderHistory(createClient(), { item: { ...item, isArchived: true } });
  expect(markup).toContain("Eliminar línea #42 de Leche, gasto #9");
  expect(markup).not.toContain("Registrar compra");
});

test("a disappeared purchase still leaves a cancellable confirmation", () => {
  const markup = renderHistory(createClient(), { deletePurchaseId: 99 });
  expect(markup).toContain("La línea ya no está disponible.");
  expect(markup).toContain("Cancelar");
  expect(markup).toContain("disabled=\"\">Confirmar eliminación");
});

test("catalog headings use light mono with a primary-ink localized word and a transparent root", () => {
  const markup = renderToString(createElement(CatalogPage, { title: "Categorías", headingLead: "Ordená tus", description: "Descripción", action: null }));
  expect(markup).toContain("bg-transparent");
  expect(markup).toContain("font-mono text-4xl font-light");
  expect(markup).toContain("text-muted");
  expect(markup).toContain("class=\"block text-primary\">categorías</span>");
});

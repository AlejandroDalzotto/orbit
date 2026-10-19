import type { Page } from "@playwright/test";
import { test, expect, expectIpc, navigate, readMock } from "./helpers/fixtures";

async function openExpense(page: Page, description = "Compra semanal") {
  await page.getByRole("button", { name: new RegExp(`${description}.*Ver detalle`) }).click();
  const dialog = page.getByRole("dialog", { name: "Detalle del movimiento" });
  await expect(dialog).toBeVisible();
  return dialog;
}

async function linkCafe(page: Page, description: string, price: string, code = "ARS") {
  const dialog = await openExpense(page, description);
  await dialog.getByRole("button", { name: "Vincular artículo", exact: true }).click();
  const form = dialog.getByRole("form", { name: "Vincular artículo al gasto" });
  await form.getByLabel("Artículo", { exact: true }).selectOption("1");
  await form.getByLabel(`Precio unitario (${code})`, { exact: true }).fill(price);
  await form.getByRole("button", { name: "Guardar vínculo" }).click();
  await expect(form).toHaveCount(0);
  await dialog.getByRole("button", { name: "Cerrar", exact: true }).click();
}

test("Expense details: exact fractional purchase refreshes lines and catalog without changing balances", async ({ app }) => {
  // Warm the existing item cache before linking from the ledger.
  await navigate(app, "Artículos");
  await expect(app.getByRole("button", { name: "Ver historial de Café", exact: true })).toBeVisible();
  await navigate(app, "Movimientos");
  const before = await readMock(app);
  const dialog = await openExpense(app);
  const link = dialog.getByRole("button", { name: "Vincular artículo", exact: true });
  await link.click();
  const form = dialog.getByRole("form", { name: "Vincular artículo al gasto" });
  await expect(form.getByLabel("Buscar artículo por nombre o marca")).toBeFocused();
  await form.getByLabel("Buscar artículo por nombre o marca").fill("local");
  await form.getByLabel("Artículo", { exact: true }).selectOption("1");
  await form.getByLabel("Cantidad", { exact: true }).fill("1,5");
  await form.getByLabel("Precio unitario (ARS)", { exact: true }).fill("12,345");
  await form.getByRole("button", { name: "Guardar vínculo" }).click();
  await expect(form.getByRole("alert")).toContainText("hasta 2 decimales");
  expect((await readMock(app)).calls.filter((call) => call.command === "add_purchase")).toHaveLength(0);
  await form.getByLabel("Precio unitario (ARS)", { exact: true }).fill("12,34");
  await form.getByLabel("Notas de la compra (opcional)").fill("  Fraccionado desde el gasto  ");
  await form.getByRole("button", { name: "Guardar vínculo" }).click();
  await expectIpc(app, "add_purchase", { entry: { movementId: 1, itemId: 1, quantity: 1.5, unitPrice: 1234, notes: "Fraccionado desde el gasto" } });
  await expect(form).toHaveCount(0);
  await expect(link).toBeFocused();
  const row = dialog.getByRole("row").filter({ hasText: "Fraccionado desde el gasto" });
  await expect(row).toContainText("Café");
  await expect(row).toContainText("1,5");
  await expect(row).toContainText("12,34 ARS");
  await expect(row).toContainText("18,51 ARS");
  await expect(dialog.getByRole("status")).toContainText("importe del gasto no cambió");
  const after = await readMock(app);
  expect(after.state.movements).toEqual(before.state.movements);
  expect(after.state.accounts).toEqual(before.state.accounts);
  expect(after.state.items[0].purchaseCount).toBe(1);
  expect(after.calls.filter((call) => ["add_movement", "update_movement", "delete_movement"].includes(call.command))).toEqual([]);
  expect(after.calls.filter((call) => call.command === "purchases_by_movement").length).toBeGreaterThanOrEqual(2);
  expect(after.calls.filter((call) => call.command === "get_movements").length).toBeGreaterThan(before.calls.filter((call) => call.command === "get_movements").length);
  expect(after.calls.filter((call) => call.command === "get_items").length).toBeGreaterThan(before.calls.filter((call) => call.command === "get_items").length);
  await app.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(app.getByRole("button", { name: /Compra semanal.*Ver detalle/ })).toBeFocused();
  await navigate(app, "Artículos");
  await app.getByRole("button", { name: "Ver historial de Café", exact: true }).click();
  const history = app.getByRole("region", { name: "Café", exact: true });
  await expect(history.getByRole("row").filter({ hasText: "Fraccionado desde el gasto" })).toContainText("18,51 ARS");
  await expect(history.getByRole("figure", { name: "Evolución del precio unitario en ARS · Mercado local", exact: true })).toBeVisible();
});

test("Link cancellation restores focus; invalid quantities and prices never reach IPC; non-expenses cannot link", async ({ app }) => {
  await navigate(app, "Movimientos");
  const dialog = await openExpense(app);
  const link = dialog.getByRole("button", { name: "Vincular artículo", exact: true });
  await link.click();
  let form = dialog.getByRole("form", { name: "Vincular artículo al gasto" });
  await app.keyboard.press("Escape");
  await expect(form).toHaveCount(0);
  await expect(dialog).toBeVisible();
  await expect(link).toBeFocused();
  await link.click();
  form = dialog.getByRole("form", { name: "Vincular artículo al gasto" });
  await form.getByLabel("Buscar artículo por nombre o marca").fill("no-such-item");
  await expect(form.getByText("No hay artículos que coincidan con la búsqueda.")).toBeVisible();
  await expect(form.getByRole("button", { name: "Guardar vínculo" })).toBeDisabled();
  await form.getByLabel("Buscar artículo por nombre o marca").fill("");
  await form.getByLabel("Artículo", { exact: true }).selectOption("1");
  await form.getByLabel("Precio unitario (ARS)", { exact: true }).fill("0,29");
  for (const quantity of ["0", "-1", "Infinity", "1e2"]) {
    await form.getByLabel("Cantidad", { exact: true }).fill(quantity);
    await form.getByRole("button", { name: "Guardar vínculo" }).click();
    await expect(form.getByRole("alert")).toBeVisible();
  }
  await form.getByLabel("Cantidad", { exact: true }).fill("1");
  await form.getByLabel("Precio unitario (ARS)", { exact: true }).fill("90071992547409,92");
  await form.getByRole("button", { name: "Guardar vínculo" }).click();
  await expect(form.getByRole("alert")).toContainText("precio excede el rango");
  expect((await readMock(app)).calls.filter((call) => call.command === "add_purchase")).toHaveLength(0);
  await form.getByRole("button", { name: "Cancelar vínculo" }).click();
  await expect(link).toBeFocused();
  await dialog.getByRole("button", { name: "Cerrar", exact: true }).click();
  for (const description of ["Sueldo febrero", "Saldo inicial"]) {
    const details = await openExpense(app, description);
    await expect(details.getByRole("button", { name: "Vincular artículo", exact: true })).toHaveCount(0);
    await details.getByRole("button", { name: "Cerrar", exact: true }).click();
  }
});

test("Price evolution: real canvas, multiple dates, separate currencies and shops, responsive filters", async ({ app }) => {
  await navigate(app, "Movimientos");
  await linkCafe(app, "Compra semanal", "0,29");
  await linkCafe(app, "Compra enero", "0.25");
  // A second line on the same day must not produce duplicate chart timestamps.
  await linkCafe(app, "Compra semanal", "0,31");
  await app.getByRole("button", { name: "Nuevo movimiento", exact: true }).click();
  const create = app.getByRole("dialog", { name: "Nuevo movimiento" });
  await create.getByLabel("Cuenta", { exact: true }).selectOption("2");
  await create.getByLabel("Importe · USD", { exact: true }).fill("10");
  await create.getByLabel("Fecha", { exact: true }).fill("2026-02-04");
  await create.getByLabel("Descripción", { exact: true }).fill("Café en dólares");
  await create.getByRole("button", { name: "Crear movimiento" }).click();
  await expect(create).toHaveCount(0);
  await linkCafe(app, "Café en dólares", "2.50", "USD");
  await navigate(app, "Artículos");
  await app.getByRole("button", { name: "Ver historial de Café", exact: true }).click();
  const history = app.getByRole("region", { name: "Café", exact: true });
  const ars = history.getByRole("region", { name: "ARS · Mercado local", exact: true });
  const usd = history.getByRole("region", { name: "USD · Sin tienda", exact: true });
  await expect(ars.getByRole("row")).toHaveCount(4);
  await expect(usd.getByRole("row")).toHaveCount(2);
  await expect(ars).not.toContainText("USD");
  await expect(usd).not.toContainText("ARS");
  const figure = ars.getByRole("figure");
  await expect.poll(() => figure.locator("canvas").evaluateAll((canvases) => canvases.some((element) => {
    const canvas = element as HTMLCanvasElement;
    const context = canvas.getContext("2d");
    if (!context || canvas.width < 100 || canvas.height < 50) return false;
    const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
    let painted = 0;
    for (let index = 3; index < pixels.length; index += 4) if (pixels[index] > 0 && ++painted > 100) return true;
    return false;
  }))).toBe(true);
  await expect(history.getByText("No se pudo dibujar el gráfico.", { exact: false })).toHaveCount(0);
  await history.getByLabel("Moneda", { exact: true }).selectOption("USD");
  await expect(ars).toHaveCount(0);
  await expect(usd.getByRole("figure")).toBeVisible();
  await history.getByLabel("Moneda", { exact: true }).selectOption("");
  await history.getByLabel("Tienda", { exact: true }).selectOption(JSON.stringify("Mercado local"));
  await expect(usd).toHaveCount(0);
  await expect(ars.getByRole("figure")).toBeVisible();
  await app.setViewportSize({ width: 390, height: 844 });
  await expect(ars.getByRole("figure")).toBeVisible();
  expect(await app.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  const purchases = (await readMock(app)).state.purchases;
  expect(purchases.filter((purchase) => purchase.currencyCode === "ARS").map((purchase) => purchase.unitPrice)).toEqual([29, 25, 31]);
});

test("Archived items cannot be linked, including when no active items remain", async ({ app }) => {
  await navigate(app, "Artículos");
  await app.getByRole("button", { name: "Archivar Café", exact: true }).click();
  await app.getByRole("button", { name: "Confirmar archivo", exact: true }).click();
  await expectIpc(app, "delete_item", { id: 1 });
  await navigate(app, "Movimientos");
  const dialog = await openExpense(app);
  await dialog.getByRole("button", { name: "Vincular artículo", exact: true }).click();
  const form = dialog.getByRole("form", { name: "Vincular artículo al gasto" });
  await expect(form.getByText(/No hay artículos activos/)).toBeVisible();
  await expect(form.getByLabel("Artículo", { exact: true })).toBeDisabled();
  await expect(form.getByRole("option", { name: /Café/ })).toHaveCount(0);
  await expect(form.getByRole("button", { name: "Guardar vínculo" })).toBeDisabled();
  expect((await readMock(app)).calls.filter((call) => call.command === "add_purchase")).toHaveLength(0);
});

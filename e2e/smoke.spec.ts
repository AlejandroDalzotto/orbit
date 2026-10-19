import { test, expect, expectIpc, navigate, readMock } from "./helpers/fixtures";
import type { Page } from "@playwright/test";

async function newMovement(page: Page) {
  await page.getByRole("button", { name: "Nuevo movimiento", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Nuevo movimiento" });
  await expect(dialog).toBeVisible();
  await expect(dialog).toHaveJSProperty("open", true);
  expect(await dialog.evaluate((element) => element.matches(":modal"))).toBe(true);
  return dialog;
}

async function expectPaintedChart(page: Page, code: string) {
  const figure = page.getByRole("figure", { name: `Flujo mensual en ${code}`, exact: true });
  await expect(figure).toBeVisible();
  await expect(figure.getByRole("alert")).toHaveCount(0);
  // Check real canvas pixels, not just a wrapper left behind after chart initialization fails.
  await expect.poll(() => figure.locator("canvas").evaluateAll((canvases) => canvases.some((element) => {
    const canvas = element as HTMLCanvasElement;
    const context = canvas.getContext("2d");
    if (!context || canvas.width < 100 || canvas.height < 50) return false;
    const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
    let painted = 0;
    for (let index = 3; index < pixels.length; index += 4) if (pixels[index] > 0 && ++painted > 100) return true;
    return false;
  })), { message: `Real ${code} chart canvases should have painted pixels` }).toBe(true);
  return figure;
}

test("Wallet: native dialog, add account, literal special-character search", async ({ app }) => {
  const open = app.getByRole("button", { name: "Nueva cuenta", exact: true });
  await open.click();
  let dialog = app.getByRole("dialog", { name: "Nueva cuenta" });
  expect(await dialog.evaluate((element) => element.matches(":modal"))).toBe(true);
  expect(await dialog.evaluate((element) => element.contains(document.activeElement))).toBe(true);
  await app.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(open).toBeFocused();

  await open.click();
  dialog = app.getByRole("dialog", { name: "Nueva cuenta" });
  const name = '<img src=x onerror=alert(1)> 50%_\\';
  await dialog.getByLabel("Nombre de la cuenta").fill(`  ${name}  `);
  await dialog.getByLabel("Tipo de cuenta").selectOption("savings");
  await dialog.getByRole("combobox", { name: "Moneda", exact: true }).selectOption("ARS");
  await dialog.getByLabel("Saldo inicial · opcional").fill("1234,56");
  await dialog.getByLabel("Descripción · opcional").fill("  Fondo de prueba  ");
  await dialog.getByRole("button", { name: "Crear cuenta", exact: true }).click();
  await expect(dialog).toHaveCount(0);
  await expectIpc(app, "add_account", { entry: { name, accountType: "savings", currencyCode: "ARS", initialBalance: 123456, description: "Fondo de prueba" } });
  await app.getByLabel("Buscar cuenta").fill("%_\\");
  await expectIpc(app, "get_accounts", { filter: { activeOnly: true, search: "%_\\", sort: { field: "name", direction: "ASC" }, pagination: { limit: 10, offset: 0 } } });
  const row = app.getByRole("listitem").filter({ has: app.getByText(name, { exact: true }) });
  await expect(row).toHaveCount(1);
  await expect(row.getByText("1.234,56 ARS", { exact: true })).toBeVisible();
  await expect(row.locator("img")).toHaveCount(0);
  await expect(app.getByText("1–1 de 1 cuentas", { exact: true })).toBeVisible();
  await app.getByLabel("Buscar cuenta").fill("definitely missing");
  await expect(app.getByRole("heading", { name: "No encontramos esa cuenta." })).toBeVisible();
  await app.getByRole("button", { name: "Limpiar filtros", exact: true }).first().click();
  await expect(app.getByRole("button", { name: `Ver detalles de ${name}`, exact: true })).toBeEnabled();
});

test("Ledger: expense rejects excess precision and sends integer minor units", async ({ app }) => {
  await navigate(app, "Movimientos");
  const dialog = await newMovement(app);
  await dialog.getByLabel("Cuenta", { exact: true }).selectOption("1");
  await dialog.getByLabel("Importe · ARS", { exact: true }).fill("12,345");
  await dialog.getByLabel("Descripción", { exact: true }).fill("Gasto de prueba");
  await dialog.getByRole("button", { name: "Crear movimiento" }).click();
  await expect(dialog.getByRole("alert")).toContainText("ARS admite 2 decimales");
  expect((await readMock(app)).calls.filter((call) => call.command === "add_movement")).toHaveLength(0);
  await dialog.getByLabel("Importe · ARS", { exact: true }).fill("12,34");
  await dialog.getByLabel("Fecha", { exact: true }).fill("2026-02-15");
  await dialog.getByLabel("Categoría", { exact: true }).selectOption("1");
  await dialog.getByLabel("Comercio", { exact: true }).selectOption("1");
  await dialog.getByLabel("Notas", { exact: true }).fill("  recibo  ");
  await dialog.getByRole("button", { name: "Crear movimiento" }).click();
  await expect(dialog).toHaveCount(0);
  await expectIpc(app, "add_movement", { entry: { accountId: 1, type: "expense", amount: 1234, currencyCode: "ARS", date: "2026-02-15", description: "Gasto de prueba", notes: "recibo", categoryId: 1, shopId: 1, toAccountId: null, toAmount: null } });
  const row = app.getByRole("row").filter({ has: app.getByRole("button", { name: /Gasto de prueba/ }) });
  await expect(row).toHaveCount(1);
  await expect(row).toContainText("−12,34 ARS");
  await expect(row).toContainText("Alimentación");
  await row.getByRole("button").click();
  await expect(app.getByRole("dialog")).toContainText("recibo");
  await app.keyboard.press("Escape");
  await expect(app.getByRole("dialog")).toHaveCount(0);
});

test("Ledger: same-currency and explicit cross-currency transfer amounts", async ({ app }) => {
  await navigate(app, "Movimientos");
  let dialog = await newMovement(app);
  await dialog.getByLabel("Tipo de movimiento").selectOption("transfer");
  await dialog.getByLabel("Cuenta de origen").selectOption("1");
  await dialog.getByLabel("Cuenta de destino").selectOption("3");
  await dialog.getByLabel("Importe · ARS", { exact: true }).fill("25,50");
  await expect(dialog.getByLabel("Importe recibido · ARS", { exact: true })).toBeDisabled();
  await expect(dialog.getByLabel("Importe recibido · ARS", { exact: true })).toHaveValue("25,50");
  await dialog.getByLabel("Fecha", { exact: true }).fill("2026-02-16");
  await dialog.getByLabel("Descripción", { exact: true }).fill("Transferencia pesos");
  await dialog.getByRole("button", { name: "Crear movimiento" }).click();
  await expect(dialog).toHaveCount(0);
  await expectIpc(app, "add_movement", { entry: { accountId: 1, type: "transfer", amount: 2550, currencyCode: "ARS", date: "2026-02-16", description: "Transferencia pesos", notes: null, categoryId: null, shopId: null, toAccountId: 3, toAmount: 2550 } });

  dialog = await newMovement(app);
  await dialog.getByLabel("Tipo de movimiento").selectOption("transfer");
  await dialog.getByLabel("Cuenta de origen").selectOption("1");
  await dialog.getByLabel("Cuenta de destino").selectOption("2");
  await dialog.getByLabel("Importe · ARS", { exact: true }).fill("100,01");
  const received = dialog.getByLabel("Importe recibido · USD", { exact: true });
  await expect(received).toBeEnabled();
  await expect(received).toHaveValue("");
  await received.fill("4,56");
  await dialog.getByLabel("Fecha", { exact: true }).fill("2026-02-17");
  await dialog.getByLabel("Descripción", { exact: true }).fill("Transferencia dólares");
  await dialog.getByRole("button", { name: "Crear movimiento" }).click();
  await expect(dialog).toHaveCount(0);
  await expectIpc(app, "add_movement", { entry: { accountId: 1, type: "transfer", amount: 10001, currencyCode: "ARS", date: "2026-02-17", description: "Transferencia dólares", notes: null, categoryId: null, shopId: null, toAccountId: 2, toAmount: 456 } });
  const row = app.getByRole("row").filter({ has: app.getByRole("button", { name: /Transferencia dólares/ }) });
  await expect(row).toHaveCount(1);
  await expect(row).toContainText("−100,01 ARS");
  await expect(row).toContainText("+4,56 USD");
  await expect(row).toContainText("→ Dólares");
});

test("Categories: add a parent and child, render and search hierarchy", async ({ app }) => {
  await navigate(app, "Categorías");
  await app.getByRole("button", { name: "Nueva categoría", exact: true }).click();
  let form = app.getByRole("form", { name: "Nueva categoría", exact: true });
  await form.getByLabel("Nombre", { exact: true }).fill("Hogar");
  await form.getByRole("button", { name: "Guardar categoría" }).click();
  await expect(form).toHaveCount(0);
  await expectIpc(app, "add_category", { entry: { name: "Hogar", type: "expense", parentId: null } });
  const parent = (await readMock(app)).state.categories.find((category) => category.name === "Hogar")!;
  await app.getByRole("button", { name: "Nueva categoría", exact: true }).click();
  form = app.getByRole("form", { name: "Nueva categoría", exact: true });
  await form.getByLabel("Nombre", { exact: true }).fill("Limpieza");
  await form.getByLabel("Categoría padre").selectOption(String(parent.id));
  await form.getByRole("button", { name: "Guardar categoría" }).click();
  await expect(form).toHaveCount(0);
  await expectIpc(app, "add_category", { entry: { name: "Limpieza", type: "expense", parentId: parent.id } });
  const child = app.getByRole("listitem").filter({ has: app.getByRole("heading", { name: /Limpieza/ }) });
  await expect(child).toContainText("Hogar /");
  await app.getByLabel("Buscar en la jerarquía").fill("Hogar");
  await expect(app.getByRole("main").getByRole("listitem")).toHaveCount(2);
  await child.getByRole("button", { name: "Editar Limpieza", exact: true }).click();
  const edit = app.getByRole("form", { name: "Editar categoría" });
  await expect(edit.getByLabel("Categoría padre")).toHaveValue(String(parent.id));
  await expect(edit.getByLabel("Categoría padre").getByRole("option", { name: /Limpieza/ })).toHaveCount(0);
  await edit.getByRole("button", { name: "Cancelar" }).click();
});

test("Items: create, purchase, price history, delete line and archive item", async ({ app }) => {
  await navigate(app, "Artículos");
  await app.getByRole("button", { name: "Nuevo ítem", exact: true }).click();
  const itemForm = app.getByRole("form", { name: "Nuevo ítem" });
  await itemForm.getByLabel("Nombre", { exact: true }).fill("Yerba de prueba");
  await itemForm.getByLabel("Marca (opcional)").fill("Orbit");
  await itemForm.getByRole("button", { name: "Guardar ítem" }).click();
  await expect(itemForm).toHaveCount(0);
  await expectIpc(app, "add_item", { entry: { name: "Yerba de prueba", brand: "Orbit", description: null } });
  const item = (await readMock(app)).state.items.find((row) => row.name === "Yerba de prueba")!;
  const history = app.getByRole("region", { name: "Yerba de prueba", exact: true });
  await expect(history.getByRole("heading", { name: "Todavía no hay compras" })).toBeVisible();
  await history.getByRole("button", { name: "Registrar compra", exact: true }).click();
  const purchaseForm = history.getByRole("form", { name: "Registrar compra" });
  await purchaseForm.getByLabel("Buscar gasto por descripción o notas").fill("Compra semanal");
  await purchaseForm.getByLabel("Movimiento de gasto").selectOption("1");
  await purchaseForm.getByLabel("Cantidad", { exact: true }).fill("1,5");
  await purchaseForm.getByLabel("Precio unitario (ARS)", { exact: true }).fill("12,34");
  await purchaseForm.getByLabel("Notas de la compra (opcional)").fill("Paquete fraccionado");
  await purchaseForm.getByRole("button", { name: "Registrar compra", exact: true }).click();
  await expect(purchaseForm).toHaveCount(0);
  await expectIpc(app, "add_purchase", { entry: { movementId: 1, itemId: item.id, quantity: 1.5, unitPrice: 1234, notes: "Paquete fraccionado" } });
  const priceRow = history.getByRole("row").filter({ hasText: "Paquete fraccionado" });
  await expect(priceRow).toContainText("12,34 ARS");
  await expect(priceRow).toContainText("18,51 ARS");
  await expect(history.getByRole("region", { name: "ARS · Mercado local", exact: true })).toBeVisible();
  const purchase = (await readMock(app)).state.purchases[0];
  await priceRow.getByRole("button", { name: /Eliminar línea/ }).click();
  await expect(history.getByRole("heading", { name: "¿Eliminar esta línea de compra?" })).toBeVisible();
  await history.getByRole("button", { name: "Confirmar eliminación" }).click();
  await expectIpc(app, "delete_purchase", { id: purchase.id });
  await expect(history.getByRole("heading", { name: "Todavía no hay compras" })).toBeVisible();
  await expect(history.getByRole("status")).toContainText("El gasto #1 se conserva");
  expect((await readMock(app)).calls.filter((call) => ["add_movement", "update_movement", "delete_movement"].includes(call.command))).toEqual([]);
  await app.getByRole("button", { name: "Archivar Yerba de prueba", exact: true }).click();
  await app.getByRole("button", { name: "Confirmar archivo", exact: true }).click();
  await expectIpc(app, "delete_item", { id: item.id });
  await expect(app.getByRole("button", { name: "Ver historial de Yerba de prueba", exact: true })).toHaveCount(0);
  await app.getByLabel("Incluir archivados", { exact: true }).check();
  await expect(app.getByRole("button", { name: "Ver historial de Yerba de prueba", exact: true })).toContainText("Archivado");
  await navigate(app, "Movimientos");
  const expense = app.getByRole("row").filter({ has: app.getByRole("button", { name: /Compra semanal/ }) });
  await expect(expense).toContainText("−123,45 ARS");
});

test("Analytics: real Edge canvas, currency/period controls and responsive layouts", async ({ app }, testInfo) => {
  await navigate(app, "Analytics");
  await app.getByRole("combobox", { name: "Período", exact: true }).selectOption("custom");
  await app.getByLabel("Desde (mes)").fill("2026-01");
  await app.getByLabel("Hasta (mes)").fill("2026-02");
  await app.getByLabel("Moneda del flujo").selectOption("ARS");
  let figure = await expectPaintedChart(app, "ARS");
  const monthly = app.getByRole("table", { name: /Flujo mensual en ARS/ });
  await expect(monthly.getByRole("row")).toHaveCount(4); // header, two months, total
  await expect(monthly.getByRole("row").filter({ hasText: "Total del período" })).toContainText("2.000,00 ARS");
  await app.getByLabel("Moneda del flujo").selectOption("USD");
  await expectPaintedChart(app, "USD");
  await expect(app.getByRole("table", { name: /Flujo mensual en USD/ })).toContainText("500,00 USD");
  await app.setViewportSize({ width: 900, height: 700 });
  await app.getByLabel("Moneda del flujo").selectOption("ARS");
  figure = await expectPaintedChart(app, "ARS");
  await figure.scrollIntoViewIfNeeded();
  const small = await figure.boundingBox();
  expect(small).not.toBeNull();
  expect(small!.x).toBeGreaterThanOrEqual(0);
  expect(small!.x + small!.width).toBeLessThanOrEqual(900);
  expect(await app.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await navigate(app, "Billetera");
  await app.getByRole("button", { name: "Nueva cuenta", exact: true }).click();
  await expect(app.getByRole("dialog", { name: "Nueva cuenta" })).toBeVisible();
  await app.keyboard.press("Escape");
  await navigate(app, "Analytics");
  await app.getByRole("combobox", { name: "Período", exact: true }).selectOption("all");
  await app.setViewportSize({ width: 1400, height: 1000 });
  figure = await expectPaintedChart(app, "ARS");
  await figure.scrollIntoViewIfNeeded();
  await app.evaluate(() => document.fonts.ready);
  const screenshot = testInfo.outputPath("orbit-1400x1000.png");
  await app.screenshot({ path: screenshot, animations: "disabled" });
  await testInfo.attach("orbit-1400x1000", { path: screenshot, contentType: "image/png" });
  await expect(app.getByRole("alert")).toHaveCount(0);
});

test.describe("Reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("Settings: theme survives reload through IPC stub; reduced-motion chart renders", async ({ app }) => {
    expect(await app.evaluate(() => matchMedia("(prefers-reduced-motion: reduce)").matches)).toBe(true);
    await navigate(app, "Configuración");
    const dim = app.getByRole("button", { name: "Grafito / tenue", exact: true });
    await dim.click();
    await expectIpc(app, "update_settings", { entry: { theme: "dim", noiseEnabled: true } });
    await expect(dim).toHaveAttribute("aria-pressed", "true");
    await expect(app.locator("html")).toHaveAttribute("data-theme", "dim");
    expect(await app.evaluate(() => localStorage.getItem("orbit-theme"))).toBe("dim");
    expect(await app.locator(".animate-enter").evaluate((element) => getComputedStyle(element).animationName)).toBe("none");
    // Clear the frontend cache: reload must recover the theme from the persistent IPC stub.
    await app.evaluate(() => localStorage.removeItem("orbit-theme"));
    await app.reload();
    await expectIpc(app, "get_settings", {});
    await expect(app.locator("html")).toHaveAttribute("data-theme", "dim");
    await navigate(app, "Configuración");
    await expect(app.getByRole("button", { name: "Grafito / tenue", exact: true })).toHaveAttribute("aria-pressed", "true");
    await navigate(app, "Analytics");
    await app.getByRole("combobox", { name: "Período", exact: true }).selectOption("all");
    await expectPaintedChart(app, "ARS");
    await navigate(app, "Configuración"); // also exercises chart cleanup under reduced motion
    await app.getByRole("button", { name: "Negro / original", exact: true }).click();
    await expectIpc(app, "update_settings", { entry: { theme: "dark", noiseEnabled: true } });
    await expect(app.locator("html")).toHaveAttribute("data-theme", "dark");
  });
});

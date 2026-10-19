import { test, expect, navigate, readMock, expectIpc } from "./helpers/fixtures";
import type { MovementFilter } from "../src/types/generated/MovementFilter";
import type { MockState } from "./helpers/tauri-mock";

// Extend this test's state only; the shared IPC mock remains unchanged.
test("Analytics confines long values and resized charts to its own scroll area", async ({ app }, testInfo) => {
  await app.evaluate(() => {
    const { state } = (window as unknown as { __orbitMock: { state: MockState } }).__orbitMock;
    state.categories[0].name = "Categoría".repeat(30);
    state.currencies[0].name = "Moneda".repeat(30);
    state.movements[0].amount = 2_000_000_000_000_000;
    state.movements[1].amount = 4_000_000_000_000_000;
    state.accounts[0].balance = 2_000_000_000_000_000;
  });
  await navigate(app, "Analytics");
  await app.getByRole("combobox", { name: "Período", exact: true }).selectOption("all");
  const analytics = app.getByRole("region", { name: "Analítica", exact: true });
  const figure = analytics.getByRole("figure", { name: "Flujo mensual en ARS", exact: true });
  await expect(figure.locator("canvas").first()).toBeVisible();

  for (const width of [900, 600, 900]) {
    await app.setViewportSize({ width, height: 700 });
    await app.evaluate(() => document.fonts.ready);

    await expect.poll(async () => analytics.evaluate((view) => {
      const main = document.getElementById("main-content")!;
      const figure = view.querySelector("figure")!;
      const chart = figure.querySelector(".tv-lightweight-charts")!;
      return {
        viewport: window.innerWidth,
        documentWidth: document.documentElement.scrollWidth,
        documentHeight: document.documentElement.scrollHeight,
        mainWidth: main.clientWidth,
        mainScrollWidth: main.scrollWidth,
        mainHeight: main.clientHeight,
        mainScrollHeight: main.scrollHeight,
        viewWidth: view.clientWidth,
        viewScrollWidth: view.scrollWidth,
        viewHeight: view.clientHeight,
        viewScrollHeight: view.scrollHeight,
        figureRight: Math.round(figure.getBoundingClientRect().right),
        chartWidth: Math.round(chart.getBoundingClientRect().width),
        containerWidth: chart.parentElement!.clientWidth,
      };
    }), { message: `Analytics must fit the fixed shell at ${width}px` }).toMatchObject({
      viewport: width,
      documentWidth: width,
      documentHeight: 700,
      mainWidth: width - 56,
      mainScrollWidth: width - 56,
      mainHeight: 636,
      mainScrollHeight: 636,
      viewWidth: width - 56,
      viewScrollWidth: width - 56,
      viewHeight: 636,
    });
    await expect.poll(() => figure.evaluate((element) => {
      const chart = element.querySelector(".tv-lightweight-charts")!;
      return Math.abs(chart.getBoundingClientRect().width - chart.parentElement!.clientWidth);
    })).toBeLessThanOrEqual(1);
    expect(await figure.evaluate((element) => element.getBoundingClientRect().right)).toBeLessThanOrEqual(width);
    const monthly = analytics.getByRole("table", { name: /Flujo mensual en ARS/ });
    const category = analytics.getByRole("table", { name: /Gastos por categoría en ARS/ });
    for (const table of [monthly, category]) {
      expect(await table.evaluate((element) => {
        const scroller = element.parentElement!;
        scroller.scrollLeft = scroller.scrollWidth;
        return { overflow: getComputedStyle(scroller).overflowX, reachable: scroller.scrollWidth <= scroller.clientWidth || scroller.scrollLeft > 0 };
      })).toEqual({ overflow: "auto", reachable: true });
      if (table === monthly && width === 600) expect(await table.evaluate((element) => element.parentElement!.scrollLeft)).toBeGreaterThan(0);
      await expect(table).toBeVisible();
    }
    await monthly.getByRole("row", { name: /Total del período/ }).scrollIntoViewIfNeeded();
    expect(await analytics.evaluate((view) => view.scrollTop)).toBeGreaterThan(0);
    expect(await app.evaluate(() => [window.scrollY, document.getElementById("main-content")!.scrollTop])).toEqual([0, 0]);
    await testInfo.attach(`analytics-${width}`, { body: await app.screenshot(), contentType: "image/png" });
  }
});

const defaultFilter: MovementFilter = {
  search: null, accountId: null, categoryId: null, movementType: null, currencyCode: null,
  dateFrom: null, dateTo: null, limit: 25, offset: 0,
};

test("Account history is a one-shot, clean filter for rows, archived accounts and details", async ({ app }) => {
  await app.evaluate(() => {
    const { state } = (window as unknown as { __orbitMock: { state: MockState } }).__orbitMock;
    state.accounts[2].isActive = false;
    const source = state.movements[0];
    state.movements.push({ ...source, id: 10, type: "transfer", categoryId: null, shopId: null, toAccountId: 3, toAccountName: "Ahorro pesos", toCurrencyCode: "ARS", toAmount: 12345, transferGroupId: "history-transfer", description: "Transferencia al ahorro" });
    for (let index = 0; index < 30; index++) {
      state.movements.push({ ...source, id: 200 + index, accountId: 2, accountName: "Dólares", type: "income", categoryId: 2, currencyCode: "USD", description: `Historial USD ${index}` });
    }
  });
  await app.getByRole("checkbox", { name: "Incluir archivadas" }).check();
  const archived = app.getByRole("listitem").filter({ has: app.getByRole("button", { name: "Ver movimientos de Ahorro pesos", exact: true }) });
  await expect(archived).toContainText("Archivada");
  const start = (await readMock(app)).calls.length;
  await archived.getByRole("button", { name: "Ver movimientos de Ahorro pesos", exact: true }).click();
  await expect(app.getByRole("combobox", { name: "Cuenta", exact: true })).toHaveValue("3");
  await expectIpc(app, "get_movements", { filter: { ...defaultFilter, accountId: 3 } });
  expect((await readMock(app)).calls.slice(start).filter((call) => call.command === "get_movements").map((call) => call.args)).toEqual([{ filter: { ...defaultFilter, accountId: 3 } }]);
  const ledger = app.getByRole("table", { name: /Movimientos paginados/ });
  await expect(ledger).toContainText("Transferencia al ahorro");
  await expect(ledger).toContainText("Saldo inicial");
  await expect(ledger).not.toContainText("Compra semanal");
  await expect(app.getByRole("combobox", { name: "Cuenta", exact: true }).locator("option:checked")).toContainText("inactiva");

  // Even clicking the already-current global navigation opens the full ledger.
  await navigate(app, "Movimientos");
  await expect(app.getByRole("combobox", { name: "Cuenta", exact: true })).toHaveValue("");
  await expectIpc(app, "get_movements", { filter: defaultFilter });
  await app.getByRole("combobox", { name: "Moneda", exact: true }).selectOption("USD");
  await app.getByRole("combobox", { name: "Tipo", exact: true }).selectOption("income");
  await app.getByRole("combobox", { name: "Categoría", exact: true }).selectOption("2");
  await app.getByLabel("Desde", { exact: true }).fill("2026-01-01");
  await app.getByLabel("Hasta", { exact: true }).fill("2026-12-31");
  await app.getByRole("searchbox").fill("Historial");
  const staleFilter = { ...defaultFilter, search: "Historial", categoryId: 2, movementType: "income", currencyCode: "USD", dateFrom: "2026-01-01", dateTo: "2026-12-31", offset: 25 };
  await expectIpc(app, "get_movements", { filter: { ...staleFilter, offset: 0 } });
  await app.getByRole("button", { name: "Siguiente", exact: true }).click();
  await expectIpc(app, "get_movements", { filter: staleFilter });

  await navigate(app, "Billetera");
  const nextStart = (await readMock(app)).calls.length;
  await app.getByRole("button", { name: "Ver movimientos de Cuenta diaria", exact: true }).click();
  await expect(app.getByRole("combobox", { name: "Cuenta", exact: true })).toHaveValue("1");
  await expectIpc(app, "get_movements", { filter: { ...defaultFilter, accountId: 1 } });
  expect((await readMock(app)).calls.slice(nextStart).filter((call) => call.command === "get_movements").map((call) => call.args)).toEqual([{ filter: { ...defaultFilter, accountId: 1 } }]);
  await expect(app.getByRole("searchbox")).toHaveValue("");
  for (const name of ["Moneda", "Tipo", "Categoría"]) await expect(app.getByRole("combobox", { name, exact: true })).toHaveValue("");
  for (const name of ["Desde", "Hasta"]) await expect(app.getByLabel(name, { exact: true })).toHaveValue("");
  await expect(ledger).toContainText("Transferencia al ahorro");
  await expect(ledger).toContainText("Compra semanal");
  await expect(ledger).not.toContainText("Historial USD");

  await navigate(app, "Billetera");
  await app.getByRole("button", { name: "Ver detalles de Dólares", exact: true }).click();
  await app.getByRole("dialog", { name: "Detalle de cuenta" }).getByRole("button", { name: "Ver movimientos de esta cuenta" }).click();
  await expect(app.getByRole("dialog")).toHaveCount(0);
  await expect(app.getByRole("combobox", { name: "Cuenta", exact: true })).toHaveValue("2");
  await expectIpc(app, "get_movements", { filter: { ...defaultFilter, accountId: 2 } });
  await navigate(app, "Analytics");
  await navigate(app, "Movimientos");
  await expect(app.getByRole("combobox", { name: "Cuenta", exact: true })).toHaveValue("");
  await app.reload();
  await navigate(app, "Movimientos");
  await expect(app.getByRole("combobox", { name: "Cuenta", exact: true })).toHaveValue("");
});

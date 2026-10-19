import type { Locator, Page, TestInfo } from "@playwright/test";
import { test, expect, expectIpc, navigate, readMock } from "./helpers/fixtures";
import { installImportMock } from "./helpers/import-mock";
import { configureWindowMock, emitWindowResize, installWindowMock, readWindowMock, releaseWindowMock } from "./helpers/window-mock";
import type { IpcCall, MockState } from "./helpers/tauri-mock";
import type { Settings } from "../src/types/generated/Settings";

const themes = [
  { id: "dark", label: "Negro / original", background: "#090909" },
  { id: "dim", label: "Grafito / tenue", background: "#141414" },
  { id: "cream", label: "Crema / almendra", background: "#f6e9c7" },
  { id: "ember", label: "Brasa / naranja quemado", background: "#191816" },
] as const;
const noiseSwitch = (page: Page) => page.getByRole("switch", { name: "Textura de ruido", exact: true });
const themeButton = (page: Page, theme: Settings["theme"]) => page.getByRole("button", { name: themes.find(({ id }) => id === theme)!.label, exact: true });

interface PreferencesWindow extends Window {
  __TAURI_INTERNALS__: { invoke: (command: string, args?: Record<string, unknown>) => Promise<unknown> };
  __orbitMock: { state: MockState; calls: IpcCall[] };
  __preferenceSave: { calls: IpcCall[]; hold: boolean; fail: boolean; release?: () => void };
  __settingsGate: { started: number; release: () => void };
}

async function appearanceSnapshot(page: Page) {
  return page.evaluate(() => ({
    theme: document.documentElement.dataset.theme,
    noise: document.documentElement.dataset.noiseEnabled,
    cachedTheme: localStorage.getItem("orbit-theme"),
    cachedNoise: localStorage.getItem("orbit-noise-enabled"),
    meta: document.querySelector('meta[name="theme-color"]')?.getAttribute("content"),
  }));
}

async function expectAppearance(page: Page, settings: Settings) {
  await expect.poll(() => appearanceSnapshot(page)).toEqual({
    theme: settings.theme, noise: String(settings.noiseEnabled), cachedTheme: settings.theme,
    cachedNoise: String(settings.noiseEnabled), meta: themes.find(({ id }) => id === settings.theme)!.background,
  });
}

async function chooseTheme(page: Page, theme: Settings["theme"]) {
  await themeButton(page, theme).click();
  await expect(themeButton(page, theme)).toHaveAttribute("aria-pressed", "true");
  await expect(themeButton(page, theme)).toBeEnabled();
  // Inherited ink transitions from the previous palette after the save resolves.
  await page.evaluate(() => Promise.all(document.getAnimations()
    .filter((animation) => animation.effect?.getTiming().iterations !== Infinity)
    .map((animation) => animation.finished.catch(() => {}))));
}

async function saveScreenshot(page: Page, info: TestInfo, name: string) {
  await page.evaluate(() => document.fonts.ready);
  const path = info.outputPath(`${name}.png`);
  await page.screenshot({ path, animations: "disabled" });
  await info.attach(name, { path, contentType: "image/png" });
}

// Composites translucent token backgrounds rather than assuming every element
// has an opaque background. Gradients are intentionally not an accessibility audit.
async function expectReadable(locator: Locator, minimum = 4.5) {
  await expect(locator).toBeVisible();
  const result = await locator.evaluate((element) => {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 1;
    const context = canvas.getContext("2d", { willReadFrequently: true })!;
    function rgba(value: string) {
      context.clearRect(0, 0, 1, 1);
      context.fillStyle = value;
      context.fillRect(0, 0, 1, 1);
      return [...context.getImageData(0, 0, 1, 1).data];
    }
    const layers: number[][] = [];
    for (let node: Element | null = element; node; node = node.parentElement) layers.unshift(rgba(getComputedStyle(node).backgroundColor));
    let background = [255, 255, 255];
    for (const layer of layers) background = background.map((value, index) => layer[index] * layer[3] / 255 + value * (1 - layer[3] / 255));
    const foreground = rgba(getComputedStyle(element).color);
    const ink = background.map((value, index) => foreground[index] * foreground[3] / 255 + value * (1 - foreground[3] / 255));
    function luminance(rgb: number[]) {
      return rgb.map((value) => value / 255).map((value) => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4)
        .reduce((sum, value, index) => sum + value * [0.2126, 0.7152, 0.0722][index], 0);
    }
    const a = luminance(ink), b = luminance(background);
    return { text: element.textContent?.trim(), foreground: ink, background, ratio: (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05) };
  });
  expect.soft(result.ratio, JSON.stringify(result)).toBeGreaterThanOrEqual(minimum);
}

async function installSaveGate(page: Page) {
  await page.evaluate(() => {
    const browser = window as unknown as PreferencesWindow;
    const original = browser.__TAURI_INTERNALS__.invoke;
    const control = { calls: [] as IpcCall[], hold: true, fail: true } as PreferencesWindow["__preferenceSave"];
    browser.__preferenceSave = control;
    browser.__TAURI_INTERNALS__.invoke = async (command, args = {}) => {
      if (command !== "update_settings") return original(command, args);
      const call = { command, args: structuredClone(args) };
      control.calls.push(call);
      if (control.hold) await new Promise<void>((resolve) => { control.release = resolve; });
      if (control.fail) {
        browser.__orbitMock.calls.push(call);
        throw { message: "SQLite appearance write rejected" };
      }
      return original(command, args);
    };
  });
}

// addInitScript order is unspecified. The setter catches a shared runtime
// installed later; wrapping the existing value handles the opposite order.
function delaySettingsAtStartup(options: { cached: Settings | null; saved: Settings }) {
  const browser = window as unknown as PreferencesWindow;
  if (options.cached) {
    localStorage.setItem("orbit-theme", options.cached.theme);
    localStorage.setItem("orbit-noise-enabled", String(options.cached.noiseEnabled));
  } else {
    localStorage.removeItem("orbit-theme");
    localStorage.removeItem("orbit-noise-enabled");
  }
  let release!: () => void;
  const gate = new Promise<void>((resolve) => { release = resolve; });
  browser.__settingsGate = { started: 0, release };
  function wrap(runtime: PreferencesWindow["__TAURI_INTERNALS__"]) {
    const original = runtime.invoke;
    runtime.invoke = async (command, args = {}) => {
      if (command === "get_settings") {
        browser.__settingsGate.started++;
        await gate;
        browser.__orbitMock.state.settings = { ...options.saved };
      }
      return original(command, args);
    };
    return runtime;
  }
  let runtime = browser.__TAURI_INTERNALS__;
  if (runtime) runtime = wrap(runtime);
  Object.defineProperty(browser, "__TAURI_INTERNALS__", { configurable: true, get: () => runtime, set: (value) => { runtime = wrap(value); } });
}

for (const theme of themes) {
  test(`Appearance: ${theme.id} and both noise states survive restart and cache loss`, async ({ app }) => {
    await navigate(app, "Configuración");
    await expect(noiseSwitch(app)).toHaveAttribute("aria-checked", "true");
    await chooseTheme(app, theme.id);
    await expectIpc(app, "update_settings", { entry: { theme: theme.id, noiseEnabled: true } });
    for (const noiseEnabled of [false, true]) {
      await noiseSwitch(app).click();
      await expect(noiseSwitch(app)).toHaveAttribute("aria-checked", String(noiseEnabled));
      await expect(noiseSwitch(app)).toBeEnabled();
      await expectIpc(app, "update_settings", { entry: { theme: theme.id, noiseEnabled } });
      await expectAppearance(app, { theme: theme.id, noiseEnabled });
      expect((await readMock(app)).state.settings).toEqual({ theme: theme.id, noiseEnabled });
      await app.reload();
      await expectAppearance(app, { theme: theme.id, noiseEnabled });
      await navigate(app, "Configuración");
      await expect(themeButton(app, theme.id)).toHaveAttribute("aria-pressed", "true");
      await expect(noiseSwitch(app)).toHaveAttribute("aria-checked", String(noiseEnabled));
      await app.evaluate(() => { localStorage.removeItem("orbit-theme"); localStorage.removeItem("orbit-noise-enabled"); });
      await app.reload();
      await expectIpc(app, "get_settings", {});
      await expectAppearance(app, { theme: theme.id, noiseEnabled });
      await navigate(app, "Configuración");
      await expect(noiseSwitch(app)).toHaveAttribute("aria-checked", String(noiseEnabled));
    }
  });
}

test("Appearance mutations preserve the other preference, reject failures without optimistic changes and lock duplicate saves", async ({ app }) => {
  await navigate(app, "Configuración");
  await noiseSwitch(app).click();
  await expect(noiseSwitch(app)).toHaveAttribute("aria-checked", "false");
  await expect(noiseSwitch(app)).toBeEnabled();
  await chooseTheme(app, "cream");
  await expectIpc(app, "update_settings", { entry: { theme: "cream", noiseEnabled: false } });
  await installSaveGate(app);
  const before = await appearanceSnapshot(app);
  const persisted = await app.evaluate(() => sessionStorage.getItem("orbit-e2e-ipc-state"));
  for (const target of [themeButton(app, "ember"), noiseSwitch(app)]) {
    // Dispatch in one task, before React can disable the controls, to test the ref lock.
    await target.evaluate((element) => { (element as HTMLButtonElement).click(); (element as HTMLButtonElement).click(); });
    await expect(target).toBeDisabled();
    await expect(themeButton(app, "dark")).toBeDisabled();
    await expect(noiseSwitch(app)).toBeDisabled();
    expect(await appearanceSnapshot(app)).toEqual(before);
    await app.evaluate(() => (window as unknown as PreferencesWindow).__preferenceSave.release!());
    await expect(app.getByRole("alert")).toContainText("SQLite appearance write rejected");
    await expect(target).toBeEnabled();
    expect(await appearanceSnapshot(app)).toEqual(before);
    expect((await readMock(app)).state.settings).toEqual({ theme: "cream", noiseEnabled: false });
    expect(await app.evaluate(() => sessionStorage.getItem("orbit-e2e-ipc-state"))).toBe(persisted);
  }
  expect(await app.evaluate(() => (window as unknown as PreferencesWindow).__preferenceSave.calls)).toEqual([
    { command: "update_settings", args: { entry: { theme: "ember", noiseEnabled: false } } },
    { command: "update_settings", args: { entry: { theme: "cream", noiseEnabled: true } } },
  ]);
  await app.evaluate(() => Object.assign((window as unknown as PreferencesWindow).__preferenceSave, { hold: false, fail: false }));
  await noiseSwitch(app).click();
  await expectAppearance(app, { theme: "cream", noiseEnabled: true });
  await expect(noiseSwitch(app)).toBeEnabled();
  await expect(app.getByRole("alert")).toHaveCount(0);
  await chooseTheme(app, "ember");
  await expectAppearance(app, { theme: "ember", noiseEnabled: true });
});

for (const cached of [null, { theme: "cream", noiseEnabled: false } as const]) {
  test(`Startup: ${cached ? "cached cream/noise-off precedes mismatching SQLite" : "empty cache defaults dark/noise-on before SQLite"}`, async ({ app }) => {
    const saved: Settings = { theme: "ember", noiseEnabled: false };
    await app.addInitScript(delaySettingsAtStartup, { cached, saved });
    // Stop at parsed HTML, before the module script can fetch settings.
    await app.reload({ waitUntil: "commit" });
    await expect(app.locator("html")).toHaveAttribute("data-theme", cached?.theme ?? "dark");
    await expect(app.locator("html")).toHaveAttribute("data-noise-enabled", String(cached?.noiseEnabled ?? true));
    await expect.poll(() => app.evaluate(() => (window as unknown as PreferencesWindow).__settingsGate.started)).toBeGreaterThan(0);
    await navigate(app, "Configuración");
    await expect(app.getByRole("status")).toContainText("Cargando preferencias");
    expect((await appearanceSnapshot(app)).theme).toBe(cached?.theme ?? "dark");
    expect((await appearanceSnapshot(app)).noise).toBe(String(cached?.noiseEnabled ?? true));
    await app.evaluate(() => (window as unknown as PreferencesWindow).__settingsGate.release());
    await expectAppearance(app, saved);
    await expect(themeButton(app, "ember")).toHaveAttribute("aria-pressed", "true");
    await expect(noiseSwitch(app)).toHaveAttribute("aria-checked", "false");
  });
}

test("Cream: readable tokens in every view, table, modal, type badge, selected control and real chart", async ({ app }, info) => {
  await navigate(app, "Configuración");
  await chooseTheme(app, "cream");
  await expectReadable(themeButton(app, "cream").getByText("Crema / almendra", { exact: true }));
  await expectReadable(themeButton(app, "cream").getByText("Activo", { exact: true }));
  for (const view of ["Billetera", "Movimientos", "Categorías", "Artículos", "Analytics", "Configuración"]) {
    await navigate(app, view);
    const main = app.locator("#main-content");
    await expectReadable(main.getByRole("heading", { level: 1 }), 3);
    await expectReadable(main.locator("p").filter({ visible: true }).first());
    await expectReadable(app.getByRole("navigation").getByRole("button", { name: view, exact: true }));
    if (view === "Billetera") {
      await expectReadable(app.getByRole("button", { name: "Nueva cuenta", exact: true }));
      await app.getByRole("button", { name: "Nueva cuenta", exact: true }).click();
      const dialog = app.getByRole("dialog", { name: "Nueva cuenta", exact: true });
      await expectReadable(dialog.getByRole("heading"));
      await expectReadable(dialog.getByLabel("Nombre de la cuenta", { exact: true }));
      await app.keyboard.press("Escape");
    }
    if (view === "Movimientos") {
      await expectReadable(main.getByRole("table").getByRole("columnheader").first());
      await expectReadable(main.getByRole("table").getByText("Compra semanal", { exact: true }));
    }
    if (view === "Analytics") {
      await app.getByRole("combobox", { name: "Período", exact: true }).selectOption("all");
      const chart = app.getByRole("figure", { name: "Flujo mensual en ARS", exact: true });
      await expect(chart).toBeVisible();
      await expect.poll(() => chart.locator("canvas").evaluateAll((canvases) => canvases.reduce((count, element) => {
        const canvas = element as HTMLCanvasElement;
        const context = canvas.getContext("2d");
        if (!context || !canvas.width || !canvas.height) return count;
        const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
        for (let i = 0; i < pixels.length; i += 4) if (pixels[i + 3] > 200 && Math.abs(pixels[i] - 32) < 5 && Math.abs(pixels[i + 1] - 29) < 5 && Math.abs(pixels[i + 2] - 24) < 5) count++;
        return count;
      }, 0))).toBeGreaterThan(20);
      await expectReadable(main.getByRole("table", { name: /Flujo mensual en ARS/ }).getByRole("columnheader").first());
      await chart.scrollIntoViewIfNeeded();
      await saveScreenshot(app, info, "cream-analytics");
    }
  }
  await installImportMock(app);
  await app.getByRole("button", { name: "Importar CSV", exact: true }).click();
  const dialog = app.getByRole("dialog", { name: "Importar datos CSV", exact: true });
  await expectReadable(dialog.getByRole("heading"));
  const colors = new Set<string>();
  for (const label of ["Texto", "Entero · ID", "Decimal", "Fecha", "Enum"]) {
    const badge = dialog.getByText(label, { exact: true }).first();
    await badge.scrollIntoViewIfNeeded();
    await expectReadable(badge);
    colors.add(await badge.evaluate((element) => getComputedStyle(element).color));
  }
  expect(colors.size).toBe(5);
  await dialog.getByRole("heading").scrollIntoViewIfNeeded();
  await saveScreenshot(app, info, "cream-import-dialog");
  await app.keyboard.press("Escape");
  await chooseTheme(app, "ember");
  await themeButton(app, "ember").scrollIntoViewIfNeeded();
  await saveScreenshot(app, info, "ember-appearance");
});

test("Noise covers titlebar, content and dialog without intercepting controls; reduced motion keeps it static", async ({ app }) => {
  await app.emulateMedia({ reducedMotion: "reduce" });
  await navigate(app, "Configuración");
  for (const enabled of [true, false, true]) {
    if ((await noiseSwitch(app).getAttribute("aria-checked")) !== String(enabled)) await noiseSwitch(app).click();
    await expect(noiseSwitch(app)).toHaveAttribute("aria-checked", String(enabled));
    const grain = app.locator(".orbit-grain").filter({ visible: true });
    if (enabled) {
      await expect(grain).toHaveCount(1);
      expect(await grain.evaluate((element) => {
        const style = getComputedStyle(element), rect = element.getBoundingClientRect();
        return { pointerEvents: style.pointerEvents, position: style.position, animation: style.animationName,
          image: style.backgroundImage.includes("feTurbulence"), opacity: Number(style.opacity), x: rect.x, y: rect.y, width: rect.width, height: rect.height };
      })).toEqual({ pointerEvents: "none", position: "fixed", animation: "none", image: true, opacity: 0.12, x: 0, y: 0, width: 1400, height: 1000 });
    } else await expect(grain).toHaveCount(0);
    await navigate(app, "Billetera");
    await app.getByRole("button", { name: "Nueva cuenta", exact: true }).click();
    const dialog = app.getByRole("dialog", { name: "Nueva cuenta", exact: true });
    await expect(dialog).toBeVisible();
    const dialogGrain = dialog.locator(".orbit-grain");
    await expect(dialogGrain).toHaveCount(1);
    if (enabled) {
      await expect(dialogGrain).toBeVisible();
      expect(await dialogGrain.evaluate((element) => getComputedStyle(element).position)).toBe("absolute");
    } else await expect(dialogGrain).toBeHidden();
    const overlays = app.locator(".orbit-grain");
    for (const overlay of await overlays.all()) {
      expect(await overlay.evaluate((element) => getComputedStyle(element).pointerEvents)).toBe("none");
      expect(await overlay.evaluate((element) => getComputedStyle(element).animationName)).toBe("none");
      if (!enabled) await expect(overlay).toBeHidden();
    }
    await dialog.getByLabel("Nombre de la cuenta", { exact: true }).fill("Ruido no bloquea");
    await app.keyboard.press("Escape");
    await app.getByRole("button", { name: "Preferencias ↗", exact: true }).click();
    await expect(noiseSwitch(app)).toBeVisible();
    expect(await app.locator(".animate-enter").evaluate((element) => getComputedStyle(element).animationName)).toBe("none");
  }
});

test("Appearance: narrow viewport contains theme controls and dialogs without page overflow", async ({ app }, info) => {
  await app.setViewportSize({ width: 390, height: 844 });
  await navigate(app, "Configuración");
  await chooseTheme(app, "cream");
  for (const theme of themes) {
    const button = themeButton(app, theme.id);
    await button.scrollIntoViewIfNeeded();
    const bounds = await button.boundingBox();
    expect(bounds).not.toBeNull();
    expect(bounds!.x).toBeGreaterThanOrEqual(0);
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(390);
  }
  for (const view of ["Billetera", "Movimientos", "Categorías", "Artículos", "Analytics", "Configuración"]) {
    await navigate(app, view);
    await expect(app.locator("#main-content").getByRole("heading", { level: 1 })).toBeVisible();
    expect(await app.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  await installImportMock(app);
  await app.getByRole("button", { name: "Importar CSV", exact: true }).click();
  const dialog = app.getByRole("dialog", { name: "Importar datos CSV", exact: true });
  await expect(dialog).toBeVisible();
  const bounds = await dialog.boundingBox();
  expect(bounds!.x).toBeGreaterThanOrEqual(0);
  expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(390);
  expect(await dialog.evaluate((element) => element.scrollWidth <= element.clientWidth + 1)).toBe(true);
  await saveScreenshot(app, info, "cream-narrow-dialog");
});

test("Titlebar: browser controls are disabled, 64px drag regions exclude interactive controls", async ({ app }) => {
  const header = app.getByRole("banner", { name: "Barra de título" });
  await expect(header).toHaveAttribute("data-tauri-drag-region", /^(true)?$/);
  expect((await header.boundingBox())!.height).toBe(64);
  expect(await header.locator("[data-tauri-drag-region]").count()).toBeGreaterThan(0);
  for (const button of await header.getByRole("button").all()) {
    expect(await button.getAttribute("data-tauri-drag-region")).toBeNull();
    expect(await button.evaluate((element) => getComputedStyle(element).getPropertyValue("-webkit-app-region"))).toBe("no-drag");
  }
  const controls = header.getByRole("group", { name: "Controles de ventana" });
  for (const button of await controls.getByRole("button").all()) await expect(button).toBeDisabled();
  await header.getByRole("button", { name: "Preferencias ↗", exact: true }).click();
  await expect(themeButton(app, "dark")).toBeVisible();
  await header.getByRole("button", { name: "Orbit, ir a billetera", exact: true }).click();
  await expect(app.getByRole("heading", { level: 1 })).toContainText("Tu billetera");
  expect((await readMock(app)).calls.filter(({ command }) => command.startsWith("plugin:window|") || command.startsWith("plugin:event|"))).toEqual([]);
});

test("Titlebar: real SDK sends exact main-window commands and resize listener lifecycle", async ({ app }) => {
  await installWindowMock(app);
  await navigate(app, "Configuración"); // Rerender App after enabling isTauri().
  await expect(app.getByRole("button", { name: "Minimizar ventana", exact: true })).toBeEnabled();
  await expect.poll(async () => (await readWindowMock(app)).listeners.length).toBe(1);
  const listener = (await readWindowMock(app)).listeners[0];
  expect((await readWindowMock(app)).calls).toEqual([
    { command: "plugin:window|is_maximized", args: { label: "main" } },
    { command: "plugin:event|listen", args: { event: "tauri://resize", target: { kind: "Window", label: "main" }, handler: listener.handler } },
  ]);
  await app.getByRole("button", { name: "Minimizar ventana", exact: true }).click();
  await expect.poll(async () => (await readWindowMock(app)).minimized).toBe(true);
  await app.getByRole("button", { name: "Maximizar ventana", exact: true }).click();
  await expect(app.getByRole("button", { name: "Restaurar ventana", exact: true })).toBeEnabled();
  expect((await readWindowMock(app)).maximized).toBe(true);
  await app.getByRole("button", { name: "Restaurar ventana", exact: true }).click();
  await expect(app.getByRole("button", { name: "Maximizar ventana", exact: true })).toBeEnabled();
  await emitWindowResize(app, true);
  await expect(app.getByRole("button", { name: "Restaurar ventana", exact: true })).toBeVisible();
  await emitWindowResize(app, false);
  await expect(app.getByRole("button", { name: "Maximizar ventana", exact: true })).toBeVisible();
  await app.getByRole("button", { name: "Cerrar ventana", exact: true }).click();
  await expect.poll(async () => (await readWindowMock(app)).closed).toBe(true);
  expect((await readWindowMock(app)).calls.filter(({ command }) => command.startsWith("plugin:window|"))).toEqual([
    "is_maximized", "minimize", "toggle_maximize", "is_maximized", "toggle_maximize", "is_maximized", "is_maximized", "is_maximized", "close",
  ].map((action) => ({ command: `plugin:window|${action}`, args: { label: "main" } })));
  await app.evaluate(() => { (window as unknown as { isTauri: boolean }).isTauri = false; });
  await navigate(app, "Billetera");
  await expect.poll(async () => (await readWindowMock(app)).listeners).toEqual([]);
  expect((await readWindowMock(app)).unregistered).toEqual([{ event: "tauri://resize", eventId: listener.eventId }]);
  expect((await readWindowMock(app)).calls.at(-1)).toEqual({ command: "plugin:event|unlisten", args: { event: "tauri://resize", eventId: listener.eventId } });
});

test("Titlebar: rejected SDK action keeps state, unlocks controls, supports dismissal and retry", async ({ app }) => {
  await installWindowMock(app, { hold: "toggle_maximize", fail: "toggle_maximize" });
  await navigate(app, "Configuración");
  const maximize = app.getByRole("button", { name: "Maximizar ventana", exact: true });
  await expect(maximize).toBeEnabled();
  await maximize.evaluate((element) => { (element as HTMLButtonElement).click(); (element as HTMLButtonElement).click(); });
  const controls = app.getByRole("group", { name: "Controles de ventana" });
  for (const button of await controls.getByRole("button").all()) await expect(button).toBeDisabled();
  expect((await readWindowMock(app)).calls.filter(({ command }) => command === "plugin:window|toggle_maximize")).toEqual([
    { command: "plugin:window|toggle_maximize", args: { label: "main" } },
  ]);
  await releaseWindowMock(app);
  await expect(app.getByRole("alert")).toContainText("Window toggle_maximize rejected");
  await expect(maximize).toBeEnabled();
  expect((await readWindowMock(app)).maximized).toBe(false);
  await app.getByRole("button", { name: "Descartar error de ventana", exact: true }).click();
  await expect(app.getByRole("alert")).toHaveCount(0);
  await configureWindowMock(app, { hold: null, fail: null });
  await maximize.click();
  await expect(app.getByRole("button", { name: "Restaurar ventana", exact: true })).toBeEnabled();
  await configureWindowMock(app, { fail: "close" });
  await app.getByRole("button", { name: "Cerrar ventana", exact: true }).click();
  await expect(app.getByRole("alert")).toContainText("Window close rejected");
  expect((await readWindowMock(app)).closed).toBe(false);
  await expect(app.getByRole("button", { name: "Cerrar ventana", exact: true })).toBeEnabled();
});

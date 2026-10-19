import { expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { appearanceThemes, applyAppearance } from "../src/lib/appearance";
import type { Settings } from "../src/types/generated/Settings";
import type { Theme } from "../src/types/generated/Theme";

const themes = ["dark", "dim", "cream", "ember"] as const satisfies readonly Theme[];

function withAppearanceDOM(run: (context: {
  dataset: Record<string, string>;
  cache: Map<string, string>;
  meta: Map<string, string>;
}) => void, options: { storageDisabled?: boolean; missingMeta?: boolean } = {}) {
  const descriptors = new Map(["document", "localStorage"].map((name) => [name, Object.getOwnPropertyDescriptor(globalThis, name)]));
  const dataset: Record<string, string> = {};
  const cache = new Map<string, string>([["unrelated", "preserved"]]);
  const meta = new Map<string, string>();
  try {
    Object.defineProperty(globalThis, "document", { configurable: true, value: {
      documentElement: { dataset },
      querySelector: (selector: string) => {
        expect(selector).toBe('meta[name="theme-color"]');
        return options.missingMeta ? null : { setAttribute: (name: string, value: string) => meta.set(name, value) };
      },
    } });
    Object.defineProperty(globalThis, "localStorage", options.storageDisabled
      ? { configurable: true, get: () => { throw new DOMException("Storage blocked", "SecurityError"); } }
      : { configurable: true, value: { setItem: (name: string, value: string) => cache.set(name, value) } });
    run({ dataset, cache, meta });
  } finally {
    for (const [name, descriptor] of descriptors) {
      if (descriptor) Object.defineProperty(globalThis, name, descriptor);
      else Reflect.deleteProperty(globalThis, name);
    }
  }
}

test("appearanceThemes contains every generated Theme exactly once with distinct accessible labels", () => {
  expect(appearanceThemes.map(({ id }) => id)).toEqual([...themes]);
  expect(new Set(appearanceThemes.map(({ label }) => label)).size).toBe(themes.length);
  expect(appearanceThemes.map(({ label }) => label)).toEqual([
    "Negro / original", "Grafito / tenue", "Crema / almendra", "Brasa / naranja quemado",
  ]);
  for (const entry of appearanceThemes) {
    expect(entry.background).toMatch(/^#[\da-f]{6}$/i);
    expect(entry.description.length).toBeGreaterThan(0);
  }
});

for (const theme of themes) for (const noiseEnabled of [true, false]) {
  test(`applyAppearance synchronizes ${theme}, noise=${noiseEnabled}, meta and both cache keys`, () => {
    withAppearanceDOM(({ dataset, cache, meta }) => {
      const settings: Settings = Object.freeze({ theme, noiseEnabled });
      applyAppearance(settings);
      expect(dataset).toEqual({ theme, noiseEnabled: String(noiseEnabled) });
      expect(cache.get("orbit-theme")).toBe(theme);
      expect(cache.get("orbit-noise-enabled")).toBe(String(noiseEnabled));
      expect(cache.get("unrelated")).toBe("preserved");
      expect(meta.get("content")).toBe(appearanceThemes.find(({ id }) => id === theme)!.background);
      expect(settings).toEqual({ theme, noiseEnabled });
    });
  });
}

test("blocked localStorage access does not prevent DOM or theme-color updates", () => {
  withAppearanceDOM(({ dataset, meta }) => {
    expect(() => applyAppearance({ theme: "cream", noiseEnabled: false })).not.toThrow();
    expect(dataset).toEqual({ theme: "cream", noiseEnabled: "false" });
    expect(meta.get("content")).toBe("#f6e9c7");
  }, { storageDisabled: true });
});

test("a quota/security failure while writing storage still leaves appearance applied", () => {
  withAppearanceDOM(({ dataset, meta }) => {
    Object.defineProperty(globalThis, "localStorage", { configurable: true, value: {
      setItem: () => { throw new DOMException("Quota exceeded", "QuotaExceededError"); },
    } });
    expect(() => applyAppearance({ theme: "ember", noiseEnabled: true })).not.toThrow();
    expect(dataset).toEqual({ theme: "ember", noiseEnabled: "true" });
    expect(meta.get("content")).toBe("#191816");
  });
});

test("missing theme-color metadata is safe and repeated calls replace both preferences", () => {
  withAppearanceDOM(({ dataset, cache }) => {
    applyAppearance({ theme: "cream", noiseEnabled: false });
    applyAppearance({ theme: "dark", noiseEnabled: true });
    expect(dataset).toEqual({ theme: "dark", noiseEnabled: "true" });
    expect(cache.get("orbit-theme")).toBe("dark");
    expect(cache.get("orbit-noise-enabled")).toBe("true");
  }, { missingMeta: true });
});

test("main window capability grants only the needed explicit window commands", () => {
  const capability = JSON.parse(readFileSync(new URL("../src-tauri/capabilities/default.json", import.meta.url), "utf8")) as { windows: string[]; permissions: string[] };
  expect(capability.windows).toEqual(["main"]);
  expect(capability.permissions.filter((permission) => permission.startsWith("core:window:")).sort()).toEqual([
    "core:window:allow-close", "core:window:allow-is-maximized", "core:window:allow-minimize",
    "core:window:allow-start-dragging", "core:window:allow-toggle-maximize",
  ]);
  expect(capability.permissions).not.toContain("core:window:default");
});

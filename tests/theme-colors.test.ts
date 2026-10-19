import { expect, test } from "bun:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { chartColors, chartThemeOptions, colorWithAlpha } from "../src/components/analytics-primitives";
import { analyticsColors } from "../src/components/analytics-chart";
import { walletField, walletPrimary, walletSecondary } from "../src/components/wallet-ui";
import OrbitLogo from "../src/components/orbit-logo";
import { SearchInput } from "../src/components/search-input";

const dark = {
  "--color-bg": "#090909", "--color-surface": "#101010", "--color-primary": "#f1f0ec",
  "--color-muted": "#949491", "--color-hairline": "rgba(255,255,255,0.14)",
  "--color-chart-income": "#f5f5f5", "--color-chart-expenses": "#b5b8ff", "--color-chart-net": "#ffc77a",
};
const cream = {
  "--color-bg": "#f6e9c7", "--color-surface": "#fff3d1", "--color-primary": "#171611",
  "--color-muted": "#6d6554", "--color-hairline": "rgba(23,22,17,0.14)",
  "--color-chart-income": "#171611", "--color-chart-expenses": "#555b9f", "--color-chart-net": "#946000",
};
const styles = (tokens: Record<string, string>) => ({ getPropertyValue: (name: string) => tokens[name] ?? "" });

test("chart alpha colors use the resolved ink, including shorthand hex and computed RGB", () => {
  expect(colorWithAlpha("#171611", 0.3)).toBe("rgba(23,22,17,0.3)");
  expect(colorWithAlpha(" #FFF ", 0)).toBe("rgba(255,255,255,0)");
  expect(colorWithAlpha("#abc", 0.55)).toBe("rgba(170,187,204,0.55)");
  expect(colorWithAlpha("rgb(23 22 17)", 0.07)).toBe("rgba(23,22,17,0.07)");
  expect(colorWithAlpha("rgba(23, 22, 17, 1)", 0.38)).toBe("rgba(23,22,17,0.38)");
  expect(colorWithAlpha("rgb(100% 0% 0%)", 0.1)).toBe("rgba(255,0,0,0.1)");
  expect(() => colorWithAlpha("var(--color-primary)", 0.3)).toThrow("hexadecimal o RGB");
});

for (const [name, tokens] of [["dark", dark], ["cream", cream]] as const) {
  test(`${name} chart options cover canvas, labels, grid, scales, crosshair and every series token`, () => {
    const colors = chartColors(styles(tokens));
    expect(colors.income).toBe(tokens["--color-chart-income"]);
    expect(colors.expenses).toBe(tokens["--color-chart-expenses"]);
    expect(colors.net).toBe(tokens["--color-chart-net"]);
    const options = chartThemeOptions(colors);
    expect(options.layout.background.color).toBe(tokens["--color-bg"]);
    expect(options.layout.textColor).toBe(tokens["--color-muted"]);
    expect(options.grid.horzLines.color).toBe(colorWithAlpha(tokens["--color-primary"], 0.07));
    expect(options.grid.vertLines.color).toBe(options.grid.horzLines.color);
    expect(options.rightPriceScale.borderColor).toBe(tokens["--color-hairline"]);
    expect(options.timeScale.borderColor).toBe(tokens["--color-hairline"]);
    expect(options.crosshair.vertLine.color).toBe(colorWithAlpha(tokens["--color-primary"], 0.3));
    expect(options.crosshair.vertLine.labelBackgroundColor).toBe(tokens["--color-surface"]);
    expect(options.crosshair.horzLine).toEqual(options.crosshair.vertLine);
  });
}

test("theme reads are not cached, so an existing chart can recolor without resetting its data", () => {
  const tokens: Record<string, string> = { ...dark };
  const computed = styles(tokens);
  expect(chartColors(computed).income).toBe(dark["--color-chart-income"]);
  Object.assign(tokens, cream);
  const next = chartColors(computed);
  expect(next.income).toBe("#171611");
  expect(next.expenses).toBe("#555b9f");
  expect(next.net).toBe("#946000");
  expect(next.grid).toBe("rgba(23,22,17,0.07)");
});

test("additional palettes use CSS tokens rather than branching on a fixed list of theme names", () => {
  const tokens = { ...dark, "--color-primary": "#ecc9a8", "--color-bg": "#24170f", "--color-chart-income": "#eeb17c", "--color-chart-expenses": "#ccb8ed", "--color-chart-net": "#e8c17b" };
  const colors = chartColors(styles(tokens));
  expect(colors.primary).toBe(tokens["--color-primary"]);
  expect(colors.background).toBe(tokens["--color-bg"]);
  expect(colors.income).toBe(tokens["--color-chart-income"]);
  expect(colors.expenses).toBe(tokens["--color-chart-expenses"]);
  expect(colors.net).toBe(tokens["--color-chart-net"]);
});

test("missing optional chart tokens inherit primary ink and retain the analyticsColors API", () => {
  expect(chartColors(styles({ "--color-primary": "#171611" })).income).toBe("#171611");
  expect(Object.keys(analyticsColors)).toEqual(["income", "expenses", "net"]);
  for (const key of ["income", "expenses", "net"] as const) expect(typeof analyticsColors[key]).toBe("string");
});

test("wallet controls separate primary ink from the contrasting filled-button foreground", () => {
  expect(walletPrimary).toContain("bg-primary");
  expect(walletPrimary).toContain("text-on-primary");
  expect(walletPrimary.split(" ")).not.toContain("text-primary");
  expect(walletPrimary).toContain("focus-visible:outline-primary");
  expect(walletField).toContain("text-primary");
  expect(walletSecondary).toContain("text-primary/70");
  for (const classes of [walletPrimary, walletField, walletSecondary]) expect(classes).not.toMatch(/(?:text|border|bg|outline|ring)-white|#[\da-f]{6}/i);
});

test("logo and search controls can inherit cream ink rather than drawing a fixed light color", () => {
  const logo = renderToStaticMarkup(createElement(OrbitLogo, { color: "currentColor" }));
  expect(logo).toContain('fill="currentColor"');
  const search = renderToStaticMarkup(createElement(SearchInput));
  expect(search).toContain("bg-surface text-primary");
  expect(search).toContain("text-muted");
  expect(search).toContain("bg-primary/60");
  expect(search).not.toContain("neutral-");
});

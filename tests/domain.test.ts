import { describe, expect, test } from "bun:test";
import { formatMinor, minorToInput, parseMinorAmount } from "../src/components/ledger-utils";
import { parseInitialBalance, accountTypeLabels } from "../src/components/wallet-utils";
import { catalogMinorUnits, catalogMoney, categoryPath, validCategoryParents } from "../src/components/catalog-utils";
import { monthlyReport, categoryReport, periodBounds, roundedAverage, shiftMonth, percentage } from "../src/components/analytics-utils";
import { columnReveal } from "../src/components/analytics-primitives";
import type { Currency } from "../src/types/generated/Currency";
import type { Category } from "../src/types/generated/Category";
import type { Analytics } from "../src/types/generated/Analytics";

const usd: Currency = { code: "USD", name: "Dollar", symbol: "$", decimalPlaces: 2, isActive: true };
const jpy: Currency = { ...usd, code: "JPY", decimalPlaces: 0 };
const currencies = [usd, jpy];

describe("exact money boundaries", () => {
  test.each([["0.29", 29], ["1,01", 101], ["90071992547409.91", Number.MAX_SAFE_INTEGER]])("parses %s without floating-point multiplication", (text, amount) => {
    expect(parseMinorAmount(text, usd)).toBe(amount);
    expect(catalogMinorUnits(text, 2)).toBe(amount);
    expect(parseMinorAmount(minorToInput(amount, usd), usd)).toBe(amount);
  });
  test.each(["-1", "0", "1.001", "1e3", "NaN", "Infinity", "1.000,00", "90071992547409.92"]) ("rejects invalid ledger amount %s", (text) => {
    expect(() => parseMinorAmount(text, usd)).toThrow();
  });
  test("opening balance zero is absence, but zero-price purchase lines are supported", () => {
    expect(parseInitialBalance("", usd)).toBeNull();
    expect(parseInitialBalance("0,00", usd)).toBeNull();
    expect(catalogMinorUnits("0", 2)).toBe(0);
    expect(() => parseInitialBalance("-10", usd)).toThrow();
  });
  test("honors zero-decimal currencies and unknown metadata", () => {
    expect(parseMinorAmount("123", jpy)).toBe(123);
    expect(() => parseMinorAmount("1.1", jpy)).toThrow();
    expect(formatMinor(123, "JPY", currencies)).toBe("123 JPY");
    expect(formatMinor(123, "XYZ", currencies)).toContain("u. menores XYZ");
  });
  test("formats large signed integer amounts exactly", () => {
    expect(formatMinor(-9007199254740991n, "USD", currencies)).toBe("-90.071.992.547.409,91 USD");
    expect(catalogMoney(Number.MAX_SAFE_INTEGER, "USD", currencies)).toBe("90.071.992.547.409,91 USD");
  });
  test("all eight account kinds remain available", () => { expect(Object.keys(accountTypeLabels)).toHaveLength(8); });
});

function category(id: number, parentId: number | null, type: Category["type"] = "expense"): Category {
  return { id, parentId, name: `Category ${id}`, type, isActive: true, movementCount: 0, createdAt: "2026-01-01" };
}
describe("category hierarchy", () => {
  const categories = [category(1, null, "both"), category(2, 1), category(3, 2), category(4, null, "income")];
  test("excludes self, descendants and incompatible parent kinds", () => {
    expect(validCategoryParents(categories, 2, "expense").map((row) => row.id)).toEqual([1]);
    expect(validCategoryParents(categories, undefined, "both").map((row) => row.id)).toEqual([1]);
  });
  test("renders paths and terminates even with corrupt historical cycles", () => {
    expect(categoryPath(categories[2], categories)).toBe("Category 1 / Category 2 / Category 3");
    expect(categoryPath(category(1, 2), [category(1, 2), category(2, 1)])).toBe("Category 2 / Category 1");
  });
});

const analytics: Analytics = { monthly: [
  { month: "2026-01", currencyCode: "USD", totalIncome: Number.MAX_SAFE_INTEGER, totalExpenses: 100, net: Number.MAX_SAFE_INTEGER - 100 },
  { month: "2026-03", currencyCode: "USD", totalIncome: 200, totalExpenses: 50, net: 150 },
  { month: "2026-02", currencyCode: "ARS", totalIncome: 9999, totalExpenses: 999, net: 9000 },
], categories: [
  { month: "2026-01", currencyCode: "USD", categoryId: 1, categoryName: "Food", totalAmount: 100 },
  { month: "2026-03", currencyCode: "USD", categoryId: 1, categoryName: "Food", totalAmount: 50 },
  { month: "2026-01", currencyCode: "ARS", categoryId: 1, categoryName: "Food", totalAmount: 999 },
], netWorth: [] };

describe("read-only analytics presentation", () => {
  test("fills missing months with zero without mixing currencies", () => {
    const rows = monthlyReport(analytics, "USD", "2026-01", "2026-03");
    expect(rows).toHaveLength(3);
    expect(rows[1]).toEqual({ month: "2026-02", income: 0n, expenses: 0n, net: 0n });
    expect(rows.reduce((sum, row) => sum + row.income, 0n)).toBe(9007199254741191n);
    expect(categoryReport(analytics, "USD", "2026-01", "2026-03")).toEqual([{ id: 1, name: "Food", amount: 150n }]);
  });
  test("keeps same-named categories and uncategorized spending distinct", () => {
    const data: Analytics = { ...analytics, categories: [
      { month: "2026-01", currencyCode: "USD", categoryId: 1, categoryName: "Food", totalAmount: 100 },
      { month: "2026-01", currencyCode: "USD", categoryId: 2, categoryName: "Food", totalAmount: 50 },
      { month: "2026-01", currencyCode: "USD", categoryId: null, categoryName: "Food", totalAmount: 25 },
    ] };
    expect(categoryReport(data, "USD", "2026-01", "2026-03").map((row) => row.id)).toEqual([1, 2, null]);
  });
  test("handles calendar boundaries, reversed periods, averages and ratios", () => {
    expect(shiftMonth("2026-01", -1)).toBe("2025-12");
    expect(periodBounds("3", "2026-02", [], "", "")).toEqual({ from: "2025-12", to: "2026-02" });
    expect(monthlyReport(analytics, "USD", "2026-03", "2026-01")).toEqual([]);
    expect(roundedAverage(-5n, 2)).toBe(-3n);
    expect(percentage(1n, 3n)).toBe("33,3 %");
    expect(percentage(1n, 0n)).toBe("0,0 %");
  });
  test("staggered columns are bounded and eventually finish", () => {
    expect(columnReveal(0, 0, 12)).toBe(0);
    expect(columnReveal(200, 0, 12)).toBeGreaterThan(columnReveal(200, 11, 12));
    expect(columnReveal(840, 11, 12)).toBe(1);
    expect(columnReveal(Infinity, 0, 12)).toBe(1);
  });
});

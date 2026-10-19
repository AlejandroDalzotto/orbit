import type { Analytics } from "../types/generated/Analytics";
import type { Category } from "../types/generated/Category";
import { categoryPath } from "./catalog-utils";

export type AnalyticsMonth = { month: string; income: bigint; expenses: bigint; net: bigint };
export type AnalyticsPeriod = "3" | "6" | "12" | "all" | "custom";

export function shiftMonth(month: string, offset: number): string {
  const [year, number] = month.split("-").map(Number);
  const index = year * 12 + number - 1 + offset;
  return `${String(Math.floor(index / 12)).padStart(4, "0")}-${String(((index % 12) + 12) % 12 + 1).padStart(2, "0")}`;
}

export function periodBounds(period: AnalyticsPeriod, currentMonth: string, months: string[], customFrom: string, customTo: string) {
  if (period === "custom") return { from: customFrom, to: customTo };
  if (period === "all") {
    const sorted = [...months].sort();
    return { from: sorted[0] ?? currentMonth, to: sorted[sorted.length - 1] ?? currentMonth };
  }
  return { from: shiftMonth(currentMonth, 1 - Number(period)), to: currentMonth };
}

export function validMonth(month: string): boolean {
  return /^\d{4}-(0[1-9]|1[0-2])$/.test(month) && Number(month.slice(0, 4)) > 0;
}

export function monthlyReport(data: Analytics, currencyCode: string, from: string, to: string): AnalyticsMonth[] {
  if (!validMonth(from) || !validMonth(to) || from > to) return [];
  const map = new Map<string, AnalyticsMonth>();
  for (const row of data.monthly) {
    if (row.currencyCode !== currencyCode || row.month < from || row.month > to) continue;
    const previous = map.get(row.month) ?? { month: row.month, income: 0n, expenses: 0n, net: 0n };
    map.set(row.month, { month: row.month, income: previous.income + BigInt(row.totalIncome), expenses: previous.expenses + BigInt(row.totalExpenses), net: previous.net + BigInt(row.net) });
  }
  const result: AnalyticsMonth[] = [];
  for (let month = from; month <= to; month = shiftMonth(month, 1)) {
    result.push(map.get(month) ?? { month, income: 0n, expenses: 0n, net: 0n });
    if (month === to) break;
  }
  return result;
}

export function categoryReport(data: Analytics, currencyCode: string, from: string, to: string, categories: Category[] = []) {
  const amounts = new Map<number | null, { id: number | null; name: string; amount: bigint }>();
  for (const row of data.categories) {
    if (row.currencyCode !== currencyCode || row.month < from || row.month > to) continue;
    const category = categories.find((entry) => entry.id === row.categoryId);
    const previous = amounts.get(row.categoryId);
    amounts.set(row.categoryId, {
      id: row.categoryId,
      name: category ? categoryPath(category, categories) : row.categoryName,
      amount: (previous?.amount ?? 0n) + BigInt(row.totalAmount),
    });
  }
  return [...amounts.values()].sort((a, b) => a.amount === b.amount ? a.name.localeCompare(b.name) : a.amount > b.amount ? -1 : 1);
}

export function roundedAverage(amount: bigint, count: number): bigint {
  if (count <= 0) return 0n;
  const divisor = BigInt(count);
  const absolute = amount < 0n ? -amount : amount;
  const rounded = (absolute + divisor / 2n) / divisor;
  return amount < 0n ? -rounded : rounded;
}

export function monthLabel(month: string): string {
  if (!validMonth(month)) return month;
  const date = new Date(0);
  date.setUTCFullYear(Number(month.slice(0, 4)), Number(month.slice(5, 7)) - 1, 1);
  return new Intl.DateTimeFormat("es-AR", { month: "short", year: "numeric", timeZone: "UTC" }).format(date);
}

export function percentage(amount: bigint, total: bigint): string {
  if (total <= 0n) return "0,0 %";
  const tenths = (amount * 1000n + total / 2n) / total;
  return `${tenths / 10n},${tenths % 10n} %`;
}

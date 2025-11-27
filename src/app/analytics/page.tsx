"use client";

import { useEffect, useRef } from "react";
import { motion } from "motion/react";
import {
  createChart,
  IChartApi,
  ISeriesApi,
  LineSeries,
} from "lightweight-charts";
import { invoke } from "@tauri-apps/api/core";
import useSWR from "swr";
import TransactionsFinancialSummary from "@/components/TransactionsFinancialSummary";
import { TrendingDown, List, PieChart, BarChart } from "lucide-react";

type MonthlyAmount = {
  month: string; // "YYYY-MM"
  total: number;
};

type CategoryAggregate = {
  category: string;
  transactionsCount: number;
  totalAmount: number;
};

type ExpenseInsights = {
  averageMonthlyExpenses: number;
  highestSingleExpense: number;
};

type IncomeSourceAggregate = {
  source: string;
  totalAmount: number;
  transactionsCount: number;
};

type MostPurchasedItem = {
  itemId?: string | null;
  name: string;
  transactionsCount: number;
  totalQuantity: number;
  totalSpent: number;
};

type AnalyticsData = {
  monthlyIncome: MonthlyAmount[];
  monthlyExpenses: MonthlyAmount[];
  monthlyExpenseTrend: MonthlyAmount[];
  mostUsedCategories: CategoryAggregate[];
  expenseInsights: ExpenseInsights;
  incomeSources: IncomeSourceAggregate[];
  mostPurchasedItems: MostPurchasedItem[];
};

const fetcher = async (): Promise<AnalyticsData> =>
  (await invoke("get_analytics")) as AnalyticsData;

/**
 * Helper to convert "YYYY-MM" into "YYYY-MM-01" which lightweight-charts accepts as a time string
 */
function monthKeyToDateString(monthKey: string) {
  // monthKey expected like "2025-01"
  return monthKey + "-01";
}

export default function AnalyticsPage() {
  const { data, error, isLoading } = useSWR<AnalyticsData | undefined>(
    "analytics-data",
    fetcher,
  );

  const chartContainerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const incomeSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const expenseSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);

  useEffect(() => {
    // Initialize chart (client-only)
    if (!chartContainerRef.current) return;

    // Create chart
    chartRef.current = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 320,
      layout: {
        background: { color: "#000" },
        textColor: "#DDD",
        fontSize: 12,
      },
      grid: {
        vertLines: { color: "rgba(255,255,255,0.03)" },
        horzLines: { color: "rgba(255,255,255,0.03)" },
      },
      rightPriceScale: {
        borderVisible: false,
      },
      timeScale: {
        borderVisible: false,
        timeVisible: true,
        secondsVisible: false,
      },
    });

    // Create series using a narrow `unknown` -> typed bridge to avoid `any`
    if (chartRef.current) {
      const adder = chartRef.current;

      incomeSeriesRef.current = adder.addSeries(LineSeries, {
        color: "#10B981", // green
        lineWidth: 2,
      });

      expenseSeriesRef.current = adder.addSeries(LineSeries, {
        color: "#EF4444", // red
        lineWidth: 2,
      });
    }

    // Resize observer to keep chart responsive
    const ro = new ResizeObserver(() => {
      if (!chartContainerRef.current || !chartRef.current) return;
      chartRef.current.applyOptions({
        width: chartContainerRef.current.clientWidth,
      });
    });

    ro.observe(chartContainerRef.current);

    return () => {
      ro.disconnect();
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, []);

  // Update chart data when analytics data arrives
  useEffect(() => {
    if (
      !data ||
      !chartRef.current ||
      !incomeSeriesRef.current ||
      !expenseSeriesRef.current
    )
      return;

    // Build a unified months list to align both series
    const monthsSet = new Set<string>();
    data.monthlyIncome.forEach((m) => monthsSet.add(m.month));
    data.monthlyExpenses.forEach((m) => monthsSet.add(m.month));
    const months = Array.from(monthsSet).sort();

    const incomePoints = months.map((m) => {
      const found = data.monthlyIncome.find((p) => p.month === m);
      return {
        time: monthKeyToDateString(m),
        value: found ? Number(found.total.toFixed(2)) : 0,
      };
    });

    const expensePoints = months.map((m) => {
      const found = data.monthlyExpenses.find((p) => p.month === m);
      // keep expenses as positive numbers (UI will treat them as expenses)
      return {
        time: monthKeyToDateString(m),
        value: found ? Number(found.total.toFixed(2)) : 0,
      };
    });

    incomeSeriesRef.current.setData(incomePoints);
    expenseSeriesRef.current.setData(expensePoints);

    // Fit content
    chartRef.current.timeScale().fitContent();
  }, [data]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col max-w-6xl mx-auto"
    >
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="mb-12"
      >
        <h1 className="mb-2 font-mono text-4xl font-light text-white">
          analytics
        </h1>
        <div className="w-16 h-px mb-4 bg-neutral-800"></div>
        <p className="font-mono text-sm text-neutral-400">
          financial summaries & insights
        </p>
      </motion.div>

      {/* Reusable financial summary cards (same as transactions page) */}
      <TransactionsFinancialSummary />

      {/* Chart: Income vs Expenses */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mb-8"
      >
        <div className="border-neutral-800 rounded-xl border bg-black p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-mono text-lg text-white">
                Income vs Expenses
              </h2>
              <p className="text-neutral-500 text-xs font-mono">
                Monthly overview
              </p>
            </div>
            <div className="flex items-center space-x-4 text-neutral-400">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-[#10B981]" />
                <span className="font-mono text-xs">Income</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-[#EF4444]" />
                <span className="font-mono text-xs">Expenses</span>
              </div>
            </div>
          </div>

          <div ref={chartContainerRef} className="w-full" />
          {isLoading && (
            <p className="text-neutral-500 text-xs font-mono mt-2">
              loading chart data...
            </p>
          )}
          {error && (
            <p className="text-red-400 text-xs font-mono mt-2">
              failed to load analytics
            </p>
          )}
        </div>
      </motion.div>

      {/* Trends & Insights grid */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="grid gap-6 md:grid-cols-2 mb-12"
      >
        {/* Monthly Expense Trend */}
        <div className="border-neutral-800 rounded-xl border py-6 shadow-sm bg-black">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <BarChart className="h-4 w-4 text-neutral-600" />
                <span className="text-neutral-400 font-mono text-sm">
                  monthly expense trend
                </span>
              </div>
              <span className="text-neutral-500 text-xs font-mono">
                by month
              </span>
            </div>

            <div className="space-y-2">
              {data?.monthlyExpenseTrend &&
              data.monthlyExpenseTrend.length > 0 ? (
                data.monthlyExpenseTrend
                  .slice()
                  .reverse()
                  .slice(0, 6)
                  .map((m) => (
                    <div
                      key={m.month}
                      className="flex items-center justify-between"
                    >
                      <span className="font-mono text-xs text-neutral-400">
                        {m.month}
                      </span>
                      <span className="font-mono text-sm text-white">
                        -$
                        {m.total.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  ))
              ) : (
                <p className="text-neutral-500 text-xs font-mono">
                  No expense data
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Most Used Category */}
        <div className="border-neutral-800 rounded-xl border py-6 shadow-sm bg-black">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <List className="h-4 w-4 text-neutral-600" />
                <span className="text-neutral-400 font-mono text-sm">
                  most used categories
                </span>
              </div>
              <span className="text-neutral-500 text-xs font-mono">
                by transactions
              </span>
            </div>

            <div className="space-y-2">
              {data?.mostUsedCategories &&
              data.mostUsedCategories.length > 0 ? (
                data.mostUsedCategories.slice(0, 8).map((c) => (
                  <div
                    key={c.category}
                    className="flex items-center justify-between"
                  >
                    <span className="font-mono text-xs text-neutral-400">
                      {c.category}
                    </span>
                    <span className="font-mono text-sm text-white">
                      {c.transactionsCount} tx • $
                      {c.totalAmount.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-neutral-500 text-xs font-mono">
                  No categories data
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Expense Insights */}
        <div className="border-neutral-800 rounded-xl border py-6 shadow-sm bg-black">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <TrendingDown className="h-4 w-4 text-neutral-600" />
                <span className="text-neutral-400 font-mono text-sm">
                  expense insights
                </span>
              </div>
              <span className="text-neutral-500 text-xs font-mono">
                summary
              </span>
            </div>

            {data ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-400 font-mono text-xs">
                    avg monthly expenses
                  </span>
                  <span className="text-white font-mono text-sm">
                    -$
                    {data.expenseInsights.averageMonthlyExpenses.toLocaleString(
                      undefined,
                      { minimumFractionDigits: 2 },
                    )}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-neutral-400 font-mono text-xs">
                    highest single expense
                  </span>
                  <span className="text-white font-mono text-sm">
                    -$
                    {data.expenseInsights.highestSingleExpense.toLocaleString(
                      undefined,
                      { minimumFractionDigits: 2 },
                    )}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-neutral-500 text-xs font-mono">
                No insights available
              </p>
            )}
          </div>
        </div>

        {/* Income Sources Breakdown */}
        <div className="border-neutral-800 rounded-xl border py-6 shadow-sm bg-black">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <PieChart className="h-4 w-4 text-neutral-600" />
                <span className="text-neutral-400 font-mono text-sm">
                  income sources breakdown
                </span>
              </div>
              <span className="text-neutral-500 text-xs font-mono">
                by amount
              </span>
            </div>

            <div className="space-y-2">
              {data?.incomeSources && data.incomeSources.length > 0 ? (
                data.incomeSources.slice(0, 8).map((s) => (
                  <div
                    key={s.source}
                    className="flex items-center justify-between gap-x-6"
                  >
                    <span className="font-mono text-xs text-neutral-400 truncate">
                      {s.source}
                    </span>
                    <span className="font-mono text-sm text-white whitespace-nowrap">
                      $
                      {s.totalAmount.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                      })}{" "}
                      • {s.transactionsCount} tx
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-neutral-500 text-xs font-mono">
                  No income sources
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Most Purchased Items */}
        <div className="border-neutral-800 rounded-xl border py-6 shadow-sm bg-black">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <BarChart className="h-4 w-4 text-neutral-600" />
                <span className="text-neutral-400 font-mono text-sm">
                  most purchased items
                </span>
              </div>
              <span className="text-neutral-500 text-xs font-mono">
                by quantity
              </span>
            </div>

            <div className="space-y-2">
              {data?.mostPurchasedItems &&
              data.mostPurchasedItems.length > 0 ? (
                data.mostPurchasedItems.slice(0, 8).map((it) => (
                  <div
                    key={it.name}
                    className="flex items-center justify-between"
                  >
                    <span className="font-mono text-xs text-neutral-400">
                      {it.name}
                    </span>
                    <span className="font-mono text-sm text-white">
                      {it.totalQuantity} pcs • $
                      {it.totalSpent.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-neutral-500 text-xs font-mono">
                  No purchased items
                </p>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

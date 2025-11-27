"use client";

import { useEffect, useRef } from "react";
import type { Item, PurchaseHistoryInfo } from "@/models/item";
import { useModal } from "@/context/modal-provider";
import {
  createChart,
  IChartApi,
  ISeriesApi,
  LineSeries,
} from "lightweight-charts";
import { X } from "lucide-react";

/**
 * ModalPriceHistory
 *
 * Props:
 *  - item: Item
 *
 * Renders a lightweight-charts line chart showing the item's price history.
 * Expects `priceHistory` entries to have `{ date: number (ms), price: number, transactionName: string }`.
 *
 * The modal uses the existing ModalProvider for backdrop and centering; this component
 * renders the inner content box and provides a close button.
 */
export default function ModalPriceHistory({ item }: { item: Item }) {
  const { close } = useModal();
  const chartContainerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Line"> | null>(null);

  // Convert price history to series data for lightweight-charts
  const buildSeriesData = (prices: PurchaseHistoryInfo[]) => {
    // Sort ascending by date
    const sorted = [...prices].sort((a, b) => a.date - b.date);

    const seen = new Set<number>();
    const uniqueByDate: PurchaseHistoryInfo[] = [];

    for (const p of sorted) {
      if (!seen.has(p.date)) {
        seen.add(p.date);
        uniqueByDate.push(p);
      }
    }
    // Map to chart series format
    return uniqueByDate.map((p) => ({
      time: new Date(p.date).toISOString().slice(0, 10), // YYYY-MM-DD
      value: Number(p.price),
    }));
  };

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Create chart
    const container = chartContainerRef.current;

    // Clear any existing chart
    if (chartRef.current) {
      try {
        chartRef.current.remove();
      } catch {
        // ignore
      }
      chartRef.current = null;
      seriesRef.current = null;
    }

    const chart = createChart(container, {
      width: container.clientWidth,
      height: 300,
      layout: {
        background: { color: "#000" },
        textColor: "#d1d5db", // neutral text
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
      crosshair: {
        mode: 1,
      },
    });

    chartRef.current = chart;

    const series = chart.addSeries(LineSeries, {
      color: "#10B981", // green
      lineWidth: 2,
    });

    seriesRef.current = series;

    const data = buildSeriesData(item.purchaseHistory ?? []);
    if (data.length > 0) {
      series.setData(data);
      // Fit content
      chart.timeScale().fitContent();
    }

    // Resize handling
    const handleResize = () => {
      if (!chartRef.current || !chartContainerRef.current) return;
      chartRef.current.applyOptions({
        width: chartContainerRef.current.clientWidth,
      });
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      try {
        chart.remove();
      } catch {
        // ignore
      }
      chartRef.current = null;
      seriesRef.current = null;
    };
    // NOTE: we intentionally don't include item.priceHistory in deps here because we fully recreate chart below in separate effect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chartContainerRef.current]);

  // Update series when price history changes
  useEffect(() => {
    if (!seriesRef.current) return;
    const data = buildSeriesData(item.purchaseHistory ?? []);
    if (data.length > 0) {
      seriesRef.current.setData(data);
      chartRef.current?.timeScale().fitContent();
    } else {
      seriesRef.current.setData([]);
    }
  }, [item.purchaseHistory]);

  return (
    <div className="p-6 max-h-[calc(100vh-120px)] w-[min(900px,90vw)] overflow-y-auto text-sm rounded shadow-lg bg-black border border-neutral-700">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-white">{item.name}</h2>
          <p className="text-neutral-500 text-xs">
            Price history · {item.purchaseHistory?.length ?? 0} entries
          </p>
        </div>

        <div className="flex items-center gap-x-2">
          <button
            onClick={close}
            aria-label="close"
            className="p-2 rounded hover:bg-white/5"
          >
            <X className="w-4 h-4 text-neutral-400" />
          </button>
        </div>
      </div>

      <div>
        {item.purchaseHistory && item.purchaseHistory.length > 0 ? (
          <>
            <div
              ref={chartContainerRef}
              className="w-full bg-black rounded border border-neutral-800"
            />

            {/* Contenedor con scroll para la lista */}
            <div className="mt-4 max-h-72 overflow-y-auto pr-1 space-y-2">
              {item.purchaseHistory
                .slice()
                .sort((a, b) => b.date - a.date)
                .map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between px-3 py-2 rounded border border-neutral-800 bg-neutral-900/20"
                  >
                    <div>
                      <div className="text-sm text-neutral-300">
                        {p.transactionName ?? "transaction"}
                      </div>
                      <div className="text-xs text-neutral-500">
                        {new Date(p.date).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-white font-mono">
                        ${p.price.toFixed(2)}
                      </div>
                      <div className="text-xs text-neutral-500">
                        Quantity purchased: {p.quantity ?? "unknown"}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </>
        ) : (
          <div className="p-6 rounded border border-neutral-800 bg-neutral-900/10 text-neutral-500">
            No price history available for this item.
          </div>
        )}
      </div>
    </div>
  );
}

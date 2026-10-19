import { useEffect, useRef, useState } from "react";
import { AreaSeries, createChart, HistogramSeries, LineSeries, LineStyle, type IChartApi, type Time } from "lightweight-charts";
import type { Currency } from "../types/generated/Currency";
import { currencyDecimals } from "./ledger-utils";
import { LedgerError } from "./ledger-ui";
import type { AnalyticsMonth } from "./analytics-utils";
import { chartColors, chartThemeOptions, colorWithAlpha, IncomeParticles, NetColumns } from "./analytics-primitives";

export const analyticsColors = {
  get income() { return chartColors().income; },
  get expenses() { return chartColors().expenses; },
  get net() { return chartColors().net; },
};

export function AnalyticsChart({ rows, currency, tableId }: { rows: AnalyticsMonth[]; currency: Currency; tableId: string }) {
  const container = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<unknown>(null);
  useEffect(() => {
    const element = container.current;
    if (!element || rows.length === 0) return;
    let chart: IChartApi | undefined;
    let observer: ResizeObserver | undefined;
    let themeObserver: MutationObserver | undefined;
    let detachVisuals: (() => void) | undefined;
    let columns: NetColumns | undefined;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotion = () => {
      chart?.applyOptions({ kineticScroll: { mouse: false, touch: !motion.matches } });
      if (motion.matches) columns?.finish();
    };

    setError(null);
    try {
      const decimals = currencyDecimals(currency);
      const factor = 10 ** decimals;
      const numberFormat = new Intl.NumberFormat("es-AR", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
      const colors = chartColors();
      const themeOptions = chartThemeOptions(colors);
      chart = createChart(element, {
        ...themeOptions,
        width: Math.max(1, element.clientWidth), height: 400,
        layout: { ...themeOptions.layout, fontFamily: "monospace", fontSize: 10, attributionLogo: true },
        grid: { ...themeOptions.grid, vertLines: { visible: false } },
        rightPriceScale: { ...themeOptions.rightPriceScale, minimumWidth: 80 },
        timeScale: { ...themeOptions.timeScale, timeVisible: false, rightOffset: 0, minBarSpacing: 0.01 },
        localization: { locale: "es-AR", priceFormatter: (value: number) => numberFormat.format(value) },

        kineticScroll: { mouse: false, touch: !motion.matches },
        handleScroll: { mouseWheel: false, pressedMouseMove: true, horzTouchDrag: true, vertTouchDrag: false },
        handleScale: { mouseWheel: false, pinch: true, axisPressedMouseMove: true },
      });
      const priceFormat = { type: "price" as const, precision: decimals, minMove: 1 / factor };
      const income = chart.addSeries(AreaSeries, { lineColor: colors.income, topColor: colorWithAlpha(colors.income, 0), bottomColor: colorWithAlpha(colors.income, 0), lineWidth: 1, title: "Ingresos", priceFormat, lastValueVisible: false, priceLineVisible: false });
      const expenses = chart.addSeries(LineSeries, { color: colors.expenses, lineWidth: 1, title: "Gastos", priceFormat, lastValueVisible: false, priceLineVisible: false });
      const net = chart.addSeries(HistogramSeries, { color: "rgba(0,0,0,0)", title: "Neto", priceFormat, lastValueVisible: false, priceLineVisible: false }, 1);
      const incomeData = rows.map((row) => ({ time: `${row.month}-01` as Time, value: Number(row.income) / factor }));
      const expensesData = rows.map((row) => ({ time: `${row.month}-01` as Time, value: Number(row.expenses) / factor }));
      const netData = rows.map((row) => ({ time: `${row.month}-01` as Time, value: Number(row.net) / factor }));
      income.setData(incomeData); expenses.setData(expensesData); net.setData(netData);
      const particles = new IncomeParticles(incomeData, colors.income);
      const netColumns = new NetColumns(netData, colors.net, motion.matches);
      columns = netColumns;
      detachVisuals = () => { income.detachPrimitive(particles); net.detachPrimitive(netColumns); };
      income.attachPrimitive(particles);
      // The native histogram retains final data and autoscaling throughout the reveal.
      net.attachPrimitive(netColumns);
      const averages = ([
        [income, "income", "Prom. ingresos"],
        [expenses, "expenses", "Prom. gastos"],
        [net, "net", "Prom. neto"],
      ] as const).map(([series, key, title]) => {
        const total = rows.reduce((sum, row) => sum + row[key], 0n);
        const line = series.createPriceLine({ price: Number(total) / rows.length / factor, color: colors[key], lineWidth: 1, lineStyle: LineStyle.Dashed, axisLabelVisible: false, title });
        return { key, line };
      });
      const updateTheme = () => {
        const next = chartColors();
        chart?.applyOptions(chartThemeOptions(next));
        income.applyOptions({ lineColor: next.income, topColor: colorWithAlpha(next.income, 0), bottomColor: colorWithAlpha(next.income, 0) });
        expenses.applyOptions({ color: next.expenses });
        particles.setColor(next.income);
        netColumns.setColor(next.net);
        for (const { key, line } of averages) line.applyOptions({ color: next[key] });
      };
      chart.panes()[0]?.setStretchFactor(3);
      chart.panes()[1]?.setStretchFactor(1);
      chart.timeScale().fitContent();
      observer = new ResizeObserver((entries) => {
        const width = entries[0]?.contentRect.width;
        if (width && width > 0) chart?.resize(Math.floor(width), 400);
      });
      observer.observe(element);
      themeObserver = new MutationObserver(updateTheme);
      themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme", "class", "style"] });
      motion.addEventListener("change", updateMotion);
    } catch (cause) {
      observer?.disconnect();
      themeObserver?.disconnect();
      detachVisuals?.();
      detachVisuals = undefined;
      chart?.remove();
      chart = undefined;
      setError(cause);
    }
    return () => {
      observer?.disconnect(); themeObserver?.disconnect();
      motion.removeEventListener("change", updateMotion);
      detachVisuals?.(); chart?.remove();
    };
  }, [rows, currency]);

  return <figure aria-label={`Flujo mensual en ${currency.code}`} aria-describedby={tableId} className="min-w-0 space-y-4">
    <figcaption className="flex flex-wrap items-center justify-between gap-3">
      <h2 className="font-display text-2xl">El pulso de tus cuentas</h2>
      <span className="font-mono text-[10px] text-muted">{currency.code} · sin conversión</span>
    </figcaption>
    <ul aria-label="Leyenda del gráfico" className="flex flex-wrap gap-x-6 gap-y-2 font-mono text-[11px] text-primary/65">
      <li className="flex items-center gap-2"><span aria-hidden="true" className="h-0.5 w-5 bg-chart-income" />Ingresos</li>
      <li className="flex items-center gap-2"><span aria-hidden="true" className="h-0.5 w-5 bg-chart-expenses" />Gastos</li>
      <li className="flex items-center gap-2"><span aria-hidden="true" className="h-3 w-3 bg-chart-net" />Neto (panel inferior)</li>
      <li className="flex items-center gap-2"><span aria-hidden="true" className="w-5 border-t border-dashed border-primary/60" />Promedios del período</li>
    </ul>
    {error != null && <LedgerError error={error} />}
    <div ref={container} aria-hidden="true" className={`h-[400px] w-full ${error ? "hidden" : ""}`} />
    <p className="font-mono text-[10px] leading-relaxed text-muted">Las líneas discontinuas muestran el promedio mensual, incluidos los meses sin actividad. Los importes exactos están en la tabla mensual. Gráficos con <a href="https://www.tradingview.com/" target="_blank" rel="noreferrer" className="underline hover:text-primary">TradingView Lightweight Charts™</a>.</p>
  </figure>;
}

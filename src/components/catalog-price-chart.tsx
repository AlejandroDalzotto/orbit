import { useEffect, useRef, useState } from "react";
import { createChart, LineSeries, type IChartApi, type LineData, type Time } from "lightweight-charts";
import type { Currency } from "../types/generated/Currency";
import type { Purchase } from "../types/generated/Purchase";
import { catalogDecimalPlaces, catalogMoney } from "./catalog-utils";
import { chartColors, chartThemeOptions } from "./analytics-primitives";

export function catalogPricePoints(purchases: Purchase[], currencyCode: string, shopName: string | null): LineData<Time>[] {
  const days = new Map<string, Purchase>();
  for (const purchase of purchases) {
    if (purchase.currencyCode !== currencyCode || purchase.shopName !== shopName) continue;
    const previous = days.get(purchase.date);
    if (!previous || purchase.id > previous.id) days.set(purchase.date, purchase);
  }
  return [...days.values()].sort((a, b) => a.date.localeCompare(b.date))
    .map((purchase) => ({ time: purchase.date as Time, value: purchase.unitPrice }));
}

export function CatalogPriceChart({ purchases, currency, shopName, tableId }: {
  purchases: Purchase[]; currency: Currency; shopName: string | null; tableId: string;
}) {
  const container = useRef<HTMLDivElement>(null);
  const [error, setError] = useState(false);
  const code = currency.code;
  const decimals = catalogDecimalPlaces(currency);
  useEffect(() => {
    const element = container.current;
    if (!element || decimals === null) return;
    const points = catalogPricePoints(purchases, code, shopName);
    if (!points.length) return;
    let chart: IChartApi | undefined;
    let resize: ResizeObserver | undefined;
    let theme: MutationObserver | undefined;
    setError(false);
    try {
      // Keep minor units in the series too; converting to major units loses precision.
      const formatter = (value: number) => catalogMoney(Math.round(value), code, [currency]);
      const colors = chartColors();
      const themeOptions = chartThemeOptions(colors);
      chart = createChart(element, {
        ...themeOptions,
        width: Math.max(1, element.clientWidth), height: 240,
        layout: { ...themeOptions.layout, fontFamily: "monospace", fontSize: 10, attributionLogo: true },
        grid: { ...themeOptions.grid, vertLines: { visible: false } },
        timeScale: { ...themeOptions.timeScale, timeVisible: false },
        localization: { locale: "es-AR", priceFormatter: formatter },
        handleScroll: { mouseWheel: false, pressedMouseMove: true, horzTouchDrag: true, vertTouchDrag: false },
        handleScale: { mouseWheel: false, pinch: true, axisPressedMouseMove: true },
        kineticScroll: { mouse: false, touch: false },
      });
      const series = chart.addSeries(LineSeries, {
        color: colors.primary, lineWidth: 2, pointMarkersVisible: true, pointMarkersRadius: 3,
        priceLineVisible: false, lastValueVisible: false,
        priceFormat: { type: "custom", minMove: 1, formatter },
      });
      series.setData(points);
      chart.timeScale().fitContent();
      resize = new ResizeObserver(() => { if (element.clientWidth > 0) chart?.resize(element.clientWidth, 240); });
      resize.observe(element);
      const updateTheme = () => {
        const next = chartColors();
        chart?.applyOptions(chartThemeOptions(next));
        series.applyOptions({ color: next.primary });
      };
      theme = new MutationObserver(updateTheme);
      theme.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme", "class", "style"] });
    } catch {
      resize?.disconnect(); theme?.disconnect(); chart?.remove(); chart = undefined;
      setError(true);
    }
    return () => { resize?.disconnect(); theme?.disconnect(); chart?.remove(); };
  }, [purchases, currency, code, decimals, shopName]);

  if (decimals === null) return null;
  return <figure aria-label={`Evolución del precio unitario en ${code} · ${shopName ?? "Sin tienda"}`} aria-describedby={tableId} className="mb-5 min-w-0 space-y-3">
    <figcaption className="font-mono text-xs text-muted">Evolución del precio unitario · {code} · sin conversión</figcaption>
    {error && <p role="status" className="text-xs text-muted">No se pudo dibujar el gráfico. Los precios siguen disponibles en la tabla.</p>}
    <div ref={container} aria-hidden="true" className={`h-60 w-full ${error ? "hidden" : ""}`} />
    <p className="font-mono text-[10px] leading-relaxed text-muted">Última línea registrada de cada día; con una sola fecha se muestra un punto. La tabla conserva todas las compras y sus importes exactos. Gráfico orientativo con <a href="https://www.tradingview.com/" target="_blank" rel="noreferrer" className="underline">TradingView Lightweight Charts™</a>.</p>
  </figure>;
}

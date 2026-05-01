import { LineSeries } from "lightweight-charts";
import { MOV_TYPE_CONFIG } from "../../../views/movements-view";
import { GroupWithMovements } from "../../../definitions/groups";
import { useEffect, useMemo, useRef, useState } from "react";
import { formatCurrency } from "../../../utils/format-currency";

type ChartMode = "by_type" | "cumulative_by_type" | "cumulative_total";

const CHART_MODES: { key: ChartMode; label: string }[] = [
  { key: "by_type", label: "Por tipo" },
  { key: "cumulative_by_type", label: "Acum. por tipo" },
  { key: "cumulative_total", label: "Acum. total" },
];

// Qué series están visibles por modo
const SERIES_VISIBILITY: Record<ChartMode, { income: boolean; expense: boolean; cumIncome: boolean; cumExpense: boolean; cumTotal: boolean }> = {
  by_type: { income: true, expense: true, cumIncome: false, cumExpense: false, cumTotal: false },
  cumulative_by_type: { income: false, expense: false, cumIncome: true, cumExpense: true, cumTotal: false },
  cumulative_total: { income: false, expense: false, cumIncome: false, cumExpense: false, cumTotal: true },
};

export const GroupDetailsModal = ({ group }: { group: GroupWithMovements }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<any>(null);
  const incomeSeriesRef = useRef<any>(null);
  const expenseSeriesRef = useRef<any>(null);
  const cumIncomeSeriesRef = useRef<any>(null);
  const cumExpenseSeriesRef = useRef<any>(null);
  const cumTotalSeriesRef = useRef<any>(null);
  const [chartMode, setChartMode] = useState<ChartMode>("by_type");

  const chartData = useMemo(() => {
    const toValue = (cents: number) => cents / 100;
    const dates = [...new Set(group.movements.map((m) => m.date.split("T")[0]))].sort();

    const byDate = group.movements.reduce(
      (acc, m) => {
        const date = m.date.split("T")[0];
        if (!acc[date]) acc[date] = { income: 0, expense: 0 };
        if (m.mov_type === "income") acc[date].income += m.ars_amount;
        if (m.mov_type === "expense") acc[date].expense += m.ars_amount;
        return acc;
      },
      {} as Record<string, { income: number; expense: number }>,
    );

    // Por tipo: valores individuales por fecha
    const byTypeIncome = dates.map((d) => ({ time: d as any, value: toValue(byDate[d]?.income ?? 0) }));
    const byTypeExpense = dates.map((d) => ({ time: d as any, value: toValue(byDate[d]?.expense ?? 0) }));

    // Acumulado por tipo: suma corrida de cada tipo
    let cumInc = 0,
      cumExp = 0;
    const cumByTypeIncome = dates.map((d) => {
      cumInc += byDate[d]?.income ?? 0;
      return { time: d as any, value: toValue(cumInc) };
    });
    const cumByTypeExpense = dates.map((d) => {
      cumExp += byDate[d]?.expense ?? 0;
      return { time: d as any, value: toValue(cumExp) };
    });

    // Acumulado total: neto acumulado (income - expense)
    let cumTotal = 0;
    const cumTotalData = dates.map((d) => {
      cumTotal += (byDate[d]?.income ?? 0) - (byDate[d]?.expense ?? 0);
      return { time: d as any, value: toValue(cumTotal) };
    });

    return { byTypeIncome, byTypeExpense, cumByTypeIncome, cumByTypeExpense, cumTotalData, finalCumTotal: cumTotal };
  }, [group]);

  // Crear chart y todas las series una sola vez
  useEffect(() => {
    if (!chartRef.current || group.movements.length === 0) return;

    import("lightweight-charts").then(({ createChart, LineStyle }) => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.remove();
        chartInstanceRef.current = null;
      }

      const chart = createChart(chartRef.current!, {
        width: chartRef.current!.clientWidth,
        height: 180,
        layout: { background: { color: "transparent" }, textColor: "#a3a3a3" },
        grid: {
          vertLines: { style: LineStyle.Dotted, color: "#e5e7eb" },
          horzLines: { style: LineStyle.Dotted, color: "#e5e7eb" },
        },
        rightPriceScale: { borderColor: "#e5e7eb" },
        timeScale: { borderColor: "#e5e7eb" },
        localization: {
          priceFormatter: Intl.NumberFormat("es-AR", {
            style: "currency",
            currency: "ARS",
          }).format,
        },
      });

      chartInstanceRef.current = chart;

      incomeSeriesRef.current = chart.addSeries(LineSeries, { color: MOV_TYPE_CONFIG.income.lineColor, lineWidth: 2, title: "Ingresos" });
      expenseSeriesRef.current = chart.addSeries(LineSeries, { color: MOV_TYPE_CONFIG.expense.lineColor, lineWidth: 2, title: "Egresos" });
      cumIncomeSeriesRef.current = chart.addSeries(LineSeries, { color: MOV_TYPE_CONFIG.income.lineColor, lineWidth: 2, title: "Ingresos acum." });
      cumExpenseSeriesRef.current = chart.addSeries(LineSeries, { color: MOV_TYPE_CONFIG.expense.lineColor, lineWidth: 2, title: "Egresos acum." });
      cumTotalSeriesRef.current = chart.addSeries(LineSeries, {
        color: chartData.finalCumTotal >= 0 ? MOV_TYPE_CONFIG.income.lineColor : MOV_TYPE_CONFIG.expense.lineColor,
        lineWidth: 2,
        title: "Neto acum.",
      });

      incomeSeriesRef.current.setData(chartData.byTypeIncome);
      expenseSeriesRef.current.setData(chartData.byTypeExpense);
      cumIncomeSeriesRef.current.setData(chartData.cumByTypeIncome);
      cumExpenseSeriesRef.current.setData(chartData.cumByTypeExpense);
      cumTotalSeriesRef.current.setData(chartData.cumTotalData);

      // Visibilidad inicial según modo actual
      const v = SERIES_VISIBILITY[chartMode];
      incomeSeriesRef.current.applyOptions({ visible: v.income });
      expenseSeriesRef.current.applyOptions({ visible: v.expense });
      cumIncomeSeriesRef.current.applyOptions({ visible: v.cumIncome });
      cumExpenseSeriesRef.current.applyOptions({ visible: v.cumExpense });
      cumTotalSeriesRef.current.applyOptions({ visible: v.cumTotal });

      chart.timeScale().fitContent();
    });

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.remove();
        chartInstanceRef.current = null;
        incomeSeriesRef.current = expenseSeriesRef.current = null;
        cumIncomeSeriesRef.current = cumExpenseSeriesRef.current = cumTotalSeriesRef.current = null;
      }
    };
  }, [group, chartData]);

  // Swappear visibilidad sin recrear el chart
  useEffect(() => {
    if (!incomeSeriesRef.current) return;
    const v = SERIES_VISIBILITY[chartMode];
    incomeSeriesRef.current.applyOptions({ visible: v.income });
    expenseSeriesRef.current.applyOptions({ visible: v.expense });
    cumIncomeSeriesRef.current.applyOptions({ visible: v.cumIncome });
    cumExpenseSeriesRef.current.applyOptions({ visible: v.cumExpense });
    cumTotalSeriesRef.current.applyOptions({ visible: v.cumTotal });
    chartInstanceRef.current?.timeScale().fitContent();
  }, [chartMode]);

  const sorted = useMemo(() => [...group.movements].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()), [group.movements]);

  const stats = useMemo(() => {
    return group.movements.reduce(
      (acc, m) => {
        if (m.mov_type === "income") acc.income += m.ars_amount;
        if (m.mov_type === "expense") acc.expense += m.ars_amount;
        return acc;
      },
      { income: 0, expense: 0 },
    );
  }, [group.movements]);

  return (
    <>
      <div className="mb-5 pr-6">
        <h3 className="text-base font-semibold text-neutral-900">{group.name}</h3>
        {group.description && <p className="text-xs text-neutral-400 mt-0.5">{group.description}</p>}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="bg-neutral-50 rounded-md px-3 py-2">
          <p className="text-xs text-neutral-400">Movimientos</p>
          <p className="text-sm font-semibold text-neutral-800">{group.movements.length}</p>
        </div>
        <div className="bg-neutral-50 rounded-md px-3 py-2">
          <p className="text-xs text-neutral-400">Ingresos</p>
          <p className={`text-sm font-semibold ${MOV_TYPE_CONFIG.income.statColor}`}>{formatCurrency(stats.income, "ARS")}</p>
        </div>
        <div className="bg-neutral-50 rounded-md px-3 py-2">
          <p className="text-xs text-neutral-400">Egresos</p>
          <p className={`text-sm font-semibold ${MOV_TYPE_CONFIG.expense.statColor}`}>{formatCurrency(stats.expense, "ARS")}</p>
        </div>
      </div>

      {/* Chart */}
      {group.movements.length > 0 && (
        <div className="mb-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-medium text-neutral-400 uppercase tracking-wide">Evolución</p>
            <div className="flex items-center gap-1 bg-neutral-100 rounded-md p-0.5">
              {CHART_MODES.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setChartMode(key)}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                    chartMode === key ? "bg-white text-neutral-800 shadow-sm" : "text-neutral-500 hover:text-neutral-700"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div ref={chartRef} className="w-full rounded-md overflow-hidden" />
        </div>
      )}

      <div className="border-t border-neutral-100 mb-4" />

      {/* Lista de movimientos */}
      <div>
        <p className="text-xs font-medium text-neutral-400 uppercase tracking-wide mb-3">Movimientos</p>
        <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
          {sorted.length === 0 ? (
            <p className="text-sm text-neutral-400">Este grupo no tiene movimientos.</p>
          ) : (
            sorted.map((mov) => {
              const config = MOV_TYPE_CONFIG[mov.mov_type];
              const date = new Date(mov.date).toLocaleDateString("es-AR");
              return (
                <div key={mov.id} className="flex items-center justify-between gap-3 px-3 py-2 rounded-md bg-neutral-50 border border-neutral-100">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium shrink-0 ${config.color}`}>
                      {config.icon}
                      {config.label}
                    </span>
                    <p className="text-sm text-neutral-700 truncate">{mov.details}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-medium text-neutral-900">{formatCurrency(mov.original_amount, mov.currency)}</p>
                    <p className="text-xs text-neutral-400">{date}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
};

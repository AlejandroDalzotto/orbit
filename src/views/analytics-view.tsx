import { useId, useMemo, useState } from "react";
import { useAnalytics, useLedgerCurrencies } from "../hooks/use-movements";
import { useCatalogCategories } from "../hooks/use-catalog";
import { AnalyticsChart } from "../components/analytics-chart";
import { AnimatedMoney } from "../components/animated-money";
import type { Currency } from "../types/generated/Currency";
import { categoryReport, monthlyReport, monthLabel, percentage, periodBounds, roundedAverage, shiftMonth, validMonth, type AnalyticsPeriod } from "../components/analytics-utils";
import { LedgerError, ledgerField, ledgerLabel, ledgerSecondary } from "../components/ledger-ui";
import { formatMinor, localDate } from "../components/ledger-utils";

export default function AnalyticsView() {
  const query = useAnalytics();
  const currenciesQuery = useLedgerCurrencies();
  const categoriesQuery = useCatalogCategories();
  const currencies = currenciesQuery.data ?? [];
  const data = query.data;
  const [selectedCurrency, setSelectedCurrency] = useState("");
  const [period, setPeriod] = useState<AnalyticsPeriod>("12");
  const currentMonth = localDate().slice(0, 7);
  const [customFrom, setCustomFrom] = useState(shiftMonth(currentMonth, -11));
  const [customTo, setCustomTo] = useState(currentMonth);
  const [categoryMonth, setCategoryMonth] = useState("");
  const tableId = useId();
  const codes = useMemo(() => [...new Set([
    ...(data?.monthly.map((row) => row.currencyCode) ?? []),
    ...(data?.categories.map((row) => row.currencyCode) ?? []),
    ...(data?.netWorth.map((row) => row.currencyCode) ?? []),
    ...(currenciesQuery.data?.filter((currency) => currency.isActive).map((currency) => currency.code) ?? []),
  ])].sort(), [data, currenciesQuery.data]);
  const code = codes.includes(selectedCurrency) ? selectedCurrency : codes[0] ?? "";
  const currency = currencies.find((item) => item.code === code);
  const availableMonths = useMemo(() => data?.monthly.filter((row) => row.currencyCode === code).map((row) => row.month) ?? [], [data, code]);
  const { from, to } = periodBounds(period, currentMonth, availableMonths, customFrom, customTo);
  const invalidPeriod = !validMonth(from) || !validMonth(to) || from > to;
  const rows = useMemo(() => data && !invalidPeriod ? monthlyReport(data, code, from, to) : [], [data, code, from, to, invalidPeriod]);
  const totals = useMemo(() => rows.reduce((sum, row) => ({ income: sum.income + row.income, expenses: sum.expenses + row.expenses, net: sum.net + row.net }), { income: 0n, expenses: 0n, net: 0n }), [rows]);
  const chosenCategoryMonth = validMonth(categoryMonth) && categoryMonth >= from && categoryMonth <= to ? categoryMonth : "";
  const categories = useMemo(() => data && !invalidPeriod ? categoryReport(data, code, chosenCategoryMonth || from, chosenCategoryMonth || to, categoriesQuery.data) : [], [data, code, from, to, chosenCategoryMonth, invalidPeriod, categoriesQuery.data]);
  const categoryTotal = categories.reduce((sum, category) => sum + category.amount, 0n);
  const hasActivity = !!data?.monthly.some((row) => row.currencyCode === code && row.month >= from && row.month <= to);
  const money = (amount: number | bigint, currencyCode = code) => currencyCode ? formatMinor(amount, currencyCode, currencies) : "—";

  // Anchor absolute screen-reader text inside this scroller, not the document.
  return <section className="relative h-full min-h-0 w-full min-w-0 overflow-y-auto bg-transparent p-5 text-primary sm:p-8 lg:p-10" aria-label="Analítica">
    <div className="mx-auto max-w-7xl space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-5 border-b border-primary/15 pb-7">
        <div>
          <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.24em] text-muted">Orbit / Perspectiva</p>
          <h1 className="font-mono text-4xl font-light leading-[1.15] tracking-tight text-muted sm:text-5xl">Tu flujo en perspectiva<span className="block text-primary">Analítica</span></h1>
          <p className="mt-3 max-w-xl font-mono text-xs leading-relaxed text-muted">Entendé tu flujo, sin mezclar monedas ni contar transferencias como ingresos.</p>
        </div>
        <button type="button" className={ledgerSecondary} disabled={query.isFetching || currenciesQuery.isFetching} onClick={() => { void query.refetch(); void currenciesQuery.refetch(); }}>{query.isFetching || currenciesQuery.isFetching ? "Actualizando…" : "Actualizar datos"}</button>
      </header>
      {query.error != null && <LedgerError error={query.error} retry={() => void query.refetch()} />}
      {currenciesQuery.error != null && <LedgerError error={currenciesQuery.error} retry={() => void currenciesQuery.refetch()} />}
      {categoriesQuery.error != null && <LedgerError error={categoriesQuery.error} retry={() => void categoriesQuery.refetch()} />}
      {query.isPending && !query.error && <p role="status" className="border border-primary/15 py-16 text-center font-mono text-xs text-muted">Preparando tu perspectiva financiera…</p>}
      {data && <>
        <section aria-labelledby={`${tableId}-worth`} className="space-y-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2"><h2 id={`${tableId}-worth`} className="font-display text-2xl">Patrimonio actual</h2><p className="font-mono text-[10px] text-muted">Cuentas activas · independiente del período</p></div>
          {data.netWorth.length ? <dl className="grid border border-hairline sm:grid-cols-2 lg:grid-cols-3">{data.netWorth.map((worth) => <div key={worth.currencyCode} className="min-w-0 border-hairline p-5 [overflow-wrap:anywhere] sm:border-r">
            <dt className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted">{worth.currencyCode} <span className="ml-2 text-muted">{currencies.find((item) => item.code === worth.currencyCode)?.name}</span></dt>
            <dd className="mt-3 break-words font-display text-3xl tabular-nums">{money(worth.totalBalance, worth.currencyCode)}</dd>
          </div>)}</dl> : <p className="border border-dashed border-primary/15 p-5 font-mono text-xs text-muted">No hay cuentas activas para calcular el patrimonio.</p>}
          <p className="font-mono text-[10px] text-muted">Cada moneda se informa por separado. No se calcula un total convertido.</p>
        </section>

        <section aria-label="Período y moneda del análisis" className="grid gap-4 border-y border-primary/15 py-5 sm:grid-cols-2 lg:grid-cols-4">
          <label className="min-w-0"><span className={ledgerLabel}>Moneda del flujo</span><select className={ledgerField} disabled={!codes.length} value={code} onChange={(event) => { setSelectedCurrency(event.target.value); setCategoryMonth(""); }}>
            {!codes.length && <option value="">Sin monedas</option>}
            {codes.map((value) => <option key={value} value={value}>{value}{currencies.find((item) => item.code === value)?.symbol ? ` · ${currencies.find((item) => item.code === value)?.symbol}` : ""}</option>)}
          </select></label>
          <label className="min-w-0"><span className={ledgerLabel}>Período</span><select className={ledgerField} value={period} onChange={(event) => { setPeriod(event.target.value as AnalyticsPeriod); setCategoryMonth(""); }}>
            <option value="3">Últimos 3 meses</option><option value="6">Últimos 6 meses</option><option value="12">Últimos 12 meses</option><option value="all">Todo el historial</option><option value="custom">Personalizado</option>
          </select></label>
          {period === "custom" ? <>
            <label className="min-w-0"><span className={ledgerLabel}>Desde (mes)</span><input type="month" className={ledgerField} value={customFrom} min="0001-01" max={customTo || "9999-12"} aria-invalid={invalidPeriod} onChange={(event) => setCustomFrom(event.target.value)} /></label>
            <label className="min-w-0"><span className={ledgerLabel}>Hasta (mes)</span><input type="month" className={ledgerField} value={customTo} min={customFrom || "0001-01"} max="9999-12" aria-invalid={invalidPeriod} onChange={(event) => setCustomTo(event.target.value)} /></label>
          </> : <div className="flex items-end pb-2 font-mono text-[11px] text-muted lg:col-span-2">{monthLabel(from)} — {monthLabel(to)} · {rows.length} {rows.length === 1 ? "mes" : "meses"}</div>}
        </section>
        {invalidPeriod ? <LedgerError error="Elegí un período válido: el mes inicial no puede ser posterior al final." /> : <>
          <section aria-label={`Resumen del período en ${code}`} className="grid gap-5 sm:grid-cols-3">
            <Summary label="Ingresos" value={totals.income} code={code} currencies={currencies} average={money(roundedAverage(totals.income, rows.length))} color="text-primary" />
            <Summary label="Gastos" value={totals.expenses} code={code} currencies={currencies} average={money(roundedAverage(totals.expenses, rows.length))} color="text-primary/80" />
            <Summary label="Flujo neto" value={totals.net} code={code} currencies={currencies} average={money(roundedAverage(totals.net, rows.length))} color="text-primary" />
          </section>
          <p className="font-mono text-[10px] leading-relaxed text-muted">Sólo ingresos y gastos. Saldos iniciales y transferencias quedan fuera del flujo. Los promedios se redondean a la unidad menor e incluyen los meses sin actividad del período.</p>
          {!hasActivity ? <div className="border border-dashed border-primary/20 px-6 py-14 text-center">
            <h2 className="font-display text-3xl">Sin flujo en este período</h2>
            <p className="mx-auto mt-3 max-w-lg font-mono text-xs leading-relaxed text-muted">No hay ingresos ni gastos en {code || "la moneda seleccionada"}. Elegí otra moneda o período, o registrá un movimiento. Las transferencias y los saldos iniciales no generan flujo.</p>
          </div> : <div className="border border-primary/15 p-4 sm:p-6">
            {currency ? <AnalyticsChart rows={rows} currency={currency} tableId={tableId} /> : <p role="status" className="font-mono text-xs text-muted">{currenciesQuery.isPending ? "Cargando precisión de la moneda…" : "El gráfico requiere la precisión de esta moneda. Los valores exactos se muestran abajo en unidades menores."}</p>}
          </div>}

          <section aria-labelledby={`${tableId}-category-title`} className="space-y-5 border border-primary/15 p-4 sm:p-6">
            <header className="flex flex-wrap items-end justify-between gap-4">
              <div><p className={ledgerLabel}>Dónde va tu dinero</p><h2 id={`${tableId}-category-title`} className="font-display text-2xl">Gastos por categoría</h2></div>
              <label><span className={ledgerLabel}>Desglose por mes</span><select className={`${ledgerField} min-w-44`} value={chosenCategoryMonth} onChange={(event) => setCategoryMonth(event.target.value)}>
                <option value="">Todo el período</option>{rows.map((row) => <option key={row.month} value={row.month}>{monthLabel(row.month)}</option>)}
              </select></label>
            </header>
            {categories.length === 0 ? <p className="py-8 font-mono text-xs text-muted">No hay gastos por categoría en {chosenCategoryMonth ? monthLabel(chosenCategoryMonth) : "este período"}.</p> : <div className="overflow-x-auto">
              <table className="w-full min-w-[380px] text-left">
                <caption className="sr-only">Gastos por categoría en {code}, {chosenCategoryMonth ? monthLabel(chosenCategoryMonth) : `${monthLabel(from)} a ${monthLabel(to)}`}</caption>
                <thead className="border-b border-primary/15 font-mono text-[10px] uppercase tracking-wider text-muted"><tr><th scope="col" className="pb-3 font-normal">Categoría</th><th scope="col" className="pb-3 text-right font-normal">Importe</th><th scope="col" className="pb-3 pl-4 text-right font-normal">Participación</th></tr></thead>
                <tbody className="divide-y divide-primary/10">{categories.map((category) => <tr key={category.id ?? "uncategorized"}>
                  <th scope="row" className="max-w-72 py-4 pr-5 font-normal"><span className="block break-words font-mono text-xs text-primary/80">{category.name}</span><span aria-hidden="true" className="mt-3 block h-0.5 w-full bg-primary/5"><span className="block h-full bg-primary/60" style={{ width: `${categoryTotal ? Number(category.amount * 10000n / categoryTotal) / 100 : 0}%` }} /></span></th>
                  <td className="whitespace-nowrap py-4 text-right font-display text-xl tabular-nums">{money(category.amount)}</td><td className="py-4 pl-4 text-right font-mono text-[11px] text-muted">{percentage(category.amount, categoryTotal)}</td>
                </tr>)}</tbody>
                <tfoot className="border-t border-primary/20"><tr><th scope="row" className="pt-4 font-mono text-xs font-normal">Total de gastos</th><td className="pt-4 text-right font-display text-xl tabular-nums">{money(categoryTotal)}</td><td className="pt-4 pl-4 text-right font-mono text-[11px] text-muted">100 %</td></tr></tfoot>
              </table>
            </div>}
          </section>

          <section aria-labelledby={`${tableId}-title`} className="space-y-4">
            <div className="flex flex-wrap items-baseline justify-between gap-3"><h2 id={`${tableId}-title`} className="font-display text-2xl">Mes a mes</h2><span className="font-mono text-[10px] text-muted">Importes exactos · {code}</span></div>
            <div className="overflow-x-auto border-y border-primary/15">
              <table id={tableId} className="w-full min-w-[600px] text-left">
                <caption className="sr-only">Flujo mensual en {code}, de {monthLabel(from)} a {monthLabel(to)}. Ingresos, gastos y neto; incluye meses sin actividad.</caption>
                <thead className="border-b border-primary/15 font-mono text-[10px] uppercase tracking-[0.14em] text-muted"><tr><th scope="col" className="px-3 py-4 font-normal">Mes</th><th scope="col" className="px-3 py-4 text-right font-normal">Ingresos</th><th scope="col" className="px-3 py-4 text-right font-normal">Gastos</th><th scope="col" className="px-3 py-4 text-right font-normal">Neto</th></tr></thead>
                <tbody className="divide-y divide-primary/10">{[...rows].reverse().map((row) => <tr key={row.month} className="hover:bg-primary/[0.025]"><th scope="row" className="px-3 py-4 font-mono text-xs font-normal text-muted">{monthLabel(row.month)}</th><td className="whitespace-nowrap px-3 py-4 text-right font-display text-lg tabular-nums">{money(row.income)}</td><td className="whitespace-nowrap px-3 py-4 text-right font-display text-lg tabular-nums text-primary/70">{money(row.expenses)}</td><td className="whitespace-nowrap px-3 py-4 text-right font-display text-lg tabular-nums text-primary">{money(row.net)}</td></tr>)}</tbody>
                <tfoot className="border-t border-primary/20"><tr><th scope="row" className="px-3 py-4 font-mono text-xs font-normal">Total del período</th><td className="whitespace-nowrap px-3 py-4 text-right font-display text-xl tabular-nums">{money(totals.income)}</td><td className="whitespace-nowrap px-3 py-4 text-right font-display text-xl tabular-nums text-primary/70">{money(totals.expenses)}</td><td className="whitespace-nowrap px-3 py-4 text-right font-display text-xl tabular-nums text-primary">{money(totals.net)}</td></tr></tfoot>
              </table>
            </div>
          </section>
        </>}
      </>}
    </div>
  </section>;
}

function Summary({ label, value, code, currencies, average, color }: { label: string; value: bigint; code: string; currencies: Currency[]; average: string; color: string }) {
  return <div className="min-w-0 border-l border-primary/20 pl-5 [overflow-wrap:anywhere]"><h2 className={ledgerLabel}>{label}</h2><p className={`mt-3 break-words font-display text-3xl tabular-nums ${color}`}><AnimatedMoney value={value} code={code} currencies={currencies} /></p><p className="mt-3 font-mono text-[10px] leading-relaxed text-muted">≈ {average} / mes</p></div>;
}

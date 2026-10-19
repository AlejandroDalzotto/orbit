import { useEffect, useState, type ReactNode } from "react";
import { ArrowDownLeft, ArrowLeftRight, ArrowUpRight, ChevronLeft, ChevronRight, FileUp, Plus, Search } from "lucide-react";
import { useLedgerChoices, useMovements } from "../hooks/use-movements";
import { useNavigationStore } from "../stores/navigation-store";
import type { Movement } from "../types/generated/Movement";
import type { MovementFilter } from "../types/generated/MovementFilter";
import type { MovementType } from "../types/generated/MovementType";
import { LedgerForm } from "../components/ledger-form";
import { ImportDataDialog } from "../components/import-data-dialog";
import { LedgerDetails } from "../components/ledger-details";
import { LedgerError, ledgerField, ledgerLabel, ledgerPrimary, ledgerSecondary } from "../components/ledger-ui";
import { displayDate, formatMinor, movementLabels } from "../components/ledger-utils";

const initialFilter: MovementFilter = {
  search: null, accountId: null, categoryId: null, movementType: null, currencyCode: null,
  dateFrom: null, dateTo: null, limit: 25, offset: 0,
};
type Panel = { mode: "create" } | { mode: "details" | "edit"; movement: Movement } | null;

export default function MovementsView() {
  const movementsTarget = useNavigationStore((state) => state.movementsTarget);
  const consumeMovementsTarget = useNavigationStore((state) => state.consumeMovementsTarget);
  const [filter, setFilter] = useState<MovementFilter>(() => ({ ...initialFilter, accountId: movementsTarget?.accountId ?? null }));
  const [search, setSearch] = useState("");
  const [panel, setPanel] = useState<Panel>(null);
  const [notice, setNotice] = useState("");
  const [importOpen, setImportOpen] = useState(false);
  const choices = useLedgerChoices();
  const invalidDates = !!(filter.dateFrom && filter.dateTo && filter.dateFrom > filter.dateTo);
  const movements = useMovements(filter, !invalidDates);
  const page = movements.data;
  const limit = filter.limit ?? 25;
  const offset = filter.offset ?? 0;
  const searching = search.trim() !== (filter.search ?? "");
  const formReady = !choices.isPending && !choices.error;

  useEffect(() => {
    if (!movementsTarget) return;
    setFilter({ ...initialFilter, accountId: movementsTarget.accountId });
    setSearch("");
    setPanel(null);
    setNotice("");
    consumeMovementsTarget(movementsTarget);
  }, [movementsTarget, consumeMovementsTarget]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setFilter((current) => current.search === (search.trim() || null) ? current : { ...current, search: search.trim() || null, offset: 0 });
    }, 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    if (page && !movements.isPlaceholderData && offset > 0 && offset >= page.total) {
      setFilter((current) => ({ ...current, offset: Math.max(0, Math.floor((page.total - 1) / limit) * limit) }));
    }
  }, [page, movements.isPlaceholderData, offset, limit]);

  function changeFilter(patch: Partial<MovementFilter>) {
    setFilter((current) => ({ ...current, ...patch, offset: 0 }));
    setNotice("");
  }
  function resetFilters() { setSearch(""); setFilter({ ...initialFilter, limit }); setNotice(""); }
  function saved() {
    setPanel(null); setNotice("Movimiento guardado. Los saldos y reportes se recalculan automáticamente.");
    setFilter((current) => ({ ...current, offset: 0 }));
  }
  const hasFilters = search !== "" || filter.accountId != null || filter.categoryId != null || filter.movementType != null || filter.currencyCode != null || filter.dateFrom != null || filter.dateTo != null;

  return <section className="h-full overflow-y-auto bg-transparent p-5 text-primary sm:p-8 lg:p-10" aria-label="Movimientos">
    <div className="mx-auto max-w-7xl space-y-7">
      <header className="flex flex-wrap items-end justify-between gap-5 border-b border-primary/15 pb-7">
        <div>
          <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.24em] text-muted">Orbit / Libro de cuentas</p>
          <h1 className="font-mono text-4xl font-light leading-[1.15] tracking-tight text-muted sm:text-5xl">Tu registro de<span className="block text-primary">Movimientos</span></h1>
          <p className="mt-3 max-w-xl font-mono text-xs leading-relaxed text-muted">Cada entrada, cada salida. Tus transferencias, una sola vez.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button type="button" className={ledgerSecondary} onClick={() => setImportOpen(true)}><FileUp size={16} />Importar CSV</button>
          <button type="button" className={ledgerPrimary} disabled={!formReady} onClick={() => { setPanel({ mode: "create" }); setNotice(""); }}><Plus size={16} />Nuevo movimiento</button>
        </div>
      </header>

      {choices.error != null && <LedgerError error={choices.error} retry={() => void choices.refetch()} />}
      {choices.isPending && !choices.error && <p role="status" className="font-mono text-xs text-muted">Cargando cuentas, monedas y categorías…</p>}
      <section aria-label="Filtros de movimientos" className="space-y-5 border border-primary/15 p-4 sm:p-5">
        <div className="flex flex-wrap items-end gap-4">
          <label className="min-w-52 flex-1">
            <span className={ledgerLabel}>Búsqueda de texto completo</span>
            <span className="relative block"><Search size={15} aria-hidden="true" className="pointer-events-none absolute left-3 top-3.5 text-primary/40" />
              <input type="search" className={`${ledgerField} pl-10`} value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Descripción o notas…" />
            </span>
          </label>
          <button type="button" className={ledgerSecondary} disabled={!hasFilters} onClick={resetFilters}>Limpiar filtros</button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <FilterField label="Cuenta">
            <select className={ledgerField} value={filter.accountId ?? ""} onChange={(event) => changeFilter({ accountId: event.target.value ? Number(event.target.value) : null })}>
              <option value="">Todas las cuentas</option>
              {choices.accounts.map((account) => <option key={account.id} value={account.id}>{account.name} · {account.currencyCode}{!account.isActive ? " · inactiva" : ""}</option>)}
            </select>
          </FilterField>
          <FilterField label="Categoría">
            <select className={ledgerField} value={filter.categoryId ?? ""} onChange={(event) => changeFilter({ categoryId: event.target.value ? Number(event.target.value) : null })}>
              <option value="">Todas las categorías</option>
              {choices.categories.map((category) => <option key={category.id} value={category.id}>{category.name}{!category.isActive ? " · archivada" : ""}</option>)}
            </select>
          </FilterField>
          <FilterField label="Moneda">
            <select className={ledgerField} value={filter.currencyCode ?? ""} onChange={(event) => changeFilter({ currencyCode: event.target.value || null })}>
              <option value="">Todas las monedas</option>
              {choices.currencies.map((currency) => <option key={currency.code} value={currency.code}>{currency.code} · {currency.name}</option>)}
            </select>
          </FilterField>
          <FilterField label="Tipo">
            <select className={ledgerField} value={filter.movementType ?? ""} onChange={(event) => changeFilter({ movementType: (event.target.value || null) as MovementType | null })}>
              <option value="">Todos los tipos</option>
              {(Object.entries(movementLabels) as [MovementType, string][]).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </FilterField>
          <FilterField label="Desde"><input type="date" className={ledgerField} value={filter.dateFrom ?? ""} max={filter.dateTo ?? undefined} aria-invalid={invalidDates} onChange={(event) => changeFilter({ dateFrom: event.target.value || null })} /></FilterField>
          <FilterField label="Hasta"><input type="date" className={ledgerField} value={filter.dateTo ?? ""} min={filter.dateFrom ?? undefined} aria-invalid={invalidDates} onChange={(event) => changeFilter({ dateTo: event.target.value || null })} /></FilterField>
        </div>
        <p className="font-mono text-[10px] leading-relaxed text-muted">Cuenta y moneda incluyen ambos lados de una transferencia. Orden: fecha más reciente primero.</p>
      </section>

      {notice && <p role="status" className="border-l border-primary/40 pl-4 font-mono text-xs text-primary/75">{notice}</p>}
      {invalidDates ? <LedgerError error="La fecha inicial no puede ser posterior a la final." /> : <>
        {movements.error != null && <LedgerError error={movements.error} retry={() => void movements.refetch()} />}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-baseline gap-3"><p className="font-display text-3xl tabular-nums">{page?.total.toLocaleString("es-AR") ?? "—"}</p><span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">Movimientos lógicos</span></div>
          <p role="status" aria-live="polite" className="font-mono text-[10px] uppercase tracking-wider text-muted">{movements.isFetching || searching ? "Actualizando…" : "Ordenados por fecha ↓"}</p>
        </div>
        {movements.isPending && !movements.error ? <div role="status" className="border-y border-primary/15 py-16 text-center font-mono text-xs text-muted">Cargando movimientos…</div> : page && <>
          {page.items.length === 0 ? <div className="border border-dashed border-primary/20 px-6 py-16 text-center">
            <h2 className="font-display text-3xl">{hasFilters ? "Sin coincidencias" : "Tu libro empieza acá"}</h2>
            <p className="mx-auto mt-3 max-w-md font-mono text-xs leading-relaxed text-muted">{hasFilters ? "Probá otro período, una búsqueda más corta o quitá los filtros." : "Registrá un ingreso, un gasto, una transferencia o el saldo inicial de una cuenta."}</p>
            <button type="button" className={`${ledgerSecondary} mt-6`} disabled={!hasFilters && !formReady} onClick={hasFilters ? resetFilters : () => setPanel({ mode: "create" })}>{hasFilters ? "Ver todos los movimientos" : "Crear primer movimiento"}</button>
          </div> : <div className={`overflow-x-auto border-y border-primary/15 ${movements.isPlaceholderData || searching ? "opacity-50" : ""}`} aria-busy={movements.isFetching || searching}>
            <table className="w-full min-w-195 border-collapse text-left">
              <caption className="sr-only">Movimientos paginados. Las transferencias muestran el importe enviado y el recibido en una única fila.</caption>
              <thead className="border-b border-primary/15 font-mono text-[10px] uppercase tracking-[0.14em] text-muted"><tr>
                <th scope="col" className="px-3 py-4 font-normal">Fecha</th><th scope="col" className="px-3 py-4 font-normal">Movimiento</th><th scope="col" className="px-3 py-4 font-normal">Cuenta / destino</th><th scope="col" className="px-3 py-4 font-normal">Categoría</th><th scope="col" className="px-3 py-4 text-right font-normal">Importe</th>
              </tr></thead>
              <tbody className="divide-y divide-primary/10">{page.items.map((movement) => {
                const category = choices.categories.find((item) => item.id === movement.categoryId);
                const shop = choices.shops.find((item) => item.id === movement.shopId);
                const transfer = movement.type === "transfer";
                const Icon = transfer ? ArrowLeftRight : movement.type === "expense" ? ArrowUpRight : ArrowDownLeft;
                return <tr key={movement.id} className="hover:bg-primary/2.5">
                  <td className="whitespace-nowrap px-3 py-5 align-top font-mono text-[11px] text-muted">{displayDate(movement.date)}</td>
                  <td className="max-w-72 px-3 py-5 align-top">
                    <button type="button" disabled={movements.isPlaceholderData || searching} onClick={() => setPanel({ mode: "details", movement })} className="group flex w-full items-start gap-3 text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">
                      <Icon size={17} aria-hidden="true" className="mt-0.5 shrink-0 text-primary/55" />
                      <span className="min-w-0"><span className="block truncate text-sm group-hover:underline">{movement.description || movementLabels[movement.type]}</span><span className="mt-1.5 block font-mono text-[10px] text-muted">{movementLabels[movement.type]}{shop ? ` · ${shop.name}` : ""}{movement.notes ? " · notas" : ""}</span><span className="sr-only"> · Ver detalle #{movement.id}</span></span>
                    </button>
                  </td>
                  <td className="px-3 py-5 align-top font-mono text-[11px] text-primary/65"><span className="block">{movement.accountName}</span>{transfer && <span className="mt-1.5 block text-muted">→ {movement.toAccountName ?? "Destino"}</span>}</td>
                  <td className="px-3 py-5 align-top font-mono text-[11px] text-muted">{category?.name ?? (movement.categoryId != null ? `#${movement.categoryId}` : "—")}</td>
                  <td className="whitespace-nowrap px-3 py-5 text-right align-top"><p className="font-display text-lg tabular-nums">{movement.type === "expense" || transfer ? "−" : "+"}{formatMinor(movement.amount, movement.currencyCode, choices.currencies)}</p>{transfer && movement.toAmount != null && movement.toCurrencyCode && <p className="mt-1 font-display text-base tabular-nums text-primary/65">+{formatMinor(movement.toAmount, movement.toCurrencyCode, choices.currencies)}</p>}</td>
                </tr>;
              })}</tbody>
            </table>
          </div>}
          <footer className="flex flex-wrap items-center justify-between gap-4 border-b border-primary/15 pb-5">
            <div className="flex flex-wrap items-center gap-4">
              <p className="font-mono text-[11px] text-muted">{page.total === 0 ? "0" : `${offset + 1}–${offset + page.items.length}`} de {page.total.toLocaleString("es-AR")}</p>
              <label className="flex items-center gap-2 font-mono text-[10px] text-muted">Por página<select className={`${ledgerField} w-auto min-h-9`} value={limit} onChange={(event) => changeFilter({ limit: Number(event.target.value) })}>{[25, 50, 100, 200].map((size) => <option key={size} value={size}>{size}</option>)}</select></label>
            </div>
            <nav aria-label="Paginación de movimientos" className="flex gap-2">
              <button type="button" className={ledgerSecondary} disabled={!page.hasPreviousPage || movements.isFetching || searching} onClick={() => setFilter((current) => ({ ...current, offset: Math.max(0, offset - limit) }))}><ChevronLeft size={15} />Anterior</button>
              <button type="button" className={ledgerSecondary} disabled={!page.hasNextPage || movements.isFetching || searching} onClick={() => setFilter((current) => ({ ...current, offset: offset + limit }))}>Siguiente<ChevronRight size={15} /></button>
            </nav>
          </footer>
        </>}
      </>}
    </div>
    {importOpen && <ImportDataDialog onClose={() => setImportOpen(false)} />}
    {panel?.mode === "details" && <LedgerDetails key={`details-${panel.movement.id}`} movement={panel.movement} categories={choices.categories} currencies={choices.currencies} shops={choices.shops} canEdit={formReady} onClose={() => setPanel(null)} onEdit={() => setPanel({ mode: "edit", movement: panel.movement })} onDeleted={() => { setPanel(null); setNotice("Movimiento eliminado. Los saldos y reportes se recalculan automáticamente."); }} />}
    {panel && panel.mode !== "details" && <LedgerForm key={panel.mode === "create" ? "create" : `edit-${panel.movement.id}`} movement={panel.mode === "edit" ? panel.movement : undefined} accounts={choices.accounts} currencies={choices.currencies} categories={choices.categories} shops={choices.shops} onClose={() => setPanel(null)} onSaved={saved} />}
  </section>;
}

function FilterField({ label, children }: { label: string; children: ReactNode }) {
  return <label><span className={ledgerLabel}>{label}</span>{children}</label>;
}

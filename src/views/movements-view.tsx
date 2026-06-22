import { useEffect, useMemo } from "react";
import { ChevronLeft, ChevronRight, Plus, Search } from "lucide-react";
import { ViewLayout } from "../layouts/view-layout";
import { useModalStore } from "../stores/modal-store";
import { formatCurrency } from "../utils/format-currency";
import type { Movement, MovementTypeFilter } from "../definitions/movements";
import { useGlobalStore, useGroups, useMovements } from "../stores/global-data-store";
import { AddMovementModal } from "../components/modals/movements/add-movement-modal";
import { formatDate } from "../utils/format-date";
import { MOV_TYPE_CONFIG } from "../definitions/consts";
import { CategorySelect, PeriodSelector, SortControl } from "../components/list-controls";
import { AddGroupModal } from "../components/modals/groups/add-group-modal";

const FILTERS: Readonly<{ value: MovementTypeFilter; label: string }>[] = [
  { value: "all", label: "Todos" },
  { value: "income", label: "Ingresos" },
  { value: "expense", label: "Egresos" },
  { value: "transfer", label: "Transferencias" },
];

export default function MovementsView() {
  const movements = useMovements();
  const open = useModalStore((s) => s.open);
  const groups = useGroups();
  const totalMovements = useGlobalStore((state) => state.totalMovements);

  const filters = useGlobalStore((state) => state.filters);
  const fetchMovements = useGlobalStore((state) => state.initMovements);

  const stats = useGlobalStore((state) => state.stats);
  const setStats = useGlobalStore((state) => state.setStats);

  useEffect(() => {
    const loadMovements = async () => {
      await Promise.all([fetchMovements(), setStats()]);
    };
    loadMovements();
  }, [filters]);

  const { period, groupId, categoryId, limit, offset, type, sort } = filters;
  const goToNextPage = useGlobalStore((state) => state.goToNextPage);
  const goToPreviousPage = useGlobalStore((state) => state.goToPreviousPage);
  const filterByQuery = useGlobalStore((state) => state.filterByQuery);
  const filterByGroupId = useGlobalStore((state) => state.filterByGroupId);
  const changePeriod = useGlobalStore((state) => state.changePeriod);
  const changeType = useGlobalStore((state) => state.changeType);

  // TODO: retrieve already sorted groups from the database to avoid sorting in memory.
  // Grupos ordenados por cantidad de movimientos desc
  const sortedGroups = useMemo(() => [...groups].sort((a, b) => b.movements.length - a.movements.length), [groups]);

  const isTherePreviousPage = offset > 0;
  const isThereNextPage = offset + limit < totalMovements;

  return (
    <ViewLayout>
      <section className="h-full flex flex-col px-4 xl:px-0 xl:container mx-auto">
        <header className="flex justify-between items-start my-8">
          <div className="justify-between items-center">
            <p className="text-neutral-500 text-xs uppercase font-mono tracking-wider">Orbit / Finanzas</p>
            <h1 className="text-5xl text-neutral-50">Movimientos</h1>
          </div>
          {/* placeholder para los periodos */}
          <PeriodSelector value={period ?? "1m"} onChange={changePeriod} />
        </header>
        <div className="grid flex-1 min-h-0 grid-cols-[200px_minmax(0,1fr)_200px] gap-x-4 w-full relative">
          {/* groups */}
          <aside className="order-1">
            <div className="flex items-center justify-between">
              <p className="text-[11px] uppercase tracking-[0.28em] text-[oklch(0.5_0_0)]">Grupos</p>
              <button
                onClick={() => open(<AddGroupModal />)}
                aria-label="Nuevo grupo"
                title="Nuevo grupo"
                className="group inline-flex size-7 items-center justify-center rounded-full bg-[oklch(0.97_0_0)] text-[oklch(0.15_0_0)] transition-transform hover:scale-110 active:scale-95"
              >
                <Plus className="size-4 transition-transform group-hover:rotate-90" strokeWidth={2} />
              </button>
            </div>
            <nav className="mt-5 flex flex-col">
              <GroupButton
                label="Todos"
                count={movements.length}
                active={groupId === null || groupId === undefined}
                onClick={() => filterByGroupId(null)}
              />
              {sortedGroups.map((g) => (
                <GroupButton
                  key={g.id}
                  label={g.name}
                  description={g.description}
                  count={g.movements.length}
                  active={g.id === groupId}
                  onClick={() => filterByGroupId(g.id)}
                />
              ))}
            </nav>
          </aside>

          {/* movements list */}
          <main className="order-2 flex flex-col min-h-0 h-full relative">
            {/* search */}
            <div className="group relative mb-5">
              <Search
                className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[oklch(0.5_0_0)] transition-colors group-focus-within:text-[oklch(0.8_0_0)]"
                strokeWidth={2}
              />
              <input
                type="text"
                placeholder="Buscar movimientos…"
                aria-label="Buscar movimientos"
                onChange={(e) => filterByQuery(e.target.value)}
                className="w-full rounded-full border border-[oklch(1_0_0/0.08)] bg-[oklch(1_0_0/0.03)] py-2.5 pl-11 pr-4 text-sm text-[oklch(0.92_0_0)] outline-none transition-all placeholder:text-[oklch(0.45_0_0)] hover:border-[oklch(1_0_0/0.14)] focus:border-[oklch(1_0_0/0.22)] focus:bg-[oklch(1_0_0/0.05)]"
              />
            </div>

            {/* controls */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap gap-1">
                {FILTERS.map((f) => {
                  const active = type === f.value;
                  return (
                    <button
                      key={f.value}
                      onClick={() => changeType(f.value)}
                      className={`rounded-full px-3.5 py-1.5 text-xs transition-colors ${
                        active ? "bg-[oklch(1_0_0/0.1)] text-[oklch(0.95_0_0)]" : "text-[oklch(0.55_0_0)] hover:text-[oklch(0.8_0_0)]"
                      }`}
                    >
                      {f.label}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => open(<AddMovementModal />)}
                className="group inline-flex items-center gap-2 rounded-full bg-[oklch(0.97_0_0)] p-2 xl:py-2 xl:pl-3 xl:pr-4 text-sm font-medium text-[oklch(0.15_0_0)] transition-transform hover:scale-[1.02] active:scale-95"
              >
                <Plus className="size-4 transition-transform group-hover:rotate-90" strokeWidth={2} />
                <p className="xl:block hidden">Nuevo Registro</p>
              </button>
            </div>
            <div className="flex items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-1">
                <CategorySelect categoryId={categoryId} />
                <span className="h-4 w-px bg-[oklch(1_0_0/0.1)]" />
                <SortControl sortField={sort?.field ?? "date"} sortOrder={sort?.order ?? "DESC"} />
              </div>
            </div>

            {/* list */}
            <div className="mt-7 flex-1 min-h-0 overflow-y-auto pr-1 [scrollbar-width:thin]">
              <ul>
                {/*first 30 items to test */}
                {movements.map((m) => (
                  <MovementRow key={m.id} m={m} category={m.category_id?.toString() ?? "Sin categoría"} />
                ))}
              </ul>
              {movements.length === 0 && <p className="py-16 text-center text-sm text-[oklch(0.5_0_0)]">Sin movimientos para este filtro.</p>}
            </div>

            {/* pagination controls */}
            {totalMovements > 0 ? (
              <div className="flex justify-between items-center-safe gap-4 mt-4">
                <button
                  disabled={!isTherePreviousPage}
                  onClick={goToPreviousPage}
                  className="group flex items-center gap-x-1 rounded border border-[oklch(1_0_0/0.08)] hover:bg-[oklch(1_0_0/0.03)] py-2.5 pl-2 pr-4 text-sm font-mono text-[oklch(0.92_0_0)] outline-none transition-all hover:border-[oklch(0.96_0_0)] not-disabled:cursor-pointer disabled:pointer-events-none disabled:text-[oklch(1_0_0/0.08)]"
                >
                  <ChevronLeft
                    className="size-4 text-[oklch(0.5_0_0)] group-disabled:text-[oklch(1_0_0/0.08)] transition-colors group-hover:text-[oklch(0.96_0_0)]"
                    strokeWidth={2}
                  />
                  <p className="text-[10px] group-disabled:text-[oklch(1_0_0/0.08)] transition-colors xl:text-sm uppercase tracking-[0.22em] text-[oklch(0.55_0_0)] group-hover:text-[oklch(0.96_0_0)]">
                    anterior
                  </p>
                </button>
                <button
                  disabled={!isThereNextPage}
                  onClick={goToNextPage}
                  className="group flex items-center gap-x-1 rounded border border-[oklch(1_0_0/0.08)] hover:bg-[oklch(1_0_0/0.03)] py-2.5 pl-4 pr-2 text-sm font-mono text-[oklch(0.92_0_0)] outline-none transition-all hover:border-[oklch(0.96_0_0)] not-disabled:cursor-pointer disabled:pointer-events-none disabled:text-[oklch(1_0_0/0.08)]"
                >
                  <p className="text-[10px] group-disabled:text-[oklch(1_0_0/0.08)] transition-colors xl:text-sm uppercase tracking-[0.22em] text-[oklch(0.55_0_0)] group-hover:text-[oklch(0.96_0_0)]">
                    siguiente
                  </p>
                  <ChevronRight
                    className="size-4 text-[oklch(0.5_0_0)] group-disabled:text-[oklch(1_0_0/0.08)] transition-colors group-hover:text-[oklch(0.96_0_0)]"
                    strokeWidth={2}
                  />
                </button>
              </div>
            ) : null}
          </main>

          {/* insights panel */}
          <aside className="order-3 flex flex-col gap-y-8">
            <div className="grid grid-cols-1 gap-px overflow-hidden rounded-xl bg-[oklch(1_0_0/0.06)]">
              <StatCell label="Ingresos" value={formatCurrency(stats.totalIncome)} accent="oklch(0.78 0.13 155)" />
              <StatCell label="Egresos" value={formatCurrency(stats.totalExpense)} accent="oklch(0.62 0.06 30)" />
              <StatCell label="Neto" value={formatCurrency(stats.totalNet)} accent="oklch(0.85 0 0)" emphasis />
            </div>

            {/*<PeriodPulse movements={items} />*/}

            {/*<GroupHeatmap membership={membership} totalItems={items.length} />*/}
          </aside>
        </div>
      </section>
    </ViewLayout>
  );
}

function GroupButton({
  label,
  description,
  count,
  active,
  onClick,
}: {
  label: string;
  description?: string | null;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`group relative flex items-start justify-between gap-3 rounded-lg px-3 py-3 text-left transition-colors ${
        active ? "bg-[oklch(1_0_0/0.05)]" : "hover:bg-[oklch(1_0_0/0.03)]"
      }`}
    >
      <span className={`absolute left-0 top-1/2 h-5 w-px -translate-y-1/2 transition-all ${active ? "bg-[oklch(0.7_0.13_85)]" : "bg-transparent"}`} />
      <span className="min-w-0">
        <span className={`block text-sm ${active ? "text-[oklch(0.96_0_0)]" : "text-[oklch(0.72_0_0)]"}`}>{label}</span>
        {description && <span className="mt-0.5 block truncate text-[11px] text-[oklch(0.45_0_0)]">{description}</span>}
      </span>
      <span className="mt-0.5 shrink-0 font-mono text-[11px] text-[oklch(0.5_0_0)]">{count}</span>
    </button>
  );
}

function StatCell({ label, value, accent, emphasis }: { label: string; value: string; accent: string; emphasis?: boolean }) {
  return (
    <div className="bg-[oklch(0.16_0_0)] px-4 py-3 xl:px-5 xl:py-4">
      <div className="flex items-center gap-2">
        <span className="size-1.5 rounded-full" style={{ background: accent }} />
        <span className="text-[10px] xl:text-sm uppercase tracking-[0.22em] text-[oklch(0.55_0_0)]">{label}</span>
      </div>
      <p className={`mt-2 font-mono tracking-tight ${emphasis ? "text-xl xl:text-2xl text-[oklch(0.97_0_0)]" : "xl:text-lg text-[oklch(0.75_0_0)]"}`}>
        {value}
      </p>
    </div>
  );
}

function MovementRow({ m, category }: { m: Movement; category?: string }) {
  const sign = m.mov_type === "income" ? "+" : m.mov_type === "expense" ? "−" : "";
  const amountColor =
    m.mov_type === "income" ? "text-[oklch(0.82_0.13_155)]" : m.mov_type === "expense" ? "text-[oklch(0.82_0_0)]" : "text-[oklch(0.7_0_0)]";

  return (
    <li className="group grid grid-cols-[auto_1fr_auto] items-center gap-4 border-b border-[oklch(1_0_0/0.05)] py-4 transition-colors hover:bg-[oklch(1_0_0/0.02)]">
      {/* date column */}
      <div className="w-14 text-center">
        <p className="font-mono text-xs uppercase text-[oklch(0.6_0_0)]">{formatDate(m.date)}</p>
      </div>

      {/* details column */}
      <div className="min-w-0">
        <p className="truncate text-[15px] text-[oklch(0.92_0_0)]">{m.details}</p>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-[oklch(0.5_0_0)]">
          <span className="uppercase tracking-[0.16em]">{MOV_TYPE_CONFIG[m.mov_type].label}</span>
          {category && (
            <>
              <span className="text-[oklch(0.35_0_0)]">·</span>
              <span>{category}</span>
            </>
          )}
          {m.rate_type && (
            <>
              <span className="text-[oklch(0.35_0_0)]">·</span>
              <span className="font-mono uppercase">{m.rate_type}</span>
            </>
          )}
        </div>
      </div>

      {/* amount column */}
      <div className="text-right">
        <p className={`font-mono text-[15px] tabular-nums ${amountColor}`}>
          {sign}
          {formatCurrency(m.ars_amount)}
        </p>
        {m.currency === "USD" && <p className="mt-0.5 font-mono text-[11px] text-[oklch(0.48_0_0)]">{formatCurrency(m.original_amount, "USD")}</p>}
      </div>
    </li>
  );
}

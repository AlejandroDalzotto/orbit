"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Check, ArrowDownUp, ArrowUp, ArrowDown, CalendarRange, Tag } from "lucide-react";
import type { Period, SortField, SortOrder } from "../definitions/movements";
import { useCategories, useGlobalStore } from "../stores/global-data-store";

/**
 *
 * @returns {string} returns a formatted date "M yyyy". e.g. "Jul 2024"
 */
const periodDate = (p: Period): string => {
  const now = new Date();
  const periodStart = new Date(now.getFullYear(), now.getMonth() - (p === "3m" ? 3 : p === "1y" ? 12 : 1), 1);
  const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return `${periodStart.toLocaleString("es-ES", { month: "short" })} ${periodEnd.getFullYear()}`;
};

export const PERIODS: Readonly<{ value: Period; label: string; hint: string }>[] = [
  { value: "1m", label: "Último mes", hint: "30 días" },
  { value: "3m", label: "Últimos 3 meses", hint: "90 días" },
  { value: "1y", label: "Último año", hint: "12 meses" },
];

export const SORT_KEYS: { value: SortField; label: string }[] = [
  { value: "date", label: "Fecha" },
  { value: "details", label: "Nombre" },
  { value: "amount", label: "Balance" },
];

function Dropdown({
  trigger,
  children,
  align = "left",
  width = "w-60",
}: {
  trigger: (props: { open: boolean }) => React.ReactNode;
  children: (close: () => void) => React.ReactNode;
  align?: "left" | "right";
  width?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen((o) => !o)} className="block">
        {trigger({ open })}
      </button>
      {open && (
        <div
          className={`mov-pop absolute z-40 mt-2 max-h-80 overflow-y-auto  ${width} ${
            align === "right" ? "right-0" : "left-0"
          } rounded-xl border border-[oklch(1_0_0/0.1)] bg-[oklch(0.17_0_0)] p-1.5 shadow-[0_30px_80px_-24px_oklch(0_0_0/0.9)]`}
        >
          {children(() => setOpen(false))}
        </div>
      )}
    </div>
  );
}

function OptionRow({ active, onClick, index, children }: { active: boolean; onClick: () => void; index: number; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{ transitionDelay: `${index * 28}ms` }}
      className={`mov-pop-item flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
        active ? "bg-[oklch(1_0_0/0.06)] text-[oklch(0.96_0_0)]" : "text-[oklch(0.64_0_0)] hover:bg-[oklch(1_0_0/0.04)] hover:text-[oklch(0.88_0_0)]"
      }`}
    >
      {children}
    </button>
  );
}

export function PeriodSelector({ value, onChange }: { value: Period; onChange: (v: Period) => void }) {
  const current = PERIODS.find((p) => p.value === value) ?? PERIODS[0];
  return (
    <Dropdown
      align="right"
      width="w-64"
      trigger={({ open }) => (
        <span className="group inline-flex items-center gap-3 rounded-full border border-[oklch(1_0_0/0.1)] bg-[oklch(1_0_0/0.03)] py-2 pl-4 pr-3 transition-colors hover:border-[oklch(1_0_0/0.2)]">
          <CalendarRange className="size-4 text-[oklch(0.7_0.13_85)]" strokeWidth={2} />
          <span className="text-left">
            <span className="block font-mono text-[10px] uppercase tracking-[0.2em] text-[oklch(0.5_0_0)]">Período - {periodDate(value)}</span>
            <span className="block text-sm text-[oklch(0.92_0_0)]">{current.label}</span>
          </span>
          <ChevronDown className={`size-4 text-[oklch(0.6_0_0)] transition-transform ${open ? "rotate-180" : ""}`} strokeWidth={2} />
        </span>
      )}
    >
      {(close) => (
        <>
          {PERIODS.map((p, i) => (
            <OptionRow
              key={p.value}
              index={i}
              active={p.value === value}
              onClick={() => {
                onChange(p.value);
                close();
              }}
            >
              <span className="flex flex-col">
                <span>{p.label}</span>
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[oklch(0.45_0_0)]">{p.hint}</span>
              </span>
              {p.value === value ? <Check className="size-4 text-[oklch(0.7_0.13_85)]" strokeWidth={2.5} /> : <span className="size-4" />}
            </OptionRow>
          ))}
        </>
      )}
    </Dropdown>
  );
}

export function CategorySelect({ categoryId }: { categoryId: number | null | undefined }) {
  const categories = useCategories();
  const filterByCategoryId = useGlobalStore((state) => state.filterByCategoryId);
  const currentCategoryName =
    categoryId === null || categoryId === undefined ? "Todas las categorías" : categories.find((c) => c.id === categoryId)?.name;

  return (
    <Dropdown
      align="right"
      width="w-56"
      trigger={({ open }) => (
        <span className="group inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs text-[oklch(0.6_0_0)] transition-colors hover:text-[oklch(0.9_0_0)]">
          <Tag className="size-3.5" strokeWidth={2} />
          <span className="text-[oklch(0.85_0_0)]">{currentCategoryName}</span>
          <ChevronDown className={`size-3.5 transition-transform ${open ? "rotate-180" : ""}`} strokeWidth={2} />
        </span>
      )}
    >
      {(close) => (
        <>
          {categories.map((c, i) => (
            <OptionRow
              key={c.id}
              index={i}
              active={c.name === currentCategoryName}
              onClick={() => {
                filterByCategoryId(c.id);
                close();
              }}
            >
              <span>{c.name}</span>
              {c.name === currentCategoryName && <Check className="size-4 text-[oklch(0.7_0.13_85)]" strokeWidth={2.5} />}
            </OptionRow>
          ))}
        </>
      )}
    </Dropdown>
  );
}

export function SortControl({ sortField, sortOrder }: { sortField: SortField; sortOrder: SortOrder }) {
  const changeSort = useGlobalStore((state) => state.changeSort);

  const current = SORT_KEYS.find((s) => s.value === sortField) ?? SORT_KEYS[0];
  return (
    <Dropdown
      align="right"
      width="w-60"
      trigger={({ open }) => (
        <span className="group inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs text-[oklch(0.6_0_0)] transition-colors hover:text-[oklch(0.9_0_0)]">
          <ArrowDownUp className="size-3.5" strokeWidth={2} />
          <span className="text-[oklch(0.85_0_0)]">{current.label}</span>
          <span className="font-mono text-[10px] uppercase text-[oklch(0.5_0_0)]">{sortOrder === "ASC" ? "ASC" : "DESC"}</span>
          <ChevronDown className={`size-3.5 transition-transform ${open ? "rotate-180" : ""}`} strokeWidth={2} />
        </span>
      )}
    >
      {() => (
        <>
          <p className="px-3 pb-1.5 pt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-[oklch(0.45_0_0)]">Ordenar por</p>
          {SORT_KEYS.map((s, i) => (
            <OptionRow key={s.value} index={i} active={s.value === sortField} onClick={() => changeSort({ field: s.value, order: sortOrder })}>
              <span>{s.label}</span>
              {s.value === sortField && <Check className="size-4 text-[oklch(0.7_0.13_85)]" strokeWidth={2.5} />}
            </OptionRow>
          ))}
          <div className="my-1.5 h-px bg-[oklch(1_0_0/0.07)]" />
          <p className="px-3 pb-1.5 pt-0.5 font-mono text-[10px] uppercase tracking-[0.2em] text-[oklch(0.45_0_0)]">Dirección</p>
          <div className="flex gap-1.5 px-1.5 pb-1">
            <button
              type="button"
              onClick={() => changeSort({ field: sortField, order: "ASC" })}
              className={`mov-pop-item flex flex-1 items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-xs transition-colors ${
                sortOrder === "ASC"
                  ? "border-[oklch(0.7_0.13_85)] bg-[oklch(0.7_0.13_85/0.12)] text-[oklch(0.92_0.08_85)]"
                  : "border-[oklch(1_0_0/0.08)] text-[oklch(0.6_0_0)] hover:border-[oklch(1_0_0/0.2)]"
              }`}
            >
              <ArrowUp className="size-3.5" strokeWidth={2} />
              Asc
            </button>
            <button
              type="button"
              onClick={() => changeSort({ field: sortField, order: "DESC" })}
              className={`mov-pop-item flex flex-1 items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-xs transition-colors ${
                sortOrder === "DESC"
                  ? "border-[oklch(0.7_0.13_85)] bg-[oklch(0.7_0.13_85/0.12)] text-[oklch(0.92_0.08_85)]"
                  : "border-[oklch(1_0_0/0.08)] text-[oklch(0.6_0_0)] hover:border-[oklch(1_0_0/0.2)]"
              }`}
            >
              <ArrowDown className="size-3.5" strokeWidth={2} />
              Desc
            </button>
          </div>
        </>
      )}
    </Dropdown>
  );
}

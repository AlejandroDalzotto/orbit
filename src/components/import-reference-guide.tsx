import { useState } from "react";
import { useLedgerChoices } from "../hooks/use-movements";
import { useCatalogExpenses, useCatalogItems, CATALOG_EXPENSE_PAGE_SIZE } from "../hooks/use-catalog";
import { useDebouncedValue } from "../hooks/use-debounced-value";
import { categoryPath } from "./catalog-utils";
import { displayDate } from "./ledger-utils";
import { LedgerError, ledgerField, ledgerLabel, ledgerSecondary } from "./ledger-ui";
import type { ImportKind } from "../types/generated/ImportKind";

export function ImportReferenceGuide({ kind }: { kind: ImportKind }) {
  const [open, setOpen] = useState(false);
  return <section className="space-y-4 border-t border-hairline pt-4">
    <button type="button" className={ledgerSecondary} aria-expanded={open} onClick={() => setOpen((current) => !current)}>{open ? "Ocultar IDs de referencia" : "Consultar IDs de referencia"}</button>
    {open && <ReferenceLists kind={kind} />}
  </section>;
}

function ReferenceLists({ kind }: { kind: ImportKind }) {
  const choices = useLedgerChoices();
  return <div className="space-y-4 text-xs">
    <p className="leading-6 text-muted">Usá estos IDs exactos; no se vincula por nombre ni se crean referencias automáticamente. Las referencias deben existir antes de importar. Importá primero cuentas, categorías y artículos; después movimientos y líneas de compra.</p>
    {choices.isPending && <p role="status">Cargando referencias…</p>}
    {choices.error != null && <LedgerError error={choices.error} retry={() => void choices.refetch()} />}
    <div className="grid min-w-0 gap-4 sm:grid-cols-2">
      {kind !== "items" && <div className="min-w-0"><h3 className={ledgerLabel}>Monedas disponibles</h3><ul className="max-h-40 space-y-2 overflow-y-auto break-words">{choices.currencies.filter((row) => row.isActive).map((row) => <li key={row.code}><code>{row.code}</code> · {row.name} · {row.decimalPlaces} decimales</li>)}</ul></div>}
      {kind === "movements" && <div className="min-w-0"><h3 className={ledgerLabel}>account_id / to_account_id</h3><ul className="max-h-40 space-y-2 overflow-y-auto break-words">{choices.accounts.filter((row) => row.isActive).map((row) => <li key={row.id}><code>#{row.id}</code> · {row.name} · {row.currencyCode}</li>)}</ul></div>}
      {(kind === "categories" || kind === "movements") && <div className="min-w-0"><h3 className={ledgerLabel}>parent_id / category_id</h3><ul className="max-h-40 space-y-2 overflow-y-auto break-words">{choices.categories.filter((row) => row.isActive).map((row) => <li key={row.id}><code>#{row.id}</code> · {categoryPath(row, choices.categories)} · {row.type}</li>)}</ul></div>}
      {kind === "movements" && <div className="min-w-0"><h3 className={ledgerLabel}>shop_id / comercios</h3><ul className="max-h-40 space-y-2 overflow-y-auto break-words">{choices.shops.map((row) => <li key={row.id}><code>#{row.id}</code> · {row.name}</li>)}</ul></div>}
    </div>
    {kind === "purchases" && <PurchaseReferences />}
  </div>;
}

function PurchaseReferences() {
  const items = useCatalogItems();
  const [search, setSearch] = useState("");
  const [offset, setOffset] = useState(0);
  const debounced = useDebouncedValue(search, 250);
  const expenses = useCatalogExpenses(debounced, offset);
  return <div className="grid min-w-0 gap-4 sm:grid-cols-2">
    <div className="min-w-0"><h3 className={ledgerLabel}>item_id / artículos activos</h3>{items.isPending && <p role="status">Cargando artículos…</p>}{items.error != null && <LedgerError error={items.error} retry={() => void items.refetch()} />}<ul className="max-h-52 space-y-2 overflow-y-auto break-words">{items.data?.filter((row) => !row.isArchived).map((row) => <li key={row.id}><code>#{row.id}</code> · {row.name}{row.brand ? ` · ${row.brand}` : ""}</li>)}</ul></div>
    <div className="min-w-0 space-y-3"><label><span className={ledgerLabel}>movement_id / buscar gasto</span><input className={ledgerField} value={search} onChange={(event) => { setSearch(event.target.value); setOffset(0); }} /></label>
      {expenses.isPending && <p role="status">Cargando gastos…</p>}{expenses.error != null && <LedgerError error={expenses.error} retry={() => void expenses.refetch()} />}
      <ul className="max-h-40 space-y-2 overflow-y-auto break-words">{expenses.data?.items.map((row) => <li key={row.id}><code>#{row.id}</code> · {displayDate(row.date)} · {row.description || "Sin descripción"} · {row.currencyCode}</li>)}</ul>
      <div className="flex gap-2"><button type="button" className={ledgerSecondary} disabled={offset === 0 || expenses.isFetching} onClick={() => setOffset((value) => Math.max(0, value - CATALOG_EXPENSE_PAGE_SIZE))}>Anterior</button><button type="button" className={ledgerSecondary} disabled={!expenses.data?.hasNextPage || expenses.isFetching} onClick={() => setOffset((value) => value + CATALOG_EXPENSE_PAGE_SIZE)}>Siguiente</button></div>
    </div>
  </div>;
}

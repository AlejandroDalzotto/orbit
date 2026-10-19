import { useEffect, useMemo, useState } from "react";
import { Archive, ArrowUpRight, ChevronLeft, ChevronRight, Eye, Landmark, List, Pencil, Plus, Search, Wallet } from "lucide-react";
import { AddAccountModal } from "../components/modals/accounts/add-account-modal";
import { EditAccountModal } from "../components/modals/accounts/edit-account-modal";
import { DeleteAccountModal } from "../components/modals/accounts/delete-account-modal";
import AccountDetailsModal from "../components/modals/accounts/account-details-modal";
import { displayDate, formatMinor } from "../components/ledger-utils";
import { AnimatedMoney } from "../components/animated-money";
import { accountTypeLabel } from "../components/wallet-utils";
import { WalletError, walletField, walletIconButton, walletLabel, walletPrimary, walletSecondary } from "../components/wallet-ui";
import { useAccounts } from "../hooks/use-accounts";
import { useDebouncedValue } from "../hooks/use-debounced-value";
import { useLedgerCurrencies } from "../hooks/use-movements";
import { useNetWorth } from "../hooks/use-net-worth";
import { useNavigationStore } from "../stores/navigation-store";
import type { Account } from "../types/generated/Account";
import type { AccountFilter } from "../types/generated/AccountFilter";
import type { Currency } from "../types/generated/Currency";

type Panel = { mode: "create" } | { mode: "details" | "edit" | "archive"; account: Account } | null;

export default function WalletView() {
  const [search, setSearch] = useState("");
  const [includeArchived, setIncludeArchived] = useState(false);
  const [offset, setOffset] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [panel, setPanel] = useState<Panel>(null);
  const [notice, setNotice] = useState("");
  const debouncedSearch = useDebouncedValue(search, 300);
  const filter = useMemo<AccountFilter>(() => ({
    activeOnly: !includeArchived,
    sort: { field: "name", direction: "ASC" },
    pagination: { limit: pageSize, offset },
    search: debouncedSearch.trim() || null,
  }), [includeArchived, pageSize, offset, debouncedSearch]);
  const accountsQuery = useAccounts(filter);
  const worthQuery = useNetWorth();
  const currencyQuery = useLedgerCurrencies();
  const currencies = currencyQuery.data ?? [];
  const page = accountsQuery.data;
  const searching = search.trim() !== (filter.search ?? "");
  const stalePage = accountsQuery.isPlaceholderData || searching;
  const refreshing = accountsQuery.isFetching || searching;
  const canCreate = currencyQuery.isSuccess && currencies.some((currency) => currency.isActive);
  const worth = [...(worthQuery.data ?? [])].sort((a, b) => a.currencyCode.localeCompare(b.currencyCode));

  useEffect(() => {
    if (page && !accountsQuery.isPlaceholderData && !searching && offset > 0 && offset >= page.total) {
      setOffset(Math.max(0, Math.floor((page.total - 1) / pageSize) * pageSize));
    }
  }, [page, accountsQuery.isPlaceholderData, searching, offset, pageSize]);

  function open(next: NonNullable<Panel>) { setNotice(""); setPanel(next); }
  function saved(account: Account) {
    setNotice(panel?.mode === "edit" ? `«${account.name}» se actualizó.` : `«${account.name}» ya está en tu billetera.`);
    setPanel(null);
  }
  function resetFilters() { setSearch(""); setIncludeArchived(false); setOffset(0); }

  return <section className="h-full overflow-y-auto bg-transparent p-5 text-primary sm:p-8 lg:p-10" aria-label="Billetera">
    <div className="mx-auto max-w-7xl space-y-9">
      <header className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="mb-5 font-mono text-[10px] uppercase tracking-[0.25em] text-muted">Orbit / Finanzas personales</p>
          <h1 className="font-mono text-2xl font-normal tracking-tight text-muted sm:text-3xl">Tu dinero. <span className="text-primary">Tu billetera</span></h1>
          <p className="mt-3 max-w-xl font-mono text-xs leading-relaxed text-muted">Cada cuenta, en su lugar. Cada moneda, por separado.</p>
        </div>
        <button type="button" className={walletPrimary} disabled={!canCreate} onClick={() => open({ mode: "create" })}><Plus size={16} aria-hidden="true" />Nueva cuenta</button>
      </header>

      <section aria-labelledby="wallet-worth-heading" aria-busy={worthQuery.isFetching}>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 id="wallet-worth-heading" className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">Patrimonio <span className="text-primary">por moneda</span></h2>
          <p className="font-mono text-[10px] text-muted">Solo cuentas activas · Sin conversión de divisas</p>
        </div>
        {worthQuery.isError && <div className="mb-4"><WalletError error={worthQuery.error} retry={() => void worthQuery.refetch()} /></div>}
        {worthQuery.isPending ? <div role="status" className="border-y border-primary/[0.14] py-9"><p className="font-display text-5xl text-muted">—</p><p className="mt-3 font-mono text-xs text-muted">Cargando patrimonio…</p></div>
          : worth.length ? <div className="grid border-y border-primary/[0.14] sm:grid-cols-2 xl:grid-cols-3">
            {worth.map((entry, index) => <div key={entry.currencyCode} className={`min-w-0 border-primary/[0.14] py-7 sm:px-6 sm:py-8 ${index > 0 ? "border-t" : ""} ${index >= 2 ? "sm:border-t" : "sm:border-t-0"} ${index % 2 ? "sm:border-l" : "sm:border-l-0"} ${index >= 3 ? "xl:border-t" : "xl:border-t-0"} ${index % 3 ? "xl:border-l" : "xl:border-l-0"}`}>
              <div className="animate-enter" style={{ animationDelay: `${Math.min(index, 4) * 80}ms` }}>
                <div className="mb-5 flex items-center justify-between gap-3">
                  <p className="font-mono text-[11px] tracking-[0.18em] text-muted">{entry.currencyCode}</p>
                  <ArrowUpRight size={15} aria-hidden="true" className="text-primary/25" />
                </div>
                <p className="break-words font-display text-4xl leading-none tracking-tight text-primary tabular-nums sm:text-5xl lg:text-6xl"><AnimatedMoney value={entry.totalBalance} code={entry.currencyCode} currencies={currencies} delayMs={Math.min(index, 4) * 80} /></p>
                <p className="mt-5 font-mono text-[10px] text-muted">{currencies.find((currency) => currency.code === entry.currencyCode)?.name ?? "Saldo en su moneda original"}</p>
              </div>
            </div>)}
          </div> : !worthQuery.isError && <div className="border-y border-primary/[0.14] py-8"><p className="font-display text-4xl text-muted">Todo empieza con una cuenta.</p><p className="mt-3 font-mono text-xs text-muted">Todavía no hay saldos de cuentas activas para mostrar.</p></div>}
        {worthQuery.isFetching && !worthQuery.isPending && <p role="status" className="mt-3 font-mono text-[10px] text-muted">Actualizando patrimonio…</p>}
      </section>

      {currencyQuery.isError && <WalletError error={currencyQuery.error} retry={() => void currencyQuery.refetch()} />}
      {currencyQuery.isPending && <p role="status" className="font-mono text-xs text-muted">Cargando catálogo de monedas…</p>}
      {currencyQuery.isSuccess && !currencies.some((currency) => currency.isActive) && <WalletError error="No hay monedas activas en el catálogo. No se pueden crear cuentas hasta que estén disponibles." retry={() => void currencyQuery.refetch()} />}
      {notice && <p role="status" className="border-l border-primary/[0.14] pl-4 font-mono text-xs leading-relaxed text-primary/75">{notice}</p>}

      <section aria-labelledby="wallet-accounts-heading" className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 id="wallet-accounts-heading" className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">Índice de <span className="text-primary">cuentas</span>{page && !stalePage && <span className="ml-3 text-muted">/ {String(page.total).padStart(2, "0")}</span>}</h2>
          <label className="inline-flex min-h-11 cursor-pointer items-center gap-3 font-mono text-[11px] text-muted">
            <input type="checkbox" checked={includeArchived} onChange={(event) => { setIncludeArchived(event.target.checked); setOffset(0); }} className="size-4 rounded-[2px] accent-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary" />Incluir archivadas
          </label>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <label className="min-w-48 flex-1"><span className={walletLabel}>Buscar cuenta</span><span className="relative block">
            <Search size={15} aria-hidden="true" className="pointer-events-none absolute top-3.5 left-3 text-primary/35" />
            <input type="search" className={`${walletField} pl-10`} value={search} onChange={(event) => { setSearch(event.target.value); setOffset(0); }} placeholder="Nombre de la cuenta…" />
          </span></label>
          <label><span className={walletLabel}>Por página</span><select className={walletField} value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setOffset(0); }}>{[10, 25, 50].map((size) => <option key={size} value={size}>{size}</option>)}</select></label>
          {(search || includeArchived) && <button type="button" className={walletSecondary} onClick={resetFilters}>Limpiar filtros</button>}
        </div>

        {accountsQuery.isError && <WalletError error={accountsQuery.error} retry={() => void accountsQuery.refetch()} />}
        <div aria-busy={refreshing}>
          <div className="flex min-h-9 items-center justify-between gap-3 font-mono text-[10px] text-muted" role="status" aria-live="polite">
            <p>{accountsQuery.isPending ? "Cargando cuentas…" : refreshing ? "Actualizando cuentas…" : accountsQuery.isError ? "No se pudo actualizar la lista." : page?.total ? `${offset + 1}–${offset + page.items.length} de ${page.total} cuentas` : "0 cuentas"}</p>
            <span className="hidden sm:block">Orden alfabético</span>
          </div>
          <div className="hidden grid-cols-[minmax(0,1fr)_minmax(9rem,0.7fr)_minmax(12rem,1fr)_8rem] gap-4 border-y border-primary/[0.14] py-3 font-mono text-[9px] uppercase tracking-[0.18em] text-muted lg:grid">
            <span>Cuenta</span><span>Tipo / Estado</span><span className="text-right">Saldo actual</span><span className="text-right">Acciones</span>
          </div>
          {accountsQuery.isPending && <div aria-hidden="true" className="divide-y divide-primary/[0.14] border-b border-primary/[0.14]">{[0, 1, 2].map((item) => <div key={item} className="flex items-center justify-between gap-4 py-7"><div className="h-4 w-1/3 bg-primary/5" /><div className="h-6 w-1/4 bg-primary/5" /></div>)}</div>}
          {page && page.items.length > 0 && <ul className={`divide-y divide-primary/[0.14] border-b border-primary/[0.14] ${stalePage ? "opacity-40" : ""}`}>
            {page.items.map((account) => <AccountRow key={account.id} account={account} currencies={currencies} disabled={stalePage || accountsQuery.isError} onDetails={() => open({ mode: "details", account })} onEdit={() => open({ mode: "edit", account })} onArchive={() => open({ mode: "archive", account })} />)}
          </ul>}
          {!accountsQuery.isPending && !accountsQuery.isError && !stalePage && page?.items.length === 0 && <div className="border-y border-primary/[0.14] py-14 text-center">
            <Wallet size={26} strokeWidth={1} aria-hidden="true" className="mx-auto mb-5 text-primary/40" />
            <h3 className="font-display text-3xl">{search.trim() ? "No encontramos esa cuenta." : includeArchived ? "Tu billetera está por empezar." : "Un espacio para tus cuentas."}</h3>
            <p className="mx-auto mt-3 max-w-md font-mono text-xs leading-relaxed text-muted">{search.trim() ? "Probá con otro nombre o incluí las cuentas archivadas." : "Agregá una cuenta para registrar tu dinero, o incluí las archivadas para revisar su historial."}</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">{(search || includeArchived) && <button type="button" className={walletSecondary} onClick={resetFilters}>Limpiar filtros</button>}<button type="button" className={walletPrimary} disabled={!canCreate} onClick={() => open({ mode: "create" })}><Plus size={15} aria-hidden="true" />Crear cuenta</button></div>
          </div>}
        </div>

        {page && page.total > 0 && <nav aria-label="Páginas de cuentas" className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <button type="button" className={walletSecondary} disabled={!page.hasPreviousPage || refreshing || accountsQuery.isError} onClick={() => setOffset((current) => Math.max(0, current - pageSize))}><ChevronLeft size={15} aria-hidden="true" />Anterior</button>
          <p className="font-mono text-[10px] text-muted">{!stalePage ? `Página ${Math.floor(offset / pageSize) + 1} de ${Math.max(1, Math.ceil(page.total / pageSize))}` : "Actualizando…"}</p>
          <button type="button" className={walletSecondary} disabled={!page.hasNextPage || refreshing || accountsQuery.isError} onClick={() => setOffset((current) => current + pageSize)}>Siguiente<ChevronRight size={15} aria-hidden="true" /></button>
        </nav>}
      </section>

      <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-primary/[0.14] pt-5 font-mono text-[9px] uppercase tracking-[0.18em] text-muted"><span>Orbit / Billetera</span><span>Sin mezclar monedas. Sin perder el detalle.</span></footer>
    </div>

    {panel?.mode === "create" && <AddAccountModal onClose={() => setPanel(null)} onSaved={saved} />}
    {panel?.mode === "edit" && <EditAccountModal account={panel.account} onClose={() => setPanel(null)} onSaved={saved} />}
    {panel?.mode === "details" && <AccountDetailsModal account={panel.account} onClose={() => setPanel(null)} onEdit={() => setPanel({ mode: "edit", account: panel.account })} onArchive={() => setPanel({ mode: "archive", account: panel.account })} />}
    {panel?.mode === "archive" && <DeleteAccountModal account={panel.account} onClose={() => setPanel(null)} onArchived={() => { setPanel(null); setNotice(`«${panel.account.name}» se archivó. Su historial se conserva.`); }} />}
  </section>;
}

function AccountRow({ account, currencies, disabled, onDetails, onEdit, onArchive }: {
  account: Account; currencies: Currency[]; disabled: boolean; onDetails: () => void; onEdit: () => void; onArchive: () => void;
}) {
  const openAccountMovements = useNavigationStore((state) => state.openAccountMovements);
  return <li className="grid gap-4 py-5 lg:grid-cols-[minmax(0,1fr)_minmax(9rem,0.7fr)_minmax(12rem,1fr)_8rem] lg:items-center">
    <button type="button" disabled={disabled} onClick={onDetails} className="group flex min-w-0 items-start gap-3 text-left disabled:cursor-wait focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">
      <Landmark size={18} strokeWidth={1.3} aria-hidden="true" className="mt-1 shrink-0 text-primary/35" />
      <span className="min-w-0"><span className="block truncate text-sm text-primary group-hover:underline">{account.name}</span><span className="mt-1.5 block truncate font-mono text-[10px] text-muted">{account.description || `Creada el ${displayDate(account.createdAt)}`}</span><span className="sr-only"> · Ver detalle de {account.name}</span></span>
    </button>
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pl-8 lg:block lg:pl-0"><p className="font-mono text-[10px] text-muted">{accountTypeLabel(account.accountType)}</p><p className="font-mono text-[9px] uppercase tracking-[0.12em] text-muted lg:mt-2">{account.isActive ? "Activa" : "Archivada"}</p></div>
    <p className={`min-w-0 break-words pl-8 font-display text-3xl tabular-nums lg:pl-0 lg:text-right ${account.isActive ? "text-primary" : "text-muted"}`}>{formatMinor(account.balance, account.currencyCode, currencies)}</p>
    <div className="flex flex-wrap items-center justify-end gap-0.5">
      <button type="button" className={`${walletSecondary} mb-1 w-full`} disabled={disabled} onClick={() => openAccountMovements(account.id)} aria-label={`Ver movimientos de ${account.name}`}><List size={15} aria-hidden="true" />Movimientos</button>
      <button type="button" className={walletIconButton} disabled={disabled} onClick={onDetails} aria-label={`Ver detalles de ${account.name}`} title="Ver detalles"><Eye size={16} aria-hidden="true" /></button>
      <button type="button" className={walletIconButton} disabled={disabled} onClick={onEdit} aria-label={`Editar ${account.name}`} title="Editar cuenta"><Pencil size={15} aria-hidden="true" /></button>
      <button type="button" className={walletIconButton} disabled={disabled || !account.isActive} onClick={onArchive} aria-label={account.isActive ? `Archivar ${account.name}` : `${account.name} ya está archivada`} title={account.isActive ? "Archivar cuenta" : "Cuenta archivada"}><Archive size={15} aria-hidden="true" /></button>
    </div>
  </li>;
}

import type { ReactNode } from "react";
import { Archive, ArrowUpRight, Pencil } from "lucide-react";
import { useLedgerCurrencies } from "../../../hooks/use-movements";
import { useNavigationStore } from "../../../stores/navigation-store";
import type { Account } from "../../../types/generated/Account";
import { LedgerDialog } from "../../ledger-ui";
import { displayDate, formatMinor } from "../../ledger-utils";
import { accountTypeLabel } from "../../wallet-utils";
import { WalletError, walletLabel, walletPrimary, walletSecondary } from "../../wallet-ui";

export default function AccountDetailsModal({ account, onClose, onEdit, onArchive }: {
  account: Account;
  onClose: () => void;
  onEdit?: () => void;
  onArchive?: () => void;
}) {
  const currencyQuery = useLedgerCurrencies();
  const openAccountMovements = useNavigationStore((state) => state.openAccountMovements);

  return <LedgerDialog title="Detalle de cuenta" onClose={onClose}>
    <div className="space-y-6 text-primary">
      <div>
        <p className={walletLabel}>{accountTypeLabel(account.accountType)} · {account.isActive ? "Activa" : "Archivada"}</p>
        <h3 className="break-words font-display text-3xl">{account.name}</h3>
      </div>
      <div className="border-y border-primary/[0.14] py-6">
        <p className={walletLabel}>Saldo actual</p>
        <p className="break-words font-display text-4xl tabular-nums sm:text-5xl">{formatMinor(account.balance, account.currencyCode, currencyQuery.data ?? [])}</p>
        <p className="mt-3 font-mono text-[10px] leading-relaxed text-muted">Calculado a partir de los movimientos. El saldo inicial, si existe, forma parte de este saldo.</p>
      </div>
      {currencyQuery.isError && <WalletError error={currencyQuery.error} retry={() => void currencyQuery.refetch()} />}
      {currencyQuery.isPending && <p role="status" className="font-mono text-xs text-muted">Cargando formato de moneda…</p>}
      <dl className="grid grid-cols-2 gap-x-6 gap-y-5">
        <Detail label="Moneda">{account.currencyCode}{currencyQuery.data?.find((currency) => currency.code === account.currencyCode)?.name && <span className="mt-1 block text-muted">{currencyQuery.data.find((currency) => currency.code === account.currencyCode)?.name}</span>}</Detail>
        <Detail label="Estado">{account.isActive ? "Activa" : "Archivada"}</Detail>
        <Detail label="Creada">{displayDate(account.createdAt)}</Detail>
        <Detail label="Actualizada">{displayDate(account.updatedAt)}</Detail>
        <div className="col-span-2"><Detail label="Descripción"><span className="whitespace-pre-wrap">{account.description || "Sin descripción."}</span></Detail></div>
      </dl>
      <div className="border-t border-primary/[0.14] pt-5">
        <button type="button" className={walletSecondary} onClick={() => { onClose(); openAccountMovements(account.id); }}>Ver movimientos de esta cuenta<ArrowUpRight size={15} aria-hidden="true" /></button>
        <p className="mt-2 font-mono text-[10px] leading-relaxed text-muted">Consultá el historial de «{account.name}», incluidas las transferencias enviadas y recibidas.</p>
      </div>
      <footer className="flex flex-wrap items-center justify-end gap-3 border-t border-primary/[0.14] pt-5">
        {onArchive && account.isActive && <button type="button" className={`${walletSecondary} sm:mr-auto`} onClick={onArchive}><Archive size={15} aria-hidden="true" />Archivar</button>}
        <button type="button" className={walletSecondary} onClick={onClose}>Cerrar</button>
        {onEdit && <button type="button" className={walletPrimary} onClick={onEdit}><Pencil size={15} aria-hidden="true" />Editar cuenta</button>}
      </footer>
    </div>
  </LedgerDialog>;
}

function Detail({ label, children }: { label: string; children: ReactNode }) {
  return <div className="min-w-0"><dt className={walletLabel}>{label}</dt><dd className="break-words font-mono text-xs leading-relaxed text-primary/80">{children}</dd></div>;
}

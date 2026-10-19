import { Archive } from "lucide-react";
import { useDeleteAccount } from "../../../hooks/use-accounts";
import type { Account } from "../../../types/generated/Account";
import { LedgerDialog } from "../../ledger-ui";
import { WalletError, walletLabel, walletSecondary } from "../../wallet-ui";

// The backend delete command archives; it never erases the account's history.
export function DeleteAccountModal({ account, onClose, onArchived }: {
  account: Account;
  onClose: () => void;
  onArchived?: () => void;
}) {
  const mutation = useDeleteAccount();

  function archive() {
    if (mutation.isPending || !account.isActive) return;
    mutation.mutate(account.id, { onSuccess: () => { if (onArchived) onArchived(); else onClose(); } });
  }

  return <LedgerDialog title="Archivar cuenta" onClose={onClose} busy={mutation.isPending}>
    <div className="space-y-6 text-primary">
      <div><p className={walletLabel}>Cuenta seleccionada</p><p className="break-words font-display text-3xl">{account.name}</p></div>
      <div className="space-y-3 font-mono text-xs leading-relaxed text-muted">
        <p>La cuenta dejará de estar disponible para nuevos movimientos y ya no sumará al patrimonio de tus cuentas activas.</p>
        <p>Su saldo y sus movimientos se conservan. Podés consultar su historial activando «Incluir archivadas».</p>
        <p>No se elimina dinero ni historial. Esta versión no permite reactivar la cuenta.</p>
      </div>
      {mutation.error != null && <WalletError error={mutation.error} />}
      <footer className="flex flex-wrap justify-end gap-3 border-t border-primary/[0.14] pt-5">
        <button autoFocus type="button" disabled={mutation.isPending} className={walletSecondary} onClick={onClose}>Conservar cuenta</button>
        <button type="button" disabled={mutation.isPending || !account.isActive} className={walletSecondary} onClick={archive}><Archive size={15} aria-hidden="true" />{mutation.isPending ? "Archivando…" : "Archivar cuenta"}</button>
      </footer>
    </div>
  </LedgerDialog>;
}

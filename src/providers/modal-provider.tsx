import { LedgerDialog } from "../components/ledger-ui";
import { useModalStore } from "../stores/modal-store";

// Legacy callers can still mount a modal host; the wallet owns its dialogs locally.
export function ModalProvider() {
  const modal = useModalStore((state) => state.modal);
  const close = useModalStore((state) => state.close);
  const busy = useModalStore((state) => state.shouldDisableEsc);

  if (modal == null) return null;
  return <LedgerDialog title="Orbit" onClose={close} busy={busy}>{modal}</LedgerDialog>;
}

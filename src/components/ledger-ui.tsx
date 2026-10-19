import { useEffect, useId, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
import { errorMessage } from "./ledger-utils";
import { NoiseOverlay } from "./noise-overlay";

export const ledgerField = "field min-h-11 font-mono text-xs placeholder:text-muted disabled:opacity-40";
export const ledgerLabel = "label font-mono";
export const ledgerPrimary = "btn-primary min-h-11 font-mono disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary";
export const ledgerSecondary = "btn-secondary min-h-10 font-mono disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

export function LedgerError({ error, retry }: { error: unknown; retry?: () => void }) {
  return <div role="alert" className="flex flex-wrap items-center justify-between gap-3 border border-error/35 bg-error/5 p-4 font-mono text-xs text-error">
    <p>{errorMessage(error)}</p>
    {retry && <button type="button" className={ledgerSecondary} onClick={retry}>Reintentar</button>}
  </div>;
}

export function LedgerDialog({ title, children, onClose, busy = false, wide = false }: {
  title: string; children: ReactNode; onClose: () => void; busy?: boolean; wide?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => {
    const dialog = ref.current;
    const previous = document.activeElement;
    dialog?.showModal();
    // React may autofocus before a closed dialog can receive focus.
    const preferred = dialog?.querySelector<HTMLElement>("[autofocus]")
      ?? dialog?.querySelector<HTMLElement>("form input:not([disabled]), form select:not([disabled]), form textarea:not([disabled])");
    preferred?.focus();
    return () => {
      dialog?.close();
      if (previous instanceof HTMLElement && previous.isConnected) previous.focus();
    };
  }, []);
  return <dialog ref={ref} aria-labelledby={titleId} aria-busy={busy} onCancel={(event) => { event.preventDefault(); if (!busy) onClose(); }}
    className={`fixed inset-0 m-auto max-h-[90dvh] w-[calc(100%_-_2rem)] min-w-0 overflow-x-hidden overflow-y-auto border border-hairline bg-surface p-0 text-primary shadow-2xl backdrop:bg-black/80 ${wide ? "max-w-5xl" : "max-w-2xl"}`}>
    <header className="flex items-center justify-between gap-4 border-b border-primary/15 p-5 sm:p-6">
      <h2 id={titleId} className="font-display text-3xl">{title}</h2>
      <button type="button" className={ledgerSecondary} aria-label="Cerrar" disabled={busy} onClick={onClose}><X size={16} /></button>
    </header>
    <div className="p-5 sm:p-6">{children}</div>
    <NoiseOverlay contained />
  </dialog>;
}

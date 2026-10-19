import type { ReactNode } from "react";
import { errorMessage } from "./ledger-utils";

export const walletLabel = "mb-2 block font-mono text-[10px] uppercase tracking-[0.18em] text-muted";
export const walletField = "min-h-11 w-full rounded-[2px] border border-primary/[0.14] bg-surface px-3 py-2 font-mono text-xs text-primary outline-none placeholder:text-muted focus:border-primary/65 focus-visible:ring-1 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-40";
export const walletPrimary = "inline-flex min-h-11 items-center justify-center gap-2 rounded-[2px] border border-primary bg-primary px-4 py-2 font-mono text-xs text-on-primary hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary motion-safe:transition-colors";
export const walletSecondary = "inline-flex min-h-11 items-center justify-center gap-2 rounded-[2px] border border-primary/[0.14] px-3 py-2 font-mono text-xs text-primary/70 hover:bg-primary/5 hover:text-primary disabled:cursor-not-allowed disabled:opacity-30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary motion-safe:transition-colors";

export const walletIconButton = "inline-flex size-10 shrink-0 items-center justify-center rounded-[2px] text-muted hover:bg-primary/5 hover:text-primary disabled:cursor-not-allowed disabled:opacity-25 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary motion-safe:transition-colors";

export function WalletError({ error, retry }: { error: unknown; retry?: () => void }) {
  return <div role="alert" className="flex flex-wrap items-center justify-between gap-3 border-l border-error bg-error/5 p-4 font-mono text-xs leading-relaxed text-error">
    <p className="min-w-0 break-words">{errorMessage(error)}</p>
    {retry && <button type="button" className={walletSecondary} onClick={retry}>Reintentar</button>}
  </div>;
}

export function WalletField({ label, children }: { label: string; children: ReactNode }) {
  return <label className="block min-w-0"><span className={walletLabel}>{label}</span>{children}</label>;
}

import type { ReactNode } from "react";
import { catalogErrorMessage } from "./catalog-utils";

export const catalogField = "field w-full rounded-[2px] border border-primary/14 bg-surface px-3 py-2.5 text-sm text-primary outline-none placeholder:text-muted focus:border-primary/60 focus-visible:ring-1 focus-visible:ring-primary/60 disabled:opacity-50";
export const catalogLabel = "label mb-2 block font-mono text-[11px] uppercase tracking-[0.14em] text-muted";
export const catalogPrimary = "btn-primary rounded-[2px] inline-flex min-h-10 items-center justify-center gap-2 px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary";
export const catalogSecondary = "btn-secondary rounded-[2px] inline-flex min-h-10 items-center justify-center gap-2 border border-primary/14 px-3 py-2 text-sm text-primary/80 hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

export function CatalogPage({ title, headingLead, description, action, children }: { title: string; headingLead: string; description: string; action: ReactNode; children: ReactNode }) {
  return (
    <section className="h-full overflow-y-auto bg-transparent p-5 text-primary sm:p-8 lg:p-10" aria-label={title}>
      <div className="mx-auto max-w-7xl space-y-7">
        <header className="flex flex-wrap items-end justify-between gap-5 border-b border-primary/14 pb-7">
          <div>
            <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.24em] text-muted">Orbit / Catálogo</p>
            <h1 className="font-mono text-4xl font-light leading-[1.1] tracking-[-0.055em] text-muted sm:text-5xl lg:text-6xl">
                          <span className="block">{headingLead}</span>
                          <span className="block text-primary">{title.toLocaleLowerCase("es-AR")}</span>
                        </h1>
            <p className="mt-3 max-w-xl text-sm text-muted">{description}</p>
          </div>
          {action}
        </header>
        {children}
      </div>
    </section>
  );
}

export function CatalogStat({ label, value }: { label: string; value: number | undefined }) {
  return (
    <div className="border-l border-primary/14 pl-5 first:border-l-0 first:pl-0">
      <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted">{label}</p>
      <p className="mt-2 font-display text-4xl tabular-nums">{value === undefined ? "—" : value.toLocaleString("es-AR")}</p>
    </div>
  );
}

export function CatalogError({ error, retry, pending = false }: { error: unknown; retry?: () => void; pending?: boolean }) {
  return (
    <div role="alert" className="flex flex-wrap items-center justify-between gap-3 border border-error/40 bg-error/5 p-4 text-sm text-error">
      <p>{catalogErrorMessage(error)}</p>
      {retry && <button type="button" className={catalogSecondary} disabled={pending} onClick={retry}>{pending ? "Reintentando…" : "Reintentar"}</button>}
    </div>
  );
}

export function CatalogLoading({ children = "Cargando catálogo…" }: { children?: ReactNode }) {
  return <p role="status" className="border border-primary/14 p-8 font-mono text-xs text-muted">{children}</p>;
}

export function CatalogEmpty({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="border border-dashed border-primary/14 px-6 py-12 text-center">
      <h2 className="font-display text-2xl">{title}</h2>
      <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted">{children}</p>
    </div>
  );
}

export function CatalogArchiveConfirm({ name, description, pending, error, onConfirm, onCancel }: {
  name: string; description: string; pending: boolean; error: unknown; onConfirm: () => void; onCancel: () => void;
}) {
  return (
    <section aria-label={`Confirmar archivo de ${name}`} className="space-y-4 border border-primary/30 bg-surface p-5">
      <h2 className="font-display text-2xl">¿Archivar «{name}»?</h2>
      <p className="text-sm leading-relaxed text-muted">{description} El historial no se elimina.</p>
      {error != null && <CatalogError error={error} />}
      <div className="flex flex-wrap gap-3">
        <button type="button" className={catalogSecondary} autoFocus disabled={pending} onClick={onCancel}>Cancelar</button>
        <button type="button" className={catalogPrimary} disabled={pending} onClick={onConfirm}>{pending ? "Archivando…" : "Confirmar archivo"}</button>
      </div>
    </section>
  );
}

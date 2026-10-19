import { useRef, useState } from "react";
import { command } from "../lib/commands";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSettings } from "../providers/theme-provider";
import { appearanceThemes, applyAppearance } from "../lib/appearance";
import type { Settings } from "../types/generated/Settings";

import { CatalogError } from "../components/catalog-ui";
import { useLedgerChoices } from "../hooks/use-movements";
import { errorMessage } from "../components/ledger-utils";
import { ImportDataDialog } from "../components/import-data-dialog";
import { FileUp } from "lucide-react";

export default function SettingsView() {
  const settings = useSettings();
  const client = useQueryClient();
  const saving = useRef(false);
  const save = useMutation({ mutationFn: (entry: Settings) => command.settings.update(entry), retry: false, onSuccess: async (data) => { applyAppearance(data); await client.invalidateQueries({ queryKey: ["settings"] }); }, onSettled: () => { saving.current = false; } });
  function persist(patch: Partial<Settings>) {
    if (!settings.data || saving.current) return;
    saving.current = true;
    save.mutate({ ...settings.data, ...patch });
  }
  const choices = useLedgerChoices();
  const [name, setName] = useState("");
  const [importOpen, setImportOpen] = useState(false);
  const [address, setAddress] = useState("");
  const shop = useMutation({ mutationFn: () => command.shops.add(name, address.trim() || null), onSuccess: async () => { setName(""); setAddress(""); await client.invalidateQueries({ queryKey: ["shops"] }); } });
  return <section className="h-full overflow-y-auto p-6 lg:p-10"><div className="mx-auto max-w-5xl space-y-10 animate-enter">
    <header className="border-b border-hairline pb-8"><p className="label">Orbit / Preferencias</p><h1 className="text-3xl font-light text-muted">Un espacio <span className="text-primary">propio.</span></h1></header>
    <section className="space-y-4"><h2 className="font-display text-3xl">Importar datos</h2><p className="max-w-2xl text-xs leading-6 text-muted">Traé tus cuentas, categorías, artículos, movimientos o líneas de compra desde CSV. Consultá las columnas, descargá un ejemplo y revisá los registros antes de confirmar. Descartar no guarda nada.</p><button type="button" className="btn-secondary" onClick={() => setImportOpen(true)}><FileUp size={16} />Importar CSV</button></section>
    <section className="space-y-6" aria-labelledby="appearance-title">
      <div><h2 id="appearance-title" className="font-display text-3xl">Apariencia</h2><p className="mt-2 text-xs leading-6 text-muted">La misma órbita, otra luz. El tema y la textura se guardan en este equipo para futuras sesiones.</p></div>
      {settings.isPending ? <p role="status">Cargando preferencias…</p> : settings.error ? <CatalogError error={settings.error} retry={() => void settings.refetch()} /> : <>
        <div className="grid min-w-0 gap-3 sm:grid-cols-2">
          {appearanceThemes.map((theme) => <button key={theme.id} type="button" aria-label={theme.label} aria-pressed={settings.data?.theme === theme.id} disabled={save.isPending} onClick={() => persist({ theme: theme.id })} className={`min-w-0 rounded-xs border p-4 text-left transition-colors hover:border-primary/50 ${settings.data?.theme === theme.id ? "border-accent bg-primary/5" : "border-hairline"}`}>
            <span aria-hidden="true" className={`mb-4 flex h-20 items-end justify-between overflow-hidden rounded-xs border border-primary/10 p-3 ${theme.swatch}`}><span className={`h-7 w-0.5 ${theme.ink}`} /><span className={`h-px w-16 ${theme.ink}`} /></span>
            <span className="flex flex-wrap items-baseline justify-between gap-2 text-xs"><span>{theme.label}</span>{settings.data?.theme === theme.id && <span className="text-[9px] uppercase tracking-wider text-accent">Activo</span>}</span>
            <span className="mt-2 block text-[11px] leading-5 text-muted">{theme.description}</span>
          </button>)}
        </div>
        <div className="flex items-center justify-between gap-6 border-y border-hairline py-5"><div><h3 id="noise-label" className="text-xs">Textura de ruido</h3><p id="noise-description" className="mt-2 max-w-lg text-[11px] leading-6 text-muted">Grano fino sobre toda la interfaz, incluida la barra de título. Es estático, no bloquea los controles y podés desactivarlo en cualquier tema.</p></div><button type="button" role="switch" aria-labelledby="noise-label" aria-describedby="noise-description" aria-checked={settings.data?.noiseEnabled ?? true} disabled={save.isPending} onClick={() => persist({ noiseEnabled: !settings.data?.noiseEnabled })} className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border transition-colors ${settings.data?.noiseEnabled ? "border-primary bg-primary" : "border-hairline bg-surface"}`}><span aria-hidden="true" className={`inline-block size-4 rounded-full transition-transform ${settings.data?.noiseEnabled ? "translate-x-5 bg-on-primary" : "translate-x-1 bg-muted"}`} /></button></div>
      </>}
      {save.isPending && <p role="status" className="text-xs text-muted">Guardando apariencia en SQLite…</p>}
      {save.error && <CatalogError error={save.error} />}
    </section>
    <section className="space-y-5 border-t border-hairline pt-8"><h2 className="font-display text-3xl">Comercios</h2><p className="max-w-xl text-xs leading-6 text-muted">Un comercio pertenece al movimiento de gasto. Las líneas de compra heredan ese contexto para comparar precios.</p>
      <form onSubmit={(e) => { e.preventDefault(); shop.mutate(); }} className="grid gap-4 sm:grid-cols-[1fr_1fr_auto]"><label><span className="label">Nombre</span><input className="field" required maxLength={200} value={name} onChange={(e) => setName(e.target.value)} /></label><label><span className="label">Dirección / opcional</span><input className="field" value={address} onChange={(e) => setAddress(e.target.value)} /></label><button className="btn-secondary self-end" disabled={shop.isPending || !name.trim()}>{shop.isPending ? "Guardando…" : "Añadir comercio"}</button></form>
      {shop.error && <CatalogError error={shop.error} />}{choices.error ? <CatalogError error={choices.error} retry={() => void choices.refetch()} /> : <ul className="divide-y divide-hairline">{choices.shops.map((item) => <li key={item.id} className="flex justify-between gap-5 py-3 text-xs"><span>{item.name}</span><span className="text-muted">{item.address ?? "Sin dirección"}</span></li>)}</ul>}
    </section>
    <section className="space-y-4 border-t border-hairline pt-8"><h2 className="font-display text-3xl">Tus datos, en tu equipo.</h2><p className="max-w-2xl text-xs leading-7 text-muted">Orbit no conecta con bancos, no mueve dinero real y no utiliza APIs de cambio. Los registros son personales y las monedas nunca se convierten ni se suman entre sí. Los datos se guardan en app.db dentro del directorio local de la aplicación.</p><p className="max-w-2xl text-xs leading-7 text-muted">Para una copia manual segura, cerrá Orbit y copiá el directorio de datos completo. La base no está cifrada: usá la protección de disco y de sesión de tu sistema operativo.</p><p className="text-xs text-muted">{save.isPending ? "Guardando en SQLite…" : "Sin cuenta, sin nube, sin sincronización."}</p>{shop.error && <span className="sr-only">{errorMessage(shop.error)}</span>}</section>
    {importOpen && <ImportDataDialog onClose={() => setImportOpen(false)} />}
  </div></section>;
}

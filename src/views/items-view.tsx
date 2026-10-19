import { useState } from "react";
import { Archive, ArrowUpRight, Pencil, Plus } from "lucide-react";
import { useArchiveCatalogItem, useCatalogItems } from "../hooks/use-catalog";
import { CatalogItemForm } from "../components/catalog-item-form";
import { CatalogPurchaseHistory } from "../components/catalog-purchase-history";
import { CatalogArchiveConfirm, CatalogEmpty, CatalogError, CatalogLoading, CatalogPage, CatalogStat, catalogField, catalogLabel, catalogPrimary, catalogSecondary } from "../components/catalog-ui";

export default function ItemsView() {
  const items = useCatalogItems();
  const archive = useArchiveCatalogItem();
  const [search, setSearch] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [editor, setEditor] = useState<number | "new" | null>(null);
  const [archiveId, setArchiveId] = useState<number | null>(null);
  const [purchaseOpen, setPurchaseOpen] = useState(false);
  const [deletePurchaseId, setDeletePurchaseId] = useState<number | null>(null);
  const [notice, setNotice] = useState("");
  const all = items.data ?? [];
  const selected = all.find((item) => item.id === selectedId);
  const editing = all.find((item) => item.id === editor);
  const archiving = all.find((item) => item.id === archiveId);
  const busy = editor !== null || archiveId !== null || purchaseOpen || deletePurchaseId !== null;
  const filtered = all.filter((item) => (showArchived || !item.isArchived) &&
    [item.name, item.brand ?? "", item.description ?? ""].some((value) => value.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase())),
  ).sort((a, b) => a.name.localeCompare(b.name, "es"));

  return (
    <CatalogPage title="Ítems" headingLead="Conocé tus" description="Lo que comprás, a lo largo del tiempo. Compará precios por moneda y tienda, sin mezclar importes."
      action={<button className={catalogPrimary} disabled={busy || !items.data} onClick={() => { setNotice(""); setEditor("new"); }}><Plus size={16} aria-hidden="true" />Nuevo ítem</button>}>
      <div className="grid grid-cols-3 gap-4">
        <CatalogStat label="Ítems activos" value={items.data ? all.filter((item) => !item.isArchived).length : undefined} />
        <CatalogStat label="Compras registradas" value={items.data ? all.reduce((sum, item) => sum + item.purchaseCount, 0) : undefined} />
        <CatalogStat label="Archivados" value={items.data ? all.filter((item) => item.isArchived).length : undefined} />
      </div>
      <p role="status" className="text-sm text-primary/65">{notice}</p>
      {(editor === "new" || editing) && <CatalogItemForm key={editor} item={editing} onCancel={() => setEditor(null)} onSaved={(item) => { setEditor(null); setSelectedId(item.id); setNotice(`Ítem «${item.name}» guardado.`); }} />}
      {archiving && <CatalogArchiveConfirm name={archiving.name} description="No se podrán registrar nuevas compras de este ítem. Podés seguir consultando sus precios anteriores." pending={archive.isPending} error={archive.error}
        onCancel={() => { setArchiveId(null); archive.reset(); }} onConfirm={() => {
          if (archive.isPending) return;
          archive.mutate(archiving.id, { onSuccess: () => { setArchiveId(null); setNotice(`Ítem «${archiving.name}» archivado.`); } });
        }} />}
      <div className="flex flex-wrap items-end gap-4 border-y border-primary/14 py-4">
        <div className="min-w-48 flex-1">
          <label className={catalogLabel} htmlFor="catalog-item-search">Buscar ítems</label>
          <input id="catalog-item-search" type="search" className={catalogField} value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Nombre, marca o descripción…" />
        </div>
        <label className="flex min-h-10 cursor-pointer items-center gap-2 text-sm text-primary/65">
          <input type="checkbox" className="size-4 accent-primary" checked={showArchived} onChange={(event) => setShowArchived(event.target.checked)} />Incluir archivados
        </label>
      </div>
      {items.isPending && <CatalogLoading />}
      {items.isError && <CatalogError error={items.error} retry={() => { void items.refetch(); }} pending={items.isFetching} />}
      {items.data && <div className="grid items-start gap-6 xl:grid-cols-[minmax(18rem,0.8fr)_minmax(0,1.5fr)]">
        <section aria-label="Lista de ítems" className="min-w-0">
          <p className="mb-4 font-mono text-[10px] uppercase tracking-widest text-muted" aria-live="polite">{items.isFetching ? "Actualizando…" : `${filtered.length} ítems · seleccioná para ver precios`}</p>
          {filtered.length === 0 ? <CatalogEmpty title={all.length ? "Sin coincidencias" : "Tu primera compra empieza acá"}>{all.length ? "Probá otra búsqueda o incluí los ítems archivados." : "Creá un ítem y registrá sus compras para construir un historial de precios."}</CatalogEmpty> :
            <ul className="divide-y divide-primary/14 border-y border-primary/14">
              {filtered.map((item) => <li key={item.id} className={`p-4 transition-colors ${selectedId === item.id ? "bg-primary/5" : "hover:bg-primary/[0.02]"}`}>
                <button type="button" className="group flex w-full items-start justify-between gap-3 text-left outline-offset-4 focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-50" disabled={busy} aria-pressed={selectedId === item.id} aria-label={`Ver historial de ${item.name}`} onClick={() => { setSelectedId(item.id); setNotice(""); }}>
                  <span className="min-w-0">
                    <span className="block break-words text-base">{item.name}</span>
                    <span className="mt-1 block break-words text-xs text-muted">{item.brand || "Sin marca"}</span>
                    <span className="mt-3 block font-mono text-[10px] text-muted">{item.purchaseCount.toLocaleString("es-AR")} compras{item.isArchived ? " · Archivado" : ""}</span>
                  </span>
                  <ArrowUpRight size={16} className="shrink-0 text-primary/35 group-hover:text-primary" aria-hidden="true" />
                </button>
                <div className="mt-4 flex gap-2">
                  <button className={catalogSecondary} disabled={busy} aria-label={`Editar ${item.name}`} onClick={() => { setNotice(""); setEditor(item.id); }}><Pencil size={13} aria-hidden="true" />Editar</button>
                  {!item.isArchived && <button className={catalogSecondary} disabled={busy} aria-label={`Archivar ${item.name}`} onClick={() => { archive.reset(); setNotice(""); setArchiveId(item.id); }}><Archive size={13} aria-hidden="true" />Archivar</button>}
                </div>
              </li>)}
            </ul>}
        </section>
        {selected ? <CatalogPurchaseHistory key={selected.id} item={selected} purchaseOpen={purchaseOpen} deletePurchaseId={deletePurchaseId} onDeletePurchaseChange={setDeletePurchaseId} disabled={editor !== null || archiveId !== null} onPurchaseOpenChange={setPurchaseOpen} onClose={() => setSelectedId(null)} /> :
          <CatalogEmpty title="Cada precio cuenta">Seleccioná un ítem para consultar su historial por moneda y tienda, o registrá una nueva compra en un gasto existente.</CatalogEmpty>}
      </div>}
    </CatalogPage>
  );
}

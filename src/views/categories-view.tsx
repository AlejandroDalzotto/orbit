import { useState } from "react";
import { Archive, Pencil, Plus } from "lucide-react";
import { useArchiveCatalogCategory, useCatalogCategories } from "../hooks/use-catalog";
import { CatalogCategoryForm } from "../components/catalog-category-form";
import { categoryPath, catalogTypeLabels } from "../components/catalog-utils";
import { CatalogArchiveConfirm, CatalogEmpty, CatalogError, CatalogLoading, CatalogPage, CatalogStat, catalogField, catalogLabel, catalogPrimary, catalogSecondary } from "../components/catalog-ui";

export default function CategoriesView() {
  const categories = useCatalogCategories();
  const archive = useArchiveCatalogCategory();
  const [search, setSearch] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [type, setType] = useState("all");
  const [editor, setEditor] = useState<number | "new" | null>(null);
  const [archiveId, setArchiveId] = useState<number | null>(null);
  const [notice, setNotice] = useState("");
  const all = categories.data ?? [];
  const editing = all.find((category) => category.id === editor);
  const archiving = all.find((category) => category.id === archiveId);
  const filtered = all.filter((category) =>
    (showArchived || category.isActive) && (type === "all" || category.type === type) &&
    categoryPath(category, all).toLocaleLowerCase().includes(search.trim().toLocaleLowerCase()),
  ).sort((a, b) => categoryPath(a, all).localeCompare(categoryPath(b, all), "es"));
  const busy = editor !== null || archiveId !== null;

  return (
    <CatalogPage title="Categorías" headingLead="Ordená tus" description="Una estructura clara para tus ingresos y gastos. Organizá categorías y subcategorías sin perder el historial."
      action={<button className={catalogPrimary} disabled={busy || !categories.data} onClick={() => { setNotice(""); setEditor("new"); }}><Plus size={16} aria-hidden="true" />Nueva categoría</button>}>
      <div className="grid grid-cols-3 gap-4">
        <CatalogStat label="Activas" value={categories.data ? all.filter((category) => category.isActive).length : undefined} />
        <CatalogStat label="Subcategorías" value={categories.data ? all.filter((category) => category.isActive && category.parentId !== null).length : undefined} />
        <CatalogStat label="Archivadas" value={categories.data ? all.filter((category) => !category.isActive).length : undefined} />
      </div>
      <p role="status" className="text-sm text-primary/65">{notice}</p>
      {(editor === "new" || editing) && <CatalogCategoryForm key={editor} category={editing} categories={all} onCancel={() => setEditor(null)} onSaved={(category) => { setEditor(null); setNotice(`Categoría «${category.name}» guardada.`); }} />}
      {archiving && <CatalogArchiveConfirm name={archiving.name} description="Dejará de estar disponible para nuevos movimientos. Primero archivá o mové sus subcategorías activas." pending={archive.isPending} error={archive.error}
        onCancel={() => { setArchiveId(null); archive.reset(); }} onConfirm={() => {
          if (archive.isPending) return;
          archive.mutate(archiving.id, { onSuccess: () => { setArchiveId(null); setNotice(`Categoría «${archiving.name}» archivada.`); } });
        }} />}
      <div className="flex flex-wrap items-end gap-4 border-y border-primary/14 py-4">
        <div className="min-w-48 flex-1">
          <label className={catalogLabel} htmlFor="catalog-category-search">Buscar en la jerarquía</label>
          <input id="catalog-category-search" type="search" className={catalogField} value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Nombre o categoría padre…" />
        </div>
        <div>
          <label className={catalogLabel} htmlFor="catalog-category-type">Tipo</label>
          <select id="catalog-category-type" className={catalogField} value={type} onChange={(event) => setType(event.target.value)}>
            <option value="all">Todos los tipos</option>
            {Object.entries(catalogTypeLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </div>
        <label className="flex min-h-10 cursor-pointer items-center gap-2 text-sm text-primary/65">
          <input type="checkbox" className="size-4 accent-primary" checked={showArchived} onChange={(event) => setShowArchived(event.target.checked)} />Incluir archivadas
        </label>
      </div>
      {categories.isPending && <CatalogLoading />}
      {categories.isError && <CatalogError error={categories.error} retry={() => { void categories.refetch(); }} pending={categories.isFetching} />}
      {categories.data && <>
        <div className="flex justify-between font-mono text-[10px] uppercase tracking-widest text-muted">
          <span>{filtered.length} categorías</span><span aria-live="polite">{categories.isFetching ? "Actualizando…" : "Jerarquía / tipo / movimientos"}</span>
        </div>
        {filtered.length === 0 ? <CatalogEmpty title={all.length ? "Sin coincidencias" : "Tu catálogo empieza acá"}>{all.length ? "Probá otra búsqueda, cambiá el tipo o incluí las categorías archivadas." : "Creá una categoría para empezar a organizar tus movimientos."}</CatalogEmpty> :
          <ul className="divide-y divide-primary/14 border-y border-primary/14">
            {filtered.map((category) => {
              const parent = all.find((entry) => entry.id === category.parentId);
              return <li key={category.id} className="flex flex-wrap items-center justify-between gap-4 py-5">
                <div className="min-w-0 flex-1">
                  {category.parentId !== null && <p className="mb-1 break-words font-mono text-[10px] text-muted">{parent ? categoryPath(parent, all) : "Padre no disponible"} /</p>}
                  <h2 className="break-words text-base">{category.parentId !== null && <span className="mr-2 text-primary/35" aria-hidden="true">↳</span>}{category.name}
                    {!category.isActive && <span className="ml-3 border border-primary/14 px-2 py-1 font-mono text-[9px] uppercase tracking-wider text-muted">Archivada</span>}
                  </h2>
                  <p className="mt-2 font-mono text-[10px] text-muted">{catalogTypeLabels[category.type]} · {category.movementCount.toLocaleString("es-AR")} movimientos</p>
                </div>
                <div className="flex gap-2">
                  <button className={catalogSecondary} disabled={busy} aria-label={`Editar ${category.name}`} onClick={() => { setNotice(""); setEditor(category.id); }}><Pencil size={14} aria-hidden="true" /><span className="hidden sm:inline">Editar</span></button>
                  {category.isActive && <button className={catalogSecondary} disabled={busy} aria-label={`Archivar ${category.name}`} onClick={() => { archive.reset(); setNotice(""); setArchiveId(category.id); }}><Archive size={14} aria-hidden="true" /><span className="hidden sm:inline">Archivar</span></button>}
                </div>
              </li>;
            })}
          </ul>}
      </>}
    </CatalogPage>
  );
}

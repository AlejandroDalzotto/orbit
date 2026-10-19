import { useId, useState, type FormEvent } from "react";
import { useSaveCatalogCategory } from "../hooks/use-catalog";
import type { Category } from "../types/generated/Category";
import { categoryPath, catalogTypeLabels, validCategoryParents } from "./catalog-utils";
import { CatalogError, catalogField, catalogLabel, catalogPrimary, catalogSecondary } from "./catalog-ui";

export function CatalogCategoryForm({ category, categories, onSaved, onCancel }: {
  category?: Category; categories: Category[]; onSaved: (category: Category) => void; onCancel: () => void;
}) {
  const prefix = useId();
  const [name, setName] = useState(category?.name ?? "");
  const [type, setType] = useState<Category["type"]>(category?.type ?? "expense");
  const [parentId, setParentId] = useState(category?.parentId?.toString() ?? "");
  const [validation, setValidation] = useState<string | null>(null);
  const save = useSaveCatalogCategory();
  const parents = validCategoryParents(categories, category?.id, type);
  const parentValid = !parentId || parents.some((parent) => parent.id.toString() === parentId);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (save.isPending) return;
    setValidation(null);
    if (!name.trim()) { setValidation("Ingresá un nombre para la categoría."); return; }
    if (!parentValid) { setValidation("Elegí una categoría padre activa y compatible o dejá la categoría sin padre."); return; }
    try {
      const result = await save.mutateAsync({ id: category?.id, entry: { name: name.trim(), type, parentId: parentId ? Number(parentId) : null } });
      onSaved(result);
    } catch { /* The mutation exposes the server error below and preserves the draft. */ }
  }

  return (
    <form onSubmit={submit} aria-labelledby={`${prefix}-title`} aria-busy={save.isPending} className="space-y-5 border border-primary/14 bg-surface p-5 sm:p-6">
      <h2 id={`${prefix}-title`} className="font-display text-2xl">{category ? "Editar categoría" : "Nueva categoría"}</h2>
      <fieldset disabled={save.isPending} className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className={catalogLabel} htmlFor={`${prefix}-name`}>Nombre</label>
          <input id={`${prefix}-name`} className={catalogField} autoFocus required maxLength={200} value={name} onChange={(event) => setName(event.target.value)} />
        </div>
        <div>
          <label className={catalogLabel} htmlFor={`${prefix}-type`}>Tipo</label>
          <select id={`${prefix}-type`} className={catalogField} value={type} onChange={(event) => {
            const next = event.target.value as Category["type"];
            setType(next);
            if (!validCategoryParents(categories, category?.id, next).some((parent) => parent.id.toString() === parentId)) setParentId("");
          }}>
            {Object.entries(catalogTypeLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </div>
        <div>
          <label className={catalogLabel} htmlFor={`${prefix}-parent`}>Categoría padre</label>
          <select id={`${prefix}-parent`} className={catalogField} value={parentId} aria-describedby={`${prefix}-hint`} onChange={(event) => setParentId(event.target.value)}>
            <option value="">Sin padre / categoría principal</option>
            {!parentValid && <option value={parentId} disabled>Padre no disponible — elegí otro</option>}
            {parents.map((parent) => <option key={parent.id} value={parent.id}>{categoryPath(parent, categories)}</option>)}
          </select>
        </div>
      </fieldset>
      <p id={`${prefix}-hint`} className="text-xs leading-relaxed text-muted">Solo se muestran padres activos y compatibles. Una categoría no puede depender de sí misma ni de sus descendientes. Los movimientos y las subcategorías existentes también deben ser compatibles con el tipo.</p>
      {(validation || save.error) && <CatalogError error={validation ?? save.error} />}
      <div className="flex gap-3">
        <button type="submit" className={catalogPrimary} disabled={save.isPending}>{save.isPending ? "Guardando…" : "Guardar categoría"}</button>
        <button type="button" className={catalogSecondary} disabled={save.isPending} onClick={onCancel}>Cancelar</button>
      </div>
    </form>
  );
}

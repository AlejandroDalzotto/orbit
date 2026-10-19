import { useId, useState, type FormEvent } from "react";
import { useSaveCatalogItem } from "../hooks/use-catalog";
import type { Item } from "../types/generated/Item";
import { CatalogError, catalogField, catalogLabel, catalogPrimary, catalogSecondary } from "./catalog-ui";

export function CatalogItemForm({ item, onSaved, onCancel }: { item?: Item; onSaved: (item: Item) => void; onCancel: () => void }) {
  const prefix = useId();
  const [name, setName] = useState(item?.name ?? "");
  const [brand, setBrand] = useState(item?.brand ?? "");
  const [description, setDescription] = useState(item?.description ?? "");
  const [validation, setValidation] = useState<string | null>(null);
  const save = useSaveCatalogItem();

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (save.isPending) return;
    setValidation(null);
    if (!name.trim()) { setValidation("Ingresá un nombre para el ítem."); return; }
    try {
      const result = await save.mutateAsync({ id: item?.id, entry: { name: name.trim(), brand: brand.trim() || null, description: description.trim() || null } });
      onSaved(result);
    } catch { /* Keep the draft available for retry. */ }
  }

  return (
    <form onSubmit={submit} aria-labelledby={`${prefix}-title`} aria-busy={save.isPending} className="space-y-5 border border-primary/14 bg-surface p-5 sm:p-6">
      <h2 id={`${prefix}-title`} className="font-display text-2xl">{item ? "Editar ítem" : "Nuevo ítem"}</h2>
      <fieldset disabled={save.isPending} className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className={catalogLabel} htmlFor={`${prefix}-name`}>Nombre</label>
          <input id={`${prefix}-name`} className={catalogField} required autoFocus maxLength={200} value={name} onChange={(event) => setName(event.target.value)} />
        </div>
        <div>
          <label className={catalogLabel} htmlFor={`${prefix}-brand`}>Marca (opcional)</label>
          <input id={`${prefix}-brand`} className={catalogField} maxLength={200} value={brand} onChange={(event) => setBrand(event.target.value)} />
        </div>
        <div className="sm:col-span-2">
          <label className={catalogLabel} htmlFor={`${prefix}-description`}>Descripción (opcional)</label>
          <textarea id={`${prefix}-description`} className={catalogField} rows={3} maxLength={2000} value={description} onChange={(event) => setDescription(event.target.value)} />
        </div>
      </fieldset>
      {(validation || save.error) && <CatalogError error={validation ?? save.error} />}
      <div className="flex gap-3">
        <button type="submit" className={catalogPrimary} disabled={save.isPending}>{save.isPending ? "Guardando…" : "Guardar ítem"}</button>
        <button type="button" className={catalogSecondary} disabled={save.isPending} onClick={onCancel}>Cancelar</button>
      </div>
    </form>
  );
}

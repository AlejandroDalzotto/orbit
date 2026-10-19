import { useId, useState, type FormEvent } from "react";
import { useAddCatalogPurchase, useCatalogItems } from "../hooks/use-catalog";
import type { Currency } from "../types/generated/Currency";
import type { Movement } from "../types/generated/Movement";
import { catalogDecimalPlaces, catalogMinorUnits } from "./catalog-utils";
import { LedgerError, ledgerField, ledgerLabel, ledgerPrimary, ledgerSecondary } from "./ledger-ui";

export function LedgerPurchaseForm({ movement, currencies, onSaved, onCancel, onBusyChange }: {
  movement: Movement; currencies: Currency[]; onSaved: () => void; onCancel: () => void; onBusyChange: (busy: boolean) => void;
}) {
  const prefix = useId();
  const items = useCatalogItems();
  const add = useAddCatalogPurchase();
  const [search, setSearch] = useState("");
  const [itemId, setItemId] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [price, setPrice] = useState("");
  const [notes, setNotes] = useState("");
  const [validation, setValidation] = useState<unknown>(null);
  const active = (items.data ?? []).filter((item) => !item.isArchived);
  const options = active.filter((item) => `${item.name} ${item.brand ?? ""}`.toLocaleLowerCase("es").includes(search.trim().toLocaleLowerCase("es")));
  const selected = options.find((item) => item.id.toString() === itemId);
  const decimals = catalogDecimalPlaces(currencies.find((currency) => currency.code === movement.currencyCode));
  const canSubmit = movement.type === "expense" && !!selected && !items.isError && decimals !== null;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (add.isPending) return;
    setValidation(null);
    if (!canSubmit || !selected || decimals === null) { setValidation("Seleccioná un artículo activo y una moneda con precisión disponible."); return; }
    try {
      if (!/^\d+(?:[.,]\d+)?$/.test(quantity.trim())) throw new Error("Ingresá una cantidad válida; podés usar fracciones como 1,5.");
      const qty = Number(quantity.trim().replace(",", "."));
      if (!Number.isFinite(qty) || qty <= 0) throw new Error("La cantidad debe ser mayor a cero y finita.");
      const unitPrice = catalogMinorUnits(price, decimals);
      if (!Number.isSafeInteger(Math.trunc(qty * unitPrice))) throw new Error("El total de la compra excede el rango permitido.");
      onBusyChange(true);
      await add.mutateAsync({ movementId: movement.id, itemId: selected.id, quantity: qty, unitPrice, notes: notes.trim() || null });
      onSaved();
    } catch (error) { setValidation(error); }
    finally { onBusyChange(false); }
  }

  return <form onSubmit={submit} aria-labelledby={`${prefix}-title`} aria-busy={add.isPending} className="space-y-5 border border-primary/20 bg-surface p-4 sm:p-5">
    <div>
      <h3 id={`${prefix}-title`} className="font-display text-2xl">Vincular artículo al gasto</h3>
      <p className="mt-2 font-mono text-xs leading-relaxed text-muted">Gasto #{movement.id} · {movement.date} · {movement.currencyCode}. La fecha, moneda y comercio se toman del movimiento; su importe no cambia.</p>
    </div>
    <fieldset disabled={add.isPending} className="space-y-5">
      <div>
        <label className={ledgerLabel} htmlFor={`${prefix}-search`}>Buscar artículo por nombre o marca</label>
        <input id={`${prefix}-search`} type="search" autoFocus className={ledgerField} value={search} onChange={(event) => { setSearch(event.target.value); setItemId(""); }} />
      </div>
      {items.isPending && <p role="status" className="font-mono text-xs text-muted">Cargando artículos…</p>}
      {items.isError && <LedgerError error={items.error} retry={() => void items.refetch()} />}
      {items.isSuccess && active.length === 0 && <p className="font-mono text-xs text-muted">No hay artículos activos. Creá uno en Artículos y volvé a este gasto para vincularlo.</p>}
      {items.isSuccess && active.length > 0 && options.length === 0 && <p className="font-mono text-xs text-muted">No hay artículos que coincidan con la búsqueda.</p>}
      <div>
        <label className={ledgerLabel} htmlFor={`${prefix}-item`}>Artículo</label>
        <select id={`${prefix}-item`} className={ledgerField} required disabled={!items.isSuccess || options.length === 0} value={itemId} onChange={(event) => { setItemId(event.target.value); setValidation(null); }}>
          <option value="">Seleccionar artículo…</option>
          {options.map((item) => <option key={item.id} value={item.id}>{item.name}{item.brand ? ` · ${item.brand}` : ""}</option>)}
        </select>
      </div>
      {decimals === null && <LedgerError error="No hay metadatos de precisión para esta moneda. No se puede convertir el precio de forma segura." />}
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className={ledgerLabel} htmlFor={`${prefix}-quantity`}>Cantidad</label>
          <input id={`${prefix}-quantity`} className={ledgerField} inputMode="decimal" required maxLength={80} value={quantity} onChange={(event) => setQuantity(event.target.value)} aria-describedby={`${prefix}-precision`} placeholder="1,5" />
        </div>
        <div>
          <label className={ledgerLabel} htmlFor={`${prefix}-price`}>Precio unitario ({movement.currencyCode})</label>
          <input id={`${prefix}-price`} className={ledgerField} inputMode="decimal" required maxLength={80} disabled={decimals === null} value={price} onChange={(event) => setPrice(event.target.value)} aria-describedby={`${prefix}-precision`} placeholder={decimals === 0 ? "0" : "0,00"} />
        </div>
      </div>
      <p id={`${prefix}-precision`} className="font-mono text-[10px] leading-relaxed text-muted">Se admiten cantidades fraccionarias. {decimals !== null && `El precio admite ${decimals} decimales y se guarda en unidades menores de ${movement.currencyCode}.`} El total se calcula automáticamente; las fracciones de unidades menores se truncan.</p>
      <div>
        <label className={ledgerLabel} htmlFor={`${prefix}-notes`}>Notas de la compra (opcional)</label>
        <textarea id={`${prefix}-notes`} className={ledgerField} rows={2} maxLength={2000} value={notes} onChange={(event) => setNotes(event.target.value)} />
      </div>
    </fieldset>
    {(validation != null || add.error != null) && <LedgerError error={validation ?? add.error} />}
    <div className="flex flex-wrap gap-3">
      <button type="submit" className={ledgerPrimary} disabled={add.isPending || !canSubmit}>{add.isPending ? "Vinculando…" : "Guardar vínculo"}</button>
      <button type="button" className={ledgerSecondary} disabled={add.isPending} onClick={onCancel}>Cancelar vínculo</button>
    </div>
  </form>;
}

import { useId, useState, type FormEvent } from "react";
import { CATALOG_EXPENSE_PAGE_SIZE, useAddCatalogPurchase, useCatalogCurrencies, useCatalogExpenses, useCatalogShops } from "../hooks/use-catalog";
import { useDebouncedValue } from "../hooks/use-debounced-value";
import type { Item } from "../types/generated/Item";
import { catalogDecimalPlaces, catalogMinorUnits, catalogMoney } from "./catalog-utils";
import { CatalogEmpty, CatalogError, CatalogLoading, catalogField, catalogLabel, catalogPrimary, catalogSecondary } from "./catalog-ui";

export function CatalogPurchaseForm({ item, onSaved, onCancel }: { item: Item; onSaved: () => void; onCancel: () => void }) {
  const prefix = useId();
  const [search, setSearch] = useState("");
  const debounced = useDebouncedValue(search, 250);
  const [offset, setOffset] = useState(0);
  const [movementId, setMovementId] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [price, setPrice] = useState("");
  const [notes, setNotes] = useState("");
  const [validation, setValidation] = useState<unknown>(null);
  const movements = useCatalogExpenses(debounced, offset);
  const currencies = useCatalogCurrencies();
  const shops = useCatalogShops();
  const add = useAddCatalogPurchase();
  const searching = debounced !== search;
  const selected = movements.data?.items.find((movement) => movement.id.toString() === movementId && movement.type === "expense");
  const currency = currencies.data?.find((entry) => entry.code === selected?.currencyCode);
  const decimals = catalogDecimalPlaces(currency);
  const canSubmit = !!selected && decimals !== null && !searching && !movements.isError && !currencies.isError && !item.isArchived;
  const shopName = (shopId: number | null) => shopId === null ? "Sin tienda" : shops.data?.find((shop) => shop.id === shopId)?.name ?? `Tienda #${shopId}`;

  function changePage(nextOffset: number) {
    setOffset(nextOffset);
    setMovementId("");
    setValidation(null);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (add.isPending) return;
    setValidation(null);
    if (!canSubmit || !selected || decimals === null) { setValidation("Seleccioná un gasto con una moneda disponible."); return; }
    try {
      if (!/^\d+(?:[.,]\d+)?$/.test(quantity.trim())) throw new Error("Ingresá una cantidad válida; podés usar fracciones como 1,5.");
      const qty = Number(quantity.trim().replace(",", "."));
      if (!Number.isFinite(qty) || qty <= 0) throw new Error("La cantidad debe ser mayor a cero y finita.");
      const unitPrice = catalogMinorUnits(price, decimals);
      const total = Math.trunc(qty * unitPrice);
      if (!Number.isSafeInteger(total)) throw new Error("El total de la compra excede el rango permitido.");
      await add.mutateAsync({ movementId: selected.id, itemId: item.id, quantity: qty, unitPrice, notes: notes.trim() || null });
      onSaved();
    } catch (error) { setValidation(error); }
  }

  return (
    <form onSubmit={submit} aria-labelledby={`${prefix}-title`} aria-busy={add.isPending} className="space-y-5 border border-primary/20 bg-surface p-5">
      <div>
        <h3 id={`${prefix}-title`} className="font-display text-2xl">Registrar compra</h3>
        <p className="mt-2 text-xs leading-relaxed text-muted">Agregá una línea a un gasto existente. La moneda, fecha y tienda se toman del movimiento; su importe no se modifica.</p>
      </div>
      <fieldset disabled={add.isPending} className="space-y-5">
        <div>
          <label className={catalogLabel} htmlFor={`${prefix}-search`}>Buscar gasto por descripción o notas</label>
          <input id={`${prefix}-search`} type="search" autoFocus className={catalogField} value={search} onChange={(event) => { setSearch(event.target.value); changePage(0); }} placeholder="Buscar un movimiento de gasto…" />
        </div>
        {(movements.isPending || searching) && <CatalogLoading>Buscando gastos…</CatalogLoading>}
        {movements.isError && <CatalogError error={movements.error} retry={() => { void movements.refetch(); }} pending={movements.isFetching} />}
        {movements.data && !searching && <>
          {movements.data.items.length === 0 ? <CatalogEmpty title="No hay gastos disponibles">Probá otra búsqueda o registrá un movimiento de gasto en el libro de movimientos.</CatalogEmpty> :
            <div>
              <label className={catalogLabel} htmlFor={`${prefix}-movement`}>Movimiento de gasto</label>
              <select id={`${prefix}-movement`} className={catalogField} required value={movementId} disabled={movements.isError} onChange={(event) => { setMovementId(event.target.value); setValidation(null); }}>
                <option value="">Seleccionar gasto…</option>
                {movements.data.items.filter((movement) => movement.type === "expense").map((movement) =>
                  <option key={movement.id} value={movement.id}>#{movement.id} · {movement.date} · {movement.description || "Sin descripción"} · {movement.accountName} · {shopName(movement.shopId)} · {catalogMoney(movement.amount, movement.currencyCode, currencies.data)}</option>,
                )}
              </select>
            </div>}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="font-mono text-[10px] text-muted">{movements.data.total.toLocaleString("es-AR")} gastos · página {Math.floor(offset / CATALOG_EXPENSE_PAGE_SIZE) + 1}</p>
            <div className="flex gap-2">
              <button type="button" className={catalogSecondary} disabled={offset === 0 || movements.isFetching} onClick={() => changePage(Math.max(0, offset - CATALOG_EXPENSE_PAGE_SIZE))}>Anterior</button>
              <button type="button" className={catalogSecondary} disabled={!movements.data.hasNextPage || movements.isFetching} onClick={() => changePage(offset + CATALOG_EXPENSE_PAGE_SIZE)}>Siguiente</button>
            </div>
          </div>
        </>}
        {shops.isError && <CatalogError error={shops.error} retry={() => { void shops.refetch(); }} pending={shops.isFetching} />}
        {currencies.isPending && <CatalogLoading>Cargando precisión de las monedas…</CatalogLoading>}
        {currencies.isError && <CatalogError error={currencies.error} retry={() => { void currencies.refetch(); }} pending={currencies.isFetching} />}
        {selected && <p className="border-l border-primary/30 pl-3 text-sm text-primary/65">{selected.date} · {selected.accountName} · {shopName(selected.shopId)} · {selected.currencyCode}</p>}
        {selected && currencies.isSuccess && decimals === null && <CatalogError error="No hay metadatos de precisión para esta moneda. No se puede convertir el precio de forma segura." />}
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className={catalogLabel} htmlFor={`${prefix}-quantity`}>Cantidad</label>
            <input id={`${prefix}-quantity`} className={catalogField} inputMode="decimal" required maxLength={80} value={quantity} onChange={(event) => setQuantity(event.target.value)} aria-describedby={`${prefix}-precision`} placeholder="1,5" />
          </div>
          <div>
            <label className={catalogLabel} htmlFor={`${prefix}-price`}>Precio unitario {selected ? `(${selected.currencyCode})` : ""}</label>
            <input id={`${prefix}-price`} className={catalogField} inputMode="decimal" required maxLength={80} value={price} disabled={!canSubmit} onChange={(event) => setPrice(event.target.value)} aria-describedby={`${prefix}-precision`} placeholder={decimals === 0 ? "0" : "0,00"} />
          </div>
        </div>
        <p id={`${prefix}-precision`} className="text-xs leading-relaxed text-muted">Se admiten cantidades fraccionarias. {decimals === null ? "Seleccioná un gasto para determinar los decimales del precio." : `El precio admite ${decimals} decimales y se guarda en unidades menores de ${selected?.currencyCode}.`} El total se calcula automáticamente; las fracciones de unidades menores se truncan.</p>
        <div>
          <label className={catalogLabel} htmlFor={`${prefix}-notes`}>Notas de la compra (opcional)</label>
          <textarea id={`${prefix}-notes`} className={catalogField} rows={2} maxLength={2000} value={notes} onChange={(event) => setNotes(event.target.value)} />
        </div>
      </fieldset>
      {(validation != null || add.error != null) && <CatalogError error={validation ?? add.error} />}
      <div className="flex flex-wrap gap-3">
        <button type="submit" className={catalogPrimary} disabled={add.isPending || !canSubmit}>{add.isPending ? "Registrando…" : "Registrar compra"}</button>
        <button type="button" className={catalogSecondary} disabled={add.isPending} onClick={onCancel}>Cancelar</button>
      </div>
    </form>
  );
}

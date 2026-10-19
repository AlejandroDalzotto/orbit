import { useId, useState } from "react";
import { Plus, Trash2, X } from "lucide-react";
import { useCatalogCurrencies, useCatalogPurchases, useDeleteCatalogPurchase } from "../hooks/use-catalog";
import type { Item } from "../types/generated/Item";
import type { Purchase } from "../types/generated/Purchase";
import { catalogMoney } from "./catalog-utils";
import { CatalogPurchaseForm } from "./catalog-purchase-form";
import { CatalogPriceChart } from "./catalog-price-chart";
import { CatalogEmpty, CatalogError, CatalogLoading, catalogField, catalogLabel, catalogPrimary, catalogSecondary } from "./catalog-ui";

export function CatalogPurchaseHistory({ item, purchaseOpen, deletePurchaseId, disabled, onPurchaseOpenChange, onDeletePurchaseChange, onClose }: {
  item: Item; purchaseOpen: boolean; deletePurchaseId: number | null; disabled: boolean;
  onPurchaseOpenChange: (open: boolean) => void; onDeletePurchaseChange: (id: number | null) => void; onClose: () => void;
}) {
  const prefix = useId();
  const purchases = useCatalogPurchases(item.id);
  const currencies = useCatalogCurrencies();
  const deletePurchase = useDeleteCatalogPurchase();
  const [currencyFilter, setCurrencyFilter] = useState("");
  const [shopFilter, setShopFilter] = useState("");
  const [notice, setNotice] = useState("");
  const all = purchases.data ?? [];
  const deleting = all.find((purchase) => purchase.id === deletePurchaseId);
  const codes = [...new Set(all.map((purchase) => purchase.currencyCode))].sort();
  // Keep a missing shop distinct from a real shop whose name happens to match the label.
  const shopKey = (name: string | null) => JSON.stringify(name);
  const shops = [...new Set(all.map((purchase) => purchase.shopName))].sort((a, b) => (a ?? "").localeCompare(b ?? "", "es"));
  const filtered = all.filter((purchase) => (!currencyFilter || purchase.currencyCode === currencyFilter) && (!shopFilter || shopKey(purchase.shopName) === shopFilter));
  const groups = new Map<string, Purchase[]>();
  for (const purchase of [...filtered].sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id)) {
    const key = JSON.stringify([purchase.currencyCode, purchase.shopName]);
    const group = groups.get(key) ?? [];
    group.push(purchase);
    groups.set(key, group);
  }

  function confirmDelete() {
    if (!deleting || disabled || purchaseOpen || deletePurchase.isPending) return;
    deletePurchase.mutate(deleting.id, {
      onSuccess: () => {
        onDeletePurchaseChange(null);
        const remaining = all.filter((purchase) => purchase.id !== deleting.id);
        if (!remaining.some((purchase) => purchase.currencyCode === currencyFilter)) setCurrencyFilter("");
        if (!remaining.some((purchase) => shopKey(purchase.shopName) === shopFilter)) setShopFilter("");
        setNotice(`Línea de compra eliminada. El gasto #${deleting.movementId} se conserva y su importe no cambió.`);
      },
    });
  }

  return (
    <section aria-labelledby={`${prefix}-title`} className="min-w-0 space-y-5 border border-primary/14 p-5 sm:p-6">
      <header className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-muted">Historial de precios</p>
          <h2 id={`${prefix}-title`} className="break-words font-display text-3xl">{item.name}</h2>
          <p className="mt-2 text-sm text-muted">{item.brand || "Sin marca"}{item.isArchived ? " · Archivado" : ""}</p>
          {item.description && <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-relaxed text-muted">{item.description}</p>}
        </div>
        <button type="button" className={catalogSecondary} aria-label="Cerrar historial" disabled={disabled || purchaseOpen || deletePurchaseId !== null} onClick={onClose}><X size={16} aria-hidden="true" /></button>
      </header>
      {!purchaseOpen && !item.isArchived && <button type="button" className={catalogPrimary} disabled={disabled || deletePurchaseId !== null} onClick={() => { setNotice(""); onPurchaseOpenChange(true); }}><Plus size={15} aria-hidden="true" />Registrar compra</button>}
      <p role="status" className="text-sm text-primary/65">{deletePurchase.isPending ? "Eliminando línea de compra…" : notice}</p>
            {deletePurchaseId !== null && <section id={`${prefix}-delete`} aria-labelledby={`${prefix}-delete-title`} aria-describedby={`${prefix}-delete-description`} aria-busy={deletePurchase.isPending} className="space-y-4 border border-primary/30 bg-surface p-5">
              <h3 id={`${prefix}-delete-title`} className="font-mono text-lg font-light">¿Eliminar esta línea de compra?</h3>
              {deleting && <p className="text-sm leading-relaxed text-primary/80">Línea #{deleting.id} · {item.name} · {deleting.date} · {deleting.quantity.toLocaleString("es-AR", { maximumFractionDigits: 20 })} unidades · {catalogMoney(deleting.totalPrice, deleting.currencyCode, currencies.data)} · gasto #{deleting.movementId}</p>}
              <p id={`${prefix}-delete-description`} className="text-sm leading-relaxed text-muted">Se elimina solo esta línea del historial. El movimiento de gasto no se elimina y su importe NO cambia. Esta acción no se puede deshacer.</p>
              {deletePurchase.error != null && <CatalogError error={deletePurchase.error} />}
              {!deleting && !deletePurchase.isPending && <CatalogError error="La línea ya no está disponible. Cancelá para volver al historial actualizado." />}
              <div className="flex flex-wrap gap-3">
                <button type="button" autoFocus className={catalogSecondary} disabled={deletePurchase.isPending} onClick={() => { onDeletePurchaseChange(null); deletePurchase.reset(); }}>Cancelar</button>
                <button type="button" className={catalogPrimary} disabled={disabled || purchaseOpen || deletePurchase.isPending || !deleting} onClick={confirmDelete}>{deletePurchase.isPending ? "Eliminando…" : deletePurchase.isError ? "Reintentar eliminación" : "Confirmar eliminación"}</button>
              </div>
            </section>}
      {purchaseOpen && <CatalogPurchaseForm item={item} onCancel={() => onPurchaseOpenChange(false)} onSaved={() => { onPurchaseOpenChange(false); setNotice("Compra registrada. El importe del movimiento no se modificó."); }} />}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={catalogLabel} htmlFor={`${prefix}-currency`}>Moneda</label>
          <select id={`${prefix}-currency`} className={catalogField} disabled={deletePurchaseId !== null} value={currencyFilter} onChange={(event) => setCurrencyFilter(event.target.value)}>
            <option value="">Todas las monedas</option>
            {codes.map((code) => <option key={code} value={code}>{code}</option>)}
          </select>
        </div>
        <div>
          <label className={catalogLabel} htmlFor={`${prefix}-shop`}>Tienda</label>
          <select id={`${prefix}-shop`} className={catalogField} disabled={deletePurchaseId !== null} value={shopFilter} onChange={(event) => setShopFilter(event.target.value)}>
            <option value="">Todas las tiendas</option>
            {shops.map((shop) => <option key={shopKey(shop)} value={shopKey(shop)}>{shop ?? "Sin tienda"}</option>)}
          </select>
        </div>
      </div>
      {purchases.isPending && <CatalogLoading>Cargando historial de compras…</CatalogLoading>}
      {purchases.isError && <CatalogError error={purchases.error} retry={() => { void purchases.refetch(); }} pending={purchases.isFetching} />}
      {currencies.isPending && <CatalogLoading>Cargando monedas; los precios se muestran en unidades menores mientras tanto…</CatalogLoading>}
      {currencies.isError && <CatalogError error={currencies.error} retry={() => { void currencies.refetch(); }} pending={currencies.isFetching} />}
      {purchases.data && <>
        <p className="font-mono text-[10px] text-muted" aria-live="polite">{purchases.isFetching ? "Actualizando…" : `${filtered.length} compras · precios separados por moneda y tienda`}</p>
        {filtered.length === 0 && <CatalogEmpty title={all.length ? "Sin coincidencias" : "Todavía no hay compras"}>{all.length ? "Cambiá los filtros de moneda o tienda para ver más precios." : item.isArchived ? "Este ítem está archivado y no tiene compras registradas." : "Registrá una compra en un gasto existente para empezar a comparar precios."}</CatalogEmpty>}
        {[...groups.entries()].map(([key, history]) => {
          const latest = history[0];
          const currency = currencies.data?.find((entry) => entry.code === latest.currencyCode);
          const tableId = `${prefix}-history-${latest.id}`;
          return <section key={key} aria-label={`${latest.currencyCode} · ${latest.shopName ?? "Sin tienda"}`} className="border-t border-primary/14 pt-5">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
              <div className="min-w-0">
                <h3 className="break-words text-sm">{latest.shopName ?? "Sin tienda"} <span className="ml-2 font-mono text-[10px] text-muted">{latest.currencyCode}</span></h3>
                <p className="mt-2 font-mono text-[9px] uppercase tracking-wider text-muted">Último precio unitario / {latest.date}</p>
              </div>
              <p className="break-all font-display text-2xl tabular-nums">{catalogMoney(latest.unitPrice, latest.currencyCode, currencies.data)}</p>
            </div>
            {currency && <CatalogPriceChart purchases={history} currency={currency} shopName={latest.shopName} tableId={tableId} />}
            <div className="overflow-x-auto">
              <table id={tableId} className="w-full min-w-136 text-left text-xs">
                <caption className="sr-only">Historial de {item.name} en {latest.shopName ?? "tienda no especificada"}, moneda {latest.currencyCode}</caption>
                <thead className="border-y border-primary/14 font-mono text-[9px] uppercase tracking-wider text-muted">
                  <tr><th scope="col" className="py-3 pr-3 font-normal">Fecha / gasto</th><th scope="col" className="px-2 py-3 text-right font-normal">Cantidad</th><th scope="col" className="px-2 py-3 text-right font-normal">Unitario</th><th scope="col" className="py-3 pl-2 text-right font-normal">Total</th><th scope="col" className="py-3 pl-3 text-right font-normal">Acciones</th></tr>
                </thead>
                <tbody className="divide-y divide-primary/10">
                  {history.map((purchase) => <tr key={purchase.id}>
                    <th scope="row" className="max-w-64 py-4 pr-3 font-normal">
                      <time dateTime={purchase.date}>{purchase.date}</time>
                      <p className="mt-1 font-mono text-[10px] text-muted">Gasto #{purchase.movementId}</p>
                      {purchase.notes && <p className="mt-2 whitespace-pre-wrap break-words text-muted">{purchase.notes}</p>}
                    </th>
                    <td className="px-2 py-4 text-right font-mono tabular-nums text-primary/65">{purchase.quantity.toLocaleString("es-AR", { maximumFractionDigits: 20 })}</td>
                    <td className="px-2 py-4 text-right font-mono tabular-nums">{catalogMoney(purchase.unitPrice, purchase.currencyCode, currencies.data)}</td>
                    <td className="py-4 pl-2 text-right font-mono tabular-nums text-primary/65">{catalogMoney(purchase.totalPrice, purchase.currencyCode, currencies.data)}</td>
                    <td className="py-4 pl-3 text-right">
                      <button type="button" className={catalogSecondary} disabled={disabled || purchaseOpen || deletePurchaseId !== null} aria-label={`Eliminar línea #${purchase.id} de ${item.name}, gasto #${purchase.movementId}`} aria-controls={`${prefix}-delete`} onClick={() => { deletePurchase.reset(); setNotice(""); onDeletePurchaseChange(purchase.id); }}><Trash2 size={14} aria-hidden="true" /><span>Eliminar línea</span></button>
                    </td>
                  </tr>)}
                </tbody>
              </table>
            </div>
          </section>;
        })}
      </>}
    </section>
  );
}

import { useId } from "react";
import { useMovementPurchases } from "../hooks/use-movements";
import type { Currency } from "../types/generated/Currency";
import { LedgerError, ledgerLabel } from "./ledger-ui";
import { formatMinor } from "./ledger-utils";

export function LedgerPurchases({ movementId, currencies }: { movementId: number; currencies: Currency[] }) {
  const query = useMovementPurchases(movementId);
  const titleId = useId();
  return <section aria-labelledby={titleId} className="space-y-4">
    <header>
      <p className={ledgerLabel}>Detalle vinculado · precios de sólo lectura</p>
      <h3 id={titleId} className="font-display text-2xl">Líneas de compra</h3>
    </header>
    {query.isPending && <p role="status" className="font-mono text-xs text-muted">Cargando líneas de compra…</p>}
    {query.error != null && <LedgerError error={query.error} retry={() => void query.refetch()} />}
    {query.data && (query.data.length === 0
      ? <p className="border border-dashed border-hairline p-4 font-mono text-xs text-muted">Este gasto no tiene líneas de compra vinculadas.</p>
      : <div className="overflow-x-auto border-y border-hairline">
        <table className="w-full min-w-[460px] text-left">
          <caption className="sr-only">Líneas de compra del gasto #{movementId}. Precios y totales exactos en la moneda de cada línea.</caption>
          <thead className="border-b border-hairline font-mono text-[10px] uppercase tracking-wider text-muted"><tr>
            <th scope="col" className="py-3 pr-3 font-normal">Artículo</th><th scope="col" className="px-3 py-3 text-right font-normal">Cantidad</th><th scope="col" className="px-3 py-3 text-right font-normal">Precio unitario</th><th scope="col" className="py-3 pl-3 text-right font-normal">Total</th>
          </tr></thead>
          <tbody className="divide-y divide-primary/10">{query.data.map((purchase) => <tr key={purchase.id}>
            <th scope="row" className="max-w-56 py-4 pr-3 align-top font-normal">
              <span className="block break-words font-mono text-xs">{purchase.itemName}</span>
              <span className="mt-1 block font-mono text-[10px] text-muted">Línea #{purchase.id}{purchase.shopName ? ` · ${purchase.shopName}` : ""}</span>
              {purchase.notes && <span className="mt-2 block whitespace-pre-wrap break-words font-mono text-[11px] leading-relaxed text-muted">{purchase.notes}</span>}
            </th>
            <td className="px-3 py-4 text-right align-top font-mono text-xs text-muted">{purchase.quantity.toLocaleString("es-AR", { maximumFractionDigits: 20 })}</td>
            <td className="whitespace-nowrap px-3 py-4 text-right align-top font-display text-lg tabular-nums">{formatMinor(purchase.unitPrice, purchase.currencyCode, currencies)}</td>
            <td className="whitespace-nowrap py-4 pl-3 text-right align-top font-display text-lg tabular-nums">{formatMinor(purchase.totalPrice, purchase.currencyCode, currencies)}</td>
          </tr>)}</tbody>
        </table>
      </div>)}
    <p className="font-mono text-[10px] leading-relaxed text-muted">Vincular artículos no modifica el importe del gasto. El historial de precios y la eliminación de líneas están en Artículos. Para cambiar el gasto a otro tipo, primero quitá sus líneas de compra.</p>
  </section>;
}

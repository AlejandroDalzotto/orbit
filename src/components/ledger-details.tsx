import { useRef, useState, type ReactNode } from "react";
import { useDeleteMovement } from "../hooks/use-movements";
import type { Category } from "../types/generated/Category";
import type { Currency } from "../types/generated/Currency";
import type { Movement } from "../types/generated/Movement";
import type { Shop } from "../types/generated/Shop";
import { LedgerDialog, LedgerError, ledgerLabel, ledgerPrimary, ledgerSecondary } from "./ledger-ui";
import { displayDate, formatMinor, movementLabels } from "./ledger-utils";
import { LedgerPurchases } from "./ledger-purchases";
import { LedgerPurchaseForm } from "./ledger-purchase-form";

export function LedgerDetails({ movement, categories, currencies, shops, canEdit, onClose, onEdit, onDeleted }: {
  movement: Movement; categories: Category[]; currencies: Currency[]; shops: Shop[];
  canEdit: boolean; onClose: () => void; onEdit: () => void; onDeleted: () => void;
}) {
  const remove = useDeleteMovement();
  const [confirm, setConfirm] = useState(false);
  const [linking, setLinking] = useState(false);
  const [linkBusy, setLinkBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const linkButton = useRef<HTMLButtonElement>(null);
  function finishLink() {
    setLinking(false);
    requestAnimationFrame(() => linkButton.current?.focus());
  }
  const category = categories.find((item) => item.id === movement.categoryId);
  const shop = shops.find((item) => item.id === movement.shopId);
  const transfer = movement.type === "transfer";
  return <LedgerDialog title="Detalle del movimiento" busy={remove.isPending || linkBusy} onClose={linking ? finishLink : onClose}>
    <div className="space-y-6">
      <div>
        <p className={ledgerLabel}>{movementLabels[movement.type]} · {displayDate(movement.date)}</p>
        <p className="break-words font-display text-3xl tabular-nums">{formatMinor(movement.amount, movement.currencyCode, currencies)}</p>
        <h3 className="mt-3 text-lg">{movement.description || "Sin descripción"}</h3>
      </div>
      <dl className="grid gap-5 border-y border-primary/15 py-5 sm:grid-cols-2">
        <Detail label={transfer ? "Origen" : "Cuenta"}>{movement.accountName} · {movement.currencyCode}</Detail>
        {transfer && <>
          <Detail label="Destino">{movement.toAccountName ?? "Cuenta no disponible"} · {movement.toCurrencyCode ?? "—"}</Detail>
          <Detail label="Recibido">{movement.toAmount != null && movement.toCurrencyCode ? formatMinor(movement.toAmount, movement.toCurrencyCode, currencies) : "—"}</Detail>
        </>}
        <Detail label="Categoría">{category?.name ?? (movement.categoryId != null ? `Categoría #${movement.categoryId}` : "Sin categoría")}</Detail>
        <Detail label="Comercio">{shop?.name ?? (movement.shopId != null ? `Comercio #${movement.shopId}` : "Sin comercio")}{shop?.address && <span className="mt-1 block text-muted">{shop.address}</span>}</Detail>
        <Detail label="Referencia">#{movement.id}{movement.transferGroupId && <span className="mt-1 block break-all text-muted">{movement.transferGroupId}</span>}</Detail>
        <div className="sm:col-span-2"><Detail label="Notas"><span className="whitespace-pre-wrap break-words">{movement.notes || "Sin notas"}</span></Detail></div>
      </dl>
      {movement.type === "expense" && <div className="space-y-5">
        <div className="flex justify-end">
          <button ref={linkButton} type="button" className={ledgerPrimary} disabled={linking || confirm || remove.isPending} onClick={() => { setNotice(""); setLinking(true); }}>Vincular artículo</button>
        </div>
        {linking && <LedgerPurchaseForm movement={movement} currencies={currencies} onBusyChange={setLinkBusy} onCancel={finishLink} onSaved={() => { finishLink(); setNotice("Artículo vinculado. El historial de precios se actualizó y el importe del gasto no cambió."); }} />}
        {notice && <p role="status" className="font-mono text-xs leading-relaxed text-muted">{notice}</p>}
        <LedgerPurchases movementId={movement.id} currencies={currencies} />
      </div>}
      {remove.error && <LedgerError error={remove.error} />}
      {confirm ? <section aria-label="Confirmar eliminación" className="space-y-4 border border-error/40 p-4">
        <h3 className="font-display text-xl">¿Eliminar este movimiento?</h3>
        <p className="font-mono text-xs leading-relaxed text-muted">{transfer ? "Se eliminarán ambos lados de la transferencia y se actualizarán las dos cuentas." : "El saldo de la cuenta se actualizará. Si tiene compras asociadas, también se eliminarán sus líneas de compra."} Esta acción no se puede deshacer.</p>
        <div className="flex flex-wrap gap-3">
          <button type="button" autoFocus className={ledgerSecondary} disabled={remove.isPending} onClick={() => { setConfirm(false); remove.reset(); }}>Conservar</button>
          <button type="button" className={`${ledgerSecondary} text-error`} disabled={remove.isPending} onClick={() => remove.mutate(movement.id, { onSuccess: onDeleted })}>{remove.isPending ? "Eliminando…" : "Eliminar definitivamente"}</button>
        </div>
      </section> : !linking && <footer className="flex flex-wrap justify-between gap-3">
        <button type="button" className={`${ledgerSecondary} text-error`} onClick={() => setConfirm(true)}>Eliminar</button>
        <button type="button" className={ledgerPrimary} disabled={!canEdit} onClick={onEdit}>Editar movimiento</button>
      </footer>}
    </div>
  </LedgerDialog>;
}

function Detail({ label, children }: { label: string; children: ReactNode }) {
  return <div><dt className={ledgerLabel}>{label}</dt><dd className="font-mono text-xs leading-relaxed text-primary/80">{children}</dd></div>;
}

import { ArrowDownLeft, ArrowLeftRight, ArrowUpRight } from "lucide-react";
import { Movement, MovementType } from "../../../definitions/movements";
import { formatCurrency } from "../../../utils/format-currency";
import { useAccounts, useCategories, useGlobalStore } from "../../../stores/global-data-store";
import { useEffect, useState } from "react";
import type { ItemWithPurchase } from "../../../definitions/items";

const movTypeConfig: Record<MovementType, { label: string; icon: React.ReactNode; color: string }> = {
  income: { label: "Ingreso", icon: <ArrowDownLeft className="w-3.5 h-3.5" />, color: "text-emerald-600 bg-emerald-50" },
  expense: { label: "Egreso", icon: <ArrowUpRight className="w-3.5 h-3.5" />, color: "text-red-500 bg-red-50" },
  transfer: { label: "Transferencia", icon: <ArrowLeftRight className="w-3.5 h-3.5" />, color: "text-blue-500 bg-blue-50" },
};

const Field = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div>
    <p className="text-xs text-neutral-400 mb-0.5">{label}</p>
    <p className="text-sm text-neutral-800">{value}</p>
  </div>
);

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <p className="text-xs font-medium text-neutral-400 uppercase tracking-wide mb-3">{children}</p>
);

export function MovementDetailsModal({ movement }: { movement: Movement }) {
  const [items, setItems] = useState<ItemWithPurchase[]>([]);

  const config = movTypeConfig[movement.mov_type as MovementType];
  const date = new Date(movement.date).toLocaleDateString("es-AR");
  const created = new Date(movement.created_at).toLocaleString("es-AR");
  const currency = movement.currency ?? "ARS";

  const accounts = useAccounts();
  const account = accounts.find((acc) => acc.id === movement.account_id);

  const categories = useCategories();
  const category = categories.find((cat) => cat.id === movement.category_id);

  const getItemsByMovementId = useGlobalStore((state) => state.getItemsByMovementId);

  useEffect(() => {
    const fetchItems = async () => {
      const items = await getItemsByMovementId(movement.id);
      setItems(items);
    };
    fetchItems();
  }, []);

  return (
    <>
      {/* Header */}
      <div className="mb-5 pr-6">
        <h3 className="text-base font-semibold text-neutral-900">{movement.details}</h3>
        <p className="text-xs text-neutral-400">
          {config.label} · {currency}
        </p>
      </div>

      {/* Datos del movimiento */}
      <div className="mb-5">
        <SectionLabel>Movimiento</SectionLabel>
        <div className="grid grid-cols-2 gap-x-6 gap-y-3">
          <Field
            label="Monto original"
            value={<span className="font-semibold text-neutral-900">{formatCurrency(movement.original_amount, movement.currency)}</span>}
          />

          <Field
            label="Equivalente en ARS"
            value={<span className="font-semibold text-neutral-900">{formatCurrency(movement.ars_amount, "ARS")}</span>}
          />

          <Field label="Moneda" value={currency} />

          <Field label="Fecha" value={date} />

          <Field
            label="Tipo"
            value={
              <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium ${config.color}`}>
                {config.icon}
                {config.label}
              </span>
            }
          />

          <Field label="Creado" value={created} />

          <Field label="Tasa de cambio" value={movement.exchange_rate ? movement.exchange_rate : "-"} />

          <Field label="Tipo de cambio" value={movement.rate_type ?? "-"} />

          <Field label="Cuenta" value={account?.name ?? "-"} />

          <Field label="Categoría" value={category?.name ?? "-"} />
        </div>

        {/* Lista de items */}
        <div>
          <p className="text-xs font-medium text-neutral-400 uppercase tracking-wide mb-3">Items</p>
          <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
            {items.length === 0 ? (
              <p className="text-sm text-neutral-400">Este grupo no tiene items.</p>
            ) : (
              items.map((item) => {
                return (
                  <div key={item.item_id} className="flex items-start justify-between p-2.5 rounded border border-neutral-200 bg-neutral-50">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-neutral-900 truncate">{item.item_name}</p>
                      <div className="flex gap-2 mt-1">
                        {item.item_brand && <p className="text-xs text-neutral-500">{item.item_brand}</p>}
                        {item.store_name && <p className="text-xs text-neutral-500">· {item.store_name}</p>}
                      </div>
                    </div>
                    <div className="ml-3 text-right shrink-0">
                      <p className="text-sm font-semibold text-neutral-900">{formatCurrency(item.price, currency)}</p>
                      <p className="text-xs text-neutral-500">x{item.quantity}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </>
  );
}

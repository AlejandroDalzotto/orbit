import { ArrowDownLeft, ArrowLeftRight, ArrowUpRight } from "lucide-react";
import { Movement, MovementType } from "../../../definitions/movements";
import { formatCurrency } from "../../../utils/format-currency";
import { useAccounts } from "../../../stores/accounts-store";
import { useCategories } from "../../../stores/categories-store";

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
  const config = movTypeConfig[movement.mov_type as MovementType];
  const date = new Date(movement.date).toLocaleDateString("es-AR");
  const created = new Date(movement.created_at).toLocaleString("es-AR");
  const currency = movement.currency ?? "ARS";

  const accounts = useAccounts();
  const account = accounts.find((acc) => acc.id === movement.account_id);

  const categories = useCategories();
  const category = categories.find((cat) => cat.id === movement.category_id);

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
      </div>
    </>
  );
}

import { ArrowDownLeft, ArrowLeftRight, ArrowUpRight } from "lucide-react";
import { formatCurrency } from "../../utils/format-currency";
import type { Account } from "../../definitions/accounts";

type MovType = "income" | "expense" | "transfer";
type RateType = "blue" | "oficial" | "mep" | "ccl" | "cripto" | null;

type Movement = {
  id: number;
  details: string;
  date: string;
  created_at: string;
  mov_type: MovType;
  currency: "ARS" | "USD";
  original_amount: number;
  ars_amount: number;
  exchange_rate: number | null;
  rate_type: RateType;
  account_id: number;
  category_id: number | null;
};

const MOCK_MOVEMENTS: Movement[] = [
  {
    id: 1,
    details: "Pago de servicios",
    date: "2026-03-15",
    created_at: "2026-03-15T10:00:00",
    mov_type: "expense",
    currency: "ARS",
    original_amount: 1500000,
    ars_amount: 1500000,
    exchange_rate: null,
    rate_type: null,
    account_id: 1,
    category_id: null,
  },
];

const movTypeConfig: Record<MovType, { label: string; icon: React.ReactNode; color: string }> = {
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

export default function AccountDetailsModal({ account }: { account: Account }) {
  const currency = account.currency ?? "ARS";
  const created = new Date(account.created_at).toLocaleDateString("es-AR");

  return (
    <>
      {/* Header */}
      <div className="mb-5 pr-6">
        <h3 className="text-base font-semibold text-neutral-900">{account.name}</h3>
        <p className="text-xs text-neutral-400">
          {account.acc_type ?? "-"} · {currency}
        </p>
      </div>

      {/* Datos de la cuenta */}
      <div className="mb-5">
        <SectionLabel>Cuenta</SectionLabel>
        <div className="grid grid-cols-2 gap-x-6 gap-y-3">
          <Field label="Balance actual" value={<span className="font-semibold text-neutral-900">{formatCurrency(account.balance, currency)}</span>} />
          <Field label="Balance inicial" value={formatCurrency(account.balance ?? 0, currency)} />
          <Field label="Moneda" value={currency} />
          <Field label="Fecha de creación" value={created} />
          {account.notes && (
            <div className="col-span-2">
              <Field label="Notas" value={account.notes} />
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-neutral-100 mb-5" />

      {/* Movimientos */}
      <div>
        <SectionLabel>Movimientos recientes</SectionLabel>
        <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
          {MOCK_MOVEMENTS.length === 0 ? (
            <p className="text-sm text-neutral-400">No hay movimientos registrados.</p>
          ) : (
            MOCK_MOVEMENTS.map((mov) => {
              const config = movTypeConfig[mov.mov_type];
              const date = new Date(mov.date).toLocaleDateString("es-AR");
              return (
                <div key={mov.id} className="flex items-center justify-between gap-3 px-3 py-2 rounded-md bg-neutral-50 border border-neutral-100">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium shrink-0 ${config.color}`}>
                      {config.icon}
                      {config.label}
                    </span>
                    <p className="text-sm text-neutral-700 truncate">{mov.details}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-medium text-neutral-900">{formatCurrency(mov.original_amount, mov.currency)}</p>
                    <p className="text-xs text-neutral-400">{date}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}

import { useMemo, useState } from "react";
import { ArrowDownLeft, ArrowUpRight, ArrowLeftRight, Eye, List, Pencil, Search, Trash2 } from "lucide-react";
import { ViewLayout } from "../layouts/view-layout";
import { useModalStore } from "../stores/modal-store";
import { formatCurrency } from "../utils/format-currency";
import { Movement, MovementType } from "../definitions/movements";
import { useMovements } from "../stores/movements-store";
import { AddMovementModal } from "../components/modals/movements/add-movement-modal";

type MovTypeConfig = {
  label: string;
  icon: React.ReactNode;
  color: string;
  statColor: string;
};

const MOV_TYPE_CONFIG: Record<MovementType, MovTypeConfig> = {
  income: {
    label: "Ingreso",
    icon: <ArrowDownLeft className="w-3.5 h-3.5" />,
    color: "text-emerald-600 bg-emerald-50",
    statColor: "text-emerald-600",
  },
  expense: {
    label: "Egreso",
    icon: <ArrowUpRight className="w-3.5 h-3.5" />,
    color: "text-red-500 bg-red-50",
    statColor: "text-red-500",
  },
  transfer: {
    label: "Transferencia",
    icon: <ArrowLeftRight className="w-3.5 h-3.5" />,
    color: "text-blue-500 bg-blue-50",
    statColor: "text-blue-500",
  },
};

const MovementItem = ({ movement }: { movement: Movement }) => {
  // const open = useModalStore((state) => state.open);
  const config = MOV_TYPE_CONFIG[movement.mov_type];
  const date = new Date(movement.date).toLocaleDateString("es-AR");

  return (
    <div className="bg-white shadow rounded px-4 py-3 flex items-center justify-between gap-3">
      <div className="flex items-center gap-3 min-w-0">
        {/* Tipo badge */}
        <span className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium shrink-0 ${config.color}`}>
          {config.icon}
          {config.label}
        </span>

        {/* Info */}
        <div className="min-w-0">
          <p className="font-medium text-neutral-800 truncate">{movement.details}</p>
          <p className="text-xs text-neutral-400">{date}</p>
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <p className="font-semibold text-neutral-900 text-sm">{formatCurrency(movement.original_amount, movement.currency)}</p>
        <div className="flex items-center gap-1">
          <button
            onClick={() => {}}
            className="p-1.5 rounded text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
            title="Ver detalles"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button onClick={() => {}} className="p-1.5 rounded text-neutral-400 hover:text-blue-600 hover:bg-blue-50 transition-colors" title="Editar">
            <Pencil className="w-4 h-4" />
          </button>
          <button onClick={() => {}} className="p-1.5 rounded text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors" title="Eliminar">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default function MovementsView() {
  const movements = useMovements();
  const [query, setQuery] = useState("");
  const open = useModalStore((s) => s.open);

  // Stats — calculados en ARS para consistencia entre monedas
  const stats = useMemo(() => {
    return movements.reduce(
      (acc, m) => {
        if (m.mov_type === "income") acc.income += m.ars_amount;
        if (m.mov_type === "expense") acc.expense += m.ars_amount;
        return acc;
      },
      { income: 0, expense: 0 },
    );
  }, [movements]);

  const net = stats.income - stats.expense;

  // Filtro por texto
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return movements;
    return movements.filter((m) => m.details.toLowerCase().includes(q));
  }, [movements, query]);

  return (
    <ViewLayout>
      <div className="w-full h-full grid grid-rows-[auto_1fr] gap-y-3">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <List className="w-5 h-5 text-neutral-700" />
                Movimientos
              </h2>
              <p className="text-sm text-neutral-500">Registros de ingresos, egresos y transferencias.</p>
            </div>
            <button
              onClick={() => open(<AddMovementModal />)}
              className="px-3 py-1 bg-blue-500 text-white text-sm cursor-pointer rounded hover:bg-blue-600"
            >
              Añadir movimiento
            </button>
          </div>

          {/* Stats */}
          <div className="bg-white shadow rounded px-4 py-3 grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-neutral-500">Ingresos</p>
              <p className={`text-lg font-semibold ${MOV_TYPE_CONFIG.income.statColor}`}>{formatCurrency(stats.income, "ARS")}</p>
            </div>
            <div>
              <p className="text-xs text-neutral-500">Egresos</p>
              <p className={`text-lg font-semibold ${MOV_TYPE_CONFIG.expense.statColor}`}>{formatCurrency(stats.expense, "ARS")}</p>
            </div>
            <div>
              <p className="text-xs text-neutral-500">Neto</p>
              <p className={`text-lg font-semibold ${net >= 0 ? MOV_TYPE_CONFIG.income.statColor : MOV_TYPE_CONFIG.expense.statColor}`}>
                {formatCurrency(net, "ARS")}
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="relative max-w-md">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-neutral-400" />
            </span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por descripción..."
              className="pl-10 pr-3 py-1.5 text-sm border rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>
        </div>

        {/* Lista */}
        <div className="space-y-2 overflow-y-auto" style={{ scrollbarGutter: "stable" }}>
          {filtered.length === 0 ? (
            <div className="bg-white shadow rounded p-4 text-sm text-neutral-500">
              {query ? "No se encontraron movimientos que coincidan." : "No hay movimientos registrados."}
            </div>
          ) : (
            filtered.map((movement) => <MovementItem key={movement.id} movement={movement} />)
          )}
        </div>
      </div>
    </ViewLayout>
  );
}

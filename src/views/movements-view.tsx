import { useMemo, useState } from "react";
import { Eye, Layers, List, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { ViewLayout } from "../layouts/view-layout";
import { useModalStore } from "../stores/modal-store";
import { formatCurrency } from "../utils/format-currency";
import { Movement } from "../definitions/movements";
import { useMovements } from "../stores/movements-store";
import { AddMovementModal } from "../components/modals/movements/add-movement-modal";
import { MovementDetailsModal } from "../components/modals/movements/movement-details-modal";
import { EditMovementModal } from "../components/modals/movements/edit-movement-modal";
import { DeleteMovementModal } from "../components/modals/movements/delete-movement-modal";
import { MOV_TYPE_CONFIG } from "../definitions/consts";
import { GroupCard } from "../components/group-card";
import { AddGroupModal } from "../components/modals/groups/add-group-modal";
import { useGroups } from "../stores/groups-stores";

const MovementItem = ({ movement }: { movement: Movement }) => {
  const open = useModalStore((state) => state.open);
  const config = MOV_TYPE_CONFIG[movement.mov_type];
  const date = new Date(movement.date).toLocaleDateString("es-AR");

  return (
    <div className="bg-white shadow rounded px-4 py-3 flex items-center justify-between gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <span className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium shrink-0 ${config.color}`}>
          {config.icon}
          {config.label}
        </span>
        <div className="min-w-0">
          <p className="font-medium text-neutral-800 truncate">{movement.details}</p>
          <p className="text-xs text-neutral-400">{date}</p>
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <p className="font-semibold text-neutral-900 text-sm">{formatCurrency(movement.original_amount, movement.currency)}</p>
        <div className="flex items-center gap-1">
          <button
            onClick={() => open(<MovementDetailsModal movement={movement} />)}
            className="p-1.5 rounded text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
            title="Ver detalles"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => open(<EditMovementModal movement={movement} />)}
            className="p-1.5 rounded text-neutral-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
            title="Editar"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => open(<DeleteMovementModal movement={movement} />)}
            className="p-1.5 rounded text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors"
            title="Eliminar"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default function MovementsView() {
  const movements = useMovements();
  const open = useModalStore((s) => s.open);
  const [query, setQuery] = useState("");
  const groups = useGroups();

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

  // filter movements by input query
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return movements;
    return movements.filter((m) => m.details.toLowerCase().includes(q));
  }, [movements, query]);

  // Grupos ordenados por cantidad de movimientos desc
  const sortedGroups = useMemo(() => [...groups].sort((a, b) => b.movements.length - a.movements.length), [groups]);

  return (
    <ViewLayout>
      <div className="w-full h-full grid grid-cols-[1fr_220px] gap-x-4">
        {/* ── Columna principal: movimientos ── */}
        <div className="grid grid-rows-[auto_1fr] gap-y-3 min-h-0">
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

        {/* ── Columna lateral: grupos ── */}
        <div className="grid grid-rows-[auto_1fr] gap-y-3 min-h-0">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-neutral-700 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-neutral-500" />
              Grupos
            </h3>
            <button
              onClick={() => open(<AddGroupModal movements={movements} />)}
              className="p-1 rounded text-neutral-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
              title="Nuevo grupo"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2 overflow-y-auto" style={{ scrollbarGutter: "stable" }}>
            {sortedGroups.length === 0 ? (
              <div className="bg-white shadow rounded p-3 text-xs text-neutral-400">No hay grupos creados.</div>
            ) : (
              sortedGroups.map((group) => <GroupCard key={group.id} group={group} />)
            )}
          </div>
        </div>
      </div>
    </ViewLayout>
  );
}

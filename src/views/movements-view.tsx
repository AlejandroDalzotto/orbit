import { SubmitEventHandler, useEffect, useMemo, useState } from "react";
import { ArrowDownLeft, ArrowUpRight, ArrowLeftRight, Eye, Layers, List, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { ViewLayout } from "../layouts/view-layout";
import { useModalStore } from "../stores/modal-store";
import { formatCurrency } from "../utils/format-currency";
import { Movement, MovementType } from "../definitions/movements";
import { useMovements } from "../stores/movements-store";
import { AddMovementModal } from "../components/modals/movements/add-movement-modal";
import { MovementDetailsModal } from "../components/modals/movements/movement-details-modal";
import { EditMovementModal } from "../components/modals/movements/edit-movement-modal";
import { DeleteMovementModal } from "../components/modals/movements/delete-movement-modal";

export type MovTypeConfig = {
  label: string;
  icon: React.ReactNode;
  color: string;
  statColor: string;
  lineColor: string;
};

export const MOV_TYPE_CONFIG: Record<MovementType, MovTypeConfig> = {
  income: {
    label: "Ingreso",
    icon: <ArrowDownLeft className="w-3.5 h-3.5" />,
    color: "text-emerald-600 bg-emerald-50",
    statColor: "text-emerald-600",
    lineColor: "#10b981",
  },
  expense: {
    label: "Egreso",
    icon: <ArrowUpRight className="w-3.5 h-3.5" />,
    color: "text-red-500 bg-red-50",
    statColor: "text-red-500",
    lineColor: "#ef4444",
  },
  transfer: {
    label: "Transferencia",
    icon: <ArrowLeftRight className="w-3.5 h-3.5" />,
    color: "text-blue-500 bg-blue-50",
    statColor: "text-blue-500",
    lineColor: "#3b82f6",
  },
};

// ---------------------------------------------------------------------------
// AddGroupModal
// ---------------------------------------------------------------------------

const AddGroupModal = ({ movements, onAdd }: { movements: Movement[]; onAdd: (group: AddGroup, movementIds: number[]) => Promise<void> }) => {
  const close = useModalStore((s) => s.close);
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const toggleMovement = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handler: SubmitEventHandler = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const group: AddGroup = {
      name: formData.get("name") as string,
      description: (formData.get("description") as string) || null,
    };
    await onAdd(group, Array.from(selected));
    close();
  };

  const sortedMovements = useMemo(() => [...movements].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()), [movements]);

  return (
    <>
      <h3 className="text-base font-semibold text-neutral-900 mb-1">Nuevo grupo</h3>
      <p className="text-xs text-neutral-400 mb-5">Agrupá movimientos relacionados bajo un mismo nombre.</p>

      <form onSubmit={handler}>
        {/* Info del grupo */}
        <div className="mb-5">
          <p className="text-xs font-medium text-neutral-400 uppercase tracking-wide mb-3">Información</p>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Nombre</label>
              <input
                name="name"
                type="text"
                required
                placeholder="Ej: Pagos de alquiler"
                className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Descripción</label>
              <input
                name="description"
                type="text"
                placeholder="Opcional..."
                className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
              />
            </div>
          </div>
        </div>

        <div className="border-t border-neutral-100 mb-5" />

        {/* Selección de movimientos */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-medium text-neutral-400 uppercase tracking-wide">Movimientos</p>
            {selected.size > 0 && (
              <span className="text-xs text-blue-600 font-medium">
                {selected.size} seleccionado{selected.size !== 1 ? "s" : ""}
              </span>
            )}
          </div>
          <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
            {sortedMovements.length === 0 ? (
              <p className="text-sm text-neutral-400">No hay movimientos disponibles.</p>
            ) : (
              sortedMovements.map((mov) => {
                const config = MOV_TYPE_CONFIG[mov.mov_type];
                const date = new Date(mov.date).toLocaleDateString("es-AR");
                const isSelected = selected.has(mov.id);
                return (
                  <div
                    key={mov.id}
                    onClick={() => toggleMovement(mov.id)}
                    className={`flex items-center justify-between gap-3 px-3 py-2 rounded-md border cursor-pointer transition-colors ${
                      isSelected ? "border-blue-300 bg-blue-50" : "border-neutral-100 bg-neutral-50 hover:bg-neutral-100"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleMovement(mov.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="shrink-0 accent-blue-600"
                      />
                      <span className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium shrink-0 ${config.color}`}>
                        {config.icon}
                      </span>
                      <p className="text-sm text-neutral-700 truncate">{mov.details}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-medium text-neutral-900">{formatCurrency(mov.original_amount, mov.currency)}</p>
                      <p className="text-xs text-neutral-400">{date}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={close}
            className="px-4 py-1.5 rounded-md text-sm text-neutral-600 border border-neutral-200 bg-white hover:bg-neutral-50 transition-colors"
          >
            Cancelar
          </button>
          <button type="submit" className="px-4 py-1.5 rounded-md text-sm bg-blue-600 text-white hover:bg-blue-700 transition-colors">
            Crear grupo
          </button>
        </div>
      </form>
    </>
  );
};

// ---------------------------------------------------------------------------
// GroupCard
// ---------------------------------------------------------------------------

const GroupCard = ({ group, onDelete }: { group: GroupWithMovements; onDelete: (id: number) => void }) => {
  const open = useModalStore((s) => s.open);

  return (
    <div
      onClick={() => open(<GroupDetailsModal group={group} />)}
      className="bg-white shadow rounded px-3 py-2.5 cursor-pointer hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-medium text-neutral-800 truncate">{group.name}</p>
          {group.description && <p className="text-xs text-neutral-400 truncate mt-0.5">{group.description}</p>}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(group.id);
          }}
          className="p-1 rounded text-neutral-300 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0"
          title="Eliminar grupo"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
      <p className="text-xs text-neutral-400 mt-2">
        {group.movements.length} movimiento{group.movements.length !== 1 ? "s" : ""}
      </p>
    </div>
  );
};

// ---------------------------------------------------------------------------
// MovementItem
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// MovementsView
// ---------------------------------------------------------------------------

import { useRef } from "react";
import { LineSeries } from "lightweight-charts";
import { AddGroup, GroupWithMovements } from "../definitions/groups";
import { addGroup, deleteGroup, getGroups } from "../commands/groups";
import { GroupDetailsModal } from "../components/modals/groups/group-details-modal";

export default function MovementsView() {
  const movements = useMovements();
  const open = useModalStore((s) => s.open);
  const [query, setQuery] = useState("");
  const [groups, setGroups] = useState<GroupWithMovements[]>([]);

  useEffect(() => {
    getGroups().then(setGroups);
  }, []);

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

  const handleAddGroup = async (group: AddGroup, movementIds: number[]) => {
    const created = await addGroup(group, movementIds);
    setGroups((prev) => [...prev, created]);
  };

  const handleDeleteGroup = async (id: number) => {
    await deleteGroup(id);
    setGroups((prev) => prev.filter((g) => g.id !== id));
  };

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
              onClick={() => open(<AddGroupModal movements={movements} onAdd={handleAddGroup} />)}
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
              sortedGroups.map((group) => <GroupCard key={group.id} group={group} onDelete={handleDeleteGroup} />)
            )}
          </div>
        </div>
      </div>
    </ViewLayout>
  );
}

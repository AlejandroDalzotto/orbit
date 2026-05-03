import { SubmitEventHandler, useMemo, useState } from "react";
import { useModalStore } from "../../../stores/modal-store";
import { useMovements } from "../../../stores/movements-store";
import { formatCurrency } from "../../../utils/format-currency";
import { GroupWithMovements, UpdateGroup } from "../../../definitions/groups";
import { useGroupActions } from "../../../stores/groups-stores";
import { MOV_TYPE_CONFIG } from "../../../definitions/consts";

export function EditGroupModal({ group }: { group: GroupWithMovements }) {
  const close = useModalStore((s) => s.close);
  const { updateGroup } = useGroupActions();
  const movements = useMovements();

  // Inicializar con los movimientos ya asociados al grupo
  const [selected, setSelected] = useState<Set<number>>(new Set(group.movements.map((m) => m.id)));

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
    const data: UpdateGroup = {
      name: formData.get("name") as string,
      description: (formData.get("description") as string) || null,
      movement_ids: Array.from(selected),
    };
    await updateGroup(group.id, data);
    close();
  };

  const sortedMovements = useMemo(() => [...movements].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()), [movements]);

  return (
    <>
      <h3 className="text-base font-semibold text-neutral-900 mb-1">Editar grupo</h3>
      <p className="text-xs text-neutral-400 mb-5">
        Modificá los datos de <span className="font-medium text-neutral-600">{group.name}</span>.
      </p>

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
                defaultValue={group.name}
                className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Descripción</label>
              <input
                name="description"
                type="text"
                defaultValue={group.description ?? ""}
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
            Guardar cambios
          </button>
        </div>
      </form>
    </>
  );
}

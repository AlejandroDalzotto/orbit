import { Pencil, Trash2 } from "lucide-react";
import { GroupWithMovements } from "../definitions/groups";
import { useModalStore } from "../stores/modal-store";
import { GroupDetailsModal } from "./modals/groups/group-details-modal";
import { useGroupActions } from "../stores/groups-stores";
import { EditGroupModal } from "./modals/groups/update-group-modal";

export const GroupCard = ({ group }: { group: GroupWithMovements }) => {
  const open = useModalStore((s) => s.open);
  const { deleteGroup } = useGroupActions();

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
            open(<EditGroupModal group={group} />);
          }}
          className="p-1 rounded text-neutral-300 hover:text-blue-600 hover:bg-blue-50 transition-colors shrink-0"
          title="Editar grupo"
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            deleteGroup(group.id);
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

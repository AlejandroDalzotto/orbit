import { Item } from "../../../definitions/items";
import { useGlobalStore } from "../../../stores/global-data-store";
import { useModalStore } from "../../../stores/modal-store";

/**
 * Este es un modal de confirmación que recibe un item como prop y pregunta al usuario si está seguro de eliminarlo.
 */
export function DeleteItemModal({ item }: { item: Item }) {
  const close = useModalStore((state) => state.close);
  const deleteItem = useGlobalStore((state) => state.deleteItem);

  const handler = async (item: Item) => {
    await deleteItem(item.id);
  };

  return (
    <>
      <h3 className="text-base font-semibold text-neutral-900 mb-1">Borrar Item</h3>
      <p className="text-xs text-neutral-400 mb-1 truncate max-w-[80%]">¿Estás seguro de que quieres borrar {item.name}?</p>
      <p className="text-xs text-neutral-400 mb-5">Esta acción no se puede deshacer.</p>

      {/* Acciones */}
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={close}
          className="px-4 py-1.5 rounded-md text-sm text-neutral-600 border border-neutral-200 bg-white hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-colors"
        >
          Cancelar
        </button>
        <button
          onClick={() => {
            handler(item);
            close();
          }}
          type="submit"
          className="px-4 py-1.5 rounded-md text-sm bg-red-600 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-300 transition-colors"
        >
          Confirmar
        </button>
      </div>
    </>
  );
}

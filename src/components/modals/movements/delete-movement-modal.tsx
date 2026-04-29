import type { Movement } from "../../../definitions/movements";
import { useMovementActions } from "../../../stores/movements-store";
import { useModalStore } from "../../../stores/modal-store";
import { useAccountActions } from "../../../stores/accounts-store";
import { useCategoryActions } from "../../../stores/categories-store";

/**
 * Este es un modal de confirmación que recibe un movimiento como prop y pregunta al usuario si está seguro de eliminarlo.
 */
export function DeleteMovementModal({ movement }: { movement: Movement }) {
  const close = useModalStore((state) => state.close);
  const { deleteMovement } = useMovementActions();

  const { initialize: initializeAccounts } = useAccountActions();
  const { initialize: initializeCategories } = useCategoryActions();

  const handler = async (movement: Movement) => {
    await deleteMovement(movement.id);

    await initializeAccounts();
    await initializeCategories();
  };

  return (
    <>
      <h3 className="text-base font-semibold text-neutral-900 mb-1">Borrar movimiento</h3>
      <p className="text-xs text-neutral-400 mb-5">¿Estás seguro de que quieres borrar este movimiento?</p>

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
            handler(movement);
            close();
          }}
          type="submit"
          className="px-4 py-1.5 rounded-md text-sm bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-colors"
        >
          Borrar movimiento
        </button>
      </div>
    </>
  );
}

import { SubmitEventHandler } from "react";
import { useAccountActions } from "../../../stores/accounts-store";
import { useCategories, useCategoryActions } from "../../../stores/categories-store";
import { useModalStore } from "../../../stores/modal-store";
import { useMovementActions } from "../../../stores/movements-store";
import { Currency, Movement, MovementType, UpdateMovement } from "../../../definitions/movements";

export function EditMovementModal({ movement }: { movement: Movement }) {
  const close = useModalStore((s) => s.close);
  const { updateMovement } = useMovementActions();
  const { initialize: initializeCategories } = useCategoryActions();
  const { initialize: initializeAccounts } = useAccountActions();
  const categories = useCategories();

  const handler: SubmitEventHandler = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);

    const amountRaw = parseFloat((formData.get("original_amount") as string) || "0");
    const amountInCents = Math.round(amountRaw * 100);

    const categoryRaw = formData.get("category_id") as string;
    const category_id = categoryRaw ? parseInt(categoryRaw, 10) : null;

    const updatedEntry: UpdateMovement = {
      details: formData.get("details") as string,
      date: formData.get("date") as string,
      mov_type: formData.get("mov_type") as MovementType,
      currency: "ARS" as Currency,
      original_amount: amountInCents,
      ars_amount: amountInCents,
      exchange_rate: null,
      rate_type: null,
      category_id,
    };

    try {
      await updateMovement(movement.id, updatedEntry);

      if (category_id) {
        await initializeCategories();
      }

      await initializeAccounts();

      close();
    } catch (error) {
      // TODO: handle error on updateMovement failure.
    }
  };

  return (
    <>
      <h3 className="text-base font-semibold text-neutral-900 mb-1">Editar movimiento</h3>
      <p className="text-xs text-neutral-400 mb-5">Modificá los datos del movimiento.</p>

      <form onSubmit={handler}>
        {/* Sección: Información básica */}
        <div className="mb-5">
          <p className="text-xs font-medium text-neutral-400 uppercase tracking-wide mb-3">Información básica</p>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Descripción</label>
              <input
                name="details"
                type="text"
                required
                defaultValue={movement.details}
                placeholder="Ej: Compra supermercado"
                autoComplete="off"
                spellCheck={false}
                className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Fecha</label>
                <input
                  name="date"
                  type="date"
                  required
                  defaultValue={movement.date}
                  className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Tipo</label>
                <select
                  name="mov_type"
                  required
                  defaultValue={movement.mov_type}
                  className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
                >
                  {movement.mov_type === "transfer" ? (
                    <option value="transfer">Transferencia</option>
                  ) : (
                    <>
                      <option value="income">Ingreso</option>
                      <option value="expense">Egreso</option>
                    </>
                  )}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Monto</label>
                <input
                  name="original_amount"
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  defaultValue={(movement.original_amount / 100).toFixed(2)}
                  placeholder="0"
                  className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Divisor */}
        <div className="border-t border-neutral-100 mb-5" />

        {/* Sección: Detalles opcionales */}
        <div className="mb-6">
          <p className="text-xs font-medium text-neutral-400 uppercase tracking-wide mb-3">Detalles opcionales</p>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Categoría</label>
            <select
              name="category_id"
              defaultValue={movement.category_id ? String(movement.category_id) : ""}
              className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
            >
              <option value="">Sin categoría</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>

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
            type="submit"
            className="px-4 py-1.5 rounded-md text-sm bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-colors"
          >
            Guardar cambios
          </button>
        </div>
      </form>
    </>
  );
}

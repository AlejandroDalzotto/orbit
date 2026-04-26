import { useModalStore } from "../../../stores/modal-store";
import { useMovementActions } from "../../../stores/movements-store";
import { useAccounts } from "../../../stores/accounts-store";
import { useCategories } from "../../../stores/categories-store";
import type { AddMovement, MovementType, Currency } from "../../../definitions/movements";
import { SubmitEventHandler } from "react";

const today = () => new Date().toISOString().split("T")[0];

export function AddMovementModal() {
  const close = useModalStore((s) => s.close);
  const { addMovement } = useMovementActions();
  const accounts = useAccounts();
  const categories = useCategories();

  const handler: SubmitEventHandler = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    const amountRaw = parseFloat((formData.get("original_amount") as string) || "0");
    const amountInCents = Math.round(amountRaw * 100);

    const categoryRaw = formData.get("category_id") as string;
    const category_id = categoryRaw ? parseInt(categoryRaw, 10) : null;

    const newEntry: AddMovement = {
      details: formData.get("details") as string,
      date: formData.get("date") as string,
      mov_type: formData.get("mov_type") as MovementType,
      currency: "ARS" as Currency,
      original_amount: amountInCents,
      ars_amount: amountInCents, // ARS: original_amount == ars_amount
      exchange_rate: null,
      rate_type: null,
      account_id: parseInt(formData.get("account_id") as string, 10),
      category_id,
    };

    await addMovement(newEntry);
    close();
  };

  return (
    <>
      <h3 className="text-base font-semibold text-neutral-900 mb-1">Nuevo movimiento</h3>
      <p className="text-xs text-neutral-400 mb-5">Completá los datos para agregar un movimiento.</p>

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
                  defaultValue={today()}
                  className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Tipo</label>
                <select
                  name="mov_type"
                  required
                  className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
                >
                  <option value="income">Ingreso</option>
                  <option value="expense">Egreso</option>
                  <option value="transfer">Transferencia</option>
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
                  placeholder="0"
                  className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Cuenta</label>
                <select
                  name="account_id"
                  required
                  className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
                >
                  {accounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.name}
                    </option>
                  ))}
                </select>
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
            Agregar movimiento
          </button>
        </div>
      </form>
    </>
  );
}

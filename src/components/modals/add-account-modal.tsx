import { SubmitEventHandler } from "react";
import { addAccount, AddAccount } from "../../commands/accounts";
import { useModalStore } from "../../stores/modal-store";

export function AddAccountModal() {
  const close = useModalStore((state) => state.close);

  const handler: SubmitEventHandler = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const initialBalance = parseFloat(formData.get("balance") as string) || 0;
    const newEntry: AddAccount = {
      name: formData.get("name") as string,
      acc_type: formData.get("acc_type") as string,
      currency: formData.get("currency") as string,
      initial_balance: initialBalance,
      notes: formData.get("notes") as string,
    };
    await addAccount(newEntry);
    close();
  };

  return (
    <>
      <h3 className="text-base font-semibold text-neutral-900 mb-1">Nueva cuenta</h3>
      <p className="text-xs text-neutral-400 mb-5">Completá los datos para agregar una cuenta.</p>

      <form onSubmit={handler}>
        {/* Sección: Información básica */}
        <div className="mb-5">
          <p className="text-xs font-medium text-neutral-400 uppercase tracking-wide mb-3">Información básica</p>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Nombre</label>
              <input
                autoComplete="off"
                spellCheck={false}
                type="text"
                name="name"
                placeholder="Ej: Cuenta corriente"
                className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Moneda</label>
                <select
                  name="currency"
                  className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
                >
                  <option>ARS</option>
                  <option>USD</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Tipo</label>
                {/* TODO: check for options. */}
                <select
                  name="acc_type"
                  className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
                >
                  <option>Banco</option>
                  <option>Tarjeta Debito</option>
                  <option>Tarjeta Credito</option>
                  <option>Criptomoneda</option>
                  <option>Efectivo</option>
                  <option>Billetera virtual</option>
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
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Balance inicial</label>
              <input
                name="balance"
                type="number"
                placeholder="0"
                className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Notas</label>
              <input
                autoComplete="off"
                spellCheck={false}
                name="notes"
                type="text"
                placeholder="Alguna nota sobre esta cuenta..."
                className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
              />
            </div>
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
            Agregar cuenta
          </button>
        </div>
      </form>
    </>
  );
}

import { SubmitEventHandler } from "react";
import { useModalStore } from "../../../stores/modal-store";
import { AddItem } from "../../../definitions/items";
import { useGlobalStore } from "../../../stores/global-data-store";

export function AddItemModal() {
  const close = useModalStore((state) => state.close);
  const addItem = useGlobalStore((state) => state.addItem);

  const handler: SubmitEventHandler = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newEntry: AddItem = {
      name: formData.get("name") as string,
      brand: formData.get("brand") as string | null,
    };
    console.log({ new_item: newEntry });
    await addItem(newEntry);
    close();
  };

  return (
    <>
      <h3 className="text-base font-semibold text-neutral-900 mb-1">Nuevo item</h3>
      <p className="text-xs text-neutral-400 mb-5">Completá los datos para registrar un item en el sistema.</p>

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
                placeholder="Ej: Galletas dulces, Detergente, Pasta dental..."
                className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
              />
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
              <label className="block text-sm font-medium text-neutral-700 mb-1">Marca</label>
              <input
                name="brand"
                type="text"
                placeholder="Ej: Magistral, Coca Cola, Colgate..."
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
            Agregar item
          </button>
        </div>
      </form>
    </>
  );
}

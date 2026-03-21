import { deleteAccount } from "../../commands/accounts";
import type { Account } from "../../definitions/accounts";
import { useModalStore } from "../../stores/modal-store";

const handler = async (account: Account) => {
  await deleteAccount(account.id);
};

/**
 * Este es un modal de confirmación que recibe una cuenta como prop y pregunta al usuario si está seguro de eliminarla.
 */
export function DeleteAccountModal({ account }: { account: Account }) {
  const close = useModalStore((state) => state.close);

  return (
    <>
      <h3 className="text-base font-semibold text-neutral-900 mb-1">Borrar cuenta</h3>
      <p className="text-xs text-neutral-400 mb-5">¿Estás seguro de que quieres borrar esta cuenta?</p>

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
            handler(account);
            close();
          }}
          type="submit"
          className="px-4 py-1.5 rounded-md text-sm bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-colors"
        >
          Borrar cuenta
        </button>
      </div>
    </>
  );
}

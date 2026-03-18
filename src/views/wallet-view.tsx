import { FormEvent, SubmitEventHandler, useEffect, useMemo, useState } from "react";
import { Account, AddAccount, addAccount, deleteAccount, getAccounts } from "../commands/accounts";
import { ViewLayout } from "../layouts/view-layout";
import { Pencil, Search, Trash2, Wallet } from "lucide-react";
import Modal from "../components/modal";

const formatCurrency = (valueInCents: number, currency?: string) => {
  const value = valueInCents / 100;
  const curr = currency === "USD" ? "USD" : "ARS";
  const locale = curr === "USD" ? "en-US" : "es-AR";
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: curr,
    }).format(value);
  } catch {
    return `${value.toFixed(2)} ${curr}`;
  }
};

const AccountItem = ({
  account,
  onEdit,
  onDelete,
}: {
  account: Account;
  onEdit: (account: Account) => void;
  onDelete: (account: Account) => void;
}) => {
  const created = new Date(account.created_at).toLocaleDateString("es-AR");
  const currency = account.currency ?? "ARS";
  return (
    <div className="bg-white shadow rounded px-4 py-3 flex items-center justify-between gap-3">
      <div className="flex items-center gap-4 min-w-0">
        <div className="min-w-0">
          <p className="font-medium text-neutral-800 truncate">{account.name}</p>
          <p className="text-xs text-neutral-400">
            {account.acc_type ?? "-"} · Creado: {created}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <p className="font-semibold text-neutral-900 text-sm">{formatCurrency(account.balance, currency)}</p>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(account)}
            className="p-1.5 rounded text-neutral-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
            title="Editar"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(account)}
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

const AddAccountModal = ({ onClose, onSubmit }: { onClose: () => void; onSubmit: SubmitEventHandler }) => (
  <Modal onClose={onClose}>
    <h3 className="text-base font-semibold text-neutral-900 mb-1">Nueva cuenta</h3>
    <p className="text-xs text-neutral-400 mb-5">Completá los datos para agregar una cuenta.</p>

    <form onSubmit={onSubmit}>
      {/* Sección: Información básica */}
      <div className="mb-5">
        <p className="text-xs font-medium text-neutral-400 uppercase tracking-wide mb-3">Información básica</p>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Nombre</label>
            <input
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
          onClick={onClose}
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
  </Modal>
);

export default function WalletView() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [query, setQuery] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  useEffect(() => {
    getAccounts().then(setAccounts);
  }, []);

  const filteredAccounts = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return accounts;
    return accounts.filter((a) => (a.name ?? "").toLowerCase().includes(q));
  }, [accounts, query]);

  const totalsByCurrency = useMemo(() => {
    return accounts.reduce(
      (acc, account) => {
        const curr = account.currency;
        acc[curr] = (acc[curr] ?? 0) + account.balance;
        return acc;
      },
      {} as Record<string, number>,
    );
  }, [accounts]);

  const handleAddAccount: SubmitEventHandler = async (e) => {
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
    const newAccounts = await getAccounts();
    setAccounts(newAccounts);
    setIsModalOpen(false);
  };

  const handleEditAccount = (account: Account) => {
    // TODO
  };

  const handleDeleteAccount = async (account: Account) => {
    await deleteAccount(account.id);
    const newAccounts = await getAccounts();
    setAccounts(newAccounts);
  };

  return (
    <ViewLayout>
      {isModalOpen && <AddAccountModal onClose={() => setIsModalOpen(false)} onSubmit={handleAddAccount} />}

      <div className="w-full h-full grid grid-rows-[auto_1fr] gap-y-3">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Wallet className="w-5 h-5 text-neutral-700" />
                Billetera
              </h2>
              <p className="text-sm text-neutral-500">Resumen de tus cuentas y balances.</p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-3 py-1 bg-blue-500 text-white text-sm cursor-pointer rounded hover:bg-blue-600"
            >
              Añadir cuenta
            </button>
          </div>

          {/* Totals */}
          <div className="bg-white shadow rounded px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <p className="text-xs text-neutral-500">Cuentas</p>
              <p className="text-2xl font-semibold">{accounts.length}</p>
            </div>
            <div>
              {Object.entries(totalsByCurrency).length === 0 ? (
                <p className="text-sm text-neutral-500">No hay balances por moneda</p>
              ) : (
                <div>
                  <p className="text-xs text-neutral-500 mb-1">Total por moneda</p>
                  <div className="flex gap-2">
                    {Object.entries(totalsByCurrency).map(([currency, total]) => (
                      <div key={currency} className="px-3 py-1.5 bg-gray-50 rounded">
                        <p className="text-xs text-gray-500">{currency}</p>
                        <p className="font-medium text-sm">{formatCurrency(total, currency)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
              placeholder="Buscar cuenta por nombre..."
              className="pl-10 pr-3 py-1.5 text-sm border rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>
        </div>

        {/* Accounts List */}
        <div className="space-y-2 overflow-y-auto" style={{ scrollbarGutter: "stable" }}>
          {filteredAccounts.length === 0 ? (
            <div className="bg-white shadow rounded p-4 text-sm text-neutral-500">No se encontraron cuentas que coincidan.</div>
          ) : (
            filteredAccounts.map((account) => (
              <AccountItem key={account.id} account={account} onEdit={handleEditAccount} onDelete={handleDeleteAccount} />
            ))
          )}
        </div>
      </div>
    </ViewLayout>
  );
}

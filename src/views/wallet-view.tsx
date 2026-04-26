import { useMemo, useState } from "react";
import { ViewLayout } from "../layouts/view-layout";
import { Eye, Pencil, Trash2, Wallet } from "lucide-react";
import { formatCurrency } from "../utils/format-currency";
import { useModalStore } from "../stores/modal-store";
import { AddAccountModal } from "../components/modals/accounts/add-account-modal";
import { EditAccountModal } from "../components/modals/accounts/edit-account-modal";
import { DeleteAccountModal } from "../components/modals/accounts/delete-account-modal";
import AccountDetailsModal from "../components/modals/accounts/account-details-modal";
import { Account } from "../definitions/accounts";
import { useAccounts } from "../stores/accounts-store";
import { SearchInput } from "../components/search-input";

const AccountItem = ({ account }: { account: Account }) => {
  const open = useModalStore((state) => state.open);
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
            onClick={() => open(<AccountDetailsModal account={account} />)}
            className="p-1.5 rounded text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
            title="Ver detalles"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => open(<EditAccountModal account={account} />)}
            className="p-1.5 rounded text-neutral-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
            title="Editar"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => open(<DeleteAccountModal account={account} />)}
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

export default function WalletView() {
  const accounts = useAccounts();
  const [query, setQuery] = useState<string>("");
  const open = useModalStore((state) => state.open);

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

  return (
    <ViewLayout>
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
              onClick={() => open(<AddAccountModal />)}
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
          <SearchInput value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar cuenta por nombre..." />
        </div>

        {/* Accounts List */}
        <div className="space-y-2 overflow-y-auto" style={{ scrollbarGutter: "stable" }}>
          {filteredAccounts.length === 0 ? (
            <div className="bg-white shadow rounded p-4 text-sm text-neutral-500">No se encontraron cuentas que coincidan.</div>
          ) : (
            filteredAccounts.map((account) => <AccountItem key={account.id} account={account} />)
          )}
        </div>
      </div>
    </ViewLayout>
  );
}

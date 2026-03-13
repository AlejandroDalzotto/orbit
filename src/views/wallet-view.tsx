import { useEffect, useMemo, useState } from "react";
import { Account, getAccountBalanceById, getAccounts } from "../commands/accounts";
import { ViewLayout } from "../layouts/view-layout";
import { Search, Wallet } from "lucide-react";

const AccountItem = ({ account }: { account: Account }) => {
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    getAccountBalanceById(account.id).then(setBalance);
  }, []);

  const formatCurrency = (value: number, currency?: string) => {
    const curr = currency === "USD" ? "USD" : "ARS";
    const locale = curr === "USD" ? "en-US" : "es-AR";
    try {
      return new Intl.NumberFormat(locale, { style: "currency", currency: curr }).format(value);
    } catch {
      return `${value.toFixed(2)} ${curr}`;
    }
  };

  const created = new Date(account.created_at).toLocaleDateString("es-AR");
  const currency = account.currency ?? "ARS";
  return (
    <div key={account.id} className="bg-white shadow rounded p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div>
        <p className="text-sm text-gray-500">Nombre</p>
        <p className="font-medium text-gray-800">{account.name}</p>

        <div className="mt-2">
          <p className="text-sm text-gray-500">Tipo</p>
          <p className="text-sm text-gray-700">{account.acc_type ?? "-"}</p>
        </div>
      </div>

      <div className="text-left sm:text-right">
        <p className="text-sm text-gray-500">Balance</p>
        <p className="font-semibold text-gray-900">{formatCurrency(balance, currency)}</p>

        <p className="text-xs text-gray-400 mt-1">Creado: {created}</p>
      </div>
    </div>
  );
};

export default function WalletView() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [query, setQuery] = useState<string>("");

  useEffect(() => {
    getAccounts().then(setAccounts);
  }, []);

  const filteredAccounts = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return accounts;
    return accounts.filter((a) => (a.name ?? "").toLowerCase().includes(q));
  }, [accounts, query]);

  return (
    <ViewLayout>
      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
          <Wallet className="w-5 h-5 text-gray-700" />
          Billetera
        </h2>
        <p className="text-sm text-gray-600">Resumen de tus cuentas y balances.</p>
      </div>

      {/* Metadata / Totals */}
      <div className="bg-white shadow rounded p-4 mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="text-sm text-gray-500">Cuentas</p>
            <p className="text-2xl font-semibold">{accounts.length}</p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div>
              <p className="text-sm text-gray-500">Total (por moneda)</p>
              <div className="flex gap-3 mt-1">
                <div className="px-3 py-2 bg-gray-50 rounded">
                  <p className="text-xs text-gray-500">ARS</p>
                  {/*<p className="font-medium">{formatCurrency(totalsByCurrency["ARS"] ?? 0, "ARS")}</p>*/}
                </div>
                <div className="px-3 py-2 bg-gray-50 rounded">
                  <p className="text-xs text-gray-500">USD</p>
                  {/*<p className="font-medium">{formatCurrency(totalsByCurrency["USD"] ?? 0, "USD")}</p>*/}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search / Filter */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Filtrar por nombre</label>
        <div className="relative max-w-md">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="w-4 h-4 text-gray-400" />
          </span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar cuenta por nombre..."
            className="pl-10 pr-3 py-2 border rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </div>
      </div>

      {/* Accounts List */}
      <div className="space-y-3">
        {filteredAccounts.length === 0 ? (
          <div className="bg-white shadow rounded p-4 text-gray-600">No se encontraron cuentas que coincidan.</div>
        ) : (
          filteredAccounts.map((account) => {
            return <AccountItem key={account.id} account={account} />;
          })
        )}
      </div>
    </ViewLayout>
  );
}

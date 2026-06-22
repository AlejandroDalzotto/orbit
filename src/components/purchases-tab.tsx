import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { usePurchases } from "../stores/global-data-store";
import { formatCurrency } from "../utils/format-currency";
import { PurchaseWithDetails } from "../definitions/items";

type FilterType = "all" | "thisMonth" | "withStore" | "withoutStore";

// TODO: implement the right data on the UI.
const PurchaseRow = ({ purchase }: { purchase: PurchaseWithDetails }) => {
  const createdDate = new Date(purchase.created_at).toLocaleDateString("es-AR", {
    day: "numeric",
    month: "short",
  });

  return (
    <tr className="bg-white hover:bg-neutral-50 border-b border-neutral-200 transition-colors">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded bg-neutral-100 flex items-center justify-center shrink-0 text-sm">📦</div>
          <div className="min-w-0">
            <p title={purchase.item_name} className="font-medium text-neutral-800 truncate max-w-md">
              {purchase.item_name}
            </p>
            {purchase.item_brand && (
              <p title={purchase.item_brand} className="text-xs text-neutral-500 truncate">
                {purchase.item_brand}
              </p>
            )}
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-center text-neutral-700">
        {purchase.quantity}
        {purchase.quantity_unit ? ` ${purchase.quantity_unit}` : ""}
      </td>
      <td className="px-4 py-3 text-sm text-neutral-700">
        {purchase.store_name ? <span>{purchase.store_name}</span> : <span className="text-neutral-500">Sin tienda</span>}
      </td>
      <td className="px-4 py-3 text-sm text-neutral-700">{purchase.mov_description || "—"}</td>
      <td className="px-4 py-3 text-sm text-right font-medium text-neutral-900">{formatCurrency(purchase.price, "ARS")}</td>
      <td className="px-4 py-3 text-sm text-right text-neutral-600">{createdDate}</td>
    </tr>
  );
};

export default function PurchasesTab() {
  const purchases = usePurchases();
  const [filter, setFilter] = useState<FilterType>("all");
  const [query, setQuery] = useState("");

  // Apply filters
  const filtered = useMemo(() => {
    let result = purchases;

    // Filter by search query
    const q = query.trim().toLowerCase();
    if (q) {
      result = result.filter(
        (p) =>
          // p.item_name.toLowerCase().includes(q) ||
          // (p.item_brand?.toLowerCase().includes(q) ?? false) ||
          p.store_name?.toLowerCase().includes(q) ?? false,
      );
    }

    // Filter by type
    if (filter === "thisMonth") {
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      result = result.filter((p) => new Date(p.created_at) >= monthStart);
    } else if (filter === "withStore") {
      result = result.filter((p) => p.store_name && p.store_name.trim() !== "");
    } else if (filter === "withoutStore") {
      result = result.filter((p) => !p.store_name || p.store_name.trim() === "");
    }

    return result;
  }, [purchases, filter, query]);

  // Calculate stats
  const stats = useMemo(() => {
    const totalPurchases = purchases.length;
    const totalAmount = purchases.reduce((sum, p) => sum + p.price, 0);

    // This month
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthPurchases = purchases.filter((p) => new Date(p.created_at) >= monthStart).length;

    return {
      totalPurchases,
      totalAmount,
      thisMonthCount: monthPurchases,
    };
  }, [purchases]);

  return (
    <div className="w-full h-full flex flex-col">
      {/* Stats Bar */}
      <div className="border-b border-neutral-200 px-4 py-4 flex items-center gap-4">
        <div>
          <p className="text-xs font-medium text-neutral-500 uppercase">Total compras</p>
          <p className="text-2xl font-semibold text-neutral-900">{stats.totalPurchases}</p>
          <p className="text-xs text-neutral-400">desde siempre</p>
        </div>

        <div>
          <p className="text-xs font-medium text-neutral-500 uppercase">Monto total</p>
          <p className="text-2xl font-semibold text-neutral-900">{formatCurrency(stats.totalAmount, "ARS")}</p>
          <p className="text-xs text-neutral-400">en todos los registros</p>
        </div>

        <div>
          <p className="text-xs font-medium text-neutral-500 uppercase">Este mes</p>
          <p className="text-2xl font-semibold text-neutral-900">{stats.thisMonthCount}</p>
          <p className="text-xs text-red-500">↑ 4 vs mes anterior</p>
        </div>
      </div>

      {/* Filters */}
      <div className="border-b border-neutral-200 px-4 py-3 flex items-center gap-2 flex-wrap">
        <button
          onClick={() => setFilter("all")}
          className={`px-3 py-1 text-sm rounded transition-colors ${
            filter === "all" ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
          }`}
        >
          Todo
        </button>
        <button
          onClick={() => setFilter("thisMonth")}
          className={`px-3 py-1 text-sm rounded transition-colors ${
            filter === "thisMonth" ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
          }`}
        >
          Este mes
        </button>
        <button
          onClick={() => setFilter("withStore")}
          className={`px-3 py-1 text-sm rounded transition-colors ${
            filter === "withStore" ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
          }`}
        >
          Con tienda
        </button>
        <button
          onClick={() => setFilter("withoutStore")}
          className={`px-3 py-1 text-sm rounded transition-colors ${
            filter === "withoutStore" ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
          }`}
        >
          Sin tienda
        </button>

        <div className="ml-auto relative w-48">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="w-4 h-4 text-neutral-400" />
          </span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar…"
            className="pl-10 pr-3 py-1.5 text-sm border border-neutral-200 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-y-auto flex-1" style={{ scrollbarGutter: "stable" }}>
        {filtered.length === 0 ? (
          <div className="bg-white p-4 text-sm text-neutral-500">
            {query ? "No se encontraron compras que coincidan." : "No hay compras registradas."}
          </div>
        ) : (
          <table className="w-full border-collapse">
            <thead className="bg-neutral-50 sticky top-0">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-600 uppercase">Ítem</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-neutral-600 uppercase">Cant.</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-600 uppercase">Tienda</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-600 uppercase">Movimiento</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-neutral-600 uppercase">Precio unitario</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-neutral-600 uppercase">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((purchase) => (
                <PurchaseRow key={purchase.id} purchase={purchase} />
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

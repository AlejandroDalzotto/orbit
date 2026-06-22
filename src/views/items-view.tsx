import { useMemo, useState } from "react";
import { Eye, Pencil, Search, Trash2 } from "lucide-react";
import { ViewLayout } from "../layouts/view-layout";
import { useModalStore } from "../stores/modal-store";
import { Item } from "../definitions/items";
import { formatCurrency } from "../utils/format-currency";
import { DeleteItemModal } from "../components/modals/items/delete-item-modal";
import { AddItemModal } from "../components/modals/items/add-item-modal";
import PurchasesTab from "../components/purchases-tab";
import StoresTab from "../components/stores-tab";
import { useItems } from "../stores/global-data-store";

const ItemRow = ({ item }: { item: Item }) => {
  const open = useModalStore((state) => state.open);
  const createdDate = new Date(item.created_at).toLocaleDateString("es-AR");

  return (
    <tr className="bg-white hover:bg-neutral-50 border-b border-neutral-200 transition-colors">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded bg-neutral-100 flex items-center justify-center shrink-0 text-sm">📦</div>
          <div className="min-w-0">
            <p title={item.name} className="font-medium text-neutral-800 truncate max-w-2xs">
              {item.name}
            </p>
            <div className="flex items-center gap-x-0.5">
              {item.brand && (
                <p title={item.brand} className="text-xs text-neutral-500 truncate">
                  {item.brand}
                </p>
              )}
              {/* separator when both values are present */}
              {Boolean(item.brand) && Boolean(item.last_purchased_at) ? <p className="text-xs text-neutral-500">•</p> : null}
              {item.last_purchased_at && (
                <p title={item.last_purchased_at} className="text-xs text-neutral-500 truncate">
                  {item.last_purchased_at}
                </p>
              )}
            </div>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-neutral-700">{item.purchase_count}</td>
      <td className="px-4 py-3 text-sm text-neutral-700">
        {item.last_price_registered !== undefined ? formatCurrency(item.last_price_registered) : "—"}
      </td>
      <td className="px-4 py-3 text-sm text-neutral-600">{createdDate}</td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1 justify-end">
          <button
            onClick={() => open(<ItemDetailsModal item={item} />)}
            className="p-1.5 rounded text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
            title="Ver detalles"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => open(<EditItemModal item={item} />)}
            className="p-1.5 rounded text-neutral-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
            title="Editar"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => open(<DeleteItemModal item={item} />)}
            className="p-1.5 rounded text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors"
            title="Eliminar"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
};

// Placeholder modal components
const ItemDetailsModal = ({ item }: { item: Item }) => (
  <div className="p-4 bg-white rounded shadow">
    <h3 className="font-semibold">{item.name}</h3>
    <p className="text-sm text-neutral-600">{item.brand}</p>
  </div>
);

const EditItemModal = ({ item }: { item: Item }) => (
  <div className="p-4 bg-white rounded shadow">
    <h3 className="font-semibold">Editar: {item.name}</h3>
  </div>
);

export default function ItemsView() {
  const items = useItems();
  const open = useModalStore((s) => s.open);
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"items" | "stores" | "purchases">("items");

  // Filter items by name or brand
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => item.name.toLowerCase().includes(q) || (item.brand?.toLowerCase().includes(q) ?? false));
  }, [items, query]);

  // Stats
  const stats = useMemo(
    () => ({
      totalItems: items.length,
      totalStores: 12, // Placeholder
      totalPurchases: 45, // Placeholder
    }),
    [items],
  );

  return (
    <ViewLayout>
      <div className="w-full h-full grid grid-rows-[auto_auto_1fr] gap-y-0">
        {/* ── Tabs ── */}
        <div className="border-b border-neutral-200 flex items-center gap-0 px-4">
          <button
            onClick={() => setActiveTab("items")}
            className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
              activeTab === "items" ? "border-blue-500 text-blue-600" : "border-transparent text-neutral-600 hover:text-neutral-900"
            }`}
          >
            Ítems
          </button>
          <button
            onClick={() => setActiveTab("stores")}
            className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
              activeTab === "stores" ? "border-blue-500 text-blue-600" : "border-transparent text-neutral-600 hover:text-neutral-900"
            }`}
          >
            Tiendas
          </button>
          <button
            onClick={() => setActiveTab("purchases")}
            className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
              activeTab === "purchases" ? "border-blue-500 text-blue-600" : "border-transparent text-neutral-600 hover:text-neutral-900"
            }`}
          >
            Compras
          </button>
        </div>

        {/* ── Items Tab ── */}
        {activeTab === "items" && (
          <>
            {/* Header & Stats */}
            <div className="border-b border-neutral-200 px-4 py-4 space-y-3">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-neutral-900">Ítems</h2>
                <button
                  onClick={() => open(<AddItemModal />)}
                  className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
                >
                  Nuevo ítem
                </button>
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-neutral-50 rounded p-3">
                  <p className="text-xs font-medium text-neutral-500 uppercase">Ítems registrados</p>
                  <p className="text-2xl font-semibold text-neutral-900">{stats.totalItems}</p>
                </div>
                <div className="bg-neutral-50 rounded p-3">
                  <p className="text-xs font-medium text-neutral-500 uppercase">Tiendas</p>
                  <p className="text-2xl font-semibold text-neutral-900">{stats.totalStores}</p>
                </div>
                <div className="bg-neutral-50 rounded p-3">
                  <p className="text-xs font-medium text-neutral-500 uppercase">Compras totales</p>
                  <p className="text-2xl font-semibold text-neutral-900">{stats.totalPurchases}</p>
                </div>
              </div>

              {/* Search */}
              <div className="relative max-w-xs">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="w-4 h-4 text-neutral-400" />
                </span>
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar por nombre o marca..."
                  className="pl-10 pr-3 py-2 text-sm border border-neutral-200 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>
            </div>

            {/* Table */}
            <div className="overflow-y-auto" style={{ scrollbarGutter: "stable" }}>
              {filtered.length === 0 ? (
                <div className="bg-white p-4 text-sm text-neutral-500">
                  {query ? "No se encontraron ítems que coincidan." : "No hay ítems registrados."}
                </div>
              ) : (
                <table className="w-full border-collapse">
                  <thead className="bg-neutral-50 sticky top-0">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-600 uppercase">Nombre</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-600 uppercase">Compras</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-600 uppercase">Último precio registrado</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-600 uppercase">Creado</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-neutral-600 uppercase">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((item) => (
                      <ItemRow key={item.id} item={item} />
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}

        {/* ── Stores Tab Placeholder ── */}
        {activeTab === "stores" && <StoresTab />}

        {/* ── Purchases Tab ── */}
        {activeTab === "purchases" && <PurchasesTab />}
      </div>
    </ViewLayout>
  );
}

import { Search } from "lucide-react";
import { useModalStore } from "../stores/modal-store";
import { useMemo, useState } from "react";
import { formatCurrency } from "../utils/format-currency";
import OrbitLogo from "./orbit-logo";
import { useStores } from "../stores/global-data-store";

export default function StoresTab() {
  const stores = useStores();
  const open = useModalStore((state) => state.open);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return stores;
    return stores.filter((store) => store.name.toLowerCase().includes(q));
  }, [stores, query]);

  return (
    <div className="flex flex-col gap-4 flex-1 overflow-hidden">
      {/* Header & Controls */}
      <div className="border-b border-neutral-200 px-4 py-4 space-y-3">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-neutral-900">Tiendas</h2>
          <button
            onClick={() =>
              open(
                <div className="p-4 bg-white rounded shadow">
                  <h3 className="font-semibold">Agregar tienda modal</h3>
                </div>,
              )
            }
            className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
          >
            Nueva tienda
          </button>
        </div>

        {/* Top Bar with Search and View Toggle */}
        <div className="flex justify-between items-center gap-3">
          <div className="relative max-w-xs flex-1">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-neutral-400" />
            </span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar tiendas..."
              className="pl-10 pr-3 py-2 text-sm border border-neutral-200 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>

          {/* View Toggle */}
          <div className="flex gap-1 bg-neutral-100 rounded p-1">
            <button className="p-1.5 rounded text-neutral-600 hover:text-neutral-900 hover:bg-white transition-colors" title="Vista en cuadrícula">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 3h8v8H3V3zm10 0h8v8h-8V3zM3 13h8v8H3v-8zm10 0h8v8h-8v-8z" />
              </svg>
            </button>
            <button className="p-1.5 rounded text-neutral-600 hover:text-neutral-900 hover:bg-white transition-colors" title="Vista en lista">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 4h18v2H3V4zm0 7h18v2H3v-2zm0 7h18v2H3v-2z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Stores Grid */}
      <div className="overflow-y-auto flex-1 px-4" style={{ scrollbarGutter: "stable" }}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-4">
          {/* Store Card 1 */}
          {filtered.map((store) => (
            <div key={store.id} className="bg-white border relative border-neutral-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between absolute top-4 right-4">
                <div
                  style={{ backgroundColor: store.color ?? "white" }}
                  className="w-10 h-10 rounded border border-neutral-300 flex items-center justify-center text-lg"
                >
                  {/* Orbit logo */}
                  <OrbitLogo size="small" color="black" />
                </div>
              </div>
              <h3 className="font-semibold text-neutral-900 my-4">{store.name}</h3>
              {/*<p className="text-xs text-neutral-500 mb-3">Av. Principal 123</p>*/}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">Compras</span>
                  <span className="font-medium text-neutral-900">{store.total_purchases}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">Gasto total</span>
                  <span className="font-medium text-neutral-900">{formatCurrency(store.total_expenses)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

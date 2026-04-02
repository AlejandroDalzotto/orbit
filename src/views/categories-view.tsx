import { useEffect, useMemo, useState } from "react";
import { Tag, Search } from "lucide-react";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { ViewLayout } from "../layouts/view-layout";
import { Category } from "../definitions/categories";
import { useModalStore } from "../stores/modal-store";
import { useCategories, useCategoryActions } from "../stores/categories-store";
import { AddCategoryModal } from "../components/modals/categories/add-category-modal";
import { SearchInput } from "../components/search-input";

const CategoryItem = ({ category }: { category: Category }) => {
  const open = useModalStore((state) => state.open);
  const created = new Date(category.created_at).toLocaleDateString("es-AR");

  return (
    <div className="bg-white shadow rounded px-4 py-3 flex items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="font-medium text-neutral-800 truncate">{category.name}</p>
        <p className="text-xs text-neutral-400">
          Creado: {created} · {category.movement_count ?? 0} movimiento{(category.movement_count ?? 0) !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <button onClick={() => {}} className="p-1.5 rounded text-neutral-400 hover:text-blue-600 hover:bg-blue-50 transition-colors" title="Editar">
          <Pencil className="w-4 h-4" />
        </button>
        <button onClick={() => {}} className="p-1.5 rounded text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors" title="Eliminar">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default function CategoriesView() {
  const categories = useCategories();
  const { initialize } = useCategoryActions();
  const [query, setQuery] = useState("");
  const open = useModalStore((state) => state.open);

  useEffect(() => {
    initialize();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter((c) => c.name.toLowerCase().includes(q));
  }, [categories, query]);

  return (
    <ViewLayout>
      <div className="w-full h-full grid grid-rows-[auto_1fr] gap-y-3">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Tag className="w-5 h-5 text-neutral-700" />
                Categorías
              </h2>
              <p className="text-sm text-neutral-500">Organizá tus movimientos por categoría.</p>
            </div>
            <button
              onClick={() => open(<AddCategoryModal />)}
              className="px-3 py-1 bg-blue-500 text-white text-sm cursor-pointer rounded hover:bg-blue-600"
            >
              Añadir categoría
            </button>
          </div>

          {/* Totals */}
          <div className="bg-white shadow rounded px-4 py-3">
            <p className="text-xs text-neutral-500">Categorías</p>
            <p className="text-2xl font-semibold">{categories.length}</p>
          </div>

          {/* Search */}
          <SearchInput value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar categoría por nombre..." />
        </div>

        {/* List */}
        <div className="space-y-2 overflow-y-auto" style={{ scrollbarGutter: "stable" }}>
          {filtered.length === 0 ? (
            <div className="bg-white shadow rounded p-4 text-sm text-neutral-500">
              {query ? "No se encontraron categorías que coincidan." : "No hay categorías registradas."}
            </div>
          ) : (
            filtered.map((category) => <CategoryItem key={category.id} category={category} />)
          )}
        </div>
      </div>
    </ViewLayout>
  );
}

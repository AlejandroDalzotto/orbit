import { useEffect, useState } from "react";
import { Plus, X } from "lucide-react";
import { invoke } from "@tauri-apps/api/core";
import type { ItemRef } from "@/models/transaction";

interface ExistingItem {
  id: string;
  name: string;
  brand?: string | null;
  hasWarranty?: boolean | null;
  createdAt: number;
  updatedAt: number;
}

interface ItemsFormProps {
  initialValues?: ItemRef[];
  className?: string;
}

/**
 * Internal representation for a row in the form.
 * - If `selectedItemId` is present, it references an existing item from the items DB.
 * - `name`, `quantity`, `price` are always submitted so the backend can handle both
 *   ad-hoc and referenced items. When referencing an existing item we keep `name` synced
 *   with the canonical item name for backwards compatibility.
 */
type Row = {
  selectedItemId?: string | null;
  name: string;
  quantity: number | null;
  price: number | null;
};

const ItemsForm = ({ className = "", initialValues }: ItemsFormProps) => {
  const [rows, setRows] = useState<Row[]>(
    initialValues?.length
      ? initialValues.map((it) => ({
          selectedItemId: undefined,
          name: it.name ?? "",
          quantity: it.quantity,
          price: it.price,
        }))
      : [{ name: "", quantity: null, price: null }],
  );
  const [availableItems, setAvailableItems] = useState<ExistingItem[]>([]);
  const [isLoadingItems, setIsLoadingItems] = useState(false);

  useEffect(() => {
    let mounted = true;
    setIsLoadingItems(true);
    invoke("list_items")
      .then((res: any) => {
        if (!mounted) return;
        // normalize keys if necessary
        const items: ExistingItem[] = (res || []).map((i: any) => ({
          id: i.id,
          name: i.name,
          brand: i.brand ?? null,
          hasWarranty: i.has_warranty ?? null,
          createdAt: i.created_at ?? 0,
          updatedAt: i.updated_at ?? 0,
        }));
        setAvailableItems(items);
      })
      .catch(() => {
        setAvailableItems([]);
      })
      .finally(() => setIsLoadingItems(false));

    return () => {
      mounted = false;
    };
  }, []);

  const addRow = () => {
    setRows((prev) => [...prev, { name: "", quantity: null, price: null }]);
  };

  const removeRow = (index: number) => {
    if (rows.length > 1) {
      setRows(rows.filter((_, i) => i !== index));
    }
  };

  const updateRow = (index: number, patch: Partial<Row>) => {
    setRows((prev) =>
      prev.map((r, i) => (i === index ? { ...r, ...patch } : r)),
    );
  };

  const handleSelectExisting = (index: number, itemId?: string) => {
    if (!itemId) {
      // switching to ad-hoc
      updateRow(index, { selectedItemId: undefined });
      return;
    }
    const found = availableItems.find((it) => it.id === itemId);
    if (found) {
      // when selecting existing, set name to canonical name and keep quantity/price editable
      updateRow(index, { selectedItemId: found.id, name: found.name });
    } else {
      updateRow(index, { selectedItemId: undefined });
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="text-neutral-300 font-mono text-sm">items</label>
        <button
          type="button"
          onClick={addRow}
          className="flex items-center space-x-1 px-2 py-1 border border-neutral-800 hover:border-neutral-700 text-neutral-400 hover:text-white rounded-sm font-mono text-xs transition-colors"
        >
          <Plus className="h-3 w-3" />
          <span>Add</span>
        </button>
      </div>

      <div className="space-y-2">
        {rows.map((row, index) => (
          <div
            key={index}
            className="flex items-center space-x-2 p-3 border border-neutral-800 rounded-md"
          >
            {/* Existing item selector */}
            <div className="flex-shrink-0 w-32">
              <select
                name={`items[${index}].itemId`}
                value={row.selectedItemId ?? ""}
                onChange={(e) =>
                  handleSelectExisting(index, e.target.value || undefined)
                }
                className="w-full px-2 py-1 bg-black border border-neutral-800 text-white font-mono text-sm rounded focus:outline-none focus:border-neutral-700"
              >
                <option value="">+ New item</option>
                {!isLoadingItems &&
                  availableItems.map((it) => (
                    <option key={it.id} value={it.id}>
                      {it.name}
                    </option>
                  ))}
              </select>
            </div>

            {/* Name - required for ad-hoc items, kept readonly when selecting an existing item */}
            <input
              autoComplete="off"
              spellCheck="false"
              type="text"
              name={`items[${index}].name`}
              placeholder="Item name"
              value={row.name}
              onChange={(e) => updateRow(index, { name: e.target.value })}
              className={`flex-1 bg-black border border-neutral-800 text-white font-mono text-sm px-2 py-1 rounded focus:outline-none focus:border-neutral-700 transition-colors ${row.selectedItemId ? "opacity-80" : ""}`}
              required={index === 0}
              readOnly={!!row.selectedItemId}
            />

            {/* Quantity */}
            <input
              type="number"
              name={`items[${index}].quantity`}
              placeholder="Qty"
              min="0"
              step="1"
              value={row.quantity ?? ""}
              onChange={(e) =>
                updateRow(index, {
                  quantity: e.target.value ? Number(e.target.value) : null,
                })
              }
              className="w-16 bg-black border border-neutral-800 text-white font-mono text-sm px-2 py-1 rounded focus:outline-none focus:border-neutral-700 transition-colors"
            />

            {/* Price */}
            <input
              type="number"
              name={`items[${index}].price`}
              placeholder="Price"
              min="0"
              step="0.01"
              value={row.price ?? ""}
              onChange={(e) =>
                updateRow(index, {
                  price: e.target.value ? Number(e.target.value) : null,
                })
              }
              className="w-20 bg-black border border-neutral-800 text-white font-mono text-sm px-2 py-1 rounded focus:outline-none focus:border-neutral-700 transition-colors"
            />

            {/* Remove button */}
            {rows.length > 1 && (
              <button
                type="button"
                onClick={() => removeRow(index)}
                className="text-neutral-400 rounded border hover:text-red-400 p-0.5 cursor-pointer bg-black transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        ))}
      </div>

      <p className="text-neutral-500 font-mono text-xs">
        You can select existing items (left) or leave it as + New item and type
        a name. Quantity and price are optional.
      </p>
    </div>
  );
};

export default ItemsForm;

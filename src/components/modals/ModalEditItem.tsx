"use client";

import { useEffect, useState } from "react";
import { useModal } from "@/context/modal-provider";
import { useItemStore } from "@/stores/itemStore";
import type { Item, RequestEditItem } from "@/models/item";
import { toast } from "sonner";
import { ChevronDown } from "lucide-react";
import CheckBox from "../form/CheckBox";

type Props = {
  item: Item;
};

/**
 * ModalEditItem
 *
 * Edits basic item fields (name, brand, hasWarranty).
 * On successful edit, updates the items store via `editItem` and closes the modal.
 */
export default function ModalEditItem({ item }: Props) {
  const { close } = useModal();
  const editItem = useItemStore((s) => s.editItem);

  const [name, setName] = useState(item.name);
  const [brand, setBrand] = useState(item.brand ?? "");
  const [hasWarranty, setHasWarranty] = useState<boolean>(!!item.hasWarranty);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Keep local state in sync if a different item is passed later
    setName(item.name);
    setBrand(item.brand ?? "");
    setHasWarranty(!!item.hasWarranty);
  }, [item]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const payload: RequestEditItem = {
      name: name.trim().length ? name.trim() : undefined,
      brand: brand.trim().length ? brand.trim() : undefined,
      hasWarranty,
    };

    try {
      const [error] = await editItem(item.id, payload);
      if (error) {
        console.error("Failed to edit item:", error);
        toast.error(error.message ?? "Failed to update item");
        setIsLoading(false);
        return;
      }

      toast.success("Item updated");
      close();
    } catch (err) {
      console.error(err);
      toast.error("Unexpected error updating item");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 max-h-[calc(100vh-100px)] text-sm rounded shadow-lg bg-black border border-neutral-700 w-xl overflow-y-auto">
      <h2 className="mb-2 text-lg font-semibold">Edit item</h2>
      <p className="mb-4 text-neutral-500">Modify item details</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-y-4">
        <div>
          <label
            className="block mb-2 font-mono text-neutral-300"
            htmlFor="item-name"
          >
            name
          </label>
          <input
            id="item-name"
            name="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Olive Oil"
            className="w-full px-3 py-2 font-mono text-white bg-black border rounded-md border-neutral-800 focus:outline-none focus:ring-1 focus:ring-neutral-700 focus:border-neutral-700"
            type="text"
            autoComplete="off"
          />
        </div>

        <div>
          <label
            className="block mb-2 font-mono text-neutral-300"
            htmlFor="item-brand"
          >
            brand (optional)
          </label>
          <div className="relative">
            <input
              id="item-brand"
              name="brand"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="e.g. Acme"
              className="w-full px-3 py-2 pr-10 font-mono font-light text-white transition-colors bg-black border rounded-md appearance-none cursor-text border-neutral-800 hover:border-neutral-700 focus:border-neutral-700 focus:outline-none focus:ring-1 focus:ring-neutral-700"
              type="text"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <ChevronDown className="w-4 h-4 text-neutral-400 opacity-0" />
            </div>
          </div>
        </div>

        <div>
          <CheckBox name="hasWarranty" text="has warranty" />
        </div>
        <div className="flex items-center justify-end gap-x-2">
          <button
            type="button"
            onClick={() => close()}
            className="px-3 py-2 rounded border border-neutral-800 text-neutral-300 hover:bg-white/5"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-3 py-2 rounded bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-50"
          >
            {isLoading ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}

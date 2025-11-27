"use client";

import { useState } from "react";
import { useModal } from "@/context/modal-provider";
import { useItemStore } from "@/stores/itemStore";
import { ChevronDown } from "lucide-react";
import { toast } from "sonner";
import CheckBox from "../form/CheckBox";
import { useToastSoundEffect } from "@/hooks/useToastSoundEffect";

/**
 * Modal for creating a new Item.
 *
 * Fields:
 *  - name (required)
 *  - brand (optional)
 *  - hasWarranty (optional)
 *
 * On submit calls the `addItem` action from the items store. Closes modal on success.
 */
export default function ModalAddItem() {
  const { close } = useModal();
  const addItem = useItemStore((s) => s.addItem);
  const { play } = useToastSoundEffect();

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const fd = new FormData(e.target as HTMLFormElement);
    const name = (fd.get("name") as string) ?? "";
    const brand = (fd.get("brand") as string) ?? undefined;
    const hasWarranty = fd.get("hasWarranty") === "on";

    try {
      const payload = {
        name: name.trim(),
        brand: brand && brand.trim().length ? brand.trim() : undefined,
        hasWarranty,
      };

      const [error] = await addItem(payload);

      if (error) {
        console.error("Failed to create item:", error);
        toast.error(error.message ?? "Failed to create item");
        setIsLoading(false);
        return;
      }
      play();
      toast.success("Item created");
      close();
    } catch (err) {
      console.error(err);
      toast.error("Unexpected error creating item");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 max-h-[calc(100vh-100px)] text-sm rounded shadow-lg bg-black border border-neutral-700 w-xl overflow-y-auto">
      <h2 className="mb-2 text-lg font-semibold">Create item</h2>
      <p className="mb-4 text-neutral-500">
        Add a new item to the items database
      </p>

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
            className="p-2 rounded border border-neutral-800 text-neutral-300 hover:bg-white/5"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="p-2 rounded bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-50"
          >
            {isLoading ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}

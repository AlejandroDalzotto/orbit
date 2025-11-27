"use client";

import { useEffect, useState } from "react";
import { useModal } from "@/context/modal-provider";
import { useItemStore } from "@/stores/itemStore";
import type { Item, LeakDateRange, RequestIsSpendingLeak } from "@/models/item";
import CheckBox from "../form/CheckBox";
import { toast } from "sonner";

/**
 * ModalMarkLeak
 *
 * Lets user mark an item as a spending leak and optionally configure:
 * - money limit (spendMoneyLimit)
 * - quantity limit (spendAmountLimit)
 * - date range (leakDateRange): week | month | year
 *
 * This modal uses the `CheckBox` component (passing `name="isSpendingLeak"`)
 * so the checkbox is present in the form. Because `CheckBox` manages its own
 * internal state, we wire a small DOM-based sync to read its checked state so
 * the form submission picks up the correct value.
 */
type Props = {
  item: Item;
};

export default function ModalMarkLeak({ item }: Props) {
  const { close } = useModal();
  const editIsSpendingLeak = useItemStore((s) => s.editIsSpendingLeak);

  const [isLoading, setIsLoading] = useState(false);
  const [isEnabled, setIsEnabled] = useState<boolean>(!!item.isSpendingLeak);

  // Local controlled inputs for optional fields so we can reflect current item values
  const [moneyLimit, setMoneyLimit] = useState<string>(
    item.spendMoneyLimit !== undefined && item.spendMoneyLimit !== null
      ? String(item.spendMoneyLimit)
      : "",
  );
  const [amountLimit, setAmountLimit] = useState<string>(
    item.spendAmountLimit !== undefined && item.spendAmountLimit !== null
      ? String(item.spendAmountLimit)
      : "",
  );
  const [dateRange, setDateRange] = useState<LeakDateRange | "">(
    item.leakDateRange ?? "",
  );

  // Sync the visual CheckBox component's actual input into our local `isEnabled` state.
  // The CheckBox component renders an <input name="isSpendingLeak" ... />, but
  // it manages its own internal checked state. We locate that input and:
  // - set its initial checked state to the item's value (dispatching a change so the component updates)
  // - listen for changes to keep `isEnabled` in sync
  useEffect(() => {
    const selector = 'input[name="isSpendingLeak"]';
    const el = document.querySelector<HTMLInputElement>(selector);
    if (!el) return;

    // Set the input's checked to the item's value and trigger a change so the CheckBox internal state follows.
    el.checked = !!item.isSpendingLeak;
    el.dispatchEvent(new Event("change", { bubbles: true }));

    // Handler to keep our local state in sync when the user toggles the CheckBox
    const handler = () => setIsEnabled(!!el.checked);
    el.addEventListener("change", handler);

    // Initialize local state
    setIsEnabled(!!el.checked);

    return () => {
      el.removeEventListener("change", handler);
    };
    // We only want to run this once for this modal instance / item
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const payload: RequestIsSpendingLeak = {
      itemId: item.id,
      isSpendingLeak: !!isEnabled,
    };

    // parse optional fields
    if (moneyLimit.trim().length) {
      const v = Number(moneyLimit);
      if (!Number.isNaN(v)) payload.spendMoneyLimit = v;
    }

    if (amountLimit.trim().length) {
      const v = Number(amountLimit);
      if (!Number.isNaN(v)) payload.spendAmountLimit = Math.floor(v);
    }

    if (dateRange) {
      payload.leakDateRange = dateRange as LeakDateRange;
    }

    try {
      const [error] = await editIsSpendingLeak(payload);
      if (error) {
        console.error("Failed to update spending leak:", error);
        toast.error(error.message ?? "Failed to update item");
        setIsLoading(false);
        return;
      }

      toast.success(
        payload.isSpendingLeak ? "Marked as spending leak" : "Leak removed",
      );
      close();
    } catch (err) {
      console.error(err);
      toast.error("Unexpected error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 max-h-[calc(100vh-100px)] text-sm rounded shadow-lg bg-black border border-neutral-700 w-xl overflow-y-auto">
      <h2 className="mb-2 text-lg font-semibold">Mark as spending leak</h2>
      <p className="mb-4 text-neutral-500">
        Flag this item as a potential spending leak and optionally set limits.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-y-4">
        <div>
          {/* Use the provided CheckBox component as requested.
              The input it renders has name="isSpendingLeak". */}
          <CheckBox name="isSpendingLeak" text="is spending leak" />
        </div>

        <div>
          <label
            className="block mb-2 font-mono text-neutral-300"
            htmlFor="money-limit"
          >
            spend money limit (optional)
          </label>
          <input
            id="money-limit"
            name="spendMoneyLimit"
            value={moneyLimit}
            onChange={(e) => setMoneyLimit(e.target.value)}
            placeholder="e.g. 100.00"
            type="number"
            step="0.01"
            min="0"
            className="w-full px-3 py-2 font-mono text-white bg-black border rounded-md border-neutral-800 focus:outline-none focus:ring-1 focus:ring-neutral-700 focus:border-neutral-700"
          />
        </div>

        <div>
          <label
            className="block mb-2 font-mono text-neutral-300"
            htmlFor="amount-limit"
          >
            spend quantity limit (optional)
          </label>
          <input
            id="amount-limit"
            name="spendAmountLimit"
            value={amountLimit}
            onChange={(e) => setAmountLimit(e.target.value)}
            placeholder="e.g. 3"
            type="number"
            step="1"
            min="0"
            className="w-full px-3 py-2 font-mono text-white bg-black border rounded-md border-neutral-800 focus:outline-none focus:ring-1 focus:ring-neutral-700 focus:border-neutral-700"
          />
        </div>

        <div>
          <label
            className="block mb-2 font-mono text-neutral-300"
            htmlFor="leak-date-range"
          >
            date range (optional)
          </label>
          <select
            id="leak-date-range"
            name="leakDateRange"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as LeakDateRange | "")}
            className="w-full px-3 py-2 font-mono text-white bg-black border rounded-md border-neutral-800 focus:outline-none focus:ring-1 focus:ring-neutral-700 focus:border-neutral-700"
          >
            <option value="">(no range)</option>
            <option value="week">week</option>
            <option value="month">month</option>
            <option value="year">year</option>
          </select>
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
            className="px-3 py-2 rounded bg-yellow-500 hover:bg-yellow-600 text-black disabled:opacity-50"
          >
            {isLoading ? "Saving..." : "Save preference"}
          </button>
        </div>
      </form>
    </div>
  );
}

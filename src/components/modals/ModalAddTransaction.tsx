"use client";

import CheckBox from "@/components/form/CheckBox";
import WalletField from "@/components/form/WalletField";
import { useModal } from "@/context/modal-provider";
import { buildTransactionFromFormData } from "@/helpers/generate-transaction-from-formdata";
import { renderSpecificFields } from "@/helpers/render-specific-fields";
import { TransactionCategory, TransactionType } from "@/models/transaction";
import { useTransactionStore } from "@/stores/transactionStore";
import { useWalletStore } from "@/stores/walletStore";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useTransactionValidation } from "@/hooks/useTransactionValidation";

const categories: Record<TransactionType, TransactionCategory[]> = {
  income: [
    TransactionCategory.Salary,
    TransactionCategory.Freelance,
    TransactionCategory.Basic,
  ],
  expense: [TransactionCategory.Shopping, TransactionCategory.Basic],
  transfer: [],
};

export default function ModalAddTransaction() {
  const [isLoading, setIsLoading] = useState(false);
  const [type, setType] = useState<TransactionType>(TransactionType.Income);
  const [category, setCategory] = useState<TransactionCategory>(
    TransactionCategory.Basic,
  );
  const { close } = useModal();
  const { checkLimits, confirmOverride: confirm } = useTransactionValidation();
  const updateValuesOnTransactionAdded = useWalletStore(
    (state) => state.updateValuesOnTransactionAdded,
  );

  const addTransaction = useTransactionStore((state) => state.addTransaction);

  const fieldPrefix = "transaction-";

  const handleTypeChange = (value: TransactionType) => {
    if (value !== type) {
      setType(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.target as HTMLFormElement);
    const category = formData.get("category") as TransactionCategory;
    const newTransaction = buildTransactionFromFormData(
      formData,
      "create",
      category,
    );

    try {
      // check limits
      if (
        newTransaction.category === TransactionCategory.Shopping &&
        newTransaction.items.length > 0
      ) {
        const warnings = await checkLimits(newTransaction.items);

        // Ask user if they want to exceed the limits
        if (warnings.length > 0) {
          const confirmed = await confirm(warnings);
          if (!confirmed) {
            setIsLoading(false);
            return; // User canceled
          }
        }
      }

      const [error, result] = await addTransaction(newTransaction);
      if (error) {
        console.log(error.message);
        toast.error(error.message);
        setIsLoading(false);
        return;
      }

      // if the transaction affects the balance we need to update the wallet store values.
      if (result.affectsBalance) {
        updateValuesOnTransactionAdded(
          result.accountId,
          result.amount,
          result.type === TransactionType.Income,
        );
      }

      toast.success(`${result.type} saved successfully.`);
      close();
    } catch (e) {
      console.error({ e });
      toast.error(e as string);
    } finally {
      setIsLoading(false);
    }
  };

  const today = new Date();
  today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
  const todayString = today.toISOString().split("T")[0];
  return (
    <div className="p-6 max-h-[calc(100vh-100px)] text-sm rounded shadow-lg bg-black border border-neutral-700 w-xl overflow-y-auto">
      <h2 className="mb-2 text-lg font-semibold">add transaction</h2>
      <p className="mb-4 text-neutral-500">record new income or expense</p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-y-4">
        <div className="flex-1">
          <label
            className="block mb-2 font-mono text-neutral-300"
            htmlFor={`${fieldPrefix}type`}
          >
            type
          </label>
          <div className="relative">
            <select
              required
              id={`${fieldPrefix}type`}
              onChange={(e) =>
                handleTypeChange(e.target.value as TransactionType)
              }
              defaultValue="income"
              name="type"
              className="w-full px-3 py-2 pr-10 font-mono font-light text-white transition-colors bg-black border rounded-md appearance-none cursor-pointer border-neutral-800 hover:border-neutral-700 focus:border-neutral-700 focus:outline-none focus:ring-1 focus:ring-neutral-700"
            >
              <option value="" disabled className="bg-black text-neutral-500">
                select type
              </option>
              {["income", "expense"].map((value) => (
                <option
                  key={value}
                  value={value}
                  className="text-white bg-black"
                >
                  {value}
                </option>
              ))}
            </select>

            {/* Custom chevron icon */}
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <ChevronDown className="w-4 h-4 text-neutral-400" />
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <label
              className="block mb-2 font-mono text-neutral-300"
              htmlFor={`${fieldPrefix}amount`}
            >
              amount
            </label>
            <input
              required
              placeholder="0.00"
              className="w-full px-3 py-2 font-mono text-white bg-black border rounded-md border-neutral-800 focus:outline-none focus:ring-1 focus:ring-neutral-700 focus:border-neutral-700"
              type="number"
              name="amount"
              autoComplete="off"
              id={`${fieldPrefix}amount`}
            />
          </div>
        </div>

        <div className="flex-1">
          <label
            className="block mb-2 font-mono text-neutral-300"
            htmlFor={`${fieldPrefix}category`}
          >
            category
          </label>
          <div className="relative">
            <select
              required
              id={`${fieldPrefix}category`}
              defaultValue={TransactionCategory.Basic}
              onChange={(e) =>
                setCategory(e.target.value as TransactionCategory)
              }
              name="category"
              className="w-full px-3 py-2 pr-10 font-mono font-light text-white transition-colors bg-black border rounded-md appearance-none cursor-pointer border-neutral-800 hover:border-neutral-700 focus:border-neutral-700 focus:outline-none focus:ring-1 focus:ring-neutral-700"
            >
              <option value="" disabled className="bg-black text-neutral-500">
                select category
              </option>
              {categories[type].map((value) => (
                <option
                  key={value}
                  value={value}
                  className="text-white bg-black"
                >
                  {value}
                </option>
              ))}
            </select>

            {/* Custom chevron icon */}
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <ChevronDown className="w-4 h-4 text-neutral-400" />
            </div>
          </div>
        </div>

        {renderSpecificFields(category, fieldPrefix)}

        <WalletField prefix={fieldPrefix} />

        <div>
          <label
            className="block mb-2 font-mono text-neutral-300"
            htmlFor={`${fieldPrefix}date`}
          >
            date
            <span className="font-mono text-xs text-neutral-500">
              {" "}
              • today&apos;s date set by default
            </span>
          </label>
          <input
            required
            defaultValue={todayString}
            className="w-full px-3 py-2 font-mono text-white bg-black border rounded-md border-neutral-800 focus:outline-none focus:ring-1 focus:ring-neutral-700 focus:border-neutral-700"
            type="date"
            name="date"
            id={`${fieldPrefix}date`}
          />
        </div>

        <div>
          <label
            className="block mb-2 font-mono text-neutral-300"
            htmlFor={`${fieldPrefix}details`}
          >
            details
          </label>
          <textarea
            required
            spellCheck="false"
            autoComplete="off"
            placeholder="description..."
            className="w-full min-h-[2ch] resize-none bg-black border border-neutral-800 text-white font-mono px-3 py-2 rounded-md focus:outline-none focus:ring-1 focus:ring-neutral-700 focus:border-neutral-700"
            name="details"
            id={`${fieldPrefix}details`}
          />
        </div>

        <div>
          <CheckBox name="affectsBalance" text="affects balance" />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="p-2 text-white bg-blue-500 rounded hover:bg-blue-600 transition-hover disabled:opacity-50"
        >
          Save
        </button>
      </form>
    </div>
  );
}

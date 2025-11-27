"use client";

import { useModal } from "@/context/modal-provider";
import { buildTransactionFromFormData } from "@/helpers/generate-transaction-from-formdata";
import { renderSpecificFields } from "@/helpers/render-specific-fields";
import {
  TransactionType,
  type RequestUpdateTransaction,
  type Transaction,
} from "@/models/transaction";
import { TransactionService } from "@/services/transaction";
import { useTransactionStore } from "@/stores/transactionStore";
import { useWalletStore } from "@/stores/walletStore";
import { useState } from "react";
import { toast } from "sonner";

interface Props {
  transaction: Transaction;
}

export default function ModalEditTransaction({ transaction }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const { close } = useModal();
  const updateTransaction = useTransactionStore(
    (state) => state.updateTransaction,
  );
  const updateValuesOnTransactionEdited = useWalletStore(
    (state) => state.updateValuesOnTransactionEdited,
  );

  const fieldPrefix = "transaction-";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.target as HTMLFormElement);

    const newTransaction: RequestUpdateTransaction =
      buildTransactionFromFormData(formData, "edit", transaction.category);
    try {
      const [error, result] = await updateTransaction(
        transaction.id,
        newTransaction,
      );
      if (error) {
        console.log(error.message);
        toast.error(error.message);
        return;
      }
      if (result.affectsBalance) {
        updateValuesOnTransactionEdited(
          result.accountId,
          transaction.amount,
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

  const date = new Date(transaction.date);
  const dateString = date.toISOString().split("T")[0];

  return (
    <div className="p-6 max-h-[calc(100vh-100px)] text-sm rounded shadow-lg bg-black border border-neutral-700 w-xl overflow-y-auto">
      <h2 className="mb-2 text-lg font-semibold">edit transaction</h2>
      <p className="mb-4 text-neutral-500">
        update transaction&apos;s information
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-y-4">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <label
              className="block mb-2 font-mono text-neutral-300"
              htmlFor={`${fieldPrefix}amount`}
            >
              amount
            </label>
            <input
              defaultValue={transaction.amount}
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

        {renderSpecificFields(transaction.category, fieldPrefix, transaction)}

        <div>
          <label
            className="block mb-2 font-mono text-neutral-300"
            htmlFor={`${fieldPrefix}date`}
          >
            date
          </label>
          <input
            required
            defaultValue={dateString}
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
            defaultValue={transaction.details}
            spellCheck="false"
            autoComplete="off"
            placeholder="description..."
            className="w-full min-h-[2ch] resize-none bg-black border border-neutral-800 text-white font-mono px-3 py-2 rounded-md focus:outline-none focus:ring-1 focus:ring-neutral-700 focus:border-neutral-700"
            name="details"
            id={`${fieldPrefix}details`}
          />
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

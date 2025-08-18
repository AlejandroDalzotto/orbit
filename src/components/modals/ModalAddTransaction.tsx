"use client";

import { useModal } from "@/context/modal-provider";
import { CreateTransaction, TransactionType } from "@/models/transaction";
import { WalletService } from "@/services/wallet";
import { useState } from "react";
import { toast } from "sonner";
import CategoryField from "../form/CategoryField";
import { TransactionService } from "@/services/transaction";

export default function ModalAddTransaction() {
  const [isLoading, setIsLoading] = useState(false);
  const [type, setType] = useState<TransactionType>(TransactionType.Income);
  const { close } = useModal();

  const fieldPrefix = "transaction-"

  const handleTypeChange = (value: TransactionType) => {
    if (value !== type) {
      setType(value)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.target as HTMLFormElement);

    const newTransaction = Object.fromEntries(formData) as unknown as CreateTransaction

    try {
      const service = new TransactionService();
      const [error, data] = await service.addTransaction(newTransaction);
      if (error) {
        toast.error(`Failed to create transaction: ${error.message}`);
        setIsLoading(false);
        return;
      }

      // ?
      // onTransactionAdded(data)
      toast.success(`Transaction ${data.name} saved successfully.`);
    } catch (e) {
      console.error({ e })
    } finally {
      setIsLoading(false);
      close();
    }
  }

  return (
    <div className="p-6 rounded shadow-lg bg-neutral-900 w-96">
      <h2 className="mb-4 text-xl font-bold">Add New Transaction</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-y-4">

        <div>
          <label htmlFor={`${fieldPrefix}type`}>type</label>
          <select
            onChange={(e) => handleTypeChange(e.target.value as TransactionType)}
            defaultValue="income"
            name="type"
            id={`${fieldPrefix}type`}
          >
            <option value="income"></option>
            <option value="expense"></option>
          </select>
        </div>

        <div>
          <label htmlFor={`${fieldPrefix}amount`}>amount</label>
          <input type="number" name="amount" id={`${fieldPrefix}amount`} />
        </div>

        <CategoryField fieldPrefix={fieldPrefix} type={type} />

        <button type="submit" disabled={isLoading} className="p-2 text-white bg-blue-500 rounded hover:bg-blue-600 transition-hover disabled:opacity-50">
          Save
        </button>
      </form>
    </div>
  )
}

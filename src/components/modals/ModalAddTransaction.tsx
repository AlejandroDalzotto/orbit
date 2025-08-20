"use client";

import CheckBox from "@/components/form/CheckBox";
import WalletField from "@/components/form/WalletField";
import { useModal } from "@/context/modal-provider";
import { generateTransactionFromFormdata } from "@/helpers/generate-transaction-from-formdata";
import { renderSpecificFields } from "@/helpers/render-specific-fields";
import { useTransactions } from "@/hooks/useTransactions";
import { useTransactionsFinancialSummary } from "@/hooks/useTransactionsFinancialSummary";
import { TransactionCategory, TransactionType } from "@/models/transaction";
import { TransactionService } from "@/services/transaction";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const categories: Record<TransactionType, TransactionCategory[]> = {
  'income': [TransactionCategory.Salary, TransactionCategory.Freelance, TransactionCategory.Basic],
  'expense': [
    TransactionCategory.Supermarket,
    TransactionCategory.Basic,
  ],
}

export default function ModalAddTransaction() {
  const [isLoading, setIsLoading] = useState(false);
  const [type, setType] = useState<TransactionType>(TransactionType.Income);
  const [category, setCategory] = useState<TransactionCategory>(TransactionCategory.Basic);
  const { close } = useModal();
  const { mutate: mutateTransactions } = useTransactions({ offset: 0, limit: 50 })
  const { mutate: mutateFinancialData } = useTransactionsFinancialSummary()

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

    const newTransaction = generateTransactionFromFormdata(formData)
    console.log(newTransaction)
    try {
      const service = new TransactionService();
      const [error, result] = await service.addTransaction(newTransaction);
      if (error) {
        console.log(error.msg)
        toast.error(error.msg);
        setIsLoading(false);
        return;
      }

      mutateTransactions();
      mutateFinancialData();
      toast.success(`${result.type} saved successfully.`);
      close();
    } catch (e) {
      console.error({ e })
      toast.error(e as string);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="p-6 max-h-[calc(100vh-100px)] text-sm rounded shadow-lg bg-black border border-neutral-700 w-xl overflow-y-auto">
      <h2 className="mb-2 text-lg font-semibold">add transaction</h2>
      <p className="mb-4 text-neutral-500">record new income or expense</p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-y-4">

        <div className="flex-1">
          <label className="block text-neutral-300 font-mono mb-2" htmlFor={`${fieldPrefix}type`}>type</label>
          <div className="relative">
            <select
              id={`${fieldPrefix}type`}
              onChange={(e) => handleTypeChange(e.target.value as TransactionType)}
              defaultValue="income"
              name="type"
              className="w-full appearance-none bg-black border border-neutral-800 hover:border-neutral-700 focus:border-neutral-700 text-white font-mono font-light px-3 py-2 pr-10 rounded-md cursor-pointer focus:outline-none focus:ring-1 focus:ring-neutral-700 transition-colors"
            >
              <option value="" disabled className="bg-black text-neutral-500">
                select type
              </option>
              {['income', 'expense'].map((value) => (
                <option
                  key={value}
                  value={value}
                  className="bg-black text-white"
                >
                  {value}
                </option>
              ))}
            </select>

            {/* Custom chevron icon */}
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <ChevronDown className="h-4 w-4 text-neutral-400" />
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <label
              className="block text-neutral-300 font-mono mb-2"
              htmlFor={`${fieldPrefix}amount`}
            >
              amount
            </label>
            <input
              placeholder="0.00"
              className="w-full bg-black border border-neutral-800 text-white font-mono px-3 py-2 rounded-md focus:outline-none focus:ring-1 focus:ring-neutral-700 focus:border-neutral-700"
              type="number"
              name="amount"
              autoComplete="off"
              id={`${fieldPrefix}amount`}
            />
          </div>
          <div>
            <label className="block text-neutral-300 font-mono mb-2" htmlFor={`${fieldPrefix}currency`}>currency</label>
            {/* TODO: Currency should be automatically handled using the same currency as the wallet used in the transaction. */}
            <div className="relative">
              <select
                id={`${fieldPrefix}currency`}
                defaultValue="ARS"
                name="currency"
                className="min-w-28 appearance-none bg-black border border-neutral-800 hover:border-neutral-700 focus:border-neutral-700 text-white font-mono font-light px-3 py-2 pr-10 rounded-md cursor-pointer focus:outline-none focus:ring-1 focus:ring-neutral-700 transition-colors"
              >
                {['ARS', 'USD'].map((value) => (
                  <option
                    key={value}
                    value={value}
                    className="bg-black text-white"
                  >
                    {value}
                  </option>
                ))}
              </select>

              {/* Custom chevron icon */}
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <ChevronDown className="h-4 w-4 text-neutral-400" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1">
          <label className="block text-neutral-300 font-mono mb-2" htmlFor={`${fieldPrefix}category`}>category</label>
          <div className="relative">
            <select
              id={`${fieldPrefix}category`}
              defaultValue={TransactionCategory.Basic}
              onChange={(e) => setCategory(e.target.value as TransactionCategory)}
              name="category"
              className="w-full appearance-none bg-black border border-neutral-800 hover:border-neutral-700 focus:border-neutral-700 text-white font-mono font-light px-3 py-2 pr-10 rounded-md cursor-pointer focus:outline-none focus:ring-1 focus:ring-neutral-700 transition-colors"
            >
              <option value="" disabled className="bg-black text-neutral-500">
                select category
              </option>
              {categories[type].map((value) => (
                <option
                  key={value}
                  value={value}
                  className="bg-black text-white"
                >
                  {value}
                </option>
              ))}
            </select>

            {/* Custom chevron icon */}
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <ChevronDown className="h-4 w-4 text-neutral-400" />
            </div>
          </div>
        </div>

        {renderSpecificFields(category, fieldPrefix)}

        <WalletField prefix={fieldPrefix} />

        <div>
          <label
            className="block text-neutral-300 font-mono mb-2"
            htmlFor={`${fieldPrefix}date`}
          >
            date
          </label>
          <input
            className="w-full bg-black border border-neutral-800 text-white font-mono px-3 py-2 rounded-md focus:outline-none focus:ring-1 focus:ring-neutral-700 focus:border-neutral-700"
            type="date"
            name="date"
            id={`${fieldPrefix}date`}
          />
        </div>

        <div>
          <label
            className="block text-neutral-300 font-mono mb-2"
            htmlFor={`${fieldPrefix}details`}
          >
            details
          </label>
          <textarea
            spellCheck='false'
            autoComplete="off"
            placeholder="description..."
            className="w-full min-h-[2ch] resize-none bg-black border border-neutral-800 text-white font-mono px-3 py-2 rounded-md focus:outline-none focus:ring-1 focus:ring-neutral-700 focus:border-neutral-700"
            name="details"
            id={`${fieldPrefix}details`}
          />
        </div>

        <div>
          <CheckBox />
        </div>
        <button type="submit" disabled={isLoading} className="p-2 text-white bg-blue-500 rounded hover:bg-blue-600 transition-hover disabled:opacity-50">
          Save
        </button>
      </form>
    </div>
  )
}

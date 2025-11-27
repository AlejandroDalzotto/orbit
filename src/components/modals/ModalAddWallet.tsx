"use client";

import { useModal } from "@/context/modal-provider";
import type { Currency } from "@/models/transaction";
import type { AccountType, CreateAccount } from "@/models/wallet";
import { useWalletStore } from "@/stores/walletStore";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function ModalAddWallet() {
  const [isLoading, setIsLoading] = useState(false);
  const { close } = useModal();
  const addAccount = useWalletStore((state) => state.addAccount);

  const handleSubmit = async (e: React.FormEvent) => {
    setIsLoading(true);
    e.preventDefault();

    const formData = new FormData(e.target as HTMLFormElement);

    const newAccount: CreateAccount = {
      name: formData.get("name") as string,
      type: formData.get("type") as AccountType,
      currency: formData.get("currency") as Currency,
      balance: parseFloat(formData.get("balance") as string),
    };

    const [error, response] = await addAccount(newAccount);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success(response);
    }

    setIsLoading(false);
    close();
  };

  return (
    <div className="p-6 text-sm rounded shadow-lg bg-black border border-neutral-700 w-lg overflow-y-auto">
      <h2 className="mb-2 text-lg font-semibold">add new account</h2>
      <p className="mb-4 text-neutral-500">
        record new account with an initial balance
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-y-4">
        <div className="flex-1">
          <label
            htmlFor="name"
            className="block text-neutral-300 font-mono mb-2"
          >
            name
          </label>
          <input
            autoComplete="off"
            type="text"
            id="name"
            name="name"
            className="w-full bg-black border border-neutral-800 text-white font-mono px-3 py-2 rounded-md focus:outline-none focus:ring-1 focus:ring-neutral-700 focus:border-neutral-700"
            placeholder="e.g., My Cash Wallet"
          />
        </div>
        <div className="flex-1">
          <label
            htmlFor="type"
            className="block text-neutral-300 font-mono mb-2"
          >
            type
          </label>

          <div className="relative">
            <select
              required
              defaultValue="cash"
              name="type"
              className="w-full appearance-none bg-black border border-neutral-800 hover:border-neutral-700 focus:border-neutral-700 text-white font-mono font-light px-3 py-2 pr-10 rounded-md cursor-pointer focus:outline-none focus:ring-1 focus:ring-neutral-700 transition-colors"
            >
              <option value="" disabled className="bg-black text-neutral-500">
                select type
              </option>
              {["cash", "online wallet", "bank account", "credit card"].map(
                (value) => (
                  <option
                    key={value}
                    value={value}
                    className="bg-black text-white capitalize"
                  >
                    {value}
                  </option>
                ),
              )}
            </select>

            {/* Custom chevron icon */}
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <ChevronDown className="h-4 w-4 text-neutral-400" />
            </div>
          </div>
        </div>
        <div className="flex-1">
          <label
            htmlFor="currency"
            className="block text-neutral-300 font-mono mb-2"
          >
            currency
          </label>
          <div className="relative">
            <select
              required
              defaultValue="USD"
              name="currency"
              className="w-full appearance-none bg-black border border-neutral-800 hover:border-neutral-700 focus:border-neutral-700 text-white font-mono font-light px-3 py-2 pr-10 rounded-md cursor-pointer focus:outline-none focus:ring-1 focus:ring-neutral-700 transition-colors"
            >
              <option value="" disabled className="bg-black text-neutral-500">
                select currency
              </option>
              {["ARS", "USD"].map((value) => (
                <option
                  key={value}
                  value={value}
                  className="bg-black text-white capitalize"
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
        <div className="flex-1">
          <label
            htmlFor="balance"
            className="block text-neutral-300 font-mono mb-2"
          >
            initial balance
          </label>
          <input
            autoComplete="off"
            type="number"
            name="balance"
            id="balance"
            className="w-full bg-black border border-neutral-800 text-white font-mono px-3 py-2 rounded-md focus:outline-none focus:ring-1 focus:ring-neutral-700 focus:border-neutral-700"
            placeholder="e.g., 1000"
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="p-2 text-white bg-blue-500 rounded hover:bg-blue-600 transition-hover disabled:opacity-50"
        >
          {isLoading ? "Saving..." : "Save"}
        </button>
      </form>
    </div>
  );
}

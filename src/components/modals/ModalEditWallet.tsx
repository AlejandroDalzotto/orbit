"use client";

import { useModal } from "@/context/modal-provider";
import type { Account, AccountType, EditAccount } from "@/models/wallet";
import { useWalletStore } from "@/stores/walletStore";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function ModalEditWallet({ account }: { account: Account }) {
  const [isLoading, setIsLoading] = useState(false);
  const { close } = useModal();
  const updateAccount = useWalletStore((state) => state.updateAccount);

  const handleSubmit = async (e: React.FormEvent) => {
    setIsLoading(true);
    e.preventDefault();

    const formData = new FormData(e.target as HTMLFormElement);

    const newAccount: EditAccount = {
      name: formData.get("name") as string,
      type: formData.get("type") as AccountType,
      balance: parseFloat(formData.get("balance") as string),
    };

    const [error, response] = await updateAccount(account.id, newAccount);

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
      <h2 className="mb-2 text-lg font-semibold">Edit account</h2>
      <p className="mb-4 text-neutral-500">
        change the current values for {account.name} account
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-y-4">
        <div className="flex-1">
          <label
            htmlFor="name"
            className="block text-neutral-300 font-mono mb-2"
          >
            Account Name
          </label>
          <input
            autoComplete="off"
            defaultValue={account.name}
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
              defaultValue={account.type}
              id="type"
              name="type"
              className="w-full appearance-none bg-black border border-neutral-800 hover:border-neutral-700 focus:border-neutral-700 text-white font-mono font-light px-3 py-2 pr-10 rounded-md cursor-pointer focus:outline-none focus:ring-1 focus:ring-neutral-700 transition-colors"
            >
              <option value="" disabled className="bg-black text-neutral-500">
                select type
              </option>
              <option className="bg-black text-white capitalize" value="cash">
                Cash
              </option>
              <option
                className="bg-black text-white capitalize"
                value="online wallet"
              >
                Online Wallet
              </option>
              <option
                className="bg-black text-white capitalize"
                value="bank account"
              >
                Bank Account
              </option>
              <option
                className="bg-black text-white capitalize"
                value="credit card"
              >
                Credit Card
              </option>
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
            Balance
          </label>
          <input
            autoComplete="off"
            defaultValue={account.balance}
            type="number"
            name="balance"
            id="balance"
            className="w-full bg-black border border-neutral-800 text-white font-mono px-3 py-2 rounded-md focus:outline-none focus:ring-1 focus:ring-neutral-700 focus:border-neutral-700"
            placeholder="e.g., 1000.00"
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="p-2 text-white bg-blue-500 rounded hover:bg-blue-600 transition-hover disabled:opacity-50"
        >
          {isLoading ? "Saving changes..." : "Save changes"}
        </button>
      </form>
    </div>
  );
}

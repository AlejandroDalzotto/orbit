"use client";

import { useModal } from "@/context/modal-provider";
import { useWallet } from "@/context/wallet-provider";
import type { Account, AccountType, Currency, NewAccount } from "@/lib/definitions";
import { WalletService } from "@/services/wallet";
import { useState } from "react";
import { toast } from "sonner";

export default function ModalEditWallet({ account }: { account: Account }) {

  const [isLoading, setIsLoading] = useState(false);
  const { close } = useModal();
  const { onAccountEdited } = useWallet();

  const handleSubmit = async (e: React.FormEvent) => {
    setIsLoading(true);
    e.preventDefault();

    const formData = new FormData(e.target as HTMLFormElement);

    const newAccount: NewAccount = {
      name: formData.get("name") as string,
      type: formData.get("type") as AccountType,
      currency: formData.get("currency") as Currency,
      balance: parseFloat(formData.get("balance") as string)
    }

    try {
      const service = new WalletService();
      const [error, data] = await service.editAccount(account.id, newAccount);
      if (error) {
        toast.error(`Failed to create wallet: ${error.message}`);
        setIsLoading(false);
        return;
      }

      onAccountEdited(data)
      toast.success(`Account ${data.name} saved successfully.`);
      console.log('returned data from backend: ', data)
    } catch (e) {
      console.error({ e })
    } finally {
      setIsLoading(false);
      close();
    }
  }

  return (
    <div className="p-6 rounded shadow-lg bg-neutral-900 w-96">
      <h2 className="mb-4 text-xl font-bold">Add New Wallet</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-y-4">
        <div className="flex flex-col">
          <label htmlFor="name" className="mb-1 font-semibold">Wallet Name</label>
          <input defaultValue={account.name} type="text" id="name" name="name" className="p-2 border border-gray-300 rounded" placeholder="e.g., My Cash Wallet" />
        </div>
        <div className="flex flex-col">
          <label htmlFor="type" className="mb-1 font-semibold">Wallet Type</label>
          <select defaultValue={account.type} id="type" name="type" className="p-2 text-white border border-gray-700 rounded bg-neutral-800">
            <option value="cash">Cash</option>
            <option value="online wallet">Online Wallet</option>
            <option value="bank account">Bank Account</option>
            <option value="credit card">Credit Card</option>
          </select>
        </div>
        <div className="flex flex-col">
          <label htmlFor="currency" className="mb-1 font-semibold">Currency</label>
          <select defaultValue={account.currency} id="currency" name="currency" className="p-2 text-white border border-gray-700 rounded bg-neutral-800">
            <option value="USD">USD</option>
            <option value="ARS">ARS</option>
          </select>
        </div>
        <div className="flex flex-col">
          <label htmlFor="balance" className="mb-1 font-semibold">Initial Balance</label>
          <input defaultValue={account.balance} type="number" name="balance" id="balance" className="p-2 border border-gray-300 rounded" placeholder="e.g., 1000.00" />
        </div>
        <button type="submit" disabled={isLoading} className="p-2 text-white bg-blue-500 rounded hover:bg-blue-600 transition-hover disabled:opacity-50">Create Wallet</button>
      </form>
    </div>
  )
}

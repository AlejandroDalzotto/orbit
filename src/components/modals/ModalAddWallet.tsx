"use client";

import { useModal } from "@/context/modal-provider";
import type { AccountType, Currency, NewAccount } from "@/lib/definitions";
import { WalletService } from "@/services/wallet";
import { useState } from "react";
import { toast } from "sonner";

export default function ModalAddWallet() {
  const [isLoading, setIsLoading] = useState(false);
  const { close } = useModal();
  
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
    
    const service = new WalletService();
    const [error, data] = await service.addAccount(newAccount);
    console.log({ error, data });
    if (error) {
      toast.error(`Failed to create wallet: ${error.message}`);
      setIsLoading(false);
      return;
    }
    
    toast.success(data);
    close();
    
    setIsLoading(false);
  }

  return (
    <div className="bg-neutral-900 p-6 rounded shadow-lg w-96">
      <h2 className="text-xl font-bold mb-4">Add New Wallet</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-y-4">
        <div className="flex flex-col">
          <label htmlFor="name" className="mb-1 font-semibold">Wallet Name</label>
          <input type="text" id="name" name="name" className="p-2 border border-gray-300 rounded" placeholder="e.g., My Cash Wallet" />
        </div>
        <div className="flex flex-col">
          <label htmlFor="type" className="mb-1 font-semibold">Wallet Type</label>
          <select id="type" name="type" className="p-2 border border-gray-700 rounded bg-neutral-800 text-white">
            <option value="cash">Cash</option>
            <option value="online wallet">Online Wallet</option>
            <option value="bank account">Bank Account</option>
            <option value="credit card">Credit Card</option>
          </select>
        </div>
        <div className="flex flex-col">
          <label htmlFor="currency" className="mb-1 font-semibold">Currency</label>
          <select id="currency" name="currency" className="p-2 border border-gray-700 rounded bg-neutral-800 text-white">
            <option value="USD">USD</option>
            <option value="ARS">ARS</option>
          </select>
        </div>
        <div className="flex flex-col">
          <label htmlFor="balance" className="mb-1 font-semibold">Initial Balance</label>
          <input type="number" name="balance" id="balance" className="p-2 border border-gray-300 rounded" placeholder="e.g., 1000.00" />
        </div>
        <button type="submit" disabled={isLoading} className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition-hover disabled:opacity-50">Create Wallet</button>
      </form>
    </div>
  )
}

"use client";

import { useWalletStore } from "@/stores/walletStore";
import { ChevronDown } from "lucide-react";

export default function WalletField({ prefix }: { prefix: string }) {
  const accounts = useWalletStore((state) => state.accounts);

  if (!accounts) return null;

  return (
    <div>
      <label
        className="block text-neutral-300 font-mono mb-2"
        htmlFor={`${prefix}wallet`}
      >
        wallet
      </label>
      <div className="relative">
        <select
          id={`${prefix}wallet`}
          name="accountId"
          className="w-full appearance-none bg-black border border-neutral-800 hover:border-neutral-700 focus:border-neutral-700 text-white font-mono font-light px-3 py-2 pr-10 rounded-md cursor-pointer focus:outline-none focus:ring-1 focus:ring-neutral-700 transition-colors"
        >
          <option value="" disabled className="bg-black text-neutral-500">
            select category
          </option>
          {accounts.map((acc) => (
            <option key={acc.id} value={acc.id} className="bg-black text-white">
              {acc.name} • ${acc.balance} • {acc.currency}
            </option>
          ))}
        </select>

        {/* Custom chevron icon */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <ChevronDown className="h-4 w-4 text-neutral-400" />
        </div>
      </div>
    </div>
  );
}

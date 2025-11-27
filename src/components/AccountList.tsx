"use client";

import AccountCard from "@/components/AccountCard";
import ButtonAddWallet from "@/components/buttons/ButtonAddWallet";
import { useWalletStore } from "@/stores/walletStore";
import { motion } from "motion/react";

export default function AccountList() {
  const accounts = useWalletStore((state) => state.accounts);
  if (!accounts)
    return (
      <div className="flex items-center justify-center h-full">
        Something went wrong...
      </div>
    );

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-light tracking-wider text-neutral-200">
            Accounts
          </h2>
        </div>

        {accounts !== null
          ? accounts.map((account, index) => (
              <AccountCard
                key={account.id}
                account={account}
                animationDelay={index * 0.1}
              />
            ))
          : null}
      </div>

      {accounts.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center py-16 text-center"
        >
          <div className="w-1 h-16 mb-8 bg-neutral-800" />
          <p className="mb-8 font-light text-neutral-500">
            No accounts registered yet
          </p>
          <ButtonAddWallet text="Add your first account" />
        </motion.div>
      )}
    </>
  );
}

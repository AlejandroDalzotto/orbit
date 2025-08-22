"use client";

import AccountList from "@/components/AccountList";
import ButtonAddWallet from "@/components/buttons/ButtonAddWallet";
import { useWalletBalance } from "@/hooks/useWalletBalance";
import { motion } from "motion/react";

export default function WalletPage() {

  const { isLoading, error, totalBalance } = useWalletBalance()

  if (isLoading || totalBalance === null) {
    return <div className="flex items-center justify-center h-full">Loading...</div>;
  }
  if(error) return <div className="flex items-center justify-center h-full">Something went wrong...</div>

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-6xl mx-auto"
    >
      <div className="mb-16">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="pb-8 border-b border-neutral-800"
        >
          <h1 className="mb-2 text-2xl font-light tracking-wider text-white">YOUR WALLET</h1>
          <div className="flex items-center justify-between">
            <p className="text-sm font-light text-neutral-500">
              Total Balance: ${totalBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </p>
            <ButtonAddWallet text="Add account" />
          </div>
        </motion.div>
      </div>

      <AccountList />

    </motion.div>
  )
}

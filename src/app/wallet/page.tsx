"use client";

// import AccountCard from "@/components/AccountCard";
import ButtonAddWallet from "@/components/buttons/ButtonAddWallet";
import DropdownMenu from "@/components/DropdownMenu";
import { useWallet } from "@/context/wallet-provider";
import { motion } from "motion/react";

export default function WalletPage() {

  const { accounts, isLoading, totalBalance } = useWallet()

  if (isLoading || totalBalance === null || accounts === null) {
    return <div className="flex items-center justify-center h-full">Loading...</div>;
  }

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

      <div className="space-y-4">
        <h2 className="mb-2 font-light tracking-wider text-neutral-200">Accounts</h2>
        {accounts.map((account, index) => {

          return (
            <motion.div
              key={account.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between px-0 py-6 transition-colors border-b group border-neutral-900 hover:border-neutral-800"
            >
              <div className="flex-1">
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-2 rounded-full bg-neutral-600" />
                  <div>
                    <h3 className="font-light tracking-wide text-white">{account.name}</h3>
                    <p className="mt-1 text-xs text-neutral-500">
                      {account.type} • {account.currency} • {account.transactionsCount} transactions
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-6">
                <div className="text-right">
                  <p className="font-light text-white">
                    ${account.balance.toLocaleString(account.currency === 'USD' ? 'en-US' : 'es-AR', { minimumFractionDigits: 2 })}
                  </p>
                </div>

                {/* Dropdown menu */}
                <DropdownMenu account={account} />
              </div>
            </motion.div>
          )
        })}
      </div>

      {accounts.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center py-16 text-center">
          <div className="w-1 h-16 mb-8 bg-neutral-800" />
          <p className="mb-8 font-light text-neutral-500">No accounts registered yet</p>
          <ButtonAddWallet text="Add your first account" />
        </motion.div>
      )}

    </motion.div>
  )
}

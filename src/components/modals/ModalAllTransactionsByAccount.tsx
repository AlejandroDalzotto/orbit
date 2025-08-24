"use client";

import { useModal } from "@/context/modal-provider";
import type { Transaction } from "@/models/transaction";
import type { Account } from "@/models/wallet";
import { X } from "lucide-react";
import { motion } from "motion/react";

type CardProps = {
  transactions: Transaction[],
  account: Account
}

export default function ModalAllTransantionsByAccount({ transactions, account }: CardProps) {
  const { close } = useModal();
  return (
    <div className="relative p-6 text-sm rounded shadow-lg bg-black border border-neutral-700 w-lg overflow-y-auto">
      <button
        className="absolute right-6 top-6 hover:scale-125 transition-transform hover:cursor-pointer"
        onClick={() => close()}
      >
        <X />
      </button>
      <h2 className="mb-2 text-lg font-semibold">{account.name} history</h2>
      <p className="mb-4 text-neutral-500">current balance: ${account.balance.toLocaleString(account.currency === 'USD' ? 'en-US' : 'es-AR', { minimumFractionDigits: 2 })}</p>
      <div>
        {
          transactions.map((tx, idx) => {

            return (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-center justify-between px-0 py-3 transition-colors border-b group border-neutral-900 hover:border-neutral-800"
                key={tx.id}

              >
                <div className="flex-1">
                  <div className="flex items-center space-x-4">
                    <div className="w-2 h-2 rounded-full bg-neutral-600" />
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-light tracking-wide text-white">{tx.details}</h3>
                        <span className="px-1 py-px text-xs rounded border border-neutral-700 lowercase text-neutral-500">
                          {tx.category}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-neutral-500">
                        {tx.type} • {account.currency} • {new Date(tx.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-6">
                  <div className="text-right">
                    <p className="font-light text-white">
                      ${tx.amount.toLocaleString(account.currency === 'USD' ? 'en-US' : 'es-AR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              </motion.div>
            )

          })
        }
      </div>
    </div>
  )
}

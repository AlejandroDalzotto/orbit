import DropdownMenu from "@/components/DropdownMenu";
import type { Account } from "@/models/wallet";
import { motion } from 'motion/react';

export default function AccountCard({ account, animationDelay }: { account: Account, animationDelay: number }) {
  return (
    <motion.div
      key={account.id}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: animationDelay }}
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
}

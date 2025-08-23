import { renderSpecificInformation } from "@/helpers/render-specific-information";
import { useWalletAccounts } from "@/hooks/useWalletAccounts";
import { Transaction } from "@/models/transaction";
import { Calendar, Wallet2 } from "lucide-react";
import { motion } from "motion/react";
import DropdownMenuTransaction from "./DropdownMenuTransaction";

export default function TransactionCard({ transaction, animationDelay }: { transaction: Transaction, animationDelay: number }) {

  const { accounts } = useWalletAccounts()

  if (!accounts) return null;

  const accountName = accounts.find(acc => acc.id === transaction.accountId)?.name ?? "unknown account";

  return (
    <motion.div
      key={transaction.id}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: animationDelay }}
      className="flex items-center justify-between px-5 py-6 transition-colors border-b border-neutral-900 group hover:border-neutral-800"
    >
      <div className="flex-1">
        <div className="flex items-center space-x-4">
          <div className="w-2 h-2 rounded-full bg-neutral-600" />
          <div className="flex flex-col space-y-2">
            <div className="flex items-center space-x-2">
              <h3 className="font-light tracking-wide text-white">{transaction.details}</h3>
              <span className="px-2 text-sm rounded border border-neutral-700 lowercase text-neutral-500">
                {transaction.category}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-x-6">
              <p className="flex items-center gap-x-2 text-sm text-neutral-500">
                <Calendar className="w-3 h-3" />
                {new Date(transaction.date).toLocaleDateString()}
              </p>
              <p className="flex items-center gap-x-2 text-sm text-neutral-500">
                <Wallet2 className="w-3 h-3" />
                {accountName}
              </p>
              {renderSpecificInformation(transaction)}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-6">

        <div className="text-right">
          <p className="text-white text-lg font-light"> {transaction.type === 'income' ? "+" : "-"}${transaction.amount.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</p>
        </div>

        <DropdownMenuTransaction transaction={transaction} />
      </div>
    </motion.div>
  )
}
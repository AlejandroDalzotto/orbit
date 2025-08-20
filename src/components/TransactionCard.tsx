import { renderSpecificInformation } from "@/helpers/render-specific-information";
import { Transaction } from "@/models/transaction";
import { motion } from "motion/react";

export default function TransactionCard({ transaction, animationDelay }: { transaction: Transaction, animationDelay: number }) {
  return (
    <motion.div
      key={transaction.id}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: animationDelay }}
      className="flex items-center justify-between px-5 py-6 transition-colors border-b border-neutral-900 hover:border-neutral-800"
    >
      <div className="flex-1">
        <div className="flex items-center space-x-4">
          <div className="w-2 h-2 rounded-full bg-neutral-600" />
          <div className="flex flex-col space-y-2">
            <div className="flex items-center space-x-2">
              <h3 className="font-light tracking-wide text-white">{transaction.details}</h3>
              <span className="px-2 text-sm rounded border border-neutral-700 lowercase text-neutral-700">
                {transaction.category}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {renderSpecificInformation(transaction)}
              <p className="flex items-center text-sm text-neutral-700">{new Date(transaction.date).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </div>

      <div>
        <p className="text-white text-lg"> {transaction.type === 'income' ? "+" : "-"}${transaction.amount.toLocaleString(transaction.currency === 'USD' ? 'en-US' : 'es-AR', { minimumFractionDigits: 2 })} • {transaction.currency}</p>
      </div>
    </motion.div>
  )
}
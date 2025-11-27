"use client";

import { useTransactionStore } from "@/stores/transactionStore";
import { DollarSign, TrendingDown, TrendingUp } from "lucide-react";
import { motion } from "motion/react";

export default function TransactionsFinancialSummary() {
  const totalIncome = useTransactionStore((state) => state.totalIncome);
  const totalExpenses = useTransactionStore((state) => state.totalExpenses);
  const totalTransactions = useTransactionStore(
    (state) => state.totalTransactions,
  );
  const netBalance = useTransactionStore((state) => state.netBalance);

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2 }}
      className="grid gap-6 md:grid-cols-3 mb-12"
    >
      <div className="border-neutral-800 flex flex-col gap-6 rounded-xl border py-6 shadow-sm bg-black">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-neutral-400 font-mono text-sm">income</span>
            <TrendingUp className="h-4 w-4 text-neutral-600" />
          </div>
          <div className="text-2xl font-light text-white font-mono">
            +$
            {totalIncome.toLocaleString("en-US", {
              minimumFractionDigits: 2,
            })}
          </div>
        </div>
      </div>

      <div className="border-neutral-800 flex flex-col gap-6 rounded-xl border py-6 shadow-sm bg-black">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-neutral-400 font-mono text-sm">expenses</span>
            <TrendingDown className="h-4 w-4 text-neutral-600" />
          </div>
          <div className="text-2xl font-light text-white font-mono">
            -$
            {totalExpenses.toLocaleString("en-US", {
              minimumFractionDigits: 2,
            })}
          </div>
        </div>
      </div>

      <div className="border-neutral-800 flex flex-col gap-6 rounded-xl border py-6 shadow-sm bg-black">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-neutral-400 font-mono text-sm">
              net balance
            </span>
            <DollarSign className="h-4 w-4 text-neutral-600" />
          </div>
          <div
            className={`text-2xl font-light font-mono ${netBalance >= 0 ? "text-white" : "text-red-400"}`}
          >
            {netBalance >= 0 ? "+" : ""}$
            {netBalance.toLocaleString("en-US", {
              minimumFractionDigits: 2,
            })}
          </div>
          <p className="text-neutral-500 text-xs font-mono mt-2">
            {totalTransactions}{" "}
            {totalTransactions === 1 ? "transaction" : "transactions"}{" "}
            registered
          </p>
        </div>
      </div>
    </motion.div>
  );
}

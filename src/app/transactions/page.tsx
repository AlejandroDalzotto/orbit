"use client";

import ButtonAddTransaction from "@/components/buttons/ButtonAddTransaction";
import Searchbar from "@/components/Searchbar";
import TransactionList from "@/components/TransactionList";
import TransactionsFinancialSummary from "@/components/TransactionsFinancialSummary";
import { useTransactionStore } from "@/stores/transactionStore";
import { motion } from "motion/react";
import { useEffect } from "react";

export default function Home() {
  const loadPersistedTransactions = useTransactionStore(
    (state) => state.loadPersistedTransactions,
  );

  // Load transactions data on mount
  useEffect(() => {
    loadPersistedTransactions();
  }, [loadPersistedTransactions]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col max-w-6xl mx-auto"
    >
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="mb-12"
      >
        <h1 className="mb-2 font-mono text-4xl font-light text-white">
          transactions
        </h1>
        <div className="w-16 h-px mb-4 bg-neutral-800"></div>
        <p className="font-mono text-sm text-neutral-400">
          track income and expenses
        </p>
      </motion.div>

      <TransactionsFinancialSummary />

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex flex-col gap-4 mb-8 sm:flex-row"
      >
        <div className="flex-1">
          <Searchbar />
        </div>

        <ButtonAddTransaction text="Add new transaction" />
      </motion.div>

      <TransactionList />
    </motion.div>
  );
}

"use client";

import type React from "react";

import ButtonAddTransaction from "@/components/buttons/ButtonAddTransaction";
import TransactionCard from "@/components/TransactionCard";
import PaginationControls from "@/components/PaginationControls";
import { motion } from "motion/react";
import SortOptionsSelectorTransactions from "./SortOptionsSelectorTransactions";
import { useTransactionStore } from "@/stores/transactionStore";

export default function TransactionList() {
  const transactions = useTransactionStore((state) => state.transactions);
  const currentPage = useTransactionStore((state) => state.currentPage);
  const limit = useTransactionStore((state) => state.limitPerPage);
  const totalTransactions = useTransactionStore(
    (state) => state.totalTransactions,
  );
  const totalPages = useTransactionStore((state) => state.totalPages);

  const startItem = totalTransactions > 0 ? (currentPage - 1) * limit + 1 : 0;
  const endItem = Math.min(currentPage * limit, totalTransactions);
  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h2 className="font-light tracking-wider text-neutral-200">
              Transactions
            </h2>
            {totalTransactions > 0 && (
              <motion.span
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                className="font-mono text-xs text-neutral-500"
              >
                showing {startItem}-{endItem} of {totalTransactions}{" "}
                transactions
              </motion.span>
            )}
          </div>

          <SortOptionsSelectorTransactions
            shouldRender={totalTransactions > 0}
          />
        </div>

        {totalPages > 1 ? (
          <div className="flex items-center justify-between py-3 border-y border-neutral-800">
            <PaginationControls className="" showGoTo={true} />
          </div>
        ) : null}

        {transactions.map((transaction, i) => (
          <TransactionCard
            key={transaction.id}
            transaction={transaction}
            animationDelay={i * 0.1}
          />
        ))}
      </div>

      {totalTransactions === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center py-16 text-center"
        >
          <div className="w-1 h-16 mb-8 bg-neutral-800" />
          <p className="mb-8 font-light text-neutral-500">
            No transactions registered yet
          </p>
          <ButtonAddTransaction text="Add your first transaction" />
        </motion.div>
      )}
    </>
  );
}

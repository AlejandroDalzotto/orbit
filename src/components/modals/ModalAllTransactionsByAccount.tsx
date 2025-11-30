"use client";

import { useModal } from "@/context/modal-provider";
import { TransactionCategory } from "@/models/transaction";
import type { Account } from "@/models/wallet";
import { X } from "lucide-react";
import { motion } from "motion/react";
import { useEffect } from "react";
import PaginationControls from "@/components/PaginationControls";
import { PaginationLimit } from "@/lib/types";
import { useAccountTransactionStore } from "@/stores/accountTransactionStore";

type CardProps = {
  account: Account;
};

export default function ModalAllTransantionsByAccount({ account }: CardProps) {
  const error = useAccountTransactionStore((state) => state.error);
  const isLoading = useAccountTransactionStore((state) => state.isLoading);
  const setAccount = useAccountTransactionStore((state) => state.setAccount);
  const loadPage = useAccountTransactionStore((state) => state.loadPage);
  const reset = useAccountTransactionStore((state) => state.reset);
  const total = useAccountTransactionStore((state) => state.total);
  const limit = useAccountTransactionStore((state) => state.limitPerPage);
  const currentPage = useAccountTransactionStore((state) => state.currentPage);
  const transactions = useAccountTransactionStore((state) => state.items);
  const changeLimit = useAccountTransactionStore((state) => state.changeLimit);
  const totalPages = useAccountTransactionStore((state) => state.totalPages);

  const { close } = useModal();

  useEffect(() => {
    setAccount(account.id);
    loadPage(1);
    return () => reset();
  }, [account.id, loadPage, setAccount, reset]);

  if (error) {
    return (
      <div className="relative p-6 text-sm rounded shadow-lg bg-black border border-neutral-700 w-lg overflow-y-auto">
        <button
          className="absolute right-6 top-6 hover:scale-125 transition-transform hover:cursor-pointer"
          onClick={() => close()}
        >
          <X />
        </button>
        <h2 className="mb-2 text-lg font-semibold">{account.name} history</h2>
        <div className="grid font-mono text-red-400 grow place-content-center">
          Something went wrong while trying to get account transactions.
        </div>
      </div>
    );
  }

  const startItem = total > 0 ? (currentPage - 1) * limit + 1 : 0;
  const endItem = Math.min(currentPage * limit, total);

  return (
    <div className="relative p-6 text-sm rounded shadow-lg bg-black border border-neutral-700 w-lg max-h-[70vh] overflow-y-auto">
      <button
        className="absolute right-6 top-6 hover:scale-125 transition-transform hover:cursor-pointer"
        onClick={() => close()}
      >
        <X />
      </button>

      <h2 className="mb-2 text-lg font-semibold">{account.name} history</h2>
      <p className="mb-4 text-neutral-500">
        current balance: $
        {account.balance.toLocaleString(
          account.currency === "USD" ? "en-US" : "es-AR",
          { minimumFractionDigits: 2 },
        )}
      </p>

      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {total > 0 ? (
            <motion.span
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              className="font-mono text-xs text-neutral-500"
            >
              showing {startItem}-{endItem} of {total} transactions
            </motion.span>
          ) : (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="font-mono text-xs text-neutral-500"
            >
              {isLoading
                ? "Loading transactions..."
                : "No transactions for this account"}
            </motion.span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs text-neutral-500 font-mono">per page</label>
          <select
            value={limit}
            onChange={(e) => {
              // changeLimit resets page to 1 inside the provider
              changeLimit(Number(e.target.value) as PaginationLimit);
            }}
            className="px-2 py-1 text-sm bg-black border rounded border-neutral-800 text-neutral-400"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
          </select>
        </div>
      </div>

      <div>
        {transactions.map((tx, idx) => {
          return (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.04 }}
              className="flex items-center justify-between px-0 py-3 transition-colors border-b group border-neutral-900 hover:border-neutral-800"
              key={tx.id}
            >
              <div className="flex-1">
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-2 rounded-full bg-neutral-600" />
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-light tracking-wide text-white">
                        {tx.details}
                      </h3>
                      <span className="px-1 py-px text-xs rounded border border-neutral-700 lowercase text-neutral-500">
                        {tx.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-x-1">
                      <p className="mt-1 text-xs text-neutral-500">
                        {tx.type} • {account.currency} •{" "}
                        {new Date(tx.date).toLocaleDateString()}
                      </p>
                      {tx.category === TransactionCategory.Shopping ? (
                        <p className="mt-1 text-xs text-neutral-500 truncate">
                          • {tx.items.length} items at {tx.storeName}.
                        </p>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-6">
                <div className="text-right">
                  <p className="font-light text-white">
                    $
                    {tx.amount.toLocaleString(
                      account.currency === "USD" ? "en-US" : "es-AR",
                      { minimumFractionDigits: 2 },
                    )}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}

        {isLoading && transactions.length === 0 && (
          <div className="py-6 text-center text-neutral-500">Loading...</div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="mt-4">
          <PaginationControls
            className="py-3 border-t border-neutral-800"
            showGoTo={true}
          />
        </div>
      )}
    </div>
  );
}

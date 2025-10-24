"use client"

import type React from "react"

import ButtonAddTransaction from "@/components/buttons/ButtonAddTransaction"
import TransactionCard from "@/components/TransactionCard"
import { useTransactionSearch } from "@/hooks/useTransactions"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { motion } from "motion/react"
import { useCallback, useState } from "react"
import { getPageNumbers } from "@/lib/utils"
import SortOptionsSelectorTransactions from "./SortOptionsSelectorTransactions"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { SortOption } from "@/lib/types"

export default function TransactionList() {
  const [pageInput, setPageInput] = useState("")

  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()

  const currentPage = Number(searchParams.get('currentPage')) || 1;
  const limit = Number(searchParams.get('limit')) || 10;
  const search = searchParams.get('search') || "";
  const sortBy = searchParams.get('sortBy') as SortOption || "latest";

  const { transactions, total, totalPages, hasNext, hasPrevious, error, hasQuery, mutate } = useTransactionSearch({
    query: search,
    limit,
    offset: (currentPage - 1) * limit,
    sortBy
  })

  const startItem = total > 0 ? (currentPage - 1) * limit + 1 : 0
  const endItem = Math.min(currentPage * limit, total)

  // build a full url for navigation; if value is empty it removes the param
  const buildUrl = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) params.set(name, value)
      else params.delete(name)

      const qs = params.toString()
      return pathname + (qs ? `?${qs}` : "")
    },
    [pathname, searchParams]
  )

  const onMutateTransactions = () => {
    mutate()
  }

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      router.push(buildUrl('currentPage', page.toString()))
    }
  }

  const handlePageInputSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const page = Number.parseInt(pageInput)
    if (!isNaN(page) && page >= 1 && page <= totalPages) {
      goToPage(page)
      setPageInput("")
    }
  }

  if (error) {
    return (
      <div className="grid font-mono text-red-400 grow place-content-center">
        Something went wrong while trying to get transactions data.
      </div>
    )
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h2 className="font-light tracking-wider text-neutral-200">Transactions</h2>
            {total > 0 && (
              <motion.span
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                className="font-mono text-xs text-neutral-500"
              >
                showing {startItem}-{endItem} of {total} transactions
              </motion.span>
            )}
          </div>

          <SortOptionsSelectorTransactions shouldRender={transactions.length > 0} />
        </div>

        {totalPages > 1 ? (
          <div className="flex items-center justify-between py-3 border-y border-neutral-800">
            <form onSubmit={handlePageInputSubmit} className="flex items-center gap-2">
              <span className="font-mono text-xs text-neutral-500">go to</span>
              <input
                max={totalPages}
                min={1}
                type="number"
                value={pageInput}
                onChange={(e) => setPageInput(e.target.value)}
                placeholder="page..."
                className="w-24 px-2 py-1 font-mono text-sm bg-black border rounded border-neutral-800 text-neutral-400 placeholder:text-neutral-600 focus:outline-none focus:border-neutral-700"
              />
            </form>

            <div className="flex items-center gap-2">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={!hasPrevious}
                className="p-2 transition-colors text-neutral-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-1">
                {getPageNumbers(currentPage, totalPages).map((page, index) => (
                  <div key={index}>
                    {page === "..." ? (
                      <span className="px-2 font-mono text-sm select-none text-neutral-600">...</span>
                    ) : (
                      <button
                        onClick={() => goToPage(page as number)}
                        className={`px-3 select-none py-1 text-sm font-mono rounded transition-colors ${currentPage === page
                          ? "bg-white text-black"
                          : "text-neutral-400 hover:text-white hover:bg-neutral-900"
                          }`}
                      >
                        {page}
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={!hasNext}
                className="p-2 transition-colors text-neutral-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : null}

        {transactions.map((transaction, i) => (
          <TransactionCard key={transaction.id} onMutate={onMutateTransactions} transaction={transaction} animationDelay={i * 0.1} />
        ))}
      </div>

      {total === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center py-16 text-center"
        >
          <div className="w-1 h-16 mb-8 bg-neutral-800" />
          <p className="mb-8 font-light text-neutral-500">
            {hasQuery ? "No transactions found for your search" : "No transactions registered yet"}
          </p>
          {!hasQuery && <ButtonAddTransaction onMutate={onMutateTransactions} text="Add your first transaction" />}
        </motion.div>
      )}
    </>
  )
}

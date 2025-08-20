import type { Transaction } from "@/models/transaction"
import { invoke } from "@tauri-apps/api/core"
import useSWR from "swr"

type PaginationProps = {
  limit: number
  offset: number
}

type SearchProps = {
  query: string
  limit?: number
}

const transactionsFetcher = ({ limit, offset }: PaginationProps) => invoke("get_transactions", { limit, offset })

const searchFetcher = ({ query, limit = 50 }: SearchProps) =>
  query.trim() ? invoke("search_transactions", { query, limit }) : Promise.resolve([])

export const useTransactions = ({ limit, offset }: PaginationProps) => {
  const { data, error, isLoading, mutate } = useSWR(["transactions", { limit, offset }], transactionsFetcher)

  return {
    transactions: data as Transaction[],
    error,
    isLoading,
    mutate,
  }
}

export const useTransactionSearch = ({ query, limit }: SearchProps) => {
  const { data, error, isLoading } = useSWR(query.trim() ? ["search", query, limit] : null, () =>
    searchFetcher({ query, limit }),
  )

  return {
    searchResults: (data as Transaction[]) || [],
    error,
    isLoading: isLoading && query.trim().length > 0,
    hasQuery: query.trim().length > 0,
  }
}

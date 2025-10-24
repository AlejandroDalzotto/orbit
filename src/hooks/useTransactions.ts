import { PaginationResult, SortOption } from "@/lib/types"
import type { Transaction } from "@/models/transaction"
import { invoke } from "@tauri-apps/api/core"
import useSWR from "swr"

type SearchProps = {
  query: string
  limit: number
  offset: number
  sortBy: SortOption
}

const searchFetcher = ({ query, limit, offset, sortBy }: SearchProps) =>
  invoke<PaginationResult<Transaction>>("search_transactions", { query, limit, offset, sortBy })

export const useTransactionSearch = ({ query, limit, offset, sortBy }: SearchProps) => {

  const swrKey = { query, limit, offset, sortBy }

  const { data, error, isLoading, mutate } = useSWR(
    swrKey,
    searchFetcher,
    {
      revalidateOnFocus: false,
      revalidateIfStale: false,
      revalidateOnReconnect: false,
    }
  )

  return {
    transactions: data?.items as Transaction[] || [],
    total: data?.total ?? 0,
    totalPages: data?.totalPages ?? 0,
    hasNext: data?.hasNext ?? false,
    hasPrevious: data?.hasPrevious ?? false,
    currentPage: data?.page ?? 1,
    error,
    isLoading,
    hasQuery: query.trim().length > 0,
    mutate,
  }
}
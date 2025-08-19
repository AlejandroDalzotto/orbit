import type { Transaction } from "@/models/transaction"
import { invoke } from "@tauri-apps/api/core"
import useSWR from "swr"

type PaginationProps = {
  limit: number,
  offset: number,
}

const fetcher = ({ limit, offset }: PaginationProps) => invoke('get_transactions', { limit, offset })

export const useTransactions = ({ limit, offset }: PaginationProps) => {
  const { data, error, isLoading, mutate } = useSWR(['transactions', { limit, offset }], fetcher);

  return {
    transactions: data as Transaction[],
    error,
    isLoading,
    mutate
  }
}
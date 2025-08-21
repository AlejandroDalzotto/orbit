import type { FinancialSummany } from "@/models/transaction";
import { invoke } from "@tauri-apps/api/core";
import useSWR from "swr";

const fetcher = () => invoke('get_financial_summary')

export const useTransactionsFinancialSummary = () => {
  const { data, error, isLoading, mutate } = useSWR('transactions-financial-summary', fetcher);

  return {
    financialSummary: data as FinancialSummany,
    error,
    isLoading,
    mutate
  }
}
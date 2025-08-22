import { invoke } from "@tauri-apps/api/core";
import useSWR from "swr";

const fetcher = () => invoke('get_total_balance')

export const useWalletBalance = () => {
  const { data, error, isLoading, mutate } = useSWR('wallet-balance', fetcher);

  return {
    totalBalance: (data as number) || 0,
    error,
    isLoading,
    mutate
  }
}
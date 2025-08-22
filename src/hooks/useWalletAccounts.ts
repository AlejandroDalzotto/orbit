import type { Account } from "@/models/wallet"
import { invoke } from "@tauri-apps/api/core"
import useSWR from "swr"

const fetcher = () => invoke("get_accounts")

export const useWalletAccounts = () => {
  const { data, error, isLoading, mutate } = useSWR("wallet-accounts", fetcher)

  return {
    accounts: (data as Account[]) || [],
    error,
    isLoading,
    mutate,
  }
}

import { StateCreator } from "zustand";
import { AccountSlice, GlobalStoreState } from "../types";
import { Account, AddAccount, UpdateAccount } from "../../definitions/accounts";
import { invoke } from "@tauri-apps/api/core";

export const createAccountSlice: StateCreator<GlobalStoreState, [], [], AccountSlice> = (set) => ({
  accounts: [],
  initAccounts: async () => {
    const accounts = await invoke<Account[]>("get_accounts");
    set({ accounts });
  },
  addAccount: async (account: AddAccount) => {
    const newAccount = await invoke<Account>("add_account", { account });
    set((old) => ({ accounts: [...old.accounts, newAccount] }));
  },
  deleteAccount: async (id: number) => {
    await invoke("delete_account", { id });
    set((old) => ({ accounts: old.accounts.filter((a) => a.id !== id) }));
  },
  updateAccount: async (id: number, account: UpdateAccount) => {
    await invoke<Account>("update_account", { id, account });
    set((old) => ({ accounts: old.accounts.map((a) => (a.id === id ? { ...a, ...account } : a)) }));
  },
});

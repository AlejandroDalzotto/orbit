import { create } from "zustand";
import { Account, AddAccount, UpdateAccount } from "../definitions/accounts";
import { addAccount, deleteAccount, getAccounts, updateAccount } from "../commands/accounts";

type AccountStore = {
  accounts: Account[];
  actions: {
    initialize: () => Promise<void>;
    addAccount: (account: AddAccount) => Promise<void>;
    deleteAccount: (id: number) => Promise<void>;
    updateAccount: (id: number, account: UpdateAccount) => Promise<void>;
  };
};

const useAccountStore = create<AccountStore>((set) => ({
  accounts: [],
  actions: {
    initialize: async () => {
      const accounts = await getAccounts();
      set({ accounts });
    },
    addAccount: async (account: AddAccount) => {
      const newAccount = await addAccount(account);
      set((old) => ({ accounts: [...old.accounts, newAccount] }));
    },
    deleteAccount: async (id: number) => {
      await deleteAccount(id);
      set((old) => ({ accounts: old.accounts.filter((a) => a.id !== id) }));
    },
    updateAccount: async (id: number, account: UpdateAccount) => {
      await updateAccount(id, account);
      set((old) => ({ accounts: old.accounts.map((a) => (a.id === id ? { ...a, ...account } : a)) }));
    },
  },
}));

export const useAccounts = () => useAccountStore((state) => state.accounts);
export const useAccountActions = () => useAccountStore((state) => state.actions);

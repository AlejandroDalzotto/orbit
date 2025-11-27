import { Response } from "@/lib/types";
import { Account, CreateAccount, EditAccount } from "@/models/wallet";
import { WalletService } from "@/services/wallet";
import { create } from "zustand";

type State = {
  totalBalance: number;
  accountCount: number;
  accounts: Account[];
};

type Action = {
  loadPersistedAccounts: () => Response<string>;
  addAccount: (account: CreateAccount) => Response<string>;
  removeAccount: (id: string) => Response<string>;
  updateAccount: (id: string, account: EditAccount) => Response<string>;
  updateValuesOnTransactionAdded: (
    accountId: string,
    amount: number,
    isIncome: boolean,
  ) => Promise<void>;
  updateValuesOnTransactionEdited: (
    accountId: string,
    oldAmount: number,
    newAmount: number,
    isIncome: boolean,
  ) => Promise<void>;
  updateValuesOnTransactionRemoved: (
    accountId: string,
    amount: number,
    isIncome: boolean,
  ) => Promise<void>;
};

const service = new WalletService();

export const useWalletStore = create<State & Action>()((set, get) => ({
  totalBalance: 0,
  accountCount: 0,
  accounts: [],
  addAccount: async (newEntry) => {
    try {
      const [error, data] = await service.addAccount(newEntry);
      if (error) {
        return [error, null];
      }

      const { accounts, totalBalance, accountCount } = get();
      set({
        accounts: [...accounts, data],
        totalBalance: totalBalance + data.balance,
        accountCount: accountCount + 1,
      });
      return [null, `Account ${data.name} saved successfully.`];
    } catch (e) {
      const error = (e as Error).message;
      return [{ message: error }, null];
    }
  },
  removeAccount: async (id) => {
    try {
      const [error, data] = await service.deleteAccount(id);
      if (error) {
        return [error, null];
      }

      const { accounts, totalBalance, accountCount } = get();
      const newAccounts = accounts.filter((account) => account.id !== id);
      const newTotalBalance = totalBalance - data.balance;
      const newAccountCount = accountCount - 1;
      set({
        accounts: newAccounts,
        totalBalance: newTotalBalance,
        accountCount: newAccountCount,
      });

      return [
        null,
        `Account ${data.name} deleted successfully.\n${data.transactionsCount} transactions will be marked as paid with an unknown method.`,
      ];
    } catch (e) {
      const error = (e as Error).message;
      return [{ message: error }, null];
    }
  },
  updateAccount: async (id, newValues) => {
    try {
      const [error, data] = await service.editAccount(id, newValues);
      if (error) {
        return [error, null];
      }

      const { accounts } = get();

      const accountToUpdate = accounts.find((account) => account.id === id);

      if (accountToUpdate) {
        const updatedBalance = data.balance - accountToUpdate.balance;
        const { totalBalance } = get();
        const updatedAccounts = accounts.map((account) =>
          account.id === id ? data : account,
        );
        set({
          accounts: updatedAccounts,
          totalBalance: totalBalance + updatedBalance,
        });
        return [null, `Account ${data.name} edited successfully.`];
      }

      return [{ message: "Error trying to update account" }, null];
    } catch (e) {
      const error = (e as Error).message;
      return [{ message: error }, null];
    }
  },
  loadPersistedAccounts: async () => {
    try {
      const [error, data] = await service.getAccounts();
      if (error) {
        return [error, null];
      }

      const { totalBalance, accountCount } = get();
      const newTotalBalance =
        totalBalance + data.reduce((acc, account) => acc + account.balance, 0);
      const newAccountCount = accountCount + data.length;
      set({
        accounts: data,
        totalBalance: newTotalBalance,
        accountCount: newAccountCount,
      });

      return [null, `Accounts loaded successfully.`];
    } catch (e) {
      const error = (e as Error).message;
      return [{ message: error }, null];
    }
  },
  updateValuesOnTransactionAdded: async (accountId, amount, isIncome) => {
    const { accounts, totalBalance } = get();

    const accountToUpdate = accounts.find(
      (account) => account.id === accountId,
    );

    if (accountToUpdate) {
      const updatedBalance = isIncome ? amount : -amount;
      const updatedAccounts = accounts.map((account) =>
        account.id === accountId
          ? {
              ...account,
              balance: account.balance + updatedBalance,
              transactionsCount: account.transactionsCount + 1,
            }
          : account,
      );
      set({
        accounts: updatedAccounts,
        totalBalance: totalBalance + updatedBalance,
      });
    }
  },
  updateValuesOnTransactionEdited: async (
    accountId,
    oldAmount,
    newAmount,
    isIncome,
  ) => {
    const { accounts, totalBalance } = get();

    const accountToUpdate = accounts.find(
      (account) => account.id === accountId,
    );

    if (accountToUpdate) {
      // Compute signed values so income adds and expenses subtract.
      const oldSigned = isIncome ? oldAmount : -oldAmount;
      const newSigned = isIncome ? newAmount : -newAmount;
      const delta = newSigned - oldSigned;

      const updatedAccounts = accounts.map((account) =>
        account.id === accountId
          ? { ...account, balance: account.balance + delta }
          : account,
      );

      set({
        accounts: updatedAccounts,
        totalBalance: totalBalance + delta,
      });
    }
  },
  updateValuesOnTransactionRemoved: async (accountId, amount, isIncome) => {
    const { accounts, totalBalance } = get();

    const accountToUpdate = accounts.find(
      (account) => account.id === accountId,
    );

    if (accountToUpdate) {
      const updatedBalance = isIncome ? -amount : amount;

      const updatedAccounts = accounts.map((account) =>
        account.id === accountId
          ? {
              ...account,
              balance: account.balance + updatedBalance,
              transactionsCount: account.transactionsCount - 1,
            }
          : account,
      );

      set({
        accounts: updatedAccounts,
        totalBalance: totalBalance + updatedBalance,
      });
    }
  },
}));

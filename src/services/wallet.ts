import type { Response } from "@/lib/types";
import { Transaction } from "@/models/transaction";
import type { Account, CreateAccount, EditAccount } from "@/models/wallet";
import { invoke } from "@tauri-apps/api/core";

export class WalletService {
  async getTotalBalance(): Response<number> {
    try {
      const balance = await invoke("get_total_balance");
      return [null, balance as number];
    } catch (e) {
      return [{ msg: (e as Error).message }, null];
    }
  }

  async getAccounts(): Response<Account[]> {
    try {
      const accounts: Account[] = await invoke("get_accounts");
      return [null, accounts];
    } catch (e) {
      return [{ msg: (e as Error).message }, null];
    }
  }

  async getAccountHistory(id: string): Response<Transaction[]> {
    try {
      const result = await invoke<Transaction[]>("get_transactions_by_account_id", { id });
      return [null, result];
    } catch (e) {
      return [{ msg: (e as Error).message }, null];
    }
  }

  async addAccount(newEntry: CreateAccount): Response<Account> {
    try {
      const result = await invoke<Account>("add_account", { entry: newEntry });
      return [null, result];
    } catch (e) {
      return [{ msg: (e as Error).message }, null];
    }
  }

  async editAccount(id: string, newValues: EditAccount): Response<Account> {
    try {
      const result = await invoke<Account>("edit_account", { id, entry: newValues });
      return [null, result];
    } catch (e) {
      return [{ msg: (e as Error).message }, null];
    }
  }

  async deleteAccount(id: string): Response<Account> {
    try {
      const result = await invoke<Account>("delete_account", { id });
      return [null, result];
    } catch (e) {
      return [{ msg: (e as Error).message }, null];
    }
  }
}
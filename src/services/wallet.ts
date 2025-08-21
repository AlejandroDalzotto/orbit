import type { Response } from "@/lib/types";
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

  // todo: Getting account history may fail due to the objects structure
  // Since we are using inheritance, the history may not be all the exact same type,
  // but they share some common properties from inheritance. So we need to use the base type.
  // getAccountHistory(id: string): Response<any[]> {
  //   throw new Error("Method not implemented.");
  // }

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
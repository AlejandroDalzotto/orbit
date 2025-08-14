import { Account, NewAccount } from "@/lib/definitions";
import { invoke } from "@tauri-apps/api/core";

type Response<T> = Promise<[Error, null] | [null, T]>;

export class WalletService {
  async getTotalBalance(): Response<number> {
    try {
      const balance = await invoke("get_total_balance");
      return [null, balance as number];
    } catch (e) {
      return [e as Error, null];
    }
  }

  async getAccounts(): Response<Account[]> {
    try {
      const accounts: Account[] = await invoke("get_accounts");
      return [null, accounts];
    } catch (e) {
      return [e as Error, null];
    }
  }

  // todo: Getting account history may fail due to the objects structure
  // Since we are using inheritance, the history may not be all the exact same type,
  // but they share some common properties from inheritance. So we need to use the base type.
  // getAccountHistory(id: string): Response<any[]> {
  //   throw new Error("Method not implemented.");
  // }

  async addAccount(newEntry: NewAccount): Response<Account> {
    try {
      const result = await invoke<Account>("add_account", { entry: newEntry });
      return [null, result];
    } catch (e) {
      return [e as Error, null];
    }
  }

  // updateAccount(id: string, newValues: NewAccount): Promise<boolean> {
  //   throw new Error("Method not implemented.");
  // }

  // deleteAccount(id: string): Promise<boolean> {
  //   throw new Error("Method not implemented.");
  // }
}
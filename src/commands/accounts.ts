import { invoke } from "@tauri-apps/api/core";

export type Account = {
  id: number;
  name: string;
  acc_type: string;
  currency: string;
  created_at: string;
};

type UpdateAccount = {
  id: number;
  name?: string;
  acc_type?: string;
};

type AddAccount = {
  name: string;
  acc_type: string;
};

export async function getAccounts(): Promise<Account[]> {
  const accounts = await invoke<Account[]>("get_accounts");
  return accounts;
}

export async function getAccountBalanceById(id: number): Promise<number> {
  const balance = await invoke<number>("get_account_balance_by_id", { id });
  return balance;
}

export async function addAccount(newValues: AddAccount): Promise<Account> {
  const account = await invoke<Account>("add_account", { account: newValues });
  return account;
}

export async function deleteAccount(id: number): Promise<boolean> {
  await invoke("delete_account", { id });
  return true;
}

export async function updateAccount(acc: UpdateAccount): Promise<boolean> {
  await invoke("update_account", { id: acc.id, account: acc });
  return true;
}

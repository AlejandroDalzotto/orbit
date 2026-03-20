import { invoke } from "@tauri-apps/api/core";

export type Account = {
  id: number;
  name: string;
  acc_type: string;
  currency: string;
  created_at: string;
  balance: number; // en centavos
  notes?: string;
};

export type UpdateAccount = {
  name: string;
  acc_type: string;
  notes?: string;
};

export type AddAccount = {
  name: string;
  acc_type: string;
  currency: string;
  initial_balance: number;
  notes?: string;
};

export async function getAccounts(): Promise<Account[]> {
  const accounts = await invoke<Account[]>("get_accounts");
  console.log({ accounts });
  return accounts;
}

export async function addAccount(newValues: AddAccount): Promise<Account> {
  const account = await invoke<Account>("add_account", { account: newValues });
  return account;
}

export async function deleteAccount(id: number): Promise<boolean> {
  await invoke("delete_account", { id });
  return true;
}

export async function updateAccount(id: number, acc: UpdateAccount): Promise<boolean> {
  await invoke("update_account", { id, account: acc });
  return true;
}

import { invoke } from "@tauri-apps/api/core";
import { Account, AddAccount, UpdateAccount } from "../definitions/accounts";

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

export async function updateAccount(id: number, acc: UpdateAccount): Promise<Account> {
  const account = await invoke<Account>("update_account", { id, account: acc });
  return account;
}

import { invoke } from "@tauri-apps/api/core";

export type Account = {
  id: number;
  name: string;
  acc_type: string;
  currency: string;
  created_at: string;
};

type Result<T, E> =
  | {
      ok: T;
      error: null;
    }
  | {
      ok: null;
      error: E;
    };

type AppError = {
  message: string;
  cause?: string;
  method?: string;
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

export async function getAccounts(): Promise<Result<Account[], AppError>> {
  try {
    const accounts = await invoke<Account[]>("get_accounts");
    return { ok: accounts, error: null };
  } catch (error) {
    return { ok: null, error: error as AppError };
  }
}

export async function addAccount(newValues: AddAccount): Promise<Result<Account, AppError>> {
  try {
    const account = await invoke<Account>("add_account", { account: newValues });
    return { ok: account, error: null };
  } catch (error) {
    return { ok: null, error: error as AppError };
  }
}

export async function deleteAccount(id: number): Promise<Result<true, AppError>> {
  try {
    await invoke("delete_account", { id });
    return { ok: true, error: null };
  } catch (error) {
    return { ok: null, error: error as AppError };
  }
}

export async function updateAccount(acc: UpdateAccount): Promise<Result<true, AppError>> {
  try {
    await invoke("update_account", { id: acc.id, account: acc });
    return { ok: true, error: null };
  } catch (error) {
    return { ok: null, error: error as AppError };
  }
}

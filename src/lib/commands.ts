import { invoke } from "@tauri-apps/api/core";
import { normalizeCommandError } from "./command-utils";
import type { Account } from "../types/generated/Account";
import type { AccountFilter } from "../types/generated/AccountFilter";
import type { AccountsPage } from "../types/generated/AccountsPage";
import type { AddAccount } from "../types/generated/AddAccount";
import type { Analytics } from "../types/generated/Analytics";
import type { Category } from "../types/generated/Category";
import type { CategoryEntry } from "../types/generated/CategoryEntry";
import type { Currency } from "../types/generated/Currency";
import type { Item } from "../types/generated/Item";
import type { ItemEntry } from "../types/generated/ItemEntry";
import type { Movement } from "../types/generated/Movement";
import type { MovementEntry } from "../types/generated/MovementEntry";
import type { MovementFilter } from "../types/generated/MovementFilter";
import type { MovementsPage } from "../types/generated/MovementsPage";
import type { NetWorthByCurrency } from "../types/generated/NetWorthByCurrency";
import type { Purchase } from "../types/generated/Purchase";
import type { PurchaseEntry } from "../types/generated/PurchaseEntry";
import type { Settings } from "../types/generated/Settings";
import type { Shop } from "../types/generated/Shop";
import type { UpdateAccount } from "../types/generated/UpdateAccount";
import type { ImportRequest } from "../types/generated/ImportRequest";
import type { ImportTemplate } from "../types/generated/ImportTemplate";
import type { ImportPreview } from "../types/generated/ImportPreview";
import type { ImportResult } from "../types/generated/ImportResult";

async function invokeCommand<T>(cmd: string, args?: Record<string, unknown>): Promise<T> {
  try {
    return await invoke<T>(cmd, args);
  } catch (error) {
    throw normalizeCommandError(error);
  }
}

export const command = {
  accounts: {
    getNetWorth: () => invokeCommand<NetWorthByCurrency[]>("get_net_worth"),
    getAll: (filter: AccountFilter) => invokeCommand<AccountsPage>("get_accounts", { filter }),
    addOne: (entry: AddAccount) => invokeCommand<Account>("add_account", { entry }),
    updateOne: (id: number, entry: UpdateAccount) => invokeCommand<Account>("update_account", { id, entry }),
    deleteOne: (id: number) => invokeCommand<Account>("delete_account", { id }),
  },
  categories: {
    getAll: () => invokeCommand<Category[]>("get_categories"),
    addOne: (entry: CategoryEntry) => invokeCommand<Category>("add_category", { entry }),
    updateOne: (id: number, entry: CategoryEntry) => invokeCommand<Category>("update_category", { id, entry }),
    deleteOne: (id: number) => invokeCommand<void>("delete_category", { id }),
  },
  items: {
    getAll: () => invokeCommand<Item[]>("get_items"),
    addOne: (entry: ItemEntry) => invokeCommand<Item>("add_item", { entry }),
    updateOne: (id: number, entry: ItemEntry) => invokeCommand<Item>("update_item", { id, entry }),
    deleteOne: (id: number) => invokeCommand<void>("delete_item", { id }),
  },
  shops: {
    getAll: () => invokeCommand<Shop[]>("get_shops"),
    add: (name: Shop["name"], address: Shop["address"] = null) => invokeCommand<Shop>("add_shop", { name, address }),
  },
  purchases: {
    getAll: () => invokeCommand<Purchase[]>("get_purchases"),
    byItem: (itemId: number) => invokeCommand<Purchase[]>("purchases_by_item", { itemId }),
    byMovement: (movementId: number) => invokeCommand<Purchase[]>("purchases_by_movement", { movementId }),
    addOne: (entry: PurchaseEntry) => invokeCommand<Purchase>("add_purchase", { entry }),
    deleteOne: (id: number) => invokeCommand<void>("delete_purchase", { id }),
  },
  movements: {
    getAll: (filter: MovementFilter) => invokeCommand<MovementsPage>("get_movements", { filter }),
    byAccount: (accountId: number, filter: MovementFilter | null = null) =>
      invokeCommand<MovementsPage>("get_movements_by_account_id", { accountId, filter }),
    addOne: (entry: MovementEntry) => invokeCommand<Movement>("add_movement", { entry }),
    updateOne: (id: number, entry: MovementEntry) => invokeCommand<Movement>("update_movement", { id, entry }),
    deleteOne: (id: number) => invokeCommand<void>("delete_movement", { id }),
  },
  analytics: {
    get: () => invokeCommand<Analytics>("get_analytics"),
  },
  currencies: {
    getAll: () => invokeCommand<Currency[]>("get_currencies"),
  },
  imports: {
    templates: () => invokeCommand<ImportTemplate[]>("get_import_templates"),
    preview: (request: ImportRequest) => invokeCommand<ImportPreview>("preview_csv_import", { request }),
    commit: (request: ImportRequest) => invokeCommand<ImportResult>("commit_csv_import", { request }),
  },
  settings: {
    get: () => invokeCommand<Settings>("get_settings"),
    update: (entry: Settings) => invokeCommand<Settings>("update_settings", { entry }),
  },
};

import type { AccountFilter } from "../types/generated/AccountFilter";
import type { MovementFilter } from "../types/generated/MovementFilter";

export const accountKeys = {
  all: ["accounts"] as const,
  lists: () => ["accounts", "list"] as const,
  list: (filter: AccountFilter) => ["accounts", "list", filter] as const,
  detail: (id: number) => ["accounts", "detail", id] as const,
  choices: (filter: AccountFilter) => ["accounts", "ledger", "choices", filter] as const,
};
export const netWorthKeys = { all: ["net-worth"] as const };
export const categoryKeys = {
  all: ["categories"] as const,
  catalog: () => ["categories", "catalog"] as const,
};
export const itemKeys = {
  all: ["items"] as const,
  catalog: () => ["items", "catalog"] as const,
};
export const shopKeys = {
  all: ["shops"] as const,
  catalog: () => ["shops", "catalog"] as const,
};
export const currencyKeys = {
  all: ["currencies"] as const,
  catalog: () => ["currencies", "catalog"] as const,
};
export const purchaseKeys = {
  all: ["purchases"] as const,
  byItem: (itemId: number) => ["purchases", "catalog", "item", itemId] as const,
  byMovement: (movementId: number) => ["purchases", "movement", movementId] as const,
};
export const movementKeys = {
  all: ["movements"] as const,
  list: (filter: MovementFilter) => ["movements", "ledger", filter] as const,
  expenses: (filter: MovementFilter) => ["movements", "catalog", "expense-picker", filter] as const,
};
export const analyticsKeys = { all: ["analytics"] as const };
export const settingsKeys = { all: ["settings"] as const };

export const mutationInvalidationKeys = {
  accounts: [accountKeys.all, netWorthKeys.all, movementKeys.all, analyticsKeys.all],
  catalog: [categoryKeys.all, itemKeys.all, purchaseKeys.all, movementKeys.all, analyticsKeys.all],
  // Movements change category counts and can cascade-delete linked purchases.
  movements: [movementKeys.all, accountKeys.all, netWorthKeys.all, analyticsKeys.all, categoryKeys.all, itemKeys.all, purchaseKeys.all],
} as const;

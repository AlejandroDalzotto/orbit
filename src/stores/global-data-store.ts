import { create } from "zustand";
import type { GlobalStoreState } from "./types";
import { createCategorySlice } from "./slices/category";
import { createAccountSlice } from "./slices/accounts";
import { createAppSlice } from "./slices/app";
import { createMovementSlice } from "./slices/movements";
import { createStoreSlice } from "./slices/stores";
import { createItemsSlice } from "./slices/items";
import { createGroupsSlice } from "./slices/groups";
import { createPurchaseSlice } from "./slices/purchases";

export const useGlobalStore = create<GlobalStoreState>()((set, get, store) => ({
  ...createCategorySlice(set, get, store),
  ...createAccountSlice(set, get, store),
  ...createAppSlice(set, get, store),
  ...createMovementSlice(set, get, store),
  ...createStoreSlice(set, get, store),
  ...createItemsSlice(set, get, store),
  ...createGroupsSlice(set, get, store),
  ...createPurchaseSlice(set, get, store),
}));

export const useCategories = () => useGlobalStore((state) => state.categories);
export const useAccounts = () => useGlobalStore((state) => state.accounts);
export const useMovements = () => useGlobalStore((state) => state.movements);
export const useStores = () => useGlobalStore((state) => state.stores);
export const useItems = () => useGlobalStore((state) => state.items);
export const useGroups = () => useGlobalStore((state) => state.groups);
export const usePurchases = () => useGlobalStore((state) => state.purchases);

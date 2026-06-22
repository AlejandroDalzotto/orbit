import { StateCreator } from "zustand";
import { GlobalStoreState, PurchaseSlice } from "../types";
import { invoke } from "@tauri-apps/api/core";
import type { PurchaseWithDetails } from "../../definitions/items";

export const createPurchaseSlice: StateCreator<GlobalStoreState, [], [], PurchaseSlice> = (set) => ({
  purchases: [],

  initPurchases: async () => {
    const purchases = await invoke<PurchaseWithDetails[]>("get_purchases");
    set({ purchases });
  },

  // TODO: implement this method later.
  getPurchasesByItemId: async (itemId: number) => {
    throw new Error("Not implemented");
    // const purchases = await invoke<PurchaseWithDetails[]>("purchases_by_item", { itemId });

    // return purchases;
  },
});

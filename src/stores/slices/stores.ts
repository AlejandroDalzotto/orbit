import { StateCreator } from "zustand";
import { GlobalStoreState, StoreSlice } from "../types";
import { invoke } from "@tauri-apps/api/core";
import type { Store } from "../../definitions/items";

export const createStoreSlice: StateCreator<GlobalStoreState, [], [], StoreSlice> = (set) => ({
  stores: [],

  initStores: async () => {
    const stores = await invoke<Store[]>("get_stores");
    set({ stores });
  },
});

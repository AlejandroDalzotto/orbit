import { StateCreator } from "zustand";
import { GlobalStoreState, ItemSlice } from "../types";
import { invoke } from "@tauri-apps/api/core";
import { Item } from "../../definitions/items";

export const createItemsSlice: StateCreator<GlobalStoreState, [], [], ItemSlice> = (set, get) => ({
  items: [],

  initItems: async () => {
    const items = await invoke<Item[]>("get_items");
    set({ items });
  },

  addItem: async (item) => {
    const _item = await invoke<Item>("add_item", { item });

    await get().initItems();
  },

  updateItem: async (id, item) => {
    const _updated = await invoke<Item>("update_item", { id, item });
    await get().initItems();
  },

  deleteItem: async (id) => {
    await invoke("delete_item", { id });
    await get().initItems();
  },
});

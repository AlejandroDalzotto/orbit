import { StateCreator } from "zustand";
import { CategorySlice, GlobalStoreState } from "../types";
import { invoke } from "@tauri-apps/api/core";
import { Category } from "../../definitions/categories";

export const createCategorySlice: StateCreator<GlobalStoreState, [], [], CategorySlice> = (set, get) => ({
  categories: [],

  initCategories: async () => {
    const categories = await invoke<Category[]>("get_categories");
    set({ categories });
  },

  addCategory: async (name) => {
    // 1. El back procesa e inserta. Si falla, el error salta acá.
    const newId = await invoke<number>("add_category", { name });

    // 2. Traemos la lista fresca y ordenada desde la DB
    await get().initCategories();

    // 3. Devolvemos el ID por si el componente lo quiere usar
    return newId;
  },

  updateCategory: async (id, name) => {
    // Mandamos el ID. El back procesa. Si no tira error, asumimos éxito.
    await invoke("update_category", { id, name });
    // SQLite ya actualizó. Pedimos la foto fresca y ordenada.
    await get().initCategories();
  },

  deleteCategory: async (id) => {
    await invoke("delete_category", { id });
    await get().initCategories();
  },
});

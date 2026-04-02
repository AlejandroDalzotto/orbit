import { create } from "zustand";
import { addCategory, deleteCategory, getCategories, updateCategory } from "../commands/categories";
import { Category } from "../definitions/categories";

type CategoryStore = {
  categories: Category[];
  actions: {
    initialize: () => Promise<void>;
    addCategory: (name: string) => Promise<void>;
    deleteCategory: (id: number) => Promise<void>;
    updateCategory: (id: number, name: string) => Promise<void>;
  };
};

const useCategoryStore = create<CategoryStore>((set) => ({
  categories: [],
  actions: {
    initialize: async () => {
      const categories = await getCategories();
      set({ categories });
    },
    addCategory: async (name: string) => {
      const newCategory = await addCategory(name);
      set((old) => ({ categories: [...old.categories, newCategory] }));
    },
    deleteCategory: async (id: number) => {
      await deleteCategory(id);
      set((old) => ({ categories: old.categories.filter((c) => c.id !== id) }));
    },
    updateCategory: async (id: number, name: string) => {
      await updateCategory(id, name);
      set((old) => ({ categories: old.categories.map((c) => (c.id === id ? { ...c, name } : c)) }));
    },
  },
}));

export const useCategories = () => useCategoryStore((state) => state.categories);
export const useCategoryActions = () => useCategoryStore((state) => state.actions);

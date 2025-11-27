import { create } from "zustand";
import {
  Item,
  RequestCreateItem,
  RequestEditItem,
  RequestIsSpendingLeak,
} from "@/models/item";
import { ItemService } from "@/services/item";
import type { Response } from "@/lib/types";

type State = {
  items: Item[];
  totalItems: number;
  isLoading: boolean;
  error?: string | null;
};

type Actions = {
  loadItems: () => Response<string>;
  addItem: (entry: RequestCreateItem) => Response<Item>;
  editItem: (id: string, newValues: RequestEditItem) => Response<Item>;
  editIsSpendingLeak: (values: RequestIsSpendingLeak) => Response<Item>;
  deleteItem: (id: string) => Response<string>;
  reset: () => void;
};

const service = new ItemService();

export const useItemStore = create<State & Actions>()((set, get) => ({
  items: [],
  totalItems: 0,
  isLoading: false,
  error: null,

  loadItems: async () => {
    set({ isLoading: true });
    try {
      const [error, data] = await service.listItems();
      if (error) {
        console.error(error.message);
        set({ isLoading: false, error: error.message });
        return [error, null];
      }

      set({
        items: data ?? [],
        totalItems: data?.length ?? 0,
        isLoading: false,
      });
      return [null, `Items loaded successfully.`];
    } catch (e) {
      set({ isLoading: false, error: (e as Error).message });
      return [{ message: (e as Error).message }, null];
    }
  },

  addItem: async (entry) => {
    set({ isLoading: true });
    try {
      const [error, data] = await service.addItem(entry);
      if (error) {
        console.error(error.message);
        set({ isLoading: false, error: error.message });
        return [error, null];
      }

      const newItems = [...(get().items ?? []), data as Item];
      set({ items: newItems, totalItems: newItems.length, isLoading: false });
      return [null, data as Item];
    } catch (e) {
      set({ isLoading: false, error: (e as Error).message });
      return [{ message: (e as Error).message }, null];
    }
  },

  editItem: async (id, newValues) => {
    set({ isLoading: true });
    try {
      const [error, data] = await service.editItem(id, newValues);
      if (error) {
        console.error(error.message);
        set({ isLoading: false, error: error.message });
        return [error, null];
      }

      const items = get().items.map((it) =>
        it.id === id ? (data as Item) : it,
      );
      set({ items, isLoading: false });
      return [null, data as Item];
    } catch (e) {
      set({ isLoading: false, error: (e as Error).message });
      return [{ message: (e as Error).message }, null];
    }
  },

  editIsSpendingLeak: async (values) => {
    set({ isLoading: true });
    try {
      const [error, data] = await service.editIsSpendingLeak(values);
      if (error) {
        console.error(error.message);
        set({ isLoading: false, error: error.message });
        return [error, null];
      }

      const items = get().items.map((it) =>
        it.id === (data as Item).id ? (data as Item) : it,
      );
      set({ items, isLoading: false });
      return [null, data as Item];
    } catch (e) {
      set({ isLoading: false, error: (e as Error).message });
      return [{ message: (e as Error).message }, null];
    }
  },

  deleteItem: async (id) => {
    set({ isLoading: true });
    try {
      const [error] = await service.deleteItem(id);
      if (error) {
        console.error(error.message);
        set({ isLoading: false, error: error.message });
        return [error, null];
      }

      const items = get().items.filter((it) => it.id !== id);
      set({ items, totalItems: items.length, isLoading: false });
      return [null, `Item deleted successfully.`];
    } catch (e) {
      set({ isLoading: false, error: (e as Error).message });
      return [{ message: (e as Error).message }, null];
    }
  },

  reset: () => set({ items: [], totalItems: 0, isLoading: false, error: null }),
}));

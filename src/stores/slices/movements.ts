import { StateCreator } from "zustand";
import type { GlobalStoreState, MovementSlice } from "../types";
import { invoke } from "@tauri-apps/api/core";
import type { Movement, MovementStats, MovementTypeFilter, Period, SortCriteria } from "../../definitions/movements";
import type { ItemWithPurchase } from "../../definitions/items";
import { DEFAULT_MOVEMENTS_FILTERS } from "../../definitions/consts";

export const createMovementSlice: StateCreator<GlobalStoreState, [], [], MovementSlice> = (set, get) => ({
  movements: [],
  totalMovements: 0,
  filters: DEFAULT_MOVEMENTS_FILTERS,
  stats: { totalIncome: 0, totalExpense: 0, totalNet: 0 },

  initMovements: async () => {
    const { filters } = get();
    const { movements, total } = await invoke<{ movements: Movement[]; total: number }>("get_movements", { filters });
    set({ movements, totalMovements: total });
  },

  addMovement: async (newValues) => {
    const movement = await invoke<Movement>("add_movement", { movement: newValues });

    await get().initMovements();

    // If the added movement includes a category, refresh the categories store
    // so the client-side state and UI reflect any server-side changes.
    // This keeps category lists, counts and related data consistent across the app.
    if (movement.category_id) {
      await get().initCategories();
    }

    // Always refresh the accounts store after adding a movement,
    // so the client-side state and UI reflect any server-side changes.
    // This keeps account lists and related data consistent across the app.
    await get().initAccounts();
  },

  updateMovement: async (id, movement) => {
    const updated = await invoke<Movement>("update_movement", { id, movement });
    await get().initMovements();

    if (updated.category_id) {
      await get().initCategories();
    }

    await get().initAccounts();
  },

  deleteMovement: async (id) => {
    await invoke("delete_movement", { id });
    await get().initMovements();
    await get().initCategories();
    await get().initAccounts();
  },

  getItemsByMovementId: async (id) => {
    console.log(`Fetching items for movement id: ${id}`);
    const items = await invoke<ItemWithPurchase[]>("items_by_movement", { movId: id });

    return items;
  },

  getMovementsByAccount: async (id) => {
    const movements = await invoke<Movement[]>("get_movements_by_account_id", { accId: id });

    return movements;
  },

  setStats: async () => {
    const { filters } = get();
    const stats = await invoke<MovementStats>("get_movements_stats", { filters });

    set({ stats });
  },

  changePeriod: (period: Period) => {
    set((old) => ({ filters: { ...old.filters, period } }));
  },
  filterByCategoryId: (categoryId: number | null) => {
    set((old) => ({ filters: { ...old.filters, categoryId } }));
  },

  filterByGroupId: (groupId: number | null) => {
    set((old) => ({ filters: { ...old.filters, groupId } }));
  },

  goToNextPage: () => {
    set((old) => ({ filters: { ...old.filters, offset: old.filters.offset + old.filters.limit } }));
  },

  goToPreviousPage: () => {
    if (get().filters.offset <= get().filters.limit) {
      set((old) => ({ filters: { ...old.filters, offset: 0 } }));
      return;
    }

    set((old) => ({ filters: { ...old.filters, offset: old.filters.offset - old.filters.limit } }));
  },

  changeSort: (sort: SortCriteria) => {
    set((old) => ({ filters: { ...old.filters, sort } }));
  },

  filterByQuery: (query: string) => {
    set((old) => ({ filters: { ...old.filters, query } }));
  },

  changeType: (type: MovementTypeFilter) => {
    set((old) => ({ filters: { ...old.filters, type } }));
  },
});

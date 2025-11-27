import { create } from "zustand";
import { PaginationLimit } from "@/lib/types";
import { Transaction } from "@/models/transaction";
import { WalletService } from "@/services/wallet";

type State = {
  accountId: string | null;
  currentPage: number;
  limitPerPage: PaginationLimit;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
  items: Transaction[];
  total: number;
  isLoading: boolean;
  error?: string | null;
};

type Actions = {
  setAccount: (accountId: string | null) => void;
  loadPage: (page?: number) => Promise<void>;
  changeLimit: (limit: PaginationLimit) => Promise<void>;
  refresh: () => Promise<void>;
  reset: () => void;
};

const walletService = new WalletService();

export const useAccountTransactionStore = create<State & Actions>(
  (set, get) => ({
    accountId: null,
    currentPage: 1,
    limitPerPage: PaginationLimit.DEFAULT,
    totalPages: 1,
    hasNext: false,
    hasPrevious: false,
    items: [],
    total: 0,
    isLoading: false,
    error: null,

    setAccount: (accountId) => {
      set({ accountId, currentPage: 1 });
      // optionally trigger a load here or let caller call loadPage
    },

    loadPage: async (page = 1) => {
      const { accountId, limitPerPage } = get();
      if (!accountId) return;
      set({ isLoading: true, error: null });
      const offset = (page - 1) * limitPerPage;
      const [err, data] = await walletService.getAccountHistory(
        accountId,
        limitPerPage,
        offset,
      );
      if (err) {
        set({ error: err.message, isLoading: false });
        return;
      }
      set({
        items: data.items,
        total: data.total,
        totalPages: data.totalPages,
        hasNext: data.hasNext,
        hasPrevious: data.hasPrevious,
        currentPage: data.page,
        isLoading: false,
      });
    },

    changeLimit: async (limit) => {
      set({ limitPerPage: limit, currentPage: 1 });
      await get().loadPage(1);
    },

    refresh: async () => {
      await get().loadPage(get().currentPage);
    },

    reset: () => {
      set({
        accountId: null,
        currentPage: 1,
        limitPerPage: PaginationLimit.DEFAULT,
        totalPages: 1,
        hasNext: false,
        hasPrevious: false,
        items: [],
        total: 0,
        isLoading: false,
        error: null,
      });
    },
  }),
);

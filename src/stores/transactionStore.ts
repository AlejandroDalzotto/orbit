import { PaginationLimit, Response } from "@/lib/types";
import {
  RequestCreateTransaction,
  RequestUpdateTransaction,
  Transaction,
} from "@/models/transaction";
import { TransactionService } from "@/services/transaction";
import { create } from "zustand";

export type TransactionSortOption =
  | "latest"
  | "oldest"
  | "cheapest"
  | "mostExpensive"
  | "income"
  | "expenses"
  | "tranfers";

type State = {
  // Pagination variables
  currentPage: number;
  limitPerPage: PaginationLimit;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
  searchQuery: string;
  sortBy: TransactionSortOption;

  // Data
  transactions: Transaction[];
  netBalance: number;
  totalTransactions: number;
  totalIncome: number;
  totalExpenses: number;
};

type Actions = {
  // Pagination actions
  nextPage: () => Promise<void>;
  previousPage: () => Promise<void>;
  navigateTo: (page: number) => Promise<void>;
  changeLimit: (limit: PaginationLimit) => Promise<void>;
  setSearchQuery: (query: string) => Promise<void>;
  setSortBy: (sortBy: TransactionSortOption) => Promise<void>;

  // Data actions
  loadPersistedTransactions: () => Response<string>;
  addTransaction: (
    transaction: RequestCreateTransaction,
  ) => Response<Transaction>;
  deleteTransaction: (id: string) => Response<string>;
  updateTransaction: (
    id: string,
    updatedTransaction: RequestUpdateTransaction,
  ) => Response<Transaction>;
};

const service = new TransactionService();

export const useTransactionStore = create<State & Actions>()((set, get) => ({
  // Pagination variables
  currentPage: 1,
  limitPerPage: PaginationLimit.DEFAULT,
  totalPages: 1,
  hasNext: false,
  hasPrevious: false,
  searchQuery: "",
  sortBy: "latest",

  // Data
  transactions: [],
  netBalance: 0,
  totalTransactions: 0,
  totalIncome: 0,
  totalExpenses: 0,

  // Pagination actions
  nextPage: async () => {
    const { currentPage, searchQuery, limitPerPage, sortBy } = get();

    const newPage = currentPage + 1;

    const [error, data] = await service.searchTransactions({
      query: searchQuery,
      limit: limitPerPage,
      offset: (newPage - 1) * limitPerPage,
      sortBy,
    });

    if (error) {
      console.error(error.message);
      return;
    }

    set({
      currentPage: newPage,
      transactions: data.items,
      hasNext: data.hasNext,
      hasPrevious: data.hasPrevious,
    });
  },
  previousPage: async () => {
    const { currentPage, searchQuery, limitPerPage, sortBy } = get();

    const newPage = currentPage - 1;

    const [error, data] = await service.searchTransactions({
      query: searchQuery,
      limit: limitPerPage,
      offset: (newPage - 1) * limitPerPage,
      sortBy,
    });

    if (error) {
      console.error(error.message);
      return;
    }

    set({
      currentPage: newPage,
      transactions: data.items,
      hasNext: data.hasNext,
      hasPrevious: data.hasPrevious,
    });
  },
  navigateTo: async (page) => {
    const { searchQuery, limitPerPage, sortBy } = get();

    const [error, data] = await service.searchTransactions({
      query: searchQuery,
      limit: limitPerPage,
      offset: (page - 1) * limitPerPage,
      sortBy,
    });

    if (error) {
      console.error(error.message);
      return;
    }

    set({
      currentPage: page,
      transactions: data.items,
      hasNext: data.hasNext,
      hasPrevious: data.hasPrevious,
    });
  },
  changeLimit: async (limit) => {
    const { currentPage, searchQuery, sortBy } = get();

    const [error, data] = await service.searchTransactions({
      query: searchQuery,
      limit,
      offset: (currentPage - 1) * limit,
      sortBy,
    });

    if (error) {
      console.error(error.message);
      return;
    }

    set({
      limitPerPage: limit,
      transactions: data.items,
      hasNext: data.hasNext,
      hasPrevious: data.hasPrevious,
    });
  },
  setSearchQuery: async (query) => {
    const { currentPage, limitPerPage, sortBy } = get();

    const [error, data] = await service.searchTransactions({
      query,
      limit: limitPerPage,
      offset: (currentPage - 1) * limitPerPage,
      sortBy,
    });

    if (error) {
      console.error(error.message);
      return;
    }

    set({
      searchQuery: query,
      transactions: data.items,
      hasNext: data.hasNext,
      hasPrevious: data.hasPrevious,
    });
  },
  setSortBy: async (sortBy) => {
    const { currentPage, limitPerPage, searchQuery } = get();

    const [error, data] = await service.searchTransactions({
      query: searchQuery,
      limit: limitPerPage,
      offset: (currentPage - 1) * limitPerPage,
      sortBy,
    });

    if (error) {
      console.error(error.message);
      return;
    }

    set({
      transactions: data.items,
      hasNext: data.hasNext,
      hasPrevious: data.hasPrevious,
      sortBy,
    });
  },

  // Data actions
  loadPersistedTransactions: async () => {
    try {
      const { currentPage, limitPerPage, searchQuery, sortBy } = get();

      const [errorSearch, data] = await service.searchTransactions({
        query: searchQuery,
        limit: limitPerPage,
        offset: (currentPage - 1) * limitPerPage,
        sortBy,
      });

      if (errorSearch) {
        console.error("Error loading transactions:", errorSearch);
        return [errorSearch, null];
      }

      set({
        transactions: data.items,
        totalPages: data.totalPages,
        hasNext: data.hasNext,
        hasPrevious: data.hasPrevious,
        totalTransactions: data.total,
      });

      const [errorFinancialSummary, financialSummary] =
        await service.getFinancialSummary();
      if (errorFinancialSummary) {
        console.error(
          "Error loading financial summary:",
          errorFinancialSummary,
        );
        return [errorFinancialSummary, null];
      }

      set({
        netBalance: financialSummary.netBalance,
        totalIncome: financialSummary.totalIncome,
        totalExpenses: financialSummary.totalExpenses,
      });

      return [null, `Transactions and financial summary loaded successfully.`];
    } catch (error) {
      console.error("Error loading transactions:", error);
      return [{ message: (error as Error).message }, null];
    }
  },
  updateTransaction: async (id, updatedTransaction) => {
    try {
      const [errorUpdate, result] = await service.updateTransaction(
        id,
        updatedTransaction,
      );

      if (errorUpdate) {
        console.error("Error updating transaction:", errorUpdate);
        return [errorUpdate, null];
      }

      const [errorSearch, data] = await service.searchTransactions({
        query: get().searchQuery,
        limit: get().limitPerPage,
        offset: (get().currentPage - 1) * get().limitPerPage,
        sortBy: get().sortBy,
      });

      if (errorSearch) {
        console.error("Error loading transactions:", errorSearch);
        return [errorSearch, null];
      }

      set({
        transactions: data.items,
        totalPages: data.totalPages,
        hasNext: data.hasNext,
        hasPrevious: data.hasPrevious,
        totalTransactions: data.total,
      });

      const [errorFinancialSummary, financialSummary] =
        await service.getFinancialSummary();
      if (errorFinancialSummary) {
        console.error(
          "Error loading financial summary:",
          errorFinancialSummary,
        );
        return [errorFinancialSummary, null];
      }

      set({
        netBalance: financialSummary.netBalance,
        totalIncome: financialSummary.totalIncome,
        totalExpenses: financialSummary.totalExpenses,
      });

      return [null, result];
    } catch (error) {
      console.error("Error updating transaction:", error);
      return [{ message: (error as Error).message }, null];
    }
  },

  deleteTransaction: async (id: string) => {
    try {
      const [errorDelete] = await service.deleteTransaction(id);

      if (errorDelete) {
        console.error("Error deleting transaction:", errorDelete);
        return [errorDelete, null];
      }

      const [errorSearch, data] = await service.searchTransactions({
        query: get().searchQuery,
        limit: get().limitPerPage,
        offset: (get().currentPage - 1) * get().limitPerPage,
        sortBy: get().sortBy,
      });

      if (errorSearch) {
        console.error("Error loading transactions:", errorSearch);
        return [errorSearch, null];
      }

      set({
        transactions: data.items,
        totalPages: data.totalPages,
        hasNext: data.hasNext,
        hasPrevious: data.hasPrevious,
        totalTransactions: data.total,
      });

      const [errorFinancialSummary, financialSummary] =
        await service.getFinancialSummary();
      if (errorFinancialSummary) {
        console.error(
          "Error loading financial summary:",
          errorFinancialSummary,
        );
        return [errorFinancialSummary, null];
      }

      set({
        netBalance: financialSummary.netBalance,
        totalIncome: financialSummary.totalIncome,
        totalExpenses: financialSummary.totalExpenses,
      });

      return [null, `Transaction deleted successfully.`];
    } catch (error) {
      console.error("Error deleting transaction:", error);
      return [{ message: (error as Error).message }, null];
    }
  },
  addTransaction: async (transaction) => {
    try {
      const [errorCreate, result] = await service.addTransaction(transaction);

      if (errorCreate) {
        console.error("Error creating transaction:", errorCreate);
        return [errorCreate, null];
      }

      const [errorSearch, data] = await service.searchTransactions({
        query: get().searchQuery,
        limit: get().limitPerPage,
        offset: (get().currentPage - 1) * get().limitPerPage,
        sortBy: get().sortBy,
      });

      if (errorSearch) {
        console.error("Error loading transactions:", errorSearch);
        return [errorSearch, null];
      }

      set({
        transactions: data.items,
        totalPages: data.totalPages,
        hasNext: data.hasNext,
        hasPrevious: data.hasPrevious,
        totalTransactions: data.total,
      });

      const [errorFinancialSummary, financialSummary] =
        await service.getFinancialSummary();
      if (errorFinancialSummary) {
        console.error(
          "Error loading financial summary:",
          errorFinancialSummary,
        );
        return [errorFinancialSummary, null];
      }

      set({
        netBalance: financialSummary.netBalance,
        totalIncome: financialSummary.totalIncome,
        totalExpenses: financialSummary.totalExpenses,
      });

      return [null, result];
    } catch (error) {
      console.error("Error adding transaction:", error);
      return [{ message: (error as Error).message }, null];
    }
  },
}));

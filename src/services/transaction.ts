import type { PaginationResult, Response, SearchProps } from "@/lib/types";
import {
  RequestCreateTransaction,
  FinancialSummany,
  Transaction,
  RequestUpdateTransaction,
} from "@/models/transaction";
import { invoke } from "@tauri-apps/api/core";

export class TransactionService {
  async searchTransactions({
    query = "",
    limit,
    offset,
    sortBy,
  }: SearchProps): Response<PaginationResult<Transaction>> {
    try {
      const transactions = await invoke<PaginationResult<Transaction>>(
        "search_transactions",
        {
          query,
          limit,
          offset,
          sortBy,
        },
      );
      return [null, transactions];
    } catch (error) {
      return [{ message: error as string }, null];
    }
  }

  async getFinancialSummary(): Response<FinancialSummany> {
    try {
      const data = (await invoke("get_financial_summary")) as FinancialSummany;
      return [null, data];
    } catch (error) {
      return [{ message: error as string }, null];
    }
  }

  async getTransactionById(id: string): Promise<Transaction | null> {
    const transaction = (await invoke("get_transaction_by_id", {
      id,
    })) as Transaction | null;

    if (!transaction) {
      return null;
    }

    return transaction;
  }

  async addTransaction(
    newEntry: RequestCreateTransaction,
  ): Response<Transaction> {
    // Validate the new entry
    if (newEntry.amount <= 0) {
      return [
        { message: "The amount should be a positive value more than zero." },
        null,
      ];
    }

    try {
      const result = (await invoke("add_transaction", {
        entry: newEntry,
      })) as Transaction;
      return [null, result];
    } catch (error) {
      return [{ message: error as string }, null];
    }
  }

  async updateTransaction(
    id: string,
    newValues: RequestUpdateTransaction,
  ): Response<Transaction> {
    try {
      const result = await invoke<Transaction>("edit_transaction", {
        id,
        newValues,
      });
      return [null, result];
    } catch (e) {
      return [{ message: (e as Error).message }, null];
    }
  }

  async deleteTransaction(id: string): Response<Transaction> {
    try {
      const result = await invoke<Transaction>("delete_transaction", { id });
      return [null, result];
    } catch (e) {
      return [{ message: (e as Error).message }, null];
    }
  }
}

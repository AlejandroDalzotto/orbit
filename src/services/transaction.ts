import type { Response } from "@/lib/types";
import { CreateTransaction, FinancialSummany, Transaction } from "@/models/transaction";
import { invoke } from "@tauri-apps/api/core";

export class TransactionService {
  async getTransactions(): Response<Transaction[]> {
    try {
      const data = await invoke("get_transactions") as Transaction[];
      return [null, data];
    } catch (error) {
      return [{ msg: error as string }, null];
    }
  }

  async getFinancialSummary(): Response<FinancialSummany> {
    try {
      const data = await invoke("get_financial_summary") as FinancialSummany;
      return [null, data];
    } catch (error) {
      return [{ msg: error as string }, null];
    }
  }

  async getTransactionById(id: string): Promise<Transaction | null> {

    const transaction = await invoke("get_transaction_by_id", { id }) as Transaction | null;

    if (!transaction) {
      return null;
    }

    return transaction;
  }

  async addTransaction(newEntry: CreateTransaction): Response<Transaction> {

    // Validate the new entry
    if (newEntry.amount <= 0) {
      return [{ msg: "The amount should be a positive value more than zero." }, null]
    }

    try {
      const result = await invoke("add_transaction", { entry: newEntry }) as Transaction;
      return [null, result];
    } catch (error) {
      return [{ msg: error as string }, null]
    }
  }

  // updateTransaction(id: string, newValues: NewTransaction): Promise<boolean> {
  //   throw new Error("Method not implemented.");
  // }

  // deleteTransaction(id: string): Promise<boolean> {
  //   throw new Error("Method not implemented.");
  // }
}
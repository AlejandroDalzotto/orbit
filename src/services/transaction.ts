import { NewTransaction, TransactionResponse } from "@/lib/definitions";
import { Transaction } from "@/models/transaction";
import { invoke } from "@tauri-apps/api/core";

export abstract class TransactionService {
  async getTransactions(): Promise<TransactionResponse> {
    const data = await invoke("get_transactions") as TransactionResponse;

    return data;
  }

  async getTransactionById(id: string): Promise<Transaction | null> {
    
    const transaction = await invoke("get_transaction_by_id", { id }) as Transaction | null;

    if (!transaction) {
      return null;
    }

    return transaction;
  }

  async addTransaction(newEntry: NewTransaction): Promise<boolean> {
    
    // Validate the new entry
    if (newEntry.amount <= 0) {
      throw new Error("Invalid transaction data");
    }

    const result = await invoke("add_transaction", { newEntry }) as boolean;
    return result;
  }

  updateTransaction(id: string, newValues: NewTransaction): Promise<boolean> {
    throw new Error("Method not implemented.");
  }

  deleteTransaction(id: string): Promise<boolean> {
    throw new Error("Method not implemented.");
  }
}
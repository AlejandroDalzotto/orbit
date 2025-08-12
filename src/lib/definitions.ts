import { Transaction } from "@/models/transaction";

export type Currency = 'ARS' | 'USD';

export type Category = 'online subscriptions'
  | 'supermarket'
  | 'transport'
  | 'online shopping'
  | 'utilities'
  | 'education'
  | 'clothing'
  | 'health'
  | 'dining out'
  | 'rent'
  | 'home services'
  | 'shopping'
  | 'gifts'
  | 'personal care'
  | 'insurance'
  | 'investments'
  | 'taxes'
  | 'salary'
  | 'refund'
  | 'cash withdrawal'
  | 'credit card payment'
  | 'cash transfer'
  | 'other';

export type PaymentMethod = 'cash' | 'credit card' | 'debit card' | 'bank transfer' | 'digital wallet' | 'cryptocurrency';

export type Series = {
  value: number;
  time: string; // formato yyyy-mm-dd
}

export type NewTransaction = Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'| 'formattedDate'>;

export type TransactionResponse = {
  transactions: Transaction[];
  netBalance: number;
  totalIncome: number;
  totalExpenses: number;
}

export type Account = {
  id: string;
  name: string;
  type: 'cash' | 'online wallet' | 'bank account' | 'credit card';
  balance: number;
  currency: Currency;
  createdAt: number;
  updatedAt: number;
  transactionsCount: number;
  transactionsId: string[];
}

export type NewAccount = Omit<Account, 'id' | 'createdAt' | 'updatedAt' | 'transactionsCount' | 'transactions' | 'transactionsId'>;

export type CRUDResult = {
  success: true;
  message: string;
} | {
  success: false;
  error: string;
};
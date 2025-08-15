export type PaymentMethod = 'cash' | 'credit card' | 'debit card' | 'bank transfer' | 'digital wallet' | 'cryptocurrency';

export enum Currency {
  ARS = 'ARS',
  USD = 'USD',
}

export enum TransactionType {
  Income = 'income',
  Expense = 'expense',
}

export interface Item {
  name: string,
  quantity: number | null,
  price: number | null,
}

export interface BasicTransaction {
  id: string,
  amount: number,
  currency: Currency,
  date: number,
  createdAt: number,
  updatedAt: number,
  details: string | null,
  type: TransactionType,
  affectsBalance: boolean,
  accountId: string,
}

export interface SalaryTransaction extends BasicTransaction {
  job: string,
  paymentDate: number,
  employer: string | null,
  extraDetails: string | null,
}

export interface SupermarketTransaction extends BasicTransaction {
  storeName: string,
  items: Item[],
}

export type Transaction =
  | SalaryTransaction
  | SupermarketTransaction;

export type TransactionResponse = {
  transactions: Transaction[];
  netBalance: number;
  totalIncome: number;
  totalExpenses: number;
}

export type CreateTransaction = Omit<Transaction,
  'id'
  | 'createdAt'
  | 'updatedAt'
  | 'accountId'
>;

export type UpdateTransaction = Omit<Transaction,
  'id'
  | 'createdAt'
  | 'updatedAt'
  | 'accountId'
>;
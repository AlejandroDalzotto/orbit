export enum Currency {
  ARS = "ARS",
  USD = "USD",
}

export enum TransactionType {
  Income = "income",
  Expense = "expense",
  Transfer = "transfer",
}

export enum TransactionCategory {
  Basic = "basic",
  Salary = "salary",
  Shopping = "shopping",
  Freelance = "freelance",
}

/**
 * Represents a reference to an item for a transaction.
 * - `itemId` references the canonical item stored in the items DB (null for ad-hoc items).
 * - `name` is optional and is used when the item is ad-hoc or for display convenience.
 * - `quantity` and `price` are stored per-transaction so price history is preserved.
 */
export interface ItemRef {
  /** ID of the canonical item in the items DB, or null for ad-hoc items */
  itemId: string | null;
  /** Optional human-friendly name (kept for ad-hoc items or to ease display) */
  name?: string | null;
  /** The quantity purchased, null if not specified */
  quantity: number | null;
  /** The price per unit, null if not specified */
  price: number | null;
}

/**
 * Base transaction interface containing common properties for all transaction types
 */
export interface BasicTransaction {
  id: string;
  amount: number;
  /** Transaction date as Unix timestamp */
  date: number;
  /** When the transaction record was created as Unix timestamp */
  createdAt: number;
  /** When the transaction record was last updated as Unix timestamp */
  updatedAt: number;
  /** Additional notes or description for the transaction */
  details: string;
  type: TransactionType;
  /** Whether this transaction affects the account balance */
  affectsBalance: boolean;
  /** ID of the account/wallet this transaction belongs to */
  accountId: string;
  category: TransactionCategory;
}

/**
 * Salary or wage payment transaction
 */
export interface SalaryTransaction extends BasicTransaction {
  /** Job title or position */
  job: string;
  /** Name of the employer or company */
  employer: string | null;
  /** Additional employment-related details */
  extraDetails: string | null;
  category: TransactionCategory.Salary;
}

/**
 * Shopping or grocery store purchase transaction
 */
export interface ShoppingTransaction extends BasicTransaction {
  /** Name of the store or shopping */
  storeName: string;
  /** List of items purchased with quantities and prices */
  items: ItemRef[];
  category: TransactionCategory.Shopping;
}

/**
 * Freelance work payment transaction
 */
export interface FreelanceTransaction extends BasicTransaction {
  /** Name of the client or company */
  client: string | null;
  /** Project name or description */
  project: string | null;
  category: TransactionCategory.Freelance;
}

export type Transaction =
  | SalaryTransaction
  | ShoppingTransaction
  | FreelanceTransaction;

export type FinancialSummany = {
  netBalance: number;
  totalIncome: number;
  totalExpenses: number;
  transactionsCount: number;
};

export type RequestCreateTransaction =
  | Omit<SalaryTransaction, "id" | "createdAt" | "updatedAt">
  | Omit<ShoppingTransaction, "id" | "createdAt" | "updatedAt">
  | Omit<FreelanceTransaction, "id" | "createdAt" | "updatedAt">;

export type RequestUpdateTransaction =
  | Pick<BasicTransaction, "amount" | "details" | "date">
  | Pick<
      SalaryTransaction,
      "amount" | "details" | "date" | "employer" | "extraDetails" | "job"
    >
  | Pick<
      ShoppingTransaction,
      "amount" | "details" | "date" | "storeName" | "items"
    >
  | Pick<
      FreelanceTransaction,
      "amount" | "details" | "date" | "client" | "project"
    >;

/**
 * 1. gastos de casa
 * 4. online subscription
 * 6. online shopping
 * 7. transportation
 * 8. healthcare
 * 9.
 */

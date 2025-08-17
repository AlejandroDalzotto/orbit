export type PaymentMethod = 'cash' | 'credit card' | 'debit card' | 'bank transfer' | 'digital wallet' | 'cryptocurrency';

export enum Currency {
  ARS = 'ARS',
  USD = 'USD',
}

export enum TransactionType {
  Income = 'income',
  Expense = 'expense',
}

/**
 * Represents an item purchased in a transaction
 */
export interface Item {
  name: string
  /** The quantity purchased, null if not specified */
  quantity: number | null
  /** The price per unit, null if not specified */
  price: number | null
}

/**
 * Base transaction interface containing common properties for all transaction types
 */
export interface BasicTransaction {
  id: string
  amount: number
  /** The currency used for this transaction */
  currency: string
  /** Transaction date as Unix timestamp */
  date: number
  /** When the transaction record was created as Unix timestamp */
  createdAt: number
  /** When the transaction record was last updated as Unix timestamp */
  updatedAt: number
  /** Additional notes or description for the transaction */
  details: string | null
  type: string // Assuming TransactionType is a string for simplicity
  /** Whether this transaction affects the account balance */
  affectsBalance: boolean
  /** ID of the account/wallet this transaction belongs to */
  accountId: string
}

/**
 * Salary or wage payment transaction
 */
export interface SalaryTransaction extends BasicTransaction {
  /** Job title or position */
  job: string
  /** Specific payment date as Unix timestamp */
  paymentDate: number
  /** Name of the employer or company */
  employer: string | null
  /** Additional employment-related details */
  extraDetails: string | null
}

/**
 * Supermarket or grocery store purchase transaction
 */
export interface SupermarketTransaction extends BasicTransaction {
  /** Name of the store or supermarket */
  storeName: string
  /** List of items purchased with quantities and prices */
  items: Item[]
}

/**
 * Freelance work payment transaction
 */
interface FreelanceTransaction extends BasicTransaction {
  /** Name of the client or company */
  client?: string
  /** Project name or description */
  project?: string
}

/**
 * Food purchase transaction (restaurants, takeout, etc.)
 */
interface FoodTransaction extends BasicTransaction {
  /** List of food items ordered */
  items?: string[]
  /** Name of the restaurant or food establishment */
  store?: string
}

/**
 * Housing-related transaction (rent, mortgage, utilities)
 */
interface HousingTransaction extends BasicTransaction {
  /** Property address or identifier */
  property?: string
  /** Landlord or property manager name */
  landlord?: string
}

/**
 * Transportation-related transaction (gas, maintenance, parking)
 */
interface TransportationTransaction extends BasicTransaction {
  /** Vehicle used (car model, license plate, etc.) */
  vehicle?: string
  /** Miles driven or odometer reading */
  mileage?: number
  /** Location of the transaction */
  location?: string
}

/**
 * Entertainment and leisure activity transaction
 */
interface EntertainmentTransaction extends BasicTransaction {
  /** Venue name (theater, stadium, etc.) */
  venue?: string
  /** Event name or description */
  event?: string
}

/**
 * Healthcare and medical expense transaction
 */
interface HealthcareTransaction extends BasicTransaction {
  /** Healthcare provider or facility name */
  provider?: string
  /** Treatment or service received */
  treatment?: string
}

/**
 * Investment transaction (stocks, bonds, crypto)
 */
interface InvestmentTransaction extends BasicTransaction {
  /** Asset name or ticker symbol */
  asset?: string
  /** Number of shares or units purchased/sold */
  shares?: number
  /** Price per share or unit */
  price?: number
}

/**
 * Utility bill transaction (electricity, water, internet)
 */
interface UtilitiesTransaction extends BasicTransaction {
  /** Utility company name */
  provider?: string
  /** Type of service (electricity, water, gas, internet) */
  service?: string
  /** Billing period covered */
  period?: string
}


export type Transaction =
  | SalaryTransaction
  | SupermarketTransaction
  | FreelanceTransaction
  | FoodTransaction
  | HousingTransaction
  | TransportationTransaction
  | InvestmentTransaction
  | HealthcareTransaction
  | UtilitiesTransaction
  | EntertainmentTransaction;

export type FinancialSummany = {
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
export type MovementType = "income" | "expense" | "transfer";

export type Currency = "ARS" | "USD";

export type RateType = "blue" | "oficial" | "mep" | "ccl" | "cripto";

export interface Movement {
  id: number;
  // Brief description of the movement
  details: string;
  // Date of the movement in ISO 8601 format (YYYY-MM-DD)
  date: string;
  // Timestamp when the movement was created (datetime format)
  created_at: string;
  // Type of movement: income, expense, or transfer
  mov_type: MovementType;
  // Currency of the original amount (ARS or USD)
  currency: Currency;
  // Amount in the original currency, stored in cents
  original_amount: number;
  // Amount converted to ARS at registration time, stored in cents
  // Used for all reports and analytics
  ars_amount: number;
  // Exchange rate used for conversion (null if currency is ARS)
  exchange_rate: number | null;
  // Type of exchange rate used ('blue', 'oficial', 'mep', 'ccl', 'cripto')
  rate_type: RateType | null;
  // Reference to the account this movement belongs to
  account_id: number;
  // Reference to the category (optional)
  category_id: number | null;
}

// Data required to add a new movement (matches AddMovement in Rust)
export interface AddMovement {
  details: string;
  date: string;
  mov_type: MovementType;
  currency: Currency;
  original_amount: number;
  ars_amount: number;
  exchange_rate: number | null;
  rate_type: RateType | null;
  account_id: number;
  category_id: number | null;
}

// Data allowed when updating a movement (matches UpdateMovement in Rust)
export interface UpdateMovement {
  details: string;
  date: string;
  mov_type: MovementType;
  currency: Currency;
  original_amount: number;
  ars_amount: number;
  exchange_rate: number | null;
  rate_type: RateType | null;
  category_id: number | null;
}

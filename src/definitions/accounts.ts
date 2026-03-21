export enum AccountType {
  BANK = "banco",
  CREDIT_CARD = "tarjeta de crédito",
  DEBIT_CARD = "tarjeta de débito",
  CASH = "efectivo",
  ONLINE_WALLET = "billetera online",
}

export type Account = {
  id: number;
  name: string;
  acc_type: AccountType;
  currency: string;
  created_at: string;
  balance: number; // en centavos
  notes?: string;
};

export type UpdateAccount = {
  name: string;
  acc_type: AccountType;
  notes?: string;
};

export type AddAccount = {
  name: string;
  acc_type: AccountType;
  currency: string;
  initial_balance: number;
  notes?: string;
};

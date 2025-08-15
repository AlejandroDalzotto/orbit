import { Currency } from "@/models/transaction";

export enum AccountType {
  Cash = 'cash',
  OnlineWallet = 'online wallet',
  BankAccount = 'bank account',
  CreditCard = 'credit card',
}

export type Account = {
  id: string;
  name: string;
  type: AccountType;
  balance: number;
  currency: Currency;
  createdAt: number;
  updatedAt: number;
  transactionsCount: number;
  transactionsId: string[];
}

export type CreateAccount = Pick<Account, 'name' | 'type' | 'balance' | 'currency'>;

export type EditAccount = Pick<Account, 'name' | 'type' | 'balance'>;

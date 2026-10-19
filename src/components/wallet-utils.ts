import type { AccountType } from "../types/generated/AccountType";
import type { Currency } from "../types/generated/Currency";
import { currencyDecimals, parseMinorAmount } from "./ledger-utils";

export const accountTypeLabels: Record<AccountType, string> = {
  cash: "Efectivo",
  checking: "Cuenta corriente",
  savings: "Caja de ahorro",
  credit_card: "Tarjeta de crédito",
  investment: "Inversión",
  loan: "Préstamo",
  digital_wallet: "Billetera digital",
  other: "Otra cuenta",
};

export function isAccountType(value: string): value is AccountType {
  return Object.prototype.hasOwnProperty.call(accountTypeLabels, value);
}

export function accountTypeLabel(value: string): string {
  return isAccountType(value) ? accountTypeLabels[value] : value;
}

export function parseInitialBalance(input: string, currency: Currency): number | null {
  const value = input.trim().replace(",", ".");
  if (!value) return null;
  // Opening balances allow zero, unlike ledger movements. Never create a zero movement.
  if (/^0+(?:\.0+)?$/.test(value)) {
    if ((value.split(".")[1]?.length ?? 0) > currencyDecimals(currency)) {
      throw new Error(`${currency.code} admite ${currency.decimalPlaces} decimales.`);
    }
    return null;
  }
  return parseMinorAmount(value, currency);
}

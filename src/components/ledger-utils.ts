import type { Currency } from "../types/generated/Currency";
import type { MovementType } from "../types/generated/MovementType";

export const movementLabels: Record<MovementType, string> = {
  income: "Ingreso", expense: "Gasto", transfer: "Transferencia", initial_balance: "Saldo inicial",
};

export function errorMessage(error: unknown): string {
  if (typeof error === "string") return error;
  if (error && typeof error === "object" && "message" in error && typeof error.message === "string") return error.message;
  return "No se pudo completar la operación. Intentá de nuevo.";
}

export function currencyDecimals(currency: Currency): number {
  const decimals = currency.decimalPlaces;
  if (!Number.isInteger(decimals) || decimals < 0 || decimals > 18) throw new Error("Precisión de moneda no compatible.");
  return decimals;
}

// Parse the decimal string before converting to Number; multiplying floats can lose a minor unit.
export function parseMinorAmount(input: string, currency: Currency): number {
  const decimals = currencyDecimals(currency);
  const normalized = input.trim().replace(",", ".");
  if (!/^\d+(?:\.\d+)?$/.test(normalized)) throw new Error("Ingresá un importe positivo, sin separadores de miles ni exponentes.");
  const [whole, fraction = ""] = normalized.split(".");
  if (fraction.length > decimals) throw new Error(`${currency.code} admite ${decimals} decimales.`);
  const amount = BigInt(whole) * 10n ** BigInt(decimals) + BigInt(fraction.padEnd(decimals, "0") || "0");
  if (amount <= 0n) throw new Error("El importe debe ser mayor que cero.");
  if (amount > BigInt(Number.MAX_SAFE_INTEGER)) throw new Error("El importe supera el máximo admitido.");
  return Number(amount);
}

function integerMinor(amount: number | bigint): bigint {
  if (typeof amount === "bigint") return amount;
  if (!Number.isSafeInteger(amount)) throw new Error("El importe no es un entero seguro.");
  return BigInt(amount);
}

export function minorToInput(amount: number | bigint, currency: Currency): string {
  const value = integerMinor(amount);
  const decimals = currencyDecimals(currency);
  const absolute = value < 0n ? -value : value;
  const digits = absolute.toString().padStart(decimals + 1, "0");
  return `${value < 0n ? "-" : ""}${decimals ? `${digits.slice(0, -decimals)}.${digits.slice(-decimals)}` : digits}`;
}

export function formatMinor(amount: number | bigint, code: string, currencies: readonly Currency[]): string {
  const currency = currencies.find((item) => item.code === code);
  // Unknown metadata must not silently assume two decimals.
  if (!currency) return `${integerMinor(amount).toLocaleString("es-AR")} u. menores ${code}`;
  const [whole, fraction] = minorToInput(amount, currency).split(".");
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${grouped}${fraction === undefined ? "" : `,${fraction}`} ${code}`;
}

export function localDate(): string {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
}

export function displayDate(date: string): string {
  const [year, month, day] = date.slice(0, 10).split("-");
  return `${day}/${month}/${year}`;
}

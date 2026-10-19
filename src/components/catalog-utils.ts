import type { Category } from "../types/generated/Category";
import type { Currency } from "../types/generated/Currency";

export const catalogTypeLabels: Record<Category["type"], string> = {
  income: "Ingreso",
  expense: "Gasto",
  both: "Ingreso y gasto",
};

export function catalogErrorMessage(error: unknown): string {
  if (typeof error === "string") return error;
  if (error && typeof error === "object" && "message" in error && typeof error.message === "string") return error.message;
  return "No se pudo completar la operación. Intentá de nuevo.";
}

export function categoryPath(category: Category, categories: Category[]): string {
  const names = [category.name];
  const seen = new Set([category.id]);
  let parentId = category.parentId;
  while (parentId !== null && !seen.has(parentId)) {
    seen.add(parentId);
    const parent = categories.find((entry) => entry.id === parentId);
    if (!parent) break;
    names.unshift(parent.name);
    parentId = parent.parentId;
  }
  return names.join(" / ");
}

export function validCategoryParents(categories: Category[], id: number | undefined, type: Category["type"]) {
  const excluded = new Set<number>(id === undefined ? [] : [id]);
  let changed = true;
  while (changed) {
    changed = false;
    for (const category of categories) {
      if (category.parentId !== null && excluded.has(category.parentId) && !excluded.has(category.id)) {
        excluded.add(category.id);
        changed = true;
      }
    }
  }
  return categories.filter((category) =>
    category.isActive && !excluded.has(category.id) && (category.type === "both" || category.type === type),
  );
}

export function catalogDecimalPlaces(currency: Currency | undefined): number | null {
  const places = currency?.decimalPlaces;
  return typeof places === "number" && Number.isInteger(places) && places >= 0 && places <= 20 ? places : null;
}

export function catalogMinorUnits(value: string, decimalPlaces: number): number {
  const trimmed = value.trim();
  if (!Number.isInteger(decimalPlaces) || decimalPlaces < 0 || decimalPlaces > 20) {
    throw new Error("La moneda no tiene una precisión válida.");
  }
  if (!/^\d+(?:[.,]\d+)?$/.test(trimmed) || trimmed.length > 80) {
    throw new Error("Ingresá un precio válido mayor o igual a cero.");
  }
  const [whole, fraction = ""] = trimmed.replace(",", ".").split(".");
  if (fraction.length > decimalPlaces) {
    throw new Error(`Esta moneda admite hasta ${decimalPlaces} decimales.`);
  }
  // Parse the decimal string exactly instead of multiplying a floating-point price.
  const minor = BigInt(whole + fraction.padEnd(decimalPlaces, "0"));
  if (minor > BigInt(Number.MAX_SAFE_INTEGER)) throw new Error("El precio excede el rango permitido.");
  return Number(minor);
}

export function catalogMoney(amount: number, code: string, currencies: Currency[] = []): string {
  const decimals = catalogDecimalPlaces(currencies.find((currency) => currency.code === code));
  if (decimals === null) return `${amount.toLocaleString("es-AR")} ${code} (unidades menores)`;
  // Format the integral minor units directly, including at the safe-integer boundary.
  const negative = amount < 0;
  const digits = Math.abs(amount).toString().padStart(decimals + 1, "0");
  const whole = decimals ? digits.slice(0, -decimals) : digits;
  const fraction = decimals ? `,${digits.slice(-decimals)}` : "";
  return `${negative ? "−" : ""}${BigInt(whole).toLocaleString("es-AR")}${fraction} ${code}`;
}

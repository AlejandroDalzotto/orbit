export const formatCurrency = (valueInCents: number, currency?: string) => {
  const value = valueInCents / 100;
  const curr = currency === "USD" ? "USD" : "ARS";
  const locale = curr === "USD" ? "en-US" : "es-AR";
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: curr,
    }).format(value);
  } catch {
    return `${value.toFixed(2)} ${curr}`;
  }
};

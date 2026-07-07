export function formatPKR(amount: number, decimals = 0): string {
  const value = Number.isFinite(amount) ? amount : 0;
  return `Rs. ${value.toLocaleString("en-PK", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
}

export const CURRENCY_LABEL = "PKR";

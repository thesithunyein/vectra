export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function formatHours(value: number): string {
  return `${value.toFixed(1)} hrs`;
}

export function formatRm(value: number): string {
  return `RM ${value.toLocaleString("en-MY")}`;
}

export function formatCurrency(value: number, compact = false): string {
  if (!isFinite(value)) return "$0";
  const abs = Math.abs(value);
  if (compact && abs >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(value < 10_000_000 ? 2 : 1)}M`;
  }
  if (compact && abs >= 1_000) {
    return `$${(value / 1_000).toFixed(value < 10_000 ? 1 : 0)}K`;
  }
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

export function formatNumberWithCommas(value: number | string): string {
  const num = typeof value === "string" ? value.replace(/,/g, "") : String(value);
  if (num === "" || num === "-") return num;
  const parts = num.split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return parts.join(".");
}

export function parseFormattedNumber(value: string): number {
  if (!value) return 0;
  const cleaned = value.replace(/,/g, "").replace(/\$/g, "");
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

export function formatPercent(value: number, digits = 1): string {
  return `${value.toFixed(digits)}%`;
}

// Long-term capital gains tax brackets (2024 single filer simplified)
export function capitalGainsTaxRate(annualWithdrawal: number): number {
  if (annualWithdrawal <= 47_025) return 0;
  if (annualWithdrawal <= 518_900) return 0.15;
  return 0.2;
}

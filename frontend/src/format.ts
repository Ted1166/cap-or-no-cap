export function formatValue(n: number, fieldKey: string): string {
  if (fieldKey === "percent_change_24h") return `${n.toFixed(2)}%`;
  if (fieldKey === "num_market_pairs") return n.toLocaleString();
  if (Math.abs(n) >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (Math.abs(n) >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  if (Math.abs(n) >= 1e3) return `$${(n / 1e3).toFixed(1)}K`;
  return `$${n.toFixed(2)}`;
}

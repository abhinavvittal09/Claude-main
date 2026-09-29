export function formatMoney(amount: number, symbol = '$'): string {
  const abs = Math.abs(amount);
  const str = Number.isInteger(abs)
    ? abs.toLocaleString('en-US')
    : abs.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `${amount < 0 ? '−' : ''}${symbol}${str}`;
}

export function formatCents(cents: number, symbol = '$'): string {
  return formatMoney(Math.round(cents) / 100, symbol);
}

export function formatPercent(fraction: number): string {
  return `${(fraction * 100).toFixed(1)}%`;
}

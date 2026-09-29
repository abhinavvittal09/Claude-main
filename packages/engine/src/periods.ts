import type { CapPeriod, CreditPeriod } from './types.js';

/** Parse YYYY-MM-DD as a UTC timestamp. Throws on anything else so bad dates fail loudly. */
export function parseDate(iso: string): number {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) throw new Error(`Expected YYYY-MM-DD, got "${iso}"`);
  return Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
}

const DAY = 86_400_000;

export function daysBetween(fromIso: string, toIso: string): number {
  return Math.round((parseDate(toIso) - parseDate(fromIso)) / DAY);
}

export interface PeriodInfo {
  key: string;
  /** Days until the next period starts. */
  daysUntilReset: number;
  /** Human label: "month", "quarter", "half-year", "year". */
  label: string;
}

export function periodInfo(period: CreditPeriod | CapPeriod, iso: string): PeriodInfo {
  const ts = parseDate(iso);
  const d = new Date(ts);
  const y = d.getUTCFullYear();
  const m = d.getUTCMonth();
  let key: string;
  let next: number;
  let label: string;
  switch (period) {
    case 'monthly':
    case 'month':
      key = `${y}-${String(m + 1).padStart(2, '0')}`;
      next = Date.UTC(y, m + 1, 1);
      label = 'month';
      break;
    case 'quarterly':
    case 'quarter': {
      const q = Math.floor(m / 3);
      key = `${y}-Q${q + 1}`;
      next = Date.UTC(y, q * 3 + 3, 1);
      label = 'quarter';
      break;
    }
    case 'semiannual': {
      const h = m < 6 ? 1 : 2;
      key = `${y}-H${h}`;
      next = h === 1 ? Date.UTC(y, 6, 1) : Date.UTC(y + 1, 0, 1);
      label = 'half-year';
      break;
    }
    case 'annual':
    case 'year':
      key = String(y);
      next = Date.UTC(y + 1, 0, 1);
      label = 'year';
      break;
  }
  return { key, daysUntilReset: Math.round((next - ts) / DAY), label };
}

import { describe, expect, it } from 'vitest';
import { daysBetween, parseDate, periodInfo } from '../src/periods.js';

describe('periods', () => {
  it('monthly key and reset', () => {
    expect(periodInfo('monthly', '2026-09-22')).toEqual({ key: '2026-09', daysUntilReset: 9, label: 'month' });
    expect(periodInfo('monthly', '2026-12-31').daysUntilReset).toBe(1);
  });
  it('quarterly, semiannual, annual', () => {
    expect(periodInfo('quarterly', '2026-10-15')).toEqual({ key: '2026-Q4', daysUntilReset: 78, label: 'quarter' });
    expect(periodInfo('semiannual', '2026-03-01').key).toBe('2026-H1');
    expect(periodInfo('semiannual', '2026-07-01').key).toBe('2026-H2');
    expect(periodInfo('annual', '2026-02-01')).toEqual({ key: '2026', daysUntilReset: 334, label: 'year' });
  });
  it('cap periods share the same machinery', () => {
    expect(periodInfo('quarter', '2026-01-01').key).toBe('2026-Q1');
    expect(periodInfo('year', '2026-06-06').key).toBe('2026');
  });
  it('dates are UTC and strict', () => {
    expect(daysBetween('2026-09-22', '2026-11-02')).toBe(41);
    expect(() => parseDate('9/22/2026')).toThrow();
  });
});

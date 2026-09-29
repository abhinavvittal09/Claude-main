/** Sample data matching docs/product/02-claude-design-prompt.md. Illustrative rates; verify before shipping as real data. */
import type { CardProduct, Category, Merchant, RewardsCurrency, UserCard } from '../types.js';

export const currencies: Record<string, RewardsCurrency> = {
  'amex-mr': { id: 'amex-mr', name: 'Membership Rewards', defaultCentsPerPoint: 2.0 },
  'chase-ur': { id: 'chase-ur', name: 'Ultimate Rewards', defaultCentsPerPoint: 2.0 },
  'capone-miles': { id: 'capone-miles', name: 'Capital One miles', defaultCentsPerPoint: 1.85 },
  cash: { id: 'cash', name: 'Cash back', defaultCentsPerPoint: 1 },
};

const cat = (id: string, name: string, parentId?: string): Category => (parentId ? { id, name, parentId } : { id, name });
export const categories: Record<string, Category> = Object.fromEntries(
  [
    cat('dining', 'Dining'),
    cat('groceries', 'Groceries'),
    cat('online-groceries', 'Online groceries', 'groceries'),
    cat('gas', 'Gas'),
    cat('online', 'Online'),
    cat('travel', 'Travel'),
    cat('flights', 'Flights', 'travel'),
    cat('drugstore', 'Drugstore'),
    cat('warehouse', 'Warehouse'),
    cat('streaming', 'Streaming'),
    cat('transit', 'Transit'),
    cat('discount', 'Discount store'),
    cat('everything', 'Everything else'),
  ].map((c) => [c.id, c]),
);

export const merchants = {
  costco: { id: 'costco', name: 'Costco', defaultCategoryId: 'warehouse', acceptedNetworks: ['visa'] },
  'uber-eats': { id: 'uber-eats', name: 'Uber Eats', defaultCategoryId: 'dining' },
  amazon: { id: 'amazon', name: 'Amazon', defaultCategoryId: 'online' },
  'whole-foods': { id: 'whole-foods', name: 'Whole Foods', defaultCategoryId: 'groceries' },
  shell: { id: 'shell', name: 'Shell', defaultCategoryId: 'gas' },
  'trader-joes': { id: 'trader-joes', name: "Trader Joe's", defaultCategoryId: 'groceries' },
  walmart: { id: 'walmart', name: 'Walmart', defaultCategoryId: 'discount' },
  target: { id: 'target', name: 'Target', defaultCategoryId: 'discount' },
  cvs: { id: 'cvs', name: 'CVS', defaultCategoryId: 'drugstore' },
  delta: { id: 'delta', name: 'Delta', defaultCategoryId: 'flights' },
  paypal: { id: 'paypal', name: 'PayPal', defaultCategoryId: 'online' },
  lisbon: { id: 'lisbon', name: 'Cervejaria Ramiro', defaultCategoryId: 'dining' },
} satisfies Record<string, Merchant>;

export const products: Record<string, CardProduct> = {
  'amex-gold': {
    id: 'amex-gold', issuer: 'American Express', name: 'Gold Card', network: 'amex', annualFee: 325, rewardsCurrencyId: 'amex-mr', foreignFeeRate: 0, foreignAcceptance: 'patchy',
    earnRules: [
      { id: 'ag-dining', match: { categoryId: 'dining' }, multiplier: 4, unit: 'points', label: 'dining' },
      { id: 'ag-groceries', match: { categoryId: 'groceries' }, multiplier: 4, unit: 'points', cap: { amount: 25_000, period: 'year' }, label: 'US supermarkets' },
      { id: 'ag-flights', match: { categoryId: 'flights' }, multiplier: 3, unit: 'points', label: 'flights' },
      { id: 'ag-base', match: {}, multiplier: 1, unit: 'points' },
    ],
    credits: [
      { id: 'ag-uber', name: 'Uber Cash', amount: 10, period: 'monthly', merchantIds: ['uber', 'uber-eats'] },
      { id: 'ag-dining-credit', name: 'dining credit', amount: 10, period: 'monthly', merchantIds: ['grubhub', 'cheesecake-factory'] },
    ],
    benefits: [{ kind: 'purchaseProtection', summary: 'Purchase protection 90 days' }, { kind: 'extendedWarranty', summary: 'Extended warranty +1 year' }],
  },
  csp: {
    id: 'csp', issuer: 'Chase', name: 'Sapphire Preferred', network: 'visa', annualFee: 95, rewardsCurrencyId: 'chase-ur', foreignFeeRate: 0,
    earnRules: [
      { id: 'csp-dining', match: { categoryId: 'dining' }, multiplier: 3, unit: 'points', label: 'dining' },
      { id: 'csp-online-groceries', match: { categoryId: 'online-groceries' }, multiplier: 3, unit: 'points', label: 'online groceries' },
      { id: 'csp-travel', match: { categoryId: 'travel' }, multiplier: 2, unit: 'points', label: 'travel' },
      { id: 'csp-base', match: {}, multiplier: 1, unit: 'points' },
    ],
    credits: [{ id: 'csp-hotel', name: 'hotel credit', amount: 50, period: 'annual', merchantIds: ['chase-travel'] }],
    benefits: [{ kind: 'purchaseProtection', summary: 'Purchase protection 120 days' }, { kind: 'extendedWarranty', summary: 'Extended warranty +1 year' }],
  },
  'custom-cash': {
    id: 'custom-cash', issuer: 'Citi', name: 'Custom Cash', network: 'mastercard', annualFee: 0, rewardsCurrencyId: 'cash', foreignFeeRate: 0.03,
    earnRules: [
      ...['dining', 'groceries', 'gas', 'drugstore', 'streaming', 'transit', 'travel'].map((c) => ({
        id: `cc-${c}`, match: { categoryId: c }, multiplier: 5, unit: 'percent' as const, cap: { amount: 500, period: 'month' as const, groupId: 'cc-top' }, label: 'top category',
      })),
      { id: 'cc-base', match: {}, multiplier: 1, unit: 'percent' },
    ],
    credits: [],
    benefits: [],
  },
  'freedom-flex': {
    id: 'freedom-flex', issuer: 'Chase', name: 'Freedom Flex', network: 'mastercard', annualFee: 0, rewardsCurrencyId: 'cash', foreignFeeRate: 0.03,
    earnRules: [
      { id: 'ff-q4-paypal', match: { merchantId: 'paypal' }, multiplier: 5, unit: 'percent', cap: { amount: 1_500, period: 'quarter', groupId: 'ff-q4' }, requiresActivation: true, validFrom: '2026-10-01', validTo: '2026-12-31', label: 'PayPal (Q4)' },
      { id: 'ff-q4-target', match: { merchantId: 'target' }, multiplier: 5, unit: 'percent', cap: { amount: 1_500, period: 'quarter', groupId: 'ff-q4' }, requiresActivation: true, validFrom: '2026-10-01', validTo: '2026-12-31', label: 'Target (Q4)' },
      { id: 'ff-dining', match: { categoryId: 'dining' }, multiplier: 3, unit: 'percent', label: 'dining' },
      { id: 'ff-drugstore', match: { categoryId: 'drugstore' }, multiplier: 3, unit: 'percent', label: 'drugstores' },
      { id: 'ff-base', match: {}, multiplier: 1, unit: 'percent' },
    ],
    credits: [],
    benefits: [{ kind: 'purchaseProtection', summary: 'Purchase protection 120 days' }],
  },
  'venture-x': {
    id: 'venture-x', issuer: 'Capital One', name: 'Venture X', network: 'visa', annualFee: 395, rewardsCurrencyId: 'capone-miles', foreignFeeRate: 0,
    earnRules: [{ id: 'vx-base', match: {}, multiplier: 2, unit: 'points' }],
    credits: [{ id: 'vx-travel', name: 'travel credit', amount: 300, period: 'annual', merchantIds: ['capone-travel'] }],
    benefits: [{ kind: 'purchaseProtection', summary: 'Purchase protection 90 days' }, { kind: 'extendedWarranty', summary: 'Extended warranty +1 year' }, { kind: 'lounge', summary: 'Priority Pass' }],
  },
};

/**
 * Wallet state on 2026-09-22 as described in the design prompt's sample data.
 * The Sapphire Preferred bonus in progress dominates every ranking (by design); the prompt's Results B–E
 * assume it has been met, so pass { cspSubMet: true } to reproduce them.
 */
export function sampleWallet(opts: { cspSubMet?: boolean } = {}): UserCard[] {
  const mk = (id: string, nickname: string, extra: Partial<UserCard> = {}): UserCard => ({
    id, product: products[id]!, nickname, status: 'active', activations: {}, capProgress: {}, creditsUsed: {}, offers: [], ...extra,
  });
  return [
    mk('amex-gold', 'Amex Gold'),
    mk('csp', 'Sapphire Preferred', opts.cspSubMet ? {} : { sub: { targetSpend: 4_000, valueCents: 120_000, deadline: '2026-11-02', progressSpend: 1_300 } }),
    mk('custom-cash', 'Custom Cash', { capProgress: { 'cc-top': 480 } }),
    mk('freedom-flex', 'Freedom Flex'),
    mk('venture-x', 'Venture X'),
  ];
}

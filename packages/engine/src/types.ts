/** Pure data types for the recommendation engine. No UI, no IO. Amounts are in major currency units (dollars); values are in cents. */

export type Network = 'visa' | 'mastercard' | 'amex' | 'discover';
export type PaymentMethod = 'in_store' | 'online' | 'mobile_wallet' | 'unknown';
export type CapPeriod = 'month' | 'quarter' | 'year';
export type CreditPeriod = 'monthly' | 'quarterly' | 'semiannual' | 'annual';
export type BenefitKind = 'purchaseProtection' | 'extendedWarranty' | 'lounge' | 'insurance' | 'other';

export interface RewardsCurrency {
  id: string;
  name: string;
  /** Default value of one point, in cents. Cash-back cards use percent rules and ignore this. */
  defaultCentsPerPoint: number;
}

export interface Category {
  id: string;
  name: string;
  parentId?: string;
}

export interface Merchant {
  id: string;
  name: string;
  defaultCategoryId: string;
  /** How a given issuer codes this merchant when it differs from the default (issuer name → category id). */
  issuerCodingOverrides?: Record<string, string>;
  /** Networks accepted here. null or undefined means all. */
  acceptedNetworks?: Network[] | null;
}

export interface RuleMatch {
  categoryId?: string;
  merchantId?: string;
  method?: PaymentMethod;
}

export interface EarnRule {
  id: string;
  /** Empty match means the card's base rate. Every specified field must match. */
  match: RuleMatch;
  multiplier: number;
  /** 'points' multiplies by the currency valuation; 'percent' is cash back on spend. */
  unit: 'points' | 'percent';
  cap?: {
    amount: number;
    period: CapPeriod;
    /** Rules that share a cap (e.g. "5% on your top category up to $500") share a groupId; progress is tracked per group. */
    groupId?: string;
  };
  requiresActivation?: boolean;
  validFrom?: string;
  validTo?: string;
  /** Short human label for the reason chip, e.g. "dining". Falls back to the category name. */
  label?: string;
}

export interface Credit {
  id: string;
  name: string;
  amount: number;
  period: CreditPeriod;
  merchantIds: string[];
}

export interface Benefit {
  kind: BenefitKind;
  summary: string;
}

export interface CardProduct {
  id: string;
  issuer: string;
  name: string;
  network: Network;
  annualFee: number;
  rewardsCurrencyId: string;
  /** Fraction, e.g. 0.03 for a 3% foreign transaction fee. */
  foreignFeeRate: number;
  earnRules: EarnRule[];
  credits: Credit[];
  benefits: Benefit[];
  foreignAcceptance?: 'good' | 'patchy';
}

export interface Offer {
  id: string;
  merchantId?: string;
  type: 'statement' | 'points';
  value: number;
  minSpend?: number;
  expiresAt?: string;
}

export interface SubState {
  targetSpend: number;
  valueCents: number;
  /** ISO date, inclusive. */
  deadline: string;
  progressSpend: number;
  /** User asserts they will hit the bonus through normal spend, so this purchase gets no bonus weighting. */
  onTrack?: boolean;
}

export interface UserCard {
  id: string;
  product: CardProduct;
  nickname: string;
  status: 'active' | 'frozen';
  sub?: SubState;
  /** ruleId → activated, for rules with requiresActivation. */
  activations: Record<string, boolean>;
  /** cap groupId (or ruleId) → spend counted against the cap in the current period. */
  capProgress: Record<string, number>;
  /** creditId → period key in which it was used. */
  creditsUsed: Record<string, string>;
  offers: Offer[];
  /** User-added rules; they outrank product rules of equal specificity. */
  customRules?: EarnRule[];
}

export type LocationContext =
  | { kind: 'domestic' }
  | { kind: 'foreign'; countryCode: string }
  | { kind: 'unknown' };

export interface Prefs {
  ignoreSubWeighting?: boolean;
  /** Purchases at or above this amount surface purchase-protection benefits as a tie-breaker. Default 500. */
  largePurchaseThreshold?: number;
  currencySymbol?: string;
}

export interface AskInput {
  merchant?: Merchant | null;
  categoryId: string;
  /** Omitted means "rank per 100 units". */
  amount?: number;
  method: PaymentMethod;
  location: LocationContext;
  /** ISO date YYYY-MM-DD. */
  date: string;
  cards: UserCard[];
  /** currencyId → cents per point, overriding the currency default. */
  valuations?: Record<string, number>;
  currencies: Record<string, RewardsCurrency>;
  categories: Record<string, Category>;
  prefs?: Prefs;
}

export type ReasonKind =
  | 'earn'
  | 'offer'
  | 'credit'
  | 'sub'
  | 'protection'
  | 'cap'
  | 'activation'
  | 'foreign'
  | 'warning'
  | 'constraint';

export interface Reason {
  kind: ReasonKind;
  text: string;
  detail?: string;
  valueCents?: number;
}

export interface RankedCard {
  card: UserCard;
  scoreCents: number;
  earnCents: number;
  /** scoreCents / amountCents. */
  effectiveRate: number;
  /** e.g. "4x" or "5%". Empty when no rule applies. */
  rateLabel: string;
  reasons: Reason[];
  warnings: Reason[];
  /** scoreCents minus the winner's; 0 for the winner. */
  deltaCents: number;
  needsActivation?: { ruleId: string; label: string };
  excludedReason?: string;
}

export interface Recommendation {
  amount: number;
  amountAssumed: boolean;
  noCards: boolean;
  allExcluded: boolean;
  tie: boolean;
  winner: RankedCard | null;
  ranked: RankedCard[];
  excluded: RankedCard[];
  assumptions: {
    valuations: Record<string, number>;
    categoryResolvedAs: string;
    issuerCodingNotes: string[];
  };
}

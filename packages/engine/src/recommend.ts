import type {
  AskInput,
  Category,
  EarnRule,
  Merchant,
  PaymentMethod,
  RankedCard,
  Reason,
  Recommendation,
  UserCard,
} from './types.js';
import { daysBetween, parseDate, periodInfo } from './periods.js';
import { formatCents, formatMoney } from './format.js';

const DEFAULT_AMOUNT = 100;
const DEFAULT_LARGE_PURCHASE = 500;
const TIE_TOLERANCE_CENTS = 1;

/** Rank the user's cards for one purchase. Pure: same input, same output. */
export function recommend(input: AskInput): Recommendation {
  const amount = input.amount ?? DEFAULT_AMOUNT;
  const amountAssumed = input.amount === undefined;
  const categoryName = input.categories[input.categoryId]?.name ?? input.categoryId;
  const valuationsUsed: Record<string, number> = {};
  const issuerCodingNotes: string[] = [];

  const base: Recommendation = {
    amount,
    amountAssumed,
    noCards: input.cards.length === 0,
    allExcluded: false,
    tie: false,
    winner: null,
    ranked: [],
    excluded: [],
    assumptions: { valuations: valuationsUsed, categoryResolvedAs: categoryName, issuerCodingNotes },
  };
  if (base.noCards) return base;

  const ranked: RankedCard[] = [];
  const excluded: RankedCard[] = [];
  for (const card of input.cards) {
    const r = scoreCard(card, input, amount, valuationsUsed, issuerCodingNotes);
    (r.excludedReason ? excluded : ranked).push(r);
  }
  ranked.sort(compareRanked);
  const winner = ranked[0] ?? null;
  if (winner) for (const r of ranked) r.deltaCents = r.scoreCents - winner.scoreCents;
  const second = ranked[1];
  const tie = !!winner && !!second && Math.abs(winner.scoreCents - second.scoreCents) < TIE_TOLERANCE_CENTS;

  return { ...base, allExcluded: ranked.length === 0, tie, winner, ranked, excluded };
}

function compareRanked(a: RankedCard, b: RankedCard): number {
  if (Math.abs(a.scoreCents - b.scoreCents) >= TIE_TOLERANCE_CENTS) return b.scoreCents - a.scoreCents;
  const prot = count(b.reasons, 'protection') - count(a.reasons, 'protection');
  if (prot !== 0) return prot;
  const cond = Number(!!a.needsActivation) - Number(!!b.needsActivation);
  if (cond !== 0) return cond;
  return a.card.nickname.localeCompare(b.card.nickname);
}

function count(reasons: Reason[], kind: Reason['kind']): number {
  return reasons.filter((r) => r.kind === kind).length;
}

function scoreCard(
  card: UserCard,
  input: AskInput,
  amount: number,
  valuationsUsed: Record<string, number>,
  issuerCodingNotes: string[],
): RankedCard {
  const symbol = input.prefs?.currencySymbol ?? '$';
  const product = card.product;
  const merchant = input.merchant ?? null;
  const amountCents = Math.round(amount * 100);
  const empty = (excludedReason: string): RankedCard => ({
    card, scoreCents: 0, earnCents: 0, effectiveRate: 0, rateLabel: '', reasons: [], warnings: [], deltaCents: 0, excludedReason,
  });

  if (card.status === 'frozen') return empty('Frozen');
  if (merchant?.acceptedNetworks && !merchant.acceptedNetworks.includes(product.network)) {
    return empty(`Not accepted: ${merchant.name} takes ${merchant.acceptedNetworks.map(networkName).join(' and ')} only`);
  }

  let categoryId = input.categoryId;
  const override = merchant?.issuerCodingOverrides?.[product.issuer];
  if (override && override !== categoryId) {
    categoryId = override;
    const note = `${product.issuer} codes ${merchant?.name} as ${input.categories[override]?.name ?? override}`;
    if (!issuerCodingNotes.includes(note)) issuerCodingNotes.push(note);
  }

  const currency = input.currencies[product.rewardsCurrencyId];
  const centsPerPoint = input.valuations?.[product.rewardsCurrencyId] ?? currency?.defaultCentsPerPoint ?? 1;
  valuationsUsed[product.rewardsCurrencyId] = centsPerPoint;

  const reasons: Reason[] = [];
  const warnings: Reason[] = [];
  const rules = [...(card.customRules ?? []).map((r) => ({ rule: r, bonus: 8 })), ...product.earnRules.map((r) => ({ rule: r, bonus: 0 }))];
  const active = rules.filter(({ rule }) => ruleIsLive(rule, input.date));
  const baseRule = active.find(({ rule }) => isBase(rule))?.rule;
  const best = pickRule(active, categoryId, merchant, input.method, input.categories, centsPerPoint);

  let earnCents = 0;
  let rateLabel = '';
  let needsActivation: RankedCard['needsActivation'];
  if (best) {
    let atRule = amount;
    let atBase = 0;
    let capReached = false;
    if (best.cap) {
      const used = card.capProgress[best.cap.groupId ?? best.id] ?? 0;
      const remaining = Math.max(0, best.cap.amount - used);
      atRule = Math.min(amount, remaining);
      atBase = amount - atRule;
      const period = periodInfo(best.cap.period, input.date).label;
      if (remaining <= 0) {
        capReached = true;
        reasons.push({ kind: 'cap', text: `Cap reached: ${formatMoney(best.cap.amount, symbol)} per ${period}` });
      } else if (atBase > 0) {
        reasons.push({ kind: 'cap', text: `Cap: ${formatMoney(remaining, symbol)} of ${formatMoney(best.cap.amount, symbol)} left this ${period}` });
      }
    }
    earnCents = ruleCents(best, atRule, centsPerPoint) + (baseRule && baseRule !== best ? ruleCents(baseRule, atBase, centsPerPoint) : 0);
    const shown = capReached && baseRule ? baseRule : best;
    rateLabel = rateText(shown);
    const label = shown.label ?? (isBase(shown) ? 'everything' : input.categories[categoryId]?.name ?? categoryId);
    reasons.unshift({ kind: 'earn', text: `${rateLabel} ${label} · ${pct(earnCents, amountCents)}`, valueCents: earnCents });
    if (best.requiresActivation && !card.activations[best.id]) {
      needsActivation = { ruleId: best.id, label: rateText(best) };
      reasons.push({ kind: 'activation', text: `Activate to earn ${rateText(best)}` });
    }
  }

  let offerCents = 0;
  for (const o of card.offers) {
    if (!merchant || o.merchantId !== merchant.id) continue;
    if (o.expiresAt && parseDate(o.expiresAt) < parseDate(input.date)) continue;
    if (o.minSpend !== undefined && amount < o.minSpend) continue;
    const v = o.type === 'statement' ? o.value * 100 : o.value * centsPerPoint;
    offerCents += v;
    reasons.push({ kind: 'offer', text: `Offer: ${o.type === 'statement' ? formatMoney(o.value, symbol) + ' back' : `${o.value} pts`} at ${merchant.name}`, valueCents: v });
  }

  let creditCents = 0;
  if (merchant) {
    for (const c of product.credits) {
      if (!c.merchantIds.includes(merchant.id)) continue;
      const p = periodInfo(c.period, input.date);
      if (card.creditsUsed[c.id] === p.key) continue;
      const v = Math.min(c.amount, amount) * 100;
      creditCents += v;
      reasons.push({ kind: 'credit', text: `Credit: ${formatMoney(c.amount, symbol)} ${c.name} unused`, detail: `Resets in ${p.daysUntilReset} days`, valueCents: v });
    }
  }

  let subCents = 0;
  if (card.sub && !card.sub.onTrack && !input.prefs?.ignoreSubWeighting) {
    const remaining = card.sub.targetSpend - card.sub.progressSpend;
    const daysLeft = daysBetween(input.date, card.sub.deadline);
    if (remaining > 0 && daysLeft >= 0) {
      subCents = Math.min(card.sub.valueCents, (card.sub.valueCents * amount) / remaining);
      reasons.push({ kind: 'sub', text: `SUB: ${formatMoney(remaining, symbol)} to go, ${daysLeft} days`, valueCents: subCents });
    }
  }

  let feeCents = 0;
  if (input.location.kind === 'foreign') {
    feeCents = amountCents * product.foreignFeeRate;
    if (feeCents > 0) warnings.push({ kind: 'foreign', text: `${(product.foreignFeeRate * 100).toFixed(0)}% foreign fee`, valueCents: -feeCents });
    if (product.foreignAcceptance === 'patchy') warnings.push({ kind: 'warning', text: `${networkName(product.network)} acceptance is patchy abroad; carry a Visa backup` });
  }

  const threshold = input.prefs?.largePurchaseThreshold ?? DEFAULT_LARGE_PURCHASE;
  if (amount >= threshold) {
    const prot = product.benefits.filter((b) => b.kind === 'purchaseProtection' || b.kind === 'extendedWarranty');
    if (prot.length) reasons.push({ kind: 'protection', text: prot.map((b) => b.summary).join(' · ') });
  }

  const scoreCents = round2(earnCents + offerCents + creditCents + subCents - feeCents);
  const r: RankedCard = {
    card, scoreCents, earnCents: round2(earnCents), effectiveRate: amountCents ? scoreCents / amountCents : 0, rateLabel, reasons, warnings, deltaCents: 0,
  };
  if (needsActivation) r.needsActivation = needsActivation;
  return r;
}

function isBase(rule: EarnRule): boolean {
  return !rule.match.categoryId && !rule.match.merchantId && !rule.match.method;
}

function ruleIsLive(rule: EarnRule, date: string): boolean {
  const ts = parseDate(date);
  if (rule.validFrom && parseDate(rule.validFrom) > ts) return false;
  if (rule.validTo && parseDate(rule.validTo) < ts) return false;
  return true;
}

function categoryMatches(ruleCategoryId: string, categoryId: string, categories: Record<string, Category>): boolean {
  let cur: string | undefined = categoryId;
  let guard = 0;
  while (cur && guard++ < 16) {
    if (cur === ruleCategoryId) return true;
    cur = categories[cur]?.parentId;
  }
  return false;
}

function pickRule(
  rules: { rule: EarnRule; bonus: number }[],
  categoryId: string,
  merchant: Merchant | null,
  method: PaymentMethod,
  categories: Record<string, Category>,
  centsPerPoint: number,
): EarnRule | undefined {
  let best: EarnRule | undefined;
  let bestSpec = -1;
  let bestValue = -1;
  for (const { rule, bonus } of rules) {
    const m = rule.match;
    let spec = bonus;
    if (m.merchantId) {
      if (!merchant || merchant.id !== m.merchantId) continue;
      spec += 4;
    }
    if (m.method) {
      if (m.method !== method) continue;
      spec += 2;
    }
    if (m.categoryId) {
      if (!categoryMatches(m.categoryId, categoryId, categories)) continue;
      spec += 1;
    }
    const value = ruleCents(rule, 1, centsPerPoint);
    if (spec > bestSpec || (spec === bestSpec && value > bestValue)) {
      best = rule;
      bestSpec = spec;
      bestValue = value;
    }
  }
  return best;
}

function ruleCents(rule: EarnRule, amount: number, centsPerPoint: number): number {
  return rule.unit === 'percent' ? amount * rule.multiplier : amount * rule.multiplier * centsPerPoint;
}

function rateText(rule: EarnRule): string {
  return rule.unit === 'percent' ? `${trim(rule.multiplier)}%` : `${trim(rule.multiplier)}x`;
}

function trim(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(2).replace(/0+$/, '').replace(/\.$/, '');
}

function pct(cents: number, amountCents: number): string {
  return amountCents ? `${((cents / amountCents) * 100).toFixed(1)}%` : '—';
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function networkName(n: UserCard['product']['network']): string {
  return { visa: 'Visa', mastercard: 'Mastercard', amex: 'Amex', discover: 'Discover' }[n];
}

export { formatCents };

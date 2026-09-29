import { describe, expect, it } from 'vitest';
import { recommend, type AskInput, type UserCard } from '../src/index.js';
import { categories, currencies, merchants, products, sampleWallet } from '../src/fixtures/sample.js';

const DATE = '2026-09-22';

/** Default wallet has the Sapphire Preferred bonus met; pass cards: sampleWallet() for the bonus case. */
function ask(over: Partial<AskInput>): AskInput {
  return { categoryId: 'everything', method: 'in_store', location: { kind: 'domestic' }, date: DATE, cards: sampleWallet({ cspSubMet: true }), currencies, categories, ...over };
}
const byId = (r: ReturnType<typeof recommend>, id: string) => [...r.ranked, ...r.excluded].find((x) => x.card.id === id)!;
const texts = (x: { reasons: { text: string }[] }) => x.reasons.map((r) => r.text);

describe('worked examples from the product plan', () => {
  it('A: Costco in store, $180 — SUB weighting beats a 2x card; non-Visa cards are excluded', () => {
    const r = recommend(ask({ cards: sampleWallet(), merchant: merchants.costco, categoryId: 'warehouse', amount: 180 }));
    expect(r.winner?.card.id).toBe('csp');
    expect(r.winner?.scoreCents).toBe(8360);
    expect(byId(r, 'venture-x').scoreCents).toBe(666);
    expect(byId(r, 'venture-x').deltaCents).toBe(-7694);
    expect(r.excluded.map((x) => x.card.id).sort()).toEqual(['amex-gold', 'custom-cash', 'freedom-flex']);
    expect(byId(r, 'amex-gold').excludedReason).toMatch(/Visa only/);
    expect(texts(r.winner!)).toEqual(expect.arrayContaining([expect.stringMatching(/^SUB: \$2,700 to go, 41 days$/), expect.stringMatching(/^1x everything · 2\.0%$/)]));
    expect(r.assumptions.valuations['chase-ur']).toBe(2.0);
  });

  it('A′: with the bonus in progress, Sapphire Preferred wins Uber Eats too, and says why', () => {
    const r = recommend(ask({ cards: sampleWallet(), merchant: merchants['uber-eats'], categoryId: 'dining', amount: 40, method: 'online' }));
    expect(r.winner?.card.id).toBe('csp');
    expect(r.winner?.scoreCents).toBeCloseTo(240 + (120_000 * 40) / 2_700, 2);
    expect(byId(r, 'amex-gold').scoreCents).toBe(1320);
  });

  it('A″: marking the bonus on track removes the weighting for that card only', () => {
    const cards = sampleWallet().map((c) => (c.id === 'csp' ? { ...c, sub: { ...c.sub!, onTrack: true } } : c));
    const r = recommend(ask({ cards, merchant: merchants['uber-eats'], categoryId: 'dining', amount: 40, method: 'online' }));
    expect(r.winner?.card.id).toBe('amex-gold');
    expect(byId(r, 'csp').scoreCents).toBe(240);
    expect(byId(r, 'csp').reasons.some((x) => x.kind === 'sub')).toBe(false);
  });

  it('B: Uber Eats online, $40 — 4x plus an unused $10 credit', () => {
    const r = recommend(ask({ merchant: merchants['uber-eats'], categoryId: 'dining', amount: 40, method: 'online' }));
    expect(r.winner?.card.id).toBe('amex-gold');
    expect(r.winner?.scoreCents).toBe(1320);
    const credit = r.winner!.reasons.find((x) => x.kind === 'credit')!;
    expect(credit.text).toBe('Credit: $10 Uber Cash unused');
    expect(credit.detail).toBe('Resets in 9 days');
    expect(byId(r, 'csp').scoreCents).toBe(240);
    expect(byId(r, 'csp').deltaCents).toBe(-1080);
    expect(byId(r, 'freedom-flex').scoreCents).toBe(120);
    expect(byId(r, 'venture-x').scoreCents).toBe(148);
    const cc = byId(r, 'custom-cash');
    expect(cc.scoreCents).toBe(120);
    expect(texts(cc)).toContain('Cap: $20 of $500 left this month');
  });

  it('C: restaurant in Lisbon, foreign — 3% fee wipes out a 3% card; Amex warned on acceptance', () => {
    const r = recommend(ask({ merchant: merchants.lisbon, categoryId: 'dining', amount: 60, location: { kind: 'foreign', countryCode: 'PT' }, prefs: { currencySymbol: '€' } }));
    expect(r.winner?.card.id).toBe('amex-gold');
    expect(r.winner?.scoreCents).toBe(480);
    expect(r.winner?.warnings.map((w) => w.kind)).toEqual(['warning']);
    expect(byId(r, 'freedom-flex').scoreCents).toBe(0);
    expect(byId(r, 'freedom-flex').warnings[0]?.text).toBe('3% foreign fee');
    expect(byId(r, 'venture-x').scoreCents).toBe(222);
  });

  it('D: PayPal in Q4, $120 — rotating 5% ranks first but flags activation', () => {
    const r = recommend(ask({ merchant: merchants.paypal, categoryId: 'online', amount: 120, method: 'online', date: '2026-10-15' }));
    expect(r.winner?.card.id).toBe('freedom-flex');
    expect(r.winner?.scoreCents).toBe(600);
    expect(r.winner?.needsActivation).toEqual({ ruleId: 'ff-q4-paypal', label: '5%' });
    expect(texts(r.winner!)).toContain('Activate to earn 5%');
    expect(byId(r, 'venture-x').scoreCents).toBe(444);
  });

  it('D′: the same PayPal rule is not live in September', () => {
    const r = recommend(ask({ merchant: merchants.paypal, categoryId: 'online', amount: 120, method: 'online' }));
    expect(byId(r, 'freedom-flex').scoreCents).toBe(120);
    expect(byId(r, 'freedom-flex').needsActivation).toBeUndefined();
  });

  it('E: groceries, $150 — a nearly exhausted 5% cap blends down to 1.5%', () => {
    const r = recommend(ask({ merchant: merchants['whole-foods'], categoryId: 'groceries', amount: 150 }));
    expect(r.winner?.card.id).toBe('amex-gold');
    expect(r.winner?.scoreCents).toBe(1200);
    const cc = byId(r, 'custom-cash');
    expect(cc.scoreCents).toBe(230);
    expect(cc.effectiveRate).toBeCloseTo(0.01533, 4);
  });
});

describe('edge cases', () => {
  it('no cards → noCards, no winner', () => {
    const r = recommend(ask({ cards: [] }));
    expect(r.noCards).toBe(true);
    expect(r.winner).toBeNull();
  });

  it('all cards excluded → allExcluded with reasons', () => {
    const amexOnly = sampleWallet().filter((c) => c.product.network === 'amex');
    const r = recommend(ask({ cards: amexOnly, merchant: merchants.costco, categoryId: 'warehouse', amount: 50 }));
    expect(r.allExcluded).toBe(true);
    expect(r.winner).toBeNull();
    expect(r.excluded).toHaveLength(1);
  });

  it('amount omitted → ranks per 100 and says so', () => {
    const r = recommend(ask({ categoryId: 'dining' }));
    expect(r.amount).toBe(100);
    expect(r.amountAssumed).toBe(true);
    expect(r.winner?.card.id).toBe('amex-gold');
  });

  it('frozen card is excluded', () => {
    const cards = sampleWallet().map((c) => (c.id === 'amex-gold' ? { ...c, status: 'frozen' as const } : c));
    const r = recommend(ask({ cards, categoryId: 'dining', amount: 40 }));
    expect(byId(r, 'amex-gold').excludedReason).toBe('Frozen');
    expect(r.winner?.card.id).toBe('csp');
  });

  it('tie: two identical-rate cards are reported as a tie', () => {
    const vx = sampleWallet().find((c) => c.id === 'venture-x')!;
    const twin: UserCard = { ...vx, id: 'venture-x-2', nickname: 'Venture X (P2)' };
    const r = recommend(ask({ cards: [vx, twin], categoryId: 'everything', amount: 100 }));
    expect(r.tie).toBe(true);
    expect(r.ranked.map((x) => x.scoreCents)).toEqual([370, 370]);
  });

  it('SUB: expired, completed, or disabled by preference adds no weighting', () => {
    const csp = sampleWallet().find((c) => c.id === 'csp')!;
    expect(csp.sub).toBeDefined();
    const expired = { ...csp, sub: { ...csp.sub!, deadline: '2026-09-21' } };
    const done = { ...csp, sub: { ...csp.sub!, progressSpend: 4_000 } };
    expect(recommend(ask({ cards: [expired], amount: 100 })).winner?.scoreCents).toBe(200);
    expect(recommend(ask({ cards: [done], amount: 100 })).winner?.scoreCents).toBe(200);
    expect(recommend(ask({ cards: [csp], amount: 100, prefs: { ignoreSubWeighting: true } })).winner?.scoreCents).toBe(200);
    expect(recommend(ask({ cards: [csp], amount: 100 })).winner?.scoreCents).toBeGreaterThan(200);
  });

  it('SUB weighting never exceeds the bonus value on one purchase', () => {
    const csp = sampleWallet().find((c) => c.id === 'csp')!;
    const r = recommend(ask({ cards: [csp], amount: 10_000 }));
    const sub = r.winner!.reasons.find((x) => x.kind === 'sub')!;
    expect(sub.valueCents).toBe(120_000);
  });

  it('offers: apply at the merchant, above min spend, before expiry', () => {
    const vx = sampleWallet().find((c) => c.id === 'venture-x')!;
    const withOffer: UserCard = { ...vx, offers: [{ id: 'o1', merchantId: 'amazon', type: 'statement', value: 15, minSpend: 50, expiresAt: '2026-12-31' }] };
    const hit = recommend(ask({ cards: [withOffer], merchant: merchants.amazon, categoryId: 'online', amount: 60, method: 'online' }));
    expect(hit.winner?.scoreCents).toBe(60 * 2 * 1.85 + 1500);
    const under = recommend(ask({ cards: [withOffer], merchant: merchants.amazon, categoryId: 'online', amount: 40, method: 'online' }));
    expect(under.winner?.scoreCents).toBe(40 * 2 * 1.85);
    const late = recommend(ask({ cards: [withOffer], merchant: merchants.amazon, categoryId: 'online', amount: 60, method: 'online', date: '2027-01-02' }));
    expect(late.winner?.scoreCents).toBe(60 * 2 * 1.85);
  });

  it('credit already used this period is not counted', () => {
    const gold = sampleWallet().find((c) => c.id === 'amex-gold')!;
    const used = { ...gold, creditsUsed: { 'ag-uber': '2026-09' } };
    const r = recommend(ask({ cards: [used], merchant: merchants['uber-eats'], categoryId: 'dining', amount: 40, method: 'online' }));
    expect(r.winner?.scoreCents).toBe(320);
  });

  it('category rules match through parents (online groceries → groceries)', () => {
    const cards = sampleWallet({ cspSubMet: true }).filter((c) => c.id === 'csp' || c.id === 'amex-gold');
    const r = recommend(ask({ cards, categoryId: 'online-groceries', amount: 100, method: 'online' }));
    expect(byId(r, 'csp').rateLabel).toBe('3x');
    expect(byId(r, 'amex-gold').rateLabel).toBe('4x');
  });

  it('issuer coding overrides change the resolved category for that issuer only', () => {
    const walmart = { ...merchants.walmart, issuerCodingOverrides: { 'American Express': 'groceries' } };
    const r = recommend(ask({ merchant: walmart, categoryId: 'discount', amount: 100 }));
    expect(byId(r, 'amex-gold').rateLabel).toBe('4x');
    expect(byId(r, 'csp').rateLabel).toBe('1x');
    expect(r.assumptions.issuerCodingNotes).toEqual(['American Express codes Walmart as Groceries']);
  });

  it('cap fully reached drops to the base rate and says so', () => {
    const cc = sampleWallet().find((c) => c.id === 'custom-cash')!;
    const maxed = { ...cc, capProgress: { 'cc-top': 500 } };
    const r = recommend(ask({ cards: [maxed], categoryId: 'dining', amount: 100 }));
    expect(r.winner?.scoreCents).toBe(100);
    expect(r.winner?.rateLabel).toBe('1%');
    expect(texts(r.winner!)).toContain('Cap reached: $500 per month');
  });

  it('large purchases surface purchase protection and break ties toward it', () => {
    const vx = sampleWallet().find((c) => c.id === 'venture-x')!;
    const plain: UserCard = { ...vx, id: 'vx-noprot', nickname: 'AAA Plain', product: { ...products['venture-x']!, benefits: [] } };
    const r = recommend(ask({ cards: [plain, vx], categoryId: 'everything', amount: 600 }));
    expect(r.tie).toBe(true);
    expect(r.winner?.card.id).toBe('venture-x');
    expect(r.winner?.reasons.some((x) => x.kind === 'protection')).toBe(true);
  });

  it('custom rules outrank product rules of equal specificity', () => {
    const csp = sampleWallet({ cspSubMet: true }).find((c) => c.id === 'csp')!;
    const custom: UserCard = { ...csp, customRules: [{ id: 'my-dining', match: { categoryId: 'dining' }, multiplier: 10, unit: 'points', label: 'my promo' }] };
    const r = recommend(ask({ cards: [custom], categoryId: 'dining', amount: 10 }));
    expect(r.winner?.rateLabel).toBe('10x');
  });

  it('mobile wallet bonus applies only for that method', () => {
    const vx = sampleWallet().find((c) => c.id === 'venture-x')!;
    const walletCard: UserCard = { ...vx, customRules: [{ id: 'mw', match: { method: 'mobile_wallet' }, multiplier: 3, unit: 'points', label: 'mobile wallet' }] };
    expect(recommend(ask({ cards: [walletCard], amount: 100, method: 'mobile_wallet' })).winner?.rateLabel).toBe('3x');
    expect(recommend(ask({ cards: [walletCard], amount: 100, method: 'in_store' })).winner?.rateLabel).toBe('2x');
  });
});

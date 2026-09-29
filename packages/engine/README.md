# @pickcard/engine

The recommendation engine as a pure TypeScript function. No UI, no IO, no dates from the clock: everything comes in through `AskInput`, so the same input always ranks the same way.

```ts
import { recommend } from '@pickcard/engine';
const r = recommend({ merchant, categoryId: 'dining', amount: 40, method: 'online', location: { kind: 'domestic' }, date: '2026-09-22', cards, currencies, categories });
r.winner?.card.nickname;          // "Amex Gold"
r.winner?.reasons;                // typed chips: earn, credit, sub, cap, activation, offer, protection
r.ranked[1]?.deltaCents;          // −1080
r.excluded[0]?.excludedReason;    // "Not accepted: Costco takes Visa only"
```

Scoring per card, in cents: `earn + offer + credit + subWeight − foreignFee`, with cap blending, activation flags, issuer coding overrides, parent-category matching, and the tie-break rules described in `docs/product/01-app-plan.md` §4.

`src/fixtures/sample.ts` holds the sample wallet from the design prompt. `test/recommend.test.ts` reproduces every worked example number.

```
pnpm --filter @pickcard/engine test
pnpm --filter @pickcard/engine typecheck
```

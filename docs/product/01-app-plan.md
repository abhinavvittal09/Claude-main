# Card-choice app — product plan

Working name: **PickCard** (placeholder, rename before the design pass).

One sentence: *Tell it where you are about to pay. It tells you which of your cards to use, and why.*

North-star metric: median time from cold launch to a recommendation **under 3 seconds and at most 2 taps**.
Secondary metric: share of recommendations where the user taps **"Paid with this"** (proves the answer was used).

---

## 1. Read this first: what actually decides whether this app is good

The screens are the easy part. Three data problems decide the product. Every competitor that fails, fails on one of these.

### 1.1 The card-rules database (the moat and the cost centre)
- Earn rates, category caps, rotating categories, monthly credits and sign-up bonuses change monthly. There is no free, licensed, public API for them.
- Plan: ship a **versioned JSON rules bundle** (semver, hosted on a static CDN) seeded with the ~60 most-held US cards. The app fetches it on launch and caches it; the app works fully offline against the cached copy.
- Monthly review cadence, plus in-app "Report a wrong rate" that files a correction for the maintainer. Community-voted corrections are a v1.0 feature, not MVP.
- Every rule carries `source`, `verifiedAt`, and `confidence` fields so the UI can show "verified 12 days ago".

### 1.2 Merchant → category resolution
- "Where are you buying?" has to resolve to a category **as the issuer codes it**, not as the user thinks of it. Walmart is not "groceries" for most issuers. Target is a discount store. Uber Eats usually codes as dining for Amex but not for every issuer.
- Plan: bundled merchant list (~500 US merchants) with `defaultCategory`, `issuerCodingOverrides`, `acceptedNetworks` (Costco US warehouses: Visa only), and aliases. Unknown merchant → user picks a category, and that mapping is remembered.
- Location lookup (Apple/Google Places) only supplies *candidates*; the bundled taxonomy makes the call.

### 1.3 Point valuations
- A Chase point is worth 1¢ as cash, 1.25–2¢ through transfers. The "best card" flips depending on this number.
- Plan: default valuations per rewards currency with a stated source and date. User can override per currency. Every recommendation shows the valuation it assumed, in one tap.
- Offer a **Simple mode** (everything expressed as "% back" using defaults) and an **Advanced mode** (edit cents-per-point).

---

## 2. Assumptions to confirm before design starts

| # | Assumption | Confidence | What changes if wrong |
|---|---|---|---|
| A1 | US market first; India/UK as later "region packs" | Guessing | Card DB, taxonomy, network acceptance, currency formatting |
| A2 | iOS first, Android from the same codebase | Likely | Widgets, Live Activities, Siri are iOS-only work |
| A3 | Manual card entry in MVP; no bank linking | Likely | Bank linking (Plaid) adds cost, compliance, and months |
| A4 | Free in MVP; monetise later via Pro tier and card referrals | Guessing | Paywall screen moves into MVP |
| A5 | English only in MVP | Likely | String length assumptions in the design |
| A6 | Spend is logged manually (one tap after a purchase) | Likely | Cap and SUB tracking accuracy depends on this |

---

## 3. Who it is for

- **The optimiser** (primary): 3–8 cards, knows what a SUB is, wants the right answer fast and wants to see the reasoning. Will correct the app when it is wrong.
- **The two-card pragmatist** (secondary): 2–3 cards, does not want to think. Wants a widget that just says "use the blue one".
- Both share one job: *at the moment of paying, know which card, without thinking.*

Jobs ranked:
1. At the register or checkout, tell me the card. (Core)
2. Remind me of the money I already paid for: monthly credits, activation, SUB deadlines. (Retention)
3. Show me what I left on the table so I trust the app. (Trust)
4. Help me decide what card to get next. (Monetisation, later)

---

## 4. Recommendation engine

This is a pure, testable function. It lives in its own package with no UI dependency.

### 4.1 Inputs
```
merchant?        resolved merchant (or null)
category         resolved category (always present)
amount?          optional, default 100 units of local currency for display
method           in_store | online | mobile_wallet | unknown
locationContext  domestic | foreign(countryCode) | unknown
date             affects rotating quarter, credit periods, SUB deadlines
userCards[]      with product rules, SUB state, cap progress, credits used, offers, activation state
valuations{}     cents per point per rewards currency
prefs            simple/advanced, "prefer cash back", "ignore SUB weighting"
```

### 4.2 Score per card (in cents of value)
```
base      = amount × effectiveRate(card, category, merchant, method, date) × valuation(card.currency)
            where effectiveRate respects: merchant override > method bonus > category rule > base rate,
            and blends when a cap is partially consumed
            (e.g. $20 left at 5% then 1% on the remainder)
offer     = value of a card-linked offer that applies to this merchant (statement credit or points)
credit    = value of an unused periodic credit that this purchase would consume
            (e.g. $10 Uber Cash this month, only if merchant is Uber/Uber Eats)
subWeight = if SUB in progress and not expired:
              subValue / remainingSpend × amount, capped so one purchase never exceeds the SUB value
            (this is the case every competitor gets wrong: a new card at 1x usually beats an old card at 4x)
fees      = amount × foreignFeePct when locationContext is foreign
score     = base + offer + credit + subWeight − fees
```

### 4.3 Hard constraints (exclude, but always say why)
- Network not accepted at this merchant (Costco warehouse + Amex/Mastercard).
- Card marked frozen or excluded by the user.
- Card's foreign acceptance flagged "poor" in a country the user is in → not excluded, but warned.

### 4.4 Soft nudges (do not exclude)
- Rotating category not activated → show the rate it *would* earn and an **Activate** button.
- Cap fully consumed → card shown at its base rate with a "cap reached" chip.
- Purchase over a threshold (default $500) → tie-break toward the card with the best purchase protection / extended warranty, and mention it.
- 0% APR promo active on a card → surface as a secondary reason, never as the primary ranking.

### 4.5 Output
```
ranked[] = { card, scoreCents, displayRate ("4.2% back" or "4x pts"), reasons[], warnings[], delta vs #1 }
assumptions = { valuationsUsed, categoryResolvedAs, issuerCodingNote }
```
Reasons are typed so the UI can render them as chips: `earn`, `offer`, `credit`, `sub`, `protection`, `warning`, `constraint`.

### 4.6 Worked examples (these double as sample data for design)

**Example A — Costco warehouse, in-store, $180**
Cards: Amex Gold, Chase Sapphire Preferred (SUB in progress: $4,000 needed, $1,300 spent, 41 days left), Citi Custom Cash, Capital One Venture X.
- Amex Gold: **excluded** (Costco warehouses accept Visa only).
- Citi Custom Cash (Mastercard): **excluded** for the same reason.
- Venture X: 2x at 1.85¢ = 3.7% → $6.66.
- Sapphire Preferred: 1x at 2.0¢ = 2.0% → $3.60, plus SUB weighting ($1,200 value / $2,700 remaining × $180 = $80).
- **Winner: Sapphire Preferred.** Reason chips: `SUB: $2,700 to go, 41 days` · `1x · 2%` · `Warning: Costco is Visa-only in-store`.

**Example B — Uber Eats, online, $40**
- Amex Gold: 4x dining at 2.0¢ = 8% → $3.20, plus **unused $10 Uber Cash this month** → $13.20 total.
- Sapphire Preferred: 3x at 2.0¢ = 6% → $2.40.
- **Winner: Amex Gold.** Chips: `4x dining` · `Credit: $10 Uber Cash unused, apply in Uber app` · `Resets in 9 days`.

**Example C — Restaurant in Lisbon, €60, foreign**
- Chase Freedom Flex: 3% dining, but 3% foreign fee → net 0%.
- Amex Gold: 4x dining, no fee → 8%, but warning `Amex acceptance is patchy in Portugal; carry a Visa`.
- Venture X: 2x, no fee → 3.7%.
- **Winner: Amex Gold**, with Venture X shown as "backup if not accepted".

**Example D — PayPal checkout in Q4, $120**
- Freedom Flex: rotating 5% on PayPal this quarter, **not activated**. Shown first with `Activate to earn 5%` CTA; ranking uses the activated rate but the chip makes the condition explicit.

**Example E — Grocery store, $150, Custom Cash has $20 of its $500 monthly 5% cap left**
- Custom Cash: blended (20 × 5% + 130 × 1%) = $2.30 → 1.5%.
- Amex Gold: 4x at 2.0¢ = 8% → $12.00.
- **Winner: Amex Gold.** Custom Cash shown with chip `Cap: $20 of $500 left this month`.

### 4.7 Edge cases the engine must handle
- No cards added → onboarding prompt, not an empty ranking.
- Unknown merchant → ask for category, remember the mapping.
- Two cards tie → show both, tie-break by simplicity preference, say "either".
- All cards excluded (e.g. only Amex at Costco) → say so, suggest debit/cash.
- Amount unknown → rank by rate, show "per $100".
- Rules bundle stale (> 45 days) → banner, still answer.

---

## 5. Information architecture

Bottom tabs (4):
1. **Ask** — the home screen; the search-and-answer loop.
2. **Wallet** — cards, SUB/cap/credit status, card detail, add/edit card.
3. **Perks** — credits due, offers added, rotating categories and activation.
4. **Activity** — spend log, month summary, "left on the table".

Settings lives behind the avatar in the top-right of every tab (not a fifth tab).

---

## 6. Screens

Each screen lists purpose, content, primary action, and required states.
IDs are stable; the design prompt and the code will reference them.

### Onboarding
**S01 Welcome** — one line of value, one button. No carousel.
**S02 Region & currency** — country picker (US default), currency inferred, "you can change this later".
**S03 Add your cards** — search field over the card DB (issuer, card name); tap to add; running list of added cards with abstract card art; "Can't find it? Build a custom card" link. Primary: Continue (disabled until ≥1 card).
**S04 Quick setup per card** (sheet, repeated per card) — "Working on a sign-up bonus?" (amount, deadline), "Opened when?", for rotating cards "Activated this quarter?". Skippable.
**S05 How should we count points?** — Simple (cash-back view, defaults) / Advanced (edit cents-per-point). Simple pre-selected.
**S06 Permissions primer** — location ("suggest the store you're standing in") and notifications ("credit and activation reminders"). Soft ask with Not now.
States: loading card DB, search no results, offline.

### Ask (home)
**S07 Ask** — large search field ("Where are you paying?"); category chip grid (Dining, Groceries, Gas, Online, Travel, Drugstore, Warehouse, Streaming, Transit, Everything else); "Nearby" row when location is granted (top 3 merchant candidates with distance); "Recent" row; a compact "Best right now" strip when a location match is confident.
States: no location permission (hide Nearby, show a one-line enabler), no recents (first run), offline banner.
**S08 Search results** — typeahead over merchants and categories; each row shows merchant, resolved category, network warnings icon; footer row "Use '<query>' as a category…" fallback.
States: no results → "Pick a category instead".
**S09 Recommendation** — hero card (abstract art of the winning card), display rate pill, reason chips, optional amount stepper ("per $100" default), runner-up rows with delta, caveat banner if any, assumptions disclosure ("assumes 2.0¢/pt UR · Costco coded as Warehouse"), actions: **Paid with this** (primary), **Not accepted here** (swaps to next accepted card and remembers), **Wrong category?** (override sheet).
States: single card, tie, all excluded, activation needed, cap reached, foreign, stale rules.
**S10 Amount sheet** — numeric keypad, quick amounts ($20/$50/$100/$500), live recalculation of the ranking.
**S11 Category override sheet** — category list with search; "Remember for this merchant" toggle.
**S12 Paid confirmation** — toast with amount and value earned; updates cap, SUB, credit state.

### Wallet
**S13 Wallet** — card list (abstract art, nickname, network glyph) with status glyphs: SUB ring, cap bar, credits pending count, activation warning. Reorder. Add card button.
States: empty, one card, many cards (scroll), frozen card dimmed.
**S14 Card detail** — header art, headline rate summary; sections: Earn rules (table), Sign-up bonus tracker (ring, deadline, "log spend"), Caps (bars per rule), Credits checklist (monthly/annual, "mark used"), Offers (list, add), Benefits (protections, lounge, insurance — plain list), Settings (nickname, colour, freeze, remove). "Report a wrong rate" link with rules `verifiedAt`.
**S15 Add card** — search DB (same as S03) or **Custom card builder**: name, issuer, network, annual fee, foreign fee, rewards currency, earn-rule editor (category, multiplier, cap, period, activation required).
States: validation errors, duplicate card.

### Perks
**S16 Perks** — sections: **Credits due** (this month/period, with days remaining and "mark used"), **Offers** (card-linked offers the user added, expiry), **Rotating categories** (current quarter per card, activation status, Activate button that deep-links to the issuer app/site), **Expiring soon**.
States: nothing due, all used (celebration is one line, not confetti).
**S17 Add offer sheet** — card, merchant or free text, value type (statement / points), min spend, expiry.
**S18 Rotating categories detail** — quarter timeline, categories, cap progress, activation toggle.

### Activity
**S19 Activity** — month summary (value earned, value missed), spend log list (merchant, card, amount, value), **Log a purchase** button.
**S20 Log purchase** — merchant/category, card, amount, date (defaults now).
**S21 Insights** — earned by card, earned by category, "left on the table" list with what should have been used. (Design MVP, ship v0.2.)

### Settings
**S22 Settings** — Point valuations, Region & currency, Location, Notifications, Rules database (version, last updated, check now), Data (export JSON, delete everything), About, Report a problem.
**S23 Valuations editor** — per rewards currency, cents-per-point, source and date, "reset to default".

### System surfaces (design now, ship v0.2)
**S24 Notifications** — geofence ("Near Costco: use Sapphire Preferred"), credit reminder ("$10 Uber Cash expires in 3 days"), activation ("Q4 categories open, activate Freedom Flex"), SUB deadline ("$900 to go, 12 days"), rules updated.
**S25 Widgets** — small (best card for nearest merchant), medium (3 category → card pairs), lock screen circular (card initial + rate), Live Activity (while at a known merchant).
**S26 Share extension** — invoked from Safari/Amazon: mini recommendation sheet for the current domain.
**S27 Siri / App Intent** — "Which card for Costco?" → spoken answer plus a compact card.
**S28 States board** — empty, loading (skeletons), error, offline, permission denied, stale rules.

---

## 7. Key flows (to prototype)

1. **First run**: S01 → S02 → S03 → S04 (×n) → S05 → S06 → S07.
2. **Core ask (typed)**: S07 → S08 → S09 → S12. Target: 2 taps after typing.
3. **Core ask (chip)**: S07 → S09. Target: 1 tap.
4. **Core ask (nearby)**: S07 "Best right now" → S09 already resolved. Target: 0 taps.
5. **Not accepted**: S09 → tap "Not accepted here" → S09 re-ranked, merchant acceptance remembered.
6. **Activate rotating**: S16 → Activate → external → return → status updated.
7. **Custom card**: S15 builder → rule editor → saved → appears in S13 and in rankings.
8. **Log a purchase**: S19 → S20 → cap/SUB/credit state updates → S13 reflects it.

---

## 8. Data model (entities, not schema)

```
CardProduct     id, issuer, name, network, annualFee, rewardsCurrencyId, foreignFeePct,
                earnRules[], rotatingSchedule?, credits[], benefits[], defaultSub?, region,
                source, verifiedAt, confidence
EarnRule        id, match { categoryId | merchantId | method }, multiplier, unit (points|percent),
                cap? { amount, period }, requiresActivation, validFrom?, validTo?, note
RewardsCurrency id, name, defaultCentsPerPoint, source, asOf
Credit          id, name, amount, period (monthly|quarterly|semiannual|annual), merchantIds[], note
Benefit         id, kind (purchaseProtection|extendedWarranty|lounge|insurance|other), summary
UserCard        id, productId, nickname, colourToken, openedAt, status (active|frozen),
                sub? { targetSpend, valueCents, deadline, progressSpend },
                activations { quarterId: bool }, capProgress { ruleId: amountThisPeriod },
                creditsUsed { creditId: periodKey }, offers[], customRules[]
Merchant        id, name, aliases[], defaultCategoryId, issuerCodingOverrides { issuer: categoryId },
                acceptedNetworks[] | null, regions[], placeIds[]
Category        id, name, parentId?, icon, mccCodes[]
Offer           id, userCardId, merchantId | text, type (statement|points), value, minSpend?, expiresAt
SpendLog        id, userCardId, merchantId?, categoryId, amount, date, valueEarnedCents, bestValueCents
Valuation       rewardsCurrencyId, centsPerPoint (user override)
RulesBundle     version, publishedAt, cardProducts[], merchants[], categories[], currencies[]
```

---

## 9. Tech stack (recommendation)

- **Expo (React Native) + TypeScript**, `expo-router` for navigation. One codebase for iOS and Android.
- **Local-first**: `expo-sqlite` with Drizzle ORM. No account required in MVP.
- **Engine as a separate package** (`packages/engine`): pure TypeScript, no React, exhaustive unit tests. This is the part that can be fully built and verified in a cloud environment without a device.
- **Rules bundle**: static JSON on a CDN, fetched with ETag; bundled snapshot inside the app for first launch and offline.
- **Widgets / Live Activity / Siri**: native Swift targets (WidgetKit, App Intents) via an Expo config plugin. Requires Xcode or EAS Build; **cannot be compiled or simulated in this cloud session**, only written.
- **Backend**: none in MVP. v1.0: Supabase for optional sync and community corrections.
- **Analytics**: privacy-respecting, opt-in, event names fixed up front (`ask_started`, `recommendation_shown`, `paid_with_this`, `not_accepted`, `category_overridden`).

Constraint to state plainly: this environment has no iOS simulator. The engine, data layer, and screens can be written and unit-tested here; running the app on a phone happens on your machine with Expo Go or an EAS build.

---

## 10. Roadmap

**v0.1 — MVP (target 4–6 weeks of build)**
Onboarding, Wallet with ~60 US cards, Ask → Recommendation with typed reasons, category chips, bundled merchant search, manual SUB/cap/credit tracking, Paid-with-this logging, dark mode, offline, rules bundle updates.

**v0.2**
Location and Nearby, notifications (credits, activation, SUB deadline, geofence), widgets and lock screen, Siri intent, share extension, card-linked offers, Insights.

**v1.0**
Optional bank linking for automatic spend logging, community rule corrections, "cards to consider" with referral links, Pro tier, Android polish, second region pack.

---

## 11. Risks

| Risk | Severity | Mitigation |
|---|---|---|
| Rules go stale and users lose trust | High | `verifiedAt` shown in UI, monthly review, one-tap reporting |
| Trademark exposure from reproducing card art or issuer logos | Medium | Abstract card art system; text-only card names |
| Location permission refusal | Medium | App is fully useful without it; Nearby is additive |
| Valuation disputes ("my points are worth more") | Medium | Editable valuations, shown on every result |
| Scope creep into a banking app | High | No money movement, no bank login in MVP |
| Android parity for widgets and Siri equivalents | Low for MVP | Ship iOS system surfaces first; Android Glance widgets in v1.0 |

---

## 12. Open questions for you

1. Confirm US-first, or name the market. This changes the seed data, not the design.
2. Do you want the paywall designed now (low fidelity) or left out until v1.0?
3. Is manual spend logging acceptable for MVP, or is automatic tracking (bank linking) a must-have from day one?

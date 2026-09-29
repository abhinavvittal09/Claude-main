# Prompt for Claude Design — design kit for the card-choice app

Copy everything below the line into Claude Design. It is self-contained; you do not need to attach the product plan.

---

## Role

You are producing a complete, developer-ready mobile design kit for a new iOS-first app (Android from the same codebase). Deliver a design system (tokens and components), every screen listed below in light and dark mode, the required states, and a clickable prototype of the core flow. The engineering team will map your token and component names directly to code, so naming discipline matters as much as visual quality.

## Product in one paragraph

Working name **PickCard** (placeholder; treat it as a wordmark slot, not a brand to reproduce). The user tells the app where they are about to pay, by typing a merchant, tapping a category chip, or letting the app detect a nearby store. The app ranks the user's own credit cards and shows the single best card to use, with a plain-language "why" (earn rate, an unused monthly credit, a card-linked offer, a sign-up bonus in progress) and any caveats (card not accepted here, category not activated, spending cap reached, foreign transaction fee). The success metric is time to answer: **under three seconds and at most two taps from cold launch**. Everything in the design serves that.

The app never moves money and never asks for bank logins. It stores the user's cards, tracks sign-up bonus progress, spending caps, and monthly credits, and logs purchases with one tap.

## Users

- **The optimiser**: holds 3–8 cards, knows what a sign-up bonus and a category cap are, wants a fast answer and wants to see the reasoning. Will correct the app when it is wrong.
- **The pragmatist**: holds 2–3 cards, wants a widget that says "use the blue one".

Design for the optimiser's information needs at the pragmatist's speed.

## Platform and frame specs

- Primary frames: iPhone 16 Pro, 402×874 pt. Also check one small frame (iPhone SE, 375×667) for the Ask and Recommendation screens.
- Respect iOS safe areas, Dynamic Island, and home indicator. Bottom tab bar, native-feeling sheets (half and full), large-title navigation where appropriate.
- Android parity: use the same layouts; note where Material conventions differ (back navigation, sheet handles). Do not produce a separate Android set.
- Support Dynamic Type up to the "Accessibility Large" step on the Ask and Recommendation screens: show one example at that size.
- Light and dark mode are both first-class. Dark is the default mock.

## Visual direction

Aim for **decisive, editorial fintech**: calm surfaces, one high-chroma accent used only for the winning card and the headline return figure, big confident numerals, and abstract card art. It should feel like a fast tool a card enthusiast trusts, not a bank's brochure and not the generic purple-gradient fintech template.

- Surfaces: near-black (dark) and warm off-white (light), with one elevated surface level for cards and sheets.
- Accent: one saturated hue (propose electric green or tangerine; show both on a single screen and recommend one). The accent appears on the winning-card pill, primary buttons, and progress rings, and almost nowhere else.
- Type: a tight grotesk for display numerals and titles (Inter Tight or Geist), the system font (SF Pro / Roboto) for body, and a monospaced face for money and percentages so columns of numbers align.
- Card art: **abstract**. Flat gradient or duotone fields with subtle grain, a small network glyph (Visa, Mastercard, Amex, Discover) rendered as a neutral monogram, and the card's nickname in text. Never reproduce issuer logos, real card artwork, or trademarks. The user picks a colour for each card from a palette of 8; the design must look good with any combination of those 8 side by side.
- Iconography: a single stroke-weight icon set, 24 pt grid, filled variants for selected tab and chip states. Deliver as SVG.
- Motion: the moment the winning card appears should feel decisive (a short settle, not a flourish). Nothing bounces. Durations 120/200/320 ms, one spring for sheets.

Also produce one alternative mood board (a single screen only) in a warmer, softer direction so the team can compare, then build the full kit on the primary direction.

## Design tokens to define (use exactly these names)

Colour (semantic, both modes):
`color/bg/canvas`, `color/bg/surface`, `color/bg/elevated`, `color/bg/inverse`
`color/text/primary`, `color/text/secondary`, `color/text/tertiary`, `color/text/onAccent`, `color/text/inverse`
`color/accent/primary`, `color/accent/subtle`, `color/accent/pressed`
`color/status/success`, `color/status/warning`, `color/status/danger`, `color/status/info` (each with a `/subtle` background variant)
`color/border/subtle`, `color/border/strong`, `color/border/focus`
`color/cardArt/1` … `color/cardArt/8` (the user-selectable card colours, each as a gradient pair)
`color/network/visa`, `color/network/mastercard`, `color/network/amex`, `color/network/discover` (muted hints only)

Type scale:
`type/display/xl` (winning return figure), `type/display/l`, `type/title/l`, `type/title/m`, `type/title/s`, `type/body/l`, `type/body/m`, `type/body/s`, `type/label/m`, `type/label/s`, `type/mono/l`, `type/mono/m`
Define size, line height, weight, letter-spacing, and the Dynamic Type behaviour for each.

Spacing: `space/1` = 4 pt through `space/12` = 48 pt on a 4-pt grid. Screen gutter is 16 pt.
Radius: `radius/xs` 6, `radius/s` 10, `radius/m` 14, `radius/l` 20, `radius/xl` 28, `radius/card` 16, `radius/pill` 999.
Elevation: `elevation/0` … `elevation/3` with values for both modes.
Motion: `motion/fast` 120 ms, `motion/base` 200 ms, `motion/slow` 320 ms, `motion/spring/sheet`.

Export all tokens as a JSON file (Figma Variables export or equivalent) in addition to the Figma variables themselves.

## Component library (with every state listed)

Build these as components with variants. States in brackets.

1. **CardVisual** — sizes: hero 370×232, row 56×36, chip 28×18. Variants: colour 1–8, network glyph, nickname on/off. [default, dimmed/frozen, selected, skeleton]
2. **RecommendationHero** — CardVisual hero plus ReturnPill plus a row of ReasonChips. [winner, tie (two heroes), excluded-all]
3. **ReturnPill** — the headline figure, e.g. "8.0% back", "4x pts", "$13.20 on $40". [accent, neutral, warning]
4. **ReasonChip** — icon plus short text. Variants: `earn`, `offer`, `credit`, `sub`, `protection`, `warning`, `constraint`. [default, tappable with disclosure]
5. **RunnerUpRow** — CardVisual row, nickname, rate, delta versus the winner ("−$9.60"), optional warning glyph. [default, excluded with reason, activation needed with inline button]
6. **CategoryChip** — icon plus label. [default, selected, disabled]
7. **MerchantRow** — initial-letter avatar (no logos), name, resolved category, distance when known, network-warning glyph. [default, recent, nearby]
8. **SearchField** — the Ask screen's hero input. [empty with placeholder, typing, results, no results, voice active]
9. **ProgressRing** — for sign-up bonus. [0–100%, complete, overdue]
10. **ProgressBar** — for caps and credits. [partial, full/cap reached, reset countdown]
11. **CreditRow** — name, amount, period, days until reset, "Mark used" checkbox. [unused, used, expiring in ≤ 3 days]
12. **OfferRow** — merchant or text, value, expiry. [active, expiring, expired]
13. **RotatingCategoryCard** — quarter label, category list, cap progress, Activate button. [not activated, activated, quarter ending]
14. **AmountKeypad** — numeric keypad with quick-amount chips ($20, $50, $100, $500). [default, typing]
15. **Button** — primary, secondary, tertiary, destructive; sizes L/M/S. [default, pressed, disabled, loading]
16. **IconButton**, **SegmentedControl**, **Toggle**, **Stepper**, **TextField** [default, focused, error, disabled], **ListRow** (with leading icon, trailing value, chevron, and toggle variants), **SectionHeader**, **Badge**, **Banner** (info, warning, offline, stale-rules), **Toast**, **Sheet** (half, full, with drag handle), **EmptyState** (illustration slot, title, body, action), **Skeleton** rows, **BottomTabBar** (4 tabs, selected uses filled icon), **NavBar** (large title and compact), **PermissionPrimer** card, **OnboardingStepHeader** (step count, title, subtitle), **AssumptionsDisclosure** (a collapsed row that expands to show the valuation and category assumptions), **WidgetFrames** (small, medium, lock-screen circular, Live Activity compact and expanded).

Every component needs light and dark, pressed and focused states, and a Dynamic Type example where text is involved.

## Screens to design

Use the IDs. Bottom tabs are **Ask**, **Wallet**, **Perks**, **Activity**. Settings is behind the avatar in the top-right of each tab.

### Onboarding
- **S01 Welcome** — one line of value, one primary button, no carousel.
- **S02 Region & currency** — country picker with US default; note that it can be changed later.
- **S03 Add your cards** — search over a card database (issuer, card name); tapping adds a card; a running list of added cards with CardVisual rows; a "Can't find it? Build a custom card" link; Continue is disabled until at least one card is added. States: loading, no results, offline.
- **S04 Quick setup** (sheet, repeated per card) — "Working on a sign-up bonus?" with amount and deadline; "Opened when?"; for rotating cards "Activated this quarter?". Skippable.
- **S05 How should we count points?** — Simple (cash-back view, pre-selected) versus Advanced (edit cents per point).
- **S06 Permissions primer** — location ("suggest the store you're standing in") and notifications ("credit and activation reminders"). Soft ask with a Not-now option.

### Ask tab
- **S07 Ask (home)** — SearchField as the hero; a grid of CategoryChips (Dining, Groceries, Gas, Online, Travel, Drugstore, Warehouse, Streaming, Transit, Everything else); a "Nearby" row of three MerchantRows with distance when location is granted; a "Recent" row; a compact "Best right now" strip when the app is confident about the current location. States: no location permission (Nearby hidden, one-line enabler), first run with no recents, offline banner.
- **S08 Search results** — typeahead over merchants and categories; MerchantRows with resolved category and a network-warning glyph where relevant; a footer row "Use '<query>' as a category…". State: no results.
- **S09 Recommendation** — RecommendationHero, ReturnPill, ReasonChips, an optional amount control ("per $100" by default), RunnerUpRows with deltas, a caveat Banner when needed, AssumptionsDisclosure ("assumes 2.0¢ per point · Costco coded as Warehouse"), actions: **Paid with this** (primary), **Not accepted here** (secondary), **Wrong category?** (tertiary). Design these variants explicitly: single card, tie, all cards excluded, activation needed, cap partially reached, foreign purchase with acceptance warning, stale rules banner.
- **S10 Amount sheet** — AmountKeypad; the ranking above re-sorts live as the amount changes.
- **S11 Category override sheet** — searchable category list with a "Remember for this merchant" toggle.
- **S12 Paid confirmation** — Toast with amount and value earned, and the updated cap or bonus progress in one line.

### Wallet tab
- **S13 Wallet** — CardVisual rows with nickname and network glyph, and status glyphs per card: sign-up bonus ring, cap bar, pending-credits count, activation warning. Reorder affordance. Add-card button. States: empty, one card, many cards, frozen card dimmed.
- **S14 Card detail** — hero art and headline rate summary; sections: Earn rules (table with category, rate, cap), Sign-up bonus tracker (ProgressRing, deadline, log-spend action), Caps (ProgressBars), Credits checklist (CreditRows), Offers (OfferRows plus add), Benefits (plain list), Settings (nickname, colour picker of the 8 card colours, freeze, remove). A "Report a wrong rate" link showing "verified 12 days ago".
- **S15 Add card** — the same search as S03, plus a **Custom card builder**: name, issuer, network, annual fee, foreign fee, rewards currency, and an earn-rule editor (category, multiplier, cap amount and period, activation required). States: validation error, duplicate card.

### Perks tab
- **S16 Perks** — sections: Credits due (CreditRows with days remaining), Offers (OfferRows), Rotating categories (RotatingCategoryCards with Activate buttons), Expiring soon. States: nothing due; everything used (one calm line, no confetti).
- **S17 Add offer sheet** — card, merchant or free text, value type (statement or points), minimum spend, expiry.
- **S18 Rotating categories detail** — quarter timeline, categories, cap progress, activation toggle.

### Activity tab
- **S19 Activity** — month summary (value earned, value missed), spend log list (merchant, card, amount, value), a Log-purchase button.
- **S20 Log purchase** — merchant or category, card, amount, date defaulting to now.
- **S21 Insights** — earned by card, earned by category, a "left on the table" list naming the card that should have been used. Keep charts simple: horizontal bars, no pie charts.

### Settings
- **S22 Settings** — Point valuations, Region & currency, Location, Notifications, Rules database (version, last updated, check now), Data (export, delete everything), About, Report a problem.
- **S23 Valuations editor** — per rewards currency: cents per point, source and date, reset to default.

### System surfaces
- **S24 Notifications** — five examples as iOS notification banners: geofence ("Near Costco: use Sapphire Preferred"), credit reminder ("$10 Uber Cash expires in 3 days"), activation ("Q4 categories are open, activate Freedom Flex"), sign-up bonus deadline ("$900 to go, 12 days"), rules updated.
- **S25 Widgets** — small (best card for the nearest merchant), medium (three category-to-card pairs), lock-screen circular (card initial plus rate), Live Activity compact and expanded (while at a known merchant).
- **S26 Share extension** — invoked from Safari on amazon.com: a compact recommendation sheet for the current domain.
- **S27 Siri response card** — the compact card shown after "Which card for Costco?".
- **S28 States board** — empty, loading skeletons, error, offline, permission denied, stale rules, all on one page.

## Flows to prototype (clickable)

1. First run: S01 → S02 → S03 → S04 → S05 → S06 → S07.
2. Ask by typing: S07 → S08 → S09 → S12.
3. Ask by chip: S07 → S09 (one tap).
4. Ask by nearby: S07 "Best right now" → S09 (zero taps).
5. Not accepted: S09 → tap "Not accepted here" → S09 re-ranked.
6. Custom card: S15 builder → rule editor → saved → visible in S13.
7. Log a purchase: S19 → S20 → S13 showing updated progress.

## Sample data (use this content verbatim in the mocks)

Rates below are illustrative sample data for the mocks; do not treat them as verified facts.

Cards (nickname · network · sample rules):
- **Amex Gold** · Amex · 4x dining, 4x US supermarkets (cap $25,000 per year), 3x flights, 1x everything else · credits: $10 Uber Cash monthly, $10 dining credit monthly · no foreign fee · card colour 3.
- **Sapphire Preferred** · Visa · 3x dining, 3x online groceries, 2x travel, 1x everything else · sign-up bonus in progress: $4,000 needed, $1,300 spent, 41 days left, worth about $1,200 · no foreign fee · card colour 1.
- **Custom Cash** · Mastercard · 5% on top category up to $500 per month (this month: $480 used), 1% everything else · 3% foreign fee · card colour 5.
- **Freedom Flex** · Mastercard · 5% rotating this quarter on PayPal and Target (not activated, cap $1,500 per quarter), 3% dining, 3% drugstores, 1% everything else · 3% foreign fee · card colour 7.
- **Venture X** · Visa · 2x everything · $300 travel credit annually (unused) · no foreign fee · card colour 2.

Merchants for search, recents, and nearby: Costco (Warehouse, Visa-only in store, 0.4 mi), Trader Joe's (Groceries, 0.6 mi), Shell (Gas, 0.2 mi), Uber Eats (Dining), Amazon (Online), Whole Foods (Groceries), Walmart (Discount store, not groceries), Target (Discount store), CVS (Drugstore), Delta (Airline), PayPal (Online).

Three recommendation results to mock exactly:

**Result A — Costco, in store, $180**
Winner: Sapphire Preferred. ReturnPill: "$83.60 on $180". Chips: `SUB · $2,700 to go, 41 days` · `1x · 2.0%` · `Costco is Visa-only in store`. Runner-up: Venture X, "3.7% · $6.66", delta "−$76.94". Excluded with reason: Amex Gold, Custom Cash, Freedom Flex ("not accepted: Visa only"). Assumptions row: "assumes 2.0¢ per point · Costco coded as Warehouse".

**Result B — Uber Eats, online, $40**
Winner: Amex Gold. ReturnPill: "$13.20 on $40". Chips: `4x dining · 8.0%` · `Credit: $10 Uber Cash unused` · `Resets in 9 days`. Runner-ups: Sapphire Preferred "6.0% · $2.40" delta "−$10.80"; Freedom Flex "3.0% · $1.20"; Venture X "3.7% · $1.48"; Custom Cash "3.0% · $1.20" with chip `Cap: $20 of $500 left this month` (blended: $20 at 5%, then 1%).

**Result C — PayPal, online, $120, fourth quarter**
Winner: Freedom Flex with chip `Activate to earn 5%` and an inline Activate button. ReturnPill: "5.0% · $6.00". Banner: "Not activated yet. Tap Activate; it takes a minute on Chase's site." Runner-up: Venture X "3.7% · $4.44".

## States and edge cases you must show

No cards added · unknown merchant (ask for category) · two cards tie ("either works") · every card excluded (suggest debit) · amount unknown ("per $100") · rules bundle older than 45 days (banner, still answers) · location denied · notifications denied · offline.

## Accessibility

- WCAG AA contrast in both modes, including the accent on its subtle background and text on every card colour.
- Every ReasonChip and status glyph has a text equivalent; colour is never the only signal (cap reached, excluded, activation needed each get an icon and a word).
- Minimum touch target 44×44 pt. The "Paid with this" button sits in the thumb zone.
- VoiceOver reading order documented for S07 and S09.
- Reduced-motion variant for the winning-card reveal.

## Deliverables and file organisation

1. Figma file with pages: `00 Cover & Direction`, `01 Tokens`, `02 Components`, `03 Screens — Onboarding`, `04 Screens — Ask`, `05 Screens — Wallet`, `06 Screens — Perks & Activity`, `07 Screens — Settings & System`, `08 States`, `09 Prototype`, `10 Handoff notes`.
2. Tokens exported as JSON using the exact names above.
3. Icon set as SVG, 24-pt grid, with a naming list.
4. The 8 card-art gradients as reusable styles.
5. A handoff document: component inventory with variant and prop names, spacing rules, and a short rationale for the accent choice.
6. One mood-board frame for the alternative (warmer) direction.

## Do not

- Do not use issuer logos, real card artwork, or bank brand colours as brand identity.
- Do not show card numbers, even masked ones. Cards are identified by nickname and colour.
- Do not use confetti, coins, or celebration illustrations. The reward is the number.
- Do not add a fifth tab, a hamburger menu, or an onboarding carousel.
- Do not put the answer below the fold on S09: the winning card and its return figure must be visible without scrolling on the iPhone SE frame.
- Do not use pie charts anywhere.

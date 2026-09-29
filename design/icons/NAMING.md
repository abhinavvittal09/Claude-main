# PickCard icon set
24x24 grid, 1.75pt stroke, round caps/joins, currentColor. `-filled` variants (tint fill + stroke) are for selected tab and chip states.

- `icon-ask`
- `icon-ask-filled`
- `icon-wallet`
- `icon-wallet-filled`
- `icon-perks`
- `icon-perks-filled`
- `icon-activity`
- `icon-activity-filled`
- `icon-dining`
- `icon-dining-filled`
- `icon-groceries`
- `icon-groceries-filled`
- `icon-gas`
- `icon-gas-filled`
- `icon-online`
- `icon-online-filled`
- `icon-travel`
- `icon-travel-filled`
- `icon-drugstore`
- `icon-drugstore-filled`
- `icon-warehouse`
- `icon-warehouse-filled`
- `icon-streaming`
- `icon-streaming-filled`
- `icon-transit`
- `icon-transit-filled`
- `icon-everything`
- `icon-earn`
- `icon-offer`
- `icon-credit`
- `icon-sub`
- `icon-protection`
- `icon-warning`
- `icon-constraint`
- `icon-search`
- `icon-mic`
- `icon-location`
- `icon-chevron-right`
- `icon-chevron-left`
- `icon-close`
- `icon-check`
- `icon-plus`
- `icon-avatar`
- `icon-frozen`
- `icon-reorder`
- `icon-info`
- `icon-offline`
- `icon-refresh`
- `icon-bell`
- `icon-calendar`
- `icon-excluded`
- `icon-activate`
- `icon-sparkline`

## Added in drop 2 (Sep 28)

Controls and actions
- `icon-chevron-down` — AssumptionsDisclosure collapsed, pickers, sheet affordance
- `icon-chevron-up` — AssumptionsDisclosure expanded
- `icon-minus` — Stepper decrement (pairs with `icon-plus`)
- `icon-more` — vertical ellipsis, row overflow menus (not a category; see `icon-everything`)
- `icon-edit` — nickname, custom-rule and offer editing (S14, S15, S17)
- `icon-trash` — remove card (S14), delete everything (S22)
- `icon-external` — opens a site outside the app: Activate (S16, S18), Report a wrong rate (S14)
- `icon-share` — data export (S22), share-extension entry (S26)
- `icon-flag` — Report a wrong rate, Report a problem

Status and context
- `icon-clock` — Recent row (S07), spend-log timestamps (S19)
- `icon-globe` — foreign purchase, acceptance warning chip (S09)
- `icon-tie` — "either works" tie state (S09)
- `icon-cash` — all cards excluded, use debit or cash (S09)
- `icon-cap` — cap reached chip (S09, S14); a bar with a stop line, never a triangle
- `icon-widget` — widgets entry (S22)

Network monograms (inside CardVisual; neutral letterforms, no brand marks or colours)
- `icon-network-visa` (V)
- `icon-network-mastercard` (M)
- `icon-network-amex` (A)
- `icon-network-discover` (D)

New filled variant
- `icon-everything-filled` — selected "Everything else" chip

## Redrawn in drop 2

- `icon-credit` — plain two-stroke "$" in the card (the old glyph read as a mirrored S)
- `icon-dining` + `icon-dining-filled` — fork head and knife blade are now closed shapes, so the filled variant shows tinted areas. Same paths in both files.
- `icon-sub` — target with a three-quarter ring; no longer reads as a clock
- `icon-sparkline` — three-segment line ending in a dot, no arrowhead (`icon-earn` unchanged)
- `icon-activity-filled` — three rounded-rectangle bars at the outline's x positions and heights. This is the one filled file whose paths differ from its outline, because line bars have no area to fill.

## Rules

- 24×24 viewBox, 1.75 stroke, round caps and joins, `stroke="currentColor"`, no hardcoded colours.
- Outline root: `fill="none"`. Filled root: `fill="currentColor" fill-opacity="0.22"`, same paths as the outline (exception: `icon-activity-filled`).

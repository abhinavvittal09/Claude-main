# Follow-up prompt for Claude Design — icons the screens still need

> **Status: delivered.** Drop 2 (Sep 28) shipped every icon and fix requested below; see `design/icons/NAMING.md` for the designer's changelog. Kept for the record.

The delivered icon set (`design/icons/`, 40 base icons, 14 with filled variants) covers the tabs, category chips, reason chips and most status glyphs. It is missing the utility icons below, which the screens in the design prompt use. Paste everything under the line into Claude Design in the same project as the first kit.

---

Extend the PickCard icon set. Match the existing set exactly: 24×24 grid, 1.75 pt stroke, round caps and joins, `currentColor`, no hardcoded colours, one path style. Filled variants use the same paths with `fill="currentColor" fill-opacity="0.22"` on the root, exactly as the existing `-filled` files do. Deliver as SVG with the `icon-` prefix and append the new names to `NAMING.md`.

Add these icons (name — where it is used):

- `icon-chevron-down` — AssumptionsDisclosure collapsed state, pickers, sheet affordance
- `icon-chevron-up` — AssumptionsDisclosure expanded state
- `icon-minus` — Stepper decrement (pairs with the existing `icon-plus`)
- `icon-more` — vertical ellipsis for row overflow menus (distinct from `icon-everything`, which is horizontal dots used as a category)
- `icon-clock` — the "Recent" row on S07 and the spend log timestamps on S19
- `icon-edit` — nickname, custom-rule and offer editing on S14, S15, S17
- `icon-trash` — remove card on S14, delete everything on S22
- `icon-external` — outbound link: the Activate button that opens the issuer's site (S16, S18), "Report a wrong rate" (S14)
- `icon-share` — data export on S22 and the share-extension entry point on S26
- `icon-flag` — "Report a wrong rate" and "Report a problem"
- `icon-globe` — foreign-purchase context on S09 and the acceptance warning chip
- `icon-tie` — "either works" tie state on S09 (an equals-style glyph)
- `icon-cash` — the "all cards excluded, use debit or cash" state on S09
- `icon-cap` — cap-reached chip on S09 and S14 (a gauge or a bar with a stop line; must read differently from `icon-warning`)
- `icon-widget` — the widgets entry on S22

Also add the four network monograms used inside CardVisual, as neutral letterforms on the same grid, no brand colours or logos: `icon-network-visa` (V), `icon-network-mastercard` (M), `icon-network-amex` (A), `icon-network-discover` (D). Each is a single glyph in a 24×24 rounded square outline.

Fix one delivered file: `icon-activity-filled.svg` is identical to its outline because the bars are open lines and nothing fills. Redraw the filled variant so the three bars have area (rounded rectangles at the same x positions and heights). An engineer-drawn stopgap is in the repo; replace it with yours.

Add one missing variant: `icon-everything-filled.svg` for the selected state of the "Everything else" chip.

Review these four from the contact sheet (`design/icons/contact-sheet.png`) and redraw where noted:

- `icon-credit` — the dollar glyph inside the card reads as a mirrored S at 24 pt. Simplify to a plain "$" with two strokes, or use a card with a small coin.
- `icon-dining-filled` — indistinguishable from the outline because the fork and knife are open strokes. Either give the filled variant a solid fork head and blade, or drop the filled variant for dining and let the chip's background carry the selected state (then do the same for every category chip, so the rule is consistent).
- `icon-sub` — reads as a clock. A sign-up bonus in progress is a target with a partial ring; a clock will collide with the new `icon-clock`.
- `icon-earn` and `icon-sparkline` — near-duplicates. Keep `earn` (rising line with arrowhead) for the reason chip; make `sparkline` a three-segment mini chart without an arrowhead, or drop it.

Deliver as a zip with the same layout as the first drop, plus an updated `NAMING.md`.

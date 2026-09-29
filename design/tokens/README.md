# Design tokens

`tokens.json` is the designer's export from the Claude Design kit (DTCG-style, dark and light modes). It is the source of truth. The typed module the app consumes is generated from it into `packages/tokens/src/tokens.ts`.

```
python3 design/tokens/tools/validate.py      # coverage, structure, WCAG contrast, spring math (-v prints every pair)
pnpm tokens:generate                          # regenerate packages/tokens/src/tokens.ts
NODE_PATH="$(npm root -g)" node design/tokens/tools/preview.cjs   # re-render preview.png
```

`preview.png` shows both modes: surface levels, text tiers, accent button and pill, status chips, borders, network hints, the eight card-art gradients, the type scale in the real fonts, and elevation.

## Verified

- All 75 token names from the design prompt are present, plus `space/gutter`. Spacing is a clean 4-pt scale.
- 72 of 76 contrast pairs pass WCAG AA. Every card-art ink passes on both ends of its gradient. `text/tertiary` clears 4.5:1 on every surface in both modes, as its description claims.
- The sheet spring (stiffness 420, damping 42) is critically damped as described.

## Usage rules the failures impose

- **Accent is not a text colour in light mode.** `accent/primary` (light) is 3.0:1 on canvas and on `accent/subtle`. Use it for fills (button background with `text/onAccent`), for `display/xl` and `display/l` figures (large text passes at 3:1), and for rings. Chips and labels in light mode use `text/primary` on `accent/subtle`.
- **`border/strong` is decorative.** At 1.6:1 it cannot be the only boundary of a control. Text fields and toggles need a background step (`bg/elevated` on `bg/surface`) or the focus ring; do not rely on the border alone.
- **Font weights map to hundreds in React Native.** 590 → 600 and 650 → 600 (half-steps round down so display 700 stays a step above title). The generated module keeps `designWeight` for reference.
- **Fonts to bundle:** `InterTight-SemiBold`, `InterTight-Bold`, `JetBrainsMono-Medium`. Both families are in `design/fonts` as OFL variable TTFs; the app registers the three instances with expo-font under those keys.
- **Elevation is `boxShadow`.** Values are CSS-style shadow strings including `inset`, which React Native 0.76+ supports on the new architecture. Older RN needs a fallback.

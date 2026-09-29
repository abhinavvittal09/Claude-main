# Card-choice app

A mobile app that answers one question at the moment of paying: *which of my cards should I use here?*

## Workspace

pnpm monorepo. `pnpm install`, then `pnpm typecheck` and `pnpm test`.

- `packages/engine` — the recommendation engine, pure TypeScript with the worked examples as tests.
- `packages/tokens` — typed design tokens generated from `design/tokens/tokens.json`.
- `apps/mobile` — the Expo app (not yet scaffolded; waits on the component kit).

## Documents

- [`docs/product/01-app-plan.md`](docs/product/01-app-plan.md) — product plan: the three data problems that decide the product, the recommendation engine with worked examples, information architecture, all screens (S01–S28), flows, data model, tech stack, roadmap, risks, open questions.
- [`docs/product/02-claude-design-prompt.md`](docs/product/02-claude-design-prompt.md) — the self-contained prompt to paste into Claude Design to produce the design kit (tokens, components, screens, states, prototype).

- [`design/tokens/`](design/tokens/) — the designer's token export, validator, contrast findings and usage rules, and a rendered preview.
- [`design/fonts/`](design/fonts/) — Inter Tight and JetBrains Mono (OFL) as variable TTFs.
- [`design/icons/`](design/icons/) — the icon set from the Claude Design kit (two drops, 73 files), with `manifest.json`, a dark/light contact sheet, and the tooling to regenerate both.
- [`docs/product/03-claude-design-followup-icons.md`](docs/product/03-claude-design-followup-icons.md) — follow-up prompt for the second icon drop (delivered).

## Status

Engine and tokens packages exist and pass their tests. Design kit: icons and tokens received; components and screens pending. No app shell yet.

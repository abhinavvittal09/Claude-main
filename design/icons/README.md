# Icons

Source: the Claude Design kit (`pickcard-icons.zip`). 24×24 grid, 1.75 stroke, round caps and joins, `currentColor`. Filled variants add a 22% tint fill and are for selected tab and chip states.

`manifest.json` lists every icon with its group (`tab`, `category`, `reason`, `status`, `ui`) and whether a filled variant exists. Two files differ from the delivered zip and say so in their manifest `notes`.

Eventual home in the app: `apps/mobile/assets/icons/`, imported through `react-native-svg-transformer` so `currentColor` maps to the `color` prop. Until the app is scaffolded they live here.

Missing icons the screens need are listed in `docs/product/03-claude-design-followup-icons.md`.

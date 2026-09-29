# Icons

Source: the Claude Design kit, two drops. 24×24 grid, 1.75 stroke, round caps and joins, `currentColor`. Filled variants add a 22% tint fill and are for selected tab and chip states. `NAMING.md` is the designer's changelog.

`manifest.json` lists every icon with its group (`tab`, `category`, `reason`, `status`, `network`, `ui`) and whether a filled variant exists. Regenerate it and the contact sheet after a new drop:

```
python3 design/icons/tools/manifest.py
NODE_PATH="$(npm root -g)" node design/icons/tools/contact-sheet.cjs
```

Eventual home in the app: `apps/mobile/assets/icons/`, imported through `react-native-svg-transformer` so `currentColor` maps to the `color` prop. Until the app is scaffolded they live here.

// Renders design/icons/contact-sheet.png (dark + light) with headless Chromium.
// Usage: NODE_PATH="$(npm root -g)" node design/icons/tools/contact-sheet.cjs
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');
(async () => {
  const dir = path.resolve(__dirname, '..');
  const m = JSON.parse(fs.readFileSync(path.join(dir, 'manifest.json'), 'utf8'));
  const svg = f => fs.readFileSync(path.join(dir, f), 'utf8');
  const cell = i => `<div class="cell"><div class="row">${svg(i.file)}${i.filled ? svg(i.filled) : '<span class="none">—</span>'}</div><div class="lbl">${i.name}</div></div>`;
  const panel = theme => `<section class="${theme}">${m.groups.map(g => `<h2>${g}</h2><div class="grid">${m.icons.filter(i => i.group === g).map(cell).join('')}</div>`).join('')}</section>`;
  const html = `<!doctype html><meta charset="utf-8"><style>
  body{margin:0;font:12px/1.3 -apple-system,Inter,system-ui,sans-serif;display:grid;grid-template-columns:1fr 1fr}
  section{padding:20px}.dark{background:#0E0F12;color:#E8E8EA}.light{background:#FAF8F4;color:#15161A}
  h2{font-size:11px;letter-spacing:.08em;text-transform:uppercase;opacity:.55;margin:14px 0 8px}
  .grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px 8px}
  .cell{display:flex;flex-direction:column;align-items:center;gap:4px}.row{display:flex;gap:10px;align-items:center}
  svg{width:32px;height:32px}.none{width:32px;text-align:center;opacity:.3}.lbl{opacity:.75;font-size:10.5px}
  </style><body>${panel('dark')}${panel('light')}</body>`;
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 900, height: 100 }, deviceScaleFactor: 2 });
  await p.setContent(html);
  const out = path.join(dir, 'contact-sheet.png');
  await p.screenshot({ path: out, fullPage: true });
  await b.close();
  console.log('wrote', out);
})();

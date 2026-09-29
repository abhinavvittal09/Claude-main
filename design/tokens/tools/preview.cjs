// Renders design/tokens/preview.png: both modes, bg levels, text, accent, status, borders, card art, type scale, elevation.
// Usage: NODE_PATH="$(npm root -g)" node design/tokens/tools/preview.cjs
const fs = require('node:fs'); const path = require('node:path'); const { chromium } = require('playwright');
(async () => {
  const dir = path.resolve(__dirname, '..'); const root = path.resolve(dir, '..', '..');
  const t = JSON.parse(fs.readFileSync(path.join(dir, 'tokens.json'), 'utf8'));
  const c = (k, m) => t[k].$value[m];
  const font = (f) => 'file://' + path.join(root, 'design', 'fonts', f);
  const type = Object.keys(t).filter(k => k.startsWith('type/'));
  const fam = (f) => f === 'System' ? "-apple-system, Inter, system-ui, sans-serif" : `'${f}'`;
  const panel = (m) => {
    const art = [1,2,3,4,5,6,7,8].map(i => { const g = t[`color/cardArt/${i}`].$value; const n = t[`color/cardArt/${i}`].$description.split('.')[0];
      return `<div class="card" style="background:linear-gradient(${g.angle}deg,${g.from},${g.to});color:${g.ink}"><span class="nick">${n}</span><span class="glyph">V</span></div>`; }).join('');
    const status = ['success','warning','danger','info'].map(s => `<span class="chip" style="color:${c(`color/status/${s}`,m)};background:${c(`color/status/${s}/subtle`,m)}">${s}</span>`).join('');
    const nets = ['visa','mastercard','amex','discover'].map(n => `<span class="net" style="border-color:${c(`color/network/${n}`,m)};color:${c(`color/network/${n}`,m)}">${n[0].toUpperCase()}</span>`).join('');
    const types = type.map(k => { const v = t[k].$value; return `<div class="ty" style="font-family:${fam(v.fontFamily)};font-size:${v.fontSize}px;line-height:${v.lineHeight}px;font-weight:${v.fontWeight};letter-spacing:${v.letterSpacing}px;font-variant-numeric:${v.fontFeatures.includes('tnum')?'tabular-nums':'normal'}">${k.replace('type/','')} · $83.60 on $180</div>`; }).join('');
    const elev = [1,2,3].map(i => `<div class="el" style="background:${c('color/bg/elevated',m)};box-shadow:${t[`elevation/${i}`].$value[m].join(', ')}">elevation/${i}</div>`).join('');
    return `<section style="background:${c('color/bg/canvas',m)};color:${c('color/text/primary',m)}">
      <h1>${m}</h1>
      <div class="row"><div class="bg" style="background:${c('color/bg/canvas',m)};border:1px solid ${c('color/border/subtle',m)}">canvas</div><div class="bg" style="background:${c('color/bg/surface',m)}">surface</div><div class="bg" style="background:${c('color/bg/elevated',m)}">elevated</div><div class="bg" style="background:${c('color/bg/inverse',m)};color:${c('color/text/inverse',m)}">inverse</div></div>
      <div class="row"><span>text/primary</span><span style="color:${c('color/text/secondary',m)}">text/secondary</span><span style="color:${c('color/text/tertiary',m)}">text/tertiary</span></div>
      <div class="row"><button class="btn" style="background:${c('color/accent/primary',m)};color:${c('color/text/onAccent',m)}">Paid with this</button><button class="btn" style="background:${c('color/accent/pressed',m)};color:${c('color/text/onAccent',m)}">pressed</button><span class="chip" style="background:${c('color/accent/subtle',m)};color:${c('color/text/primary',m)}">4x dining · 8.0%</span><span class="pill" style="color:${c('color/accent/primary',m)}">$13.20</span></div>
      <div class="row">${status}</div>
      <div class="row"><div class="bx" style="border:1px solid ${c('color/border/subtle',m)}">border/subtle</div><div class="bx" style="border:1px solid ${c('color/border/strong',m)}">border/strong</div><div class="bx" style="outline:2px solid ${c('color/border/focus',m)};outline-offset:2px">border/focus</div>${nets}</div>
      <div class="art">${art}</div>
      <div class="types">${types}</div>
      <div class="row">${elev}</div>
    </section>`; };
  const html = `<!doctype html><meta charset="utf-8"><style>
  @font-face{font-family:"Inter Tight";src:url("${font('InterTight-Variable.ttf')}");font-weight:100 900}
  @font-face{font-family:"JetBrains Mono";src:url("${font('JetBrainsMono-Variable.ttf')}");font-weight:100 800}
  body{margin:0;font:15px/20px -apple-system,Inter,system-ui,sans-serif;display:grid;grid-template-columns:1fr 1fr}
  section{padding:24px 16px}h1{font:600 12px/16px system-ui;letter-spacing:.08em;text-transform:uppercase;opacity:.6;margin:0 0 12px}
  .row{display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin:10px 0}
  .bg{flex:1;padding:14px 10px;border-radius:10px;font-size:12px}
  .btn{border:0;border-radius:14px;padding:12px 18px;font:600 15px system-ui}
  .chip{border-radius:999px;padding:4px 10px;font:590 12px/16px system-ui;letter-spacing:.2px}
  .pill{font:700 28px/32px 'Inter Tight';letter-spacing:-.6px}
  .bx{padding:8px 10px;border-radius:10px;font-size:12px}
  .net{display:inline-flex;width:24px;height:24px;border:1.75px solid;border-radius:6px;align-items:center;justify-content:center;font:600 12px system-ui}
  .art{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin:12px 0}
  .card{aspect-ratio:370/232;border-radius:16px;padding:10px;display:flex;flex-direction:column;justify-content:space-between;font:600 12px system-ui}
  .glyph{align-self:flex-end;width:20px;height:20px;border:1.5px solid currentColor;border-radius:5px;text-align:center;line-height:18px;font-size:11px;opacity:.85}
  .types{margin:14px 0}.ty{margin:4px 0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .el{flex:1;padding:16px 12px;border-radius:16px;font-size:12px;margin:12px 0}
  </style><body>${panel('dark')}${panel('light')}</body>`;
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1100, height: 100 }, deviceScaleFactor: 2 });
  const tmp = path.join(require('node:os').tmpdir(), 'pickcard-tokens-preview.html'); fs.writeFileSync(tmp, html);
  await p.goto('file://' + tmp, { waitUntil: 'load' }); await p.evaluate(() => document.fonts.ready);
  const loaded = await p.evaluate(() => [...document.fonts].filter(f => f.status === 'loaded').map(f => f.family)); console.log('fonts loaded:', loaded);
  await p.screenshot({ path: path.join(dir, 'preview.png'), fullPage: true }); await b.close(); console.log('wrote preview.png');
})();

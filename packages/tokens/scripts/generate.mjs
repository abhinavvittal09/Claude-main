// Generates src/tokens.ts from design/tokens/tokens.json. `--check` fails if the file is stale.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..', '..');
const src = path.join(root, 'design', 'tokens', 'tokens.json');
const out = path.join(here, '..', 'src', 'tokens.ts');
const t = JSON.parse(fs.readFileSync(src, 'utf8'));
const keys = Object.keys(t).filter((k) => !k.startsWith('$') && k !== 'modes' && k !== 'defaultMode');

// React Native accepts fontWeight in hundreds only. Half-steps round down so the designer's
// hierarchy survives: 700 display > 650 title/l → 600, and 590 label → 600 (SF semibold).
const rnWeight = (w) => {
  const r = w % 100 === 50 ? w - 50 : Math.round(w / 100) * 100;
  return String(Math.min(900, Math.max(100, r)));
};
// Font asset keys as registered with expo-font; 'System' means the platform font (fontFamily undefined).
const FAMILY = { 'Inter Tight': 'InterTight', 'JetBrains Mono': 'JetBrainsMono', System: null };
const INSTANCE = { 400: 'Regular', 500: 'Medium', 600: 'SemiBold', 700: 'Bold' };
const fontAsset = (family, w) => (FAMILY[family] ? `${FAMILY[family]}-${INSTANCE[rnWeight(w)]}` : undefined);

// A token that is both a leaf and a parent (status/danger and status/danger/subtle) becomes { base, subtle }.
const setPath = (obj, parts, value) => {
  let cur = obj;
  for (const p of parts.slice(0, -1)) {
    if (typeof cur[p] === 'string') cur[p] = { base: cur[p] };
    cur = cur[p] ??= {};
  }
  const last = parts.at(-1);
  if (cur[last] && typeof cur[last] === 'object') cur[last].base = value;
  else cur[last] = value;
};

const colors = { dark: {}, light: {} };
const cardArt = [];
const network = { dark: {}, light: {} };
const typography = {};
const space = {};
const radius = {};
const elevation = { dark: {}, light: {} };
const motion = {};
const fontAssets = new Set();

for (const k of keys) {
  const v = t[k];
  const parts = k.split('/');
  switch (v.$type) {
    case 'color':
      if (parts[1] === 'network') {
        network.dark[parts[2]] = v.$value.dark;
        network.light[parts[2]] = v.$value.light;
      } else {
        setPath(colors.dark, parts.slice(1), v.$value.dark);
        setPath(colors.light, parts.slice(1), v.$value.light);
      }
      break;
    case 'gradient':
      cardArt.push({ id: Number(parts[2]), name: v.$description.split('.')[0], ...v.$value });
      break;
    case 'typography': {
      const s = v.$value;
      const w = rnWeight(s.fontWeight);
      const asset = fontAsset(s.fontFamily, s.fontWeight);
      if (asset) fontAssets.add(asset);
      setPath(typography, parts.slice(1), {
        fontFamily: asset,
        fontSize: s.fontSize,
        lineHeight: s.lineHeight,
        fontWeight: w,
        letterSpacing: s.letterSpacing,
        tabularNums: s.fontFeatures.includes('tnum'),
        designWeight: s.fontWeight,
        dynamicType: v.$extensions?.dynamicType ?? null,
      });
      break;
    }
    case 'dimension':
      (parts[0] === 'space' ? space : radius)[parts[1]] = v.$value;
      break;
    case 'shadow':
      elevation.dark[parts[1]] = v.$value.dark.filter((s) => s !== 'none');
      elevation.light[parts[1]] = v.$value.light.filter((s) => s !== 'none');
      break;
    case 'duration':
      motion[parts[1]] = Number.parseInt(v.$value, 10);
      break;
    case 'spring':
      setPath(motion, parts.slice(1), v.$value);
      break;
    default:
      throw new Error(`Unhandled token type ${v.$type} for ${k}`);
  }
}
cardArt.sort((a, b) => a.id - b.id);

const easing = {
  standard: [0.2, 0, 0, 1],
  settle: [0.16, 1, 0.3, 1],
};

const lit = (x) => JSON.stringify(x, null, 2);
const body = `// GENERATED FILE. Do not edit. Source: design/tokens/tokens.json. Regenerate: pnpm tokens:generate
export type Mode = 'dark' | 'light';
export const defaultMode: Mode = ${lit(t.defaultMode)};

export const colors = ${lit(colors)} as const;
export type Colors = (typeof colors)['dark'];

/** Muted network hints for the CardVisual glyph. Never a brand fill. */
export const network = ${lit(network)} as const;

/** 8 user-selectable card colours: 135° gradient, 6% grain, and the ink colour that passes AA on both ends. */
export const cardArt = ${lit(cardArt)} as const;
export type CardArtId = (typeof cardArt)[number]['id'];

/**
 * Text styles as React Native style fragments. fontFamily is the expo-font asset key (undefined = system font).
 * fontWeight is rounded to hundreds; designWeight keeps the original value.
 */
export const typography = ${lit(typography)} as const;

export const space = ${lit(space)} as const;
export const radius = ${lit(radius)} as const;

/** boxShadow strings for React Native 0.76+ (new architecture). Join with ', ' or pass the array. */
export const elevation = ${lit(elevation)} as const;

export const motion = { ...${lit(motion)}, easing: ${lit(easing)} } as const;

/** Font files the app must load with expo-font, keyed by fontFamily above. Files live in design/fonts (variable TTFs). */
export const fontAssets = ${lit([...fontAssets].sort())} as const;
`;

if (process.argv.includes('--check')) {
  const current = fs.existsSync(out) ? fs.readFileSync(out, 'utf8') : '';
  if (current !== body) {
    console.error('packages/tokens/src/tokens.ts is stale. Run: pnpm tokens:generate');
    process.exit(1);
  }
  console.log('tokens.ts is up to date');
} else {
  fs.writeFileSync(out, body);
  console.log(`wrote ${path.relative(root, out)}: ${keys.length} tokens`);
}

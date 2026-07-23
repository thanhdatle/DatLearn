#!/usr/bin/env node
/**
 * chip-contrast.mjs — measure, never guess.
 *
 * HUB.md requires every topic chip to clear 4.5:1 contrast in BOTH themes
 * (chips render as kicker TEXT on --surface: #ffffff light, #1d1c16 dark)
 * and to sit at least MIN_HUE_GAP degrees from every other topic's hue.
 *
 * This script computes WCAG 2.x relative-luminance contrast and HSL hue for the
 * placed chips, reports the free arcs left on the wheel at a given hue rule,
 * and — when asked — SEARCHES the colour space for a passing chip pair inside a
 * band, rather than checking hexes a human guessed.
 *
 *   node scripts/chip-contrast.mjs                  # audit the placed wheel
 *   node scripts/chip-contrast.mjs --min-gap=30     # audit under a relaxed rule
 *   node scripts/chip-contrast.mjs --min-gap=30 --band=69,83 --exclude=ua
 *
 * Exit code is 1 if a --band search finds no passing pair.
 */

const SURFACE_LIGHT = '#ffffff';
const SURFACE_DARK = '#1d1c16';
const PAPER_LIGHT = '#fbfaf6';
const PAPER_DARK = '#15140f';

const MIN_CONTRAST = 4.5; // WCAG AA, normal text

/** Every topic chip currently on the wheel. Hues are recomputed, never trusted. */
const PLACED = [
  { topic: 'bg3', light: '#8a5a00', dark: '#e8b04b' },
  { topic: 'meals', light: '#2f7526', dark: '#86dd7a' },
  { topic: 'admob', light: '#0a7d65', dark: '#2fc79f' },
  { topic: 'strength', light: '#4a56a6', dark: '#9aa2e8' },
  { topic: 'llm', light: '#86198f', dark: '#e879f9' },
  { topic: 'kai', light: '#b3164b', dark: '#fb9aba' },
  // ua sits at 76deg — the centre of the only usable arc left, and legal only
  // because HUB.md relaxed the hue rule from 40deg to 30deg to admit it.
  { topic: 'ua', light: '#486300', dark: '#c9ff39' },
];

/* ---------- colour maths ---------- */

const hexToRgb = (hex) => {
  const h = hex.replace('#', '');
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
};

const rgbToHex = (r, g, b) =>
  '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('');

/** WCAG 2.x relative luminance. */
const luminanceRgb = ([r, g, b]) => {
  const [lr, lg, lb] = [r, g, b].map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * lr + 0.7152 * lg + 0.0722 * lb;
};

const luminance = (hex) => luminanceRgb(hexToRgb(hex));

const contrastL = (l1, l2) => {
  const [hi, lo] = l1 >= l2 ? [l1, l2] : [l2, l1];
  return (hi + 0.05) / (lo + 0.05);
};

const contrast = (a, b) => contrastL(luminance(a), luminance(b));

/** HSL hue, in degrees. */
const hueRgb = ([r0, g0, b0]) => {
  const [r, g, b] = [r0, g0, b0].map((v) => v / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  if (d === 0) return 0;
  let h;
  if (max === r) h = ((g - b) / d) % 6;
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  h *= 60;
  return h < 0 ? h + 360 : h;
};

const hue = (hex) => hueRgb(hexToRgb(hex));

/** HSL saturation, 0-1 — used to reject muddy greys that technically hold a hue. */
const satRgb = ([r0, g0, b0]) => {
  const [r, g, b] = [r0, g0, b0].map((v) => v / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  if (d === 0) return 0;
  const l = (max + min) / 2;
  return d / (1 - Math.abs(2 * l - 1));
};

/** HSL lightness, 0-1. Near-black and near-white read as fully saturated in HSL,
 *  so a chip search MUST bound lightness or it converges on #000/#fff. */
const lightRgb = ([r0, g0, b0]) => {
  const [r, g, b] = [r0, g0, b0].map((v) => v / 255);
  return (Math.max(r, g, b) + Math.min(r, g, b)) / 2;
};

/** Smallest angular distance between two hues, 0-180deg. */
const hueGap = (a, b) => {
  const d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
};

const fmt = (n, p = 2) => n.toFixed(p);

/* ---------- args ---------- */

const arg = (name) => {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : null;
};

const MIN_HUE_GAP = Number(arg('min-gap') ?? 40);
const bandArg = arg('band');
const BAND = bandArg ? bandArg.split(',').map(Number) : null;
/** Chips under consideration are excluded from the "existing" set while searching. */
const EXCLUDE = (arg('exclude') ?? '').split(',').filter(Boolean);

const existing = PLACED.filter((t) => !EXCLUDE.includes(t.topic));

/* ---------- audit the placed wheel ---------- */

console.log(`=== Placed topic chips (hue rule: >= ${MIN_HUE_GAP}deg) ===\n`);

const existingHues = existing.map((t) => ({ topic: t.topic, hue: hue(t.light) }));
existingHues.sort((a, b) => a.hue - b.hue);

for (const t of existing) {
  const h = hue(t.light);
  const hd = hue(t.dark);
  const nearest = existingHues
    .filter((e) => e.topic !== t.topic)
    .map((e) => ({ topic: e.topic, gap: hueGap(h, e.hue) }))
    .sort((a, b) => a.gap - b.gap)[0];
  const cL = contrast(t.light, SURFACE_LIGHT);
  const cD = contrast(t.dark, SURFACE_DARK);
  console.log(
    `${t.topic.padEnd(9)} light ${t.light} ${fmt(h, 0).padStart(3)}deg ${fmt(cL)}:1 ${cL >= MIN_CONTRAST ? 'PASS' : 'FAIL'}   ` +
      `dark ${t.dark} ${fmt(hd, 0).padStart(3)}deg ${fmt(cD)}:1 ${cD >= MIN_CONTRAST ? 'PASS' : 'FAIL'}   ` +
      `drift ${fmt(hueGap(h, hd), 0).padStart(2)}deg   ` +
      (nearest
        ? `nearest ${nearest.topic} ${fmt(nearest.gap, 0)}deg ${nearest.gap >= MIN_HUE_GAP ? 'PASS' : 'FAIL'}`
        : 'nearest —')
  );
}

/* ---------- free arcs ---------- */

const freeArcs = (hues, minGap) => {
  const free = [];
  for (let h = 0; h < 360; h++) {
    if (!hues.length || Math.min(...hues.map((e) => hueGap(h, e))) >= minGap) free.push(h);
  }
  const arcs = [];
  for (const h of free) {
    const last = arcs[arcs.length - 1];
    if (last && h === last[1] + 1) last[1] = h;
    else arcs.push([h, h]);
  }
  if (arcs.length > 1 && arcs[0][0] === 0 && arcs[arcs.length - 1][1] === 359) {
    const first = arcs.shift();
    arcs[arcs.length - 1][1] = first[1] + 360;
  }
  return arcs;
};

console.log(`\n=== Free arcs at >= ${MIN_HUE_GAP}deg ===\n`);
console.log('occupied: ' + existingHues.map((e) => fmt(e.hue, 0) + 'deg').join(', ') + '\n');
const arcs = freeArcs(existingHues.map((e) => e.hue), MIN_HUE_GAP);
if (!arcs.length) console.log(`  none — the wheel is full at the ${MIN_HUE_GAP}deg rule.`);
else
  for (const [a, b] of arcs) {
    const hi = b > 359 ? b - 360 : b;
    console.log(`  ${a}-${hi}deg  (${b - a + 1}deg wide)`);
  }

/* ---------- search a band for a passing pair ---------- */

if (!BAND) {
  console.log('\nPass --band=lo,hi to search that arc for a chip pair.');
  process.exit(0);
}

const [LO, HI] = BAND;
console.log(`\n=== Searching ${LO}-${HI}deg for a chip pair (step 3/channel) ===\n`);

/** Chips must read as a COLOUR, not as ink or paper. Bounding HSL lightness is
 *  what stops the search collapsing onto near-black / near-white, both of which
 *  score as fully saturated in HSL and trivially win on contrast. */
const LIGHTNESS = { light: [0.18, 0.42], dark: [0.55, 0.82] };

/** Walk the RGB cube coarsely; keep anything in-band, vivid, and legible. */
const search = (surface, paper, wantLighterThanSurface) => {
  const surfL = luminance(surface);
  const paperL = luminance(paper);
  const [loL, hiL] = wantLighterThanSurface ? LIGHTNESS.dark : LIGHTNESS.light;
  const hits = [];
  for (let r = 0; r < 256; r += 3)
    for (let g = 0; g < 256; g += 3)
      for (let b = 0; b < 256; b += 3) {
        const rgb = [r, g, b];
        const h = hueRgb(rgb);
        if (h < LO || h > HI) continue;
        const sat = satRgb(rgb);
        if (sat < 0.55) continue; // reject mud
        const hsl = lightRgb(rgb);
        if (hsl < loL || hsl > hiL) continue; // reject ink and paper
        const l = luminanceRgb(rgb);
        // A light-theme chip must be darker than its surface; a dark-theme chip lighter.
        if (wantLighterThanSurface ? l <= surfL : l >= surfL) continue;
        const cS = contrastL(l, surfL);
        if (cS < MIN_CONTRAST) continue;
        hits.push({ hex: rgbToHex(r, g, b), h, cS, cP: contrastL(l, paperL), sat });
      }
  return hits;
};

const lightHits = search(SURFACE_LIGHT, PAPER_LIGHT, false);
const darkHits = search(SURFACE_DARK, PAPER_DARK, true);

if (!lightHits.length || !darkHits.length) {
  console.log(`No passing chip in ${LO}-${HI}deg (light ${lightHits.length}, dark ${darkHits.length}).`);
  process.exit(1);
}

/* Identity first, once the accessibility floor is cleared: pick the pair whose
   two hues agree most closely, so the chip reads as ONE colour across a theme
   toggle. Vividness breaks ties — every survivor already clears 4.5:1, so extra
   contrast headroom is worth less than a chip that actually looks like a colour. */
let best = null;
for (const l of lightHits)
  for (const d of darkHits) {
    const drift = hueGap(l.h, d.h);
    const score = drift * 100 - (l.sat + d.sat) * 10;
    if (!best || score < best.score) best = { score, drift, l, d };
  }

const nearestTo = (h) =>
  existingHues
    .map((e) => ({ topic: e.topic, gap: hueGap(h, e.hue) }))
    .sort((a, b) => a.gap - b.gap)[0];

const nl = nearestTo(best.l.h);
console.log(
  `light ${best.l.hex}  hue ${fmt(best.l.h, 0)}deg  ${fmt(best.l.cS)}:1 on ${SURFACE_LIGHT}  (paper ${fmt(best.l.cP)}:1)\n` +
    `dark  ${best.d.hex}  hue ${fmt(best.d.h, 0)}deg  ${fmt(best.d.cS)}:1 on ${SURFACE_DARK}  (paper ${fmt(best.d.cP)}:1)\n` +
    `hue drift across themes: ${fmt(best.drift, 0)}deg\n` +
    (nl
      ? `nearest placed chip: ${nl.topic} at ${fmt(nl.gap, 0)}deg (rule: >= ${MIN_HUE_GAP}deg) ${nl.gap >= MIN_HUE_GAP ? 'PASS' : 'FAIL'}`
      : 'nearest placed chip: — (wheel empty)')
);

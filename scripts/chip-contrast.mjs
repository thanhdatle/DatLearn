#!/usr/bin/env node
/**
 * chip-contrast.mjs — measure, never guess.
 *
 * HUB.md requires every topic chip to clear 4.5:1 contrast in BOTH themes
 * (chips render as kicker TEXT on --surface: #ffffff light, #1d1c16 dark)
 * and to sit >= 40 degrees from every other topic's hue.
 *
 * This script computes WCAG 2.x relative-luminance contrast and HSL hue for a
 * set of candidate hexes, and reports hue separation against the existing
 * topic chips. Run it, read the numbers, then paste them into the CSS comment
 * block in index.html and the "Topic colours" paragraph in HUB.md.
 *
 * No input files, no output files. Hardcoded candidates in, stdout out.
 *
 *   node scripts/chip-contrast.mjs
 */

const SURFACE_LIGHT = '#ffffff';
const SURFACE_DARK = '#1d1c16';
const PAPER_LIGHT = '#fbfaf6';
const PAPER_DARK = '#15140f';

const MIN_CONTRAST = 4.5;   // WCAG AA, normal text
const MIN_HUE_GAP = 40;     // HUB.md rule
const BAND = [100, 120];    // leaf green: clear of admob's emerald at 167deg

/** The four topic chips already on the wheel. Hues are recomputed, not trusted. */
const EXISTING = [
  { topic: 'admob', light: '#0a7d65', dark: '#2fc79f' },
  { topic: 'strength', light: '#4a56a6', dark: '#9aa2e8' },
  { topic: 'llm', light: '#86198f', dark: '#e879f9' },
  { topic: 'bg3', light: '#8a5a00', dark: '#e8b04b' },
];

/** Leaf-green candidates for the new `meals` topic.
 *
 *  First pass sat at ~91deg — yellow-green, below the band. These are pulled
 *  toward true green (120deg) by lifting G relative to R while keeping B low,
 *  which is what buys the hue without losing the leaf character. */
const CANDIDATES = {
  light: ['#2e7d32', '#33741f', '#2f7526', '#357a2b', '#2b6e28', '#38801f', '#307a1e'],
  dark: ['#86dd7a', '#8fd97f', '#7fd96e', '#95e084', '#7ad46b', '#8ade72'],
};

const hexToRgb = (hex) => {
  const h = hex.replace('#', '');
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
};

/** WCAG 2.x relative luminance. */
const luminance = (hex) => {
  const [r, g, b] = hexToRgb(hex).map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const contrast = (a, b) => {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
};

/** HSL hue, in degrees. */
const hue = (hex) => {
  const [r, g, b] = hexToRgb(hex).map((v) => v / 255);
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

/** Smallest angular distance between two hues, 0-180deg. */
const hueGap = (a, b) => {
  const d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
};

const fmt = (n, p = 2) => n.toFixed(p);

console.log('=== Existing topic chips (hues recomputed from the live hexes) ===\n');
const existingHues = [];
for (const t of EXISTING) {
  const h = hue(t.light);
  existingHues.push({ topic: t.topic, hue: h });
  console.log(
    `${t.topic.padEnd(9)} light ${t.light}  hue ${fmt(h, 0).padStart(3)}deg  ` +
      `${fmt(contrast(t.light, SURFACE_LIGHT))}:1 surface  ` +
      `${fmt(contrast(t.light, PAPER_LIGHT))}:1 paper`
  );
  console.log(
    `${''.padEnd(9)} dark  ${t.dark}  hue ${fmt(hue(t.dark), 0).padStart(3)}deg  ` +
      `${fmt(contrast(t.dark, SURFACE_DARK))}:1 surface  ` +
      `${fmt(contrast(t.dark, PAPER_DARK))}:1 paper`
  );
}

const report = (hex, surface, paper, label) => {
  const cS = contrast(hex, surface);
  const cP = contrast(hex, paper);
  const h = hue(hex);
  const gaps = existingHues
    .map((e) => ({ topic: e.topic, gap: hueGap(h, e.hue) }))
    .sort((a, b) => a.gap - b.gap);
  const minGap = gaps[0].gap;
  const passContrast = cS >= MIN_CONTRAST;
  const passHue = minGap >= MIN_HUE_GAP;
  const inBand = h >= BAND[0] && h <= BAND[1];
  console.log(
    `${label} ${hex}  hue ${fmt(h, 1).padStart(5)}deg  ` +
      `surface ${fmt(cS)}:1 ${passContrast ? 'PASS' : 'FAIL'}  ` +
      `paper ${fmt(cP)}:1  ` +
      `nearest ${gaps[0].topic} ${fmt(minGap, 1)}deg ${passHue ? 'PASS' : 'FAIL'}  ` +
      `${inBand ? 'in band' : 'OUT OF BAND'}`
  );
  return { hex, h, cS, cP, minGap, ok: passContrast && passHue && inBand };
};

console.log(`\n=== LIGHT chip candidates (>= ${MIN_CONTRAST}:1 on ${SURFACE_LIGHT}) ===\n`);
const lightOk = CANDIDATES.light
  .map((hex) => report(hex, SURFACE_LIGHT, PAPER_LIGHT, 'light'))
  .filter((r) => r.ok);

console.log(`\n=== DARK chip candidates (>= ${MIN_CONTRAST}:1 on ${SURFACE_DARK}) ===\n`);
const darkOk = CANDIDATES.dark
  .map((hex) => report(hex, SURFACE_DARK, PAPER_DARK, 'dark '))
  .filter((r) => r.ok);

console.log('\n=== Verdict ===\n');
if (!lightOk.length || !darkOk.length) {
  console.log('No passing pair. Widen the candidate list.');
  process.exit(1);
}

/* Chosen pair. NOT simply the max-contrast pair: both themes have contrast to
   spare, so the tiebreak is hue agreement — a light chip at 113deg and a dark
   chip at 113deg read as the same green across a theme toggle, which a 117/109
   pair does not. Identity first, once the accessibility floor is cleared. */
const CHOSEN = { light: '#2f7526', dark: '#86dd7a' };
const bestLight = lightOk.find((r) => r.hex === CHOSEN.light);
const bestDark = darkOk.find((r) => r.hex === CHOSEN.dark);
if (!bestLight || !bestDark) {
  console.log('The chosen pair no longer passes. Re-pick from the lists above.');
  process.exit(1);
}
console.log(
  `light ${bestLight.hex}  hue ${fmt(bestLight.h, 0)}deg  ${fmt(bestLight.cS)}:1 on ${SURFACE_LIGHT}  (paper ${fmt(bestLight.cP)}:1)\n` +
    `dark  ${bestDark.hex}  hue ${fmt(bestDark.h, 0)}deg  ${fmt(bestDark.cS)}:1 on ${SURFACE_DARK}  (paper ${fmt(bestDark.cP)}:1)\n` +
    `nearest existing hue: ${fmt(bestLight.minGap, 0)}deg away (rule: >= ${MIN_HUE_GAP}deg)`
);

console.log('\n=== Free arcs remaining, with meals placed ===\n');
const allHues = [...existingHues.map((e) => e.hue), bestLight.h].sort((a, b) => a - b);
console.log('occupied: ' + allHues.map((h) => fmt(h, 0) + 'deg').join(', ') + '\n');

const free = [];
for (let h = 0; h < 360; h++) {
  if (Math.min(...allHues.map((e) => hueGap(h, e))) >= MIN_HUE_GAP) free.push(h);
}
const arcs = [];
for (const h of free) {
  const last = arcs[arcs.length - 1];
  if (last && h === last[1] + 1) last[1] = h;
  else arcs.push([h, h]);
}
// A wrap-around run (359 -> 0) is one arc, not two.
if (arcs.length > 1 && arcs[0][0] === 0 && arcs[arcs.length - 1][1] === 359) {
  const first = arcs.shift();
  arcs[arcs.length - 1][1] = first[1] + 360;
}
if (!arcs.length) {
  console.log('  none — the wheel is full at the 40deg rule.');
} else {
  for (const [a, b] of arcs) {
    const hi = b > 359 ? b - 360 : b;
    console.log(`  ${a}-${hi}deg  (${b - a + 1}deg wide)`);
  }
}

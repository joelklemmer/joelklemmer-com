#!/usr/bin/env npx tsx
/**
 * Figma Make token importer.
 * Reads styles/theme.css from src.zip or extracted dir,
 * extracts CSS custom properties, converts hex to HSL, outputs generated tokens.
 *
 * IMPORTANT: Tokens must come from https://pages-tile-41445691.figma.site/
 * 1. Open the Figma Make project that publishes to that URL
 * 2. Code tab → Download code
 * 3. Extract and run: npx tsx tools/import-figma-make.ts [path-to-extract-or-src.zip]
 *
 * Usage: npx tsx tools/import-figma-make.ts [path-to-zip-or-extracted-dir]
 * Default: ./src.zip or ./temp-figma-extract
 */

import * as fs from 'node:fs';
import * as path from 'node:path';

/** Canonical Figma site — tokens must be from this project's export. No other source. */
const FIGMA_SITE_URL = 'https://pages-tile-41445691.figma.site/';

const INPUT = process.argv[2] ?? process.cwd();
const OUTPUT_JSON = path.join(
  process.cwd(),
  'libs/tokens/src/lib/generated/figma-make.tokens.json',
);
const OUTPUT_PATCH = path.join(
  process.cwd(),
  'libs/tokens/src/lib/generated/figma-make.tokens.patch.css',
);

/** WCAG AA: ensure contrast >= 4.5:1 for text on light bg. Returns darker HSL if needed. */
function ensureWcagMuted(hslValue: string, bgLightness = 0.96): string {
  const m = hslValue.match(/^(\d+)\s+(\d+)%\s+(\d+)%$/);
  if (!m) return hslValue;
  const h = parseInt(m[1], 10);
  const s = parseInt(m[2], 10) / 100;
  const l = parseInt(m[3], 10) / 100;
  const ratio = (bgLightness + 0.05) / (l + 0.05);
  if (ratio >= 4.5) return hslValue;
  const maxL = (bgLightness + 0.05) / 4.5 - 0.05;
  const cappedL = Math.min(l, Math.max(0, maxL));
  return `${h} ${s * 100}% ${Math.round(cappedL * 100)}%`;
}

/** Convert hex color to HSL (H S% L% space-separated) */
function hexToHsl(hex: string): string {
  const clean = hex.replace(/^#/, '');
  if (clean.length !== 6 && clean.length !== 8) return hex;
  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

/** Convert rgba(...) to HSL (best-effort). Handles newlines/whitespace. */
function rgbaToHsl(value: string): string {
  const normalized = value.replace(/\s+/g, ' ').trim();
  const m = normalized.match(
    /rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*[\d.]+)?\s*\)/,
  );
  if (!m) return value;
  const r = parseInt(m[1], 10) / 255;
  const g = parseInt(m[2], 10) / 255;
  const b = parseInt(m[3], 10) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

function toHslIfColor(raw: string): string {
  const t = raw.trim();
  if (/^#[0-9A-Fa-f]{6}([0-9A-Fa-f]{2})?$/.test(t)) return hexToHsl(t);
  if (/rgba?\s*\(/.test(t)) {
    const converted = rgbaToHsl(t);
    return converted.includes('rgba') || converted.includes('rgb(')
      ? t
      : converted;
  }
  return t;
}

function parseDeclarations(block: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const line of block.split(';')) {
    const m = line.trim().match(/--([\w-]+)\s*:\s*(.+)/);
    if (m) {
      let val = m[2].trim();
      if (/^#|^rgba?\(/.test(val)) val = toHslIfColor(val);
      out[`--${m[1]}`] = val;
    }
  }
  return out;
}

function extractThemes(content: string): {
  base: Record<string, string>;
  light: Record<string, string>;
  dark: Record<string, string>;
} {
  const base: Record<string, string> = {};
  const light: Record<string, string> = {};
  const dark: Record<string, string> = {};

  const rootMatch = content.match(/:root\s*\{([^}]+)\}/s);
  if (rootMatch) Object.assign(base, parseDeclarations(rootMatch[1]));

  /* Match single or double quotes (Figma Make may use either) */
  const lightMatch = content.match(
    /\[data-theme=['"]light['"]\]\s*\{([^}]+)\}/s,
  );
  if (lightMatch) Object.assign(light, parseDeclarations(lightMatch[1]));

  const darkMatch = content.match(/\[data-theme=['"]dark['"]\]\s*\{([^}]+)\}/s);
  if (darkMatch) Object.assign(dark, parseDeclarations(darkMatch[1]));

  return { base, light, dark };
}

/** Map Figma vars to repo canonical names (HSL for colors) */
function toCanonical(theme: Record<string, string>): Record<string, string> {
  const canonical: Record<string, string> = {
    '--color-bg-base': '--color-bg',
    '--color-bg-surface': '--color-surface',
    '--color-bg-muted': '--color-surface-elevated',
    '--color-text-primary': '--color-text',
    /* Use secondary (body text) for --color-muted; tertiary too light for WCAG AA */
    '--color-text-secondary': '--color-muted',
    '--color-text-on-accent': '--color-text-on-accent',
    '--color-border-subtle': '--color-border-subtle',
    '--color-border-medium': '--color-border',
    '--color-accent': '--color-accent',
    '--color-accent-hover': '--color-accent-strong',
    '--color-focus-ring': '--color-focus',
  };
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(theme)) {
    if (v.startsWith('var(')) continue;
    const name = (canonical as Record<string, string>)[k] ?? k;
    out[name] = v;
  }
  return out;
}

function readThemeContent(): string {
  const resolved = path.isAbsolute(INPUT)
    ? INPUT
    : path.join(process.cwd(), INPUT);
  const themeInDir = path.join(resolved, 'styles/theme.css');
  if (fs.existsSync(themeInDir)) {
    return fs.readFileSync(themeInDir, 'utf-8');
  }
  if (resolved.endsWith('.zip') && fs.existsSync(resolved)) {
    const AdmZip = require('adm-zip') as new (p: string) => {
      getEntry: (e: string) => { isDirectory: boolean } | null;
      readAsText: (e: string | { isDirectory: boolean }) => string;
    };
    const zip = new AdmZip(resolved);
    const entry =
      zip.getEntry('styles/theme.css') ?? zip.getEntry('src/styles/theme.css');
    if (!entry || entry.isDirectory)
      throw new Error('styles/theme.css not found in zip');
    return zip.readAsText(entry);
  }
  if (fs.existsSync(resolved) && resolved.endsWith('theme.css')) {
    return fs.readFileSync(resolved, 'utf-8');
  }
  throw new Error(
    `No theme.css found. Provide path to: (a) extracted dir (e.g. temp-figma-extract), (b) src.zip, or (c) styles/theme.css`,
  );
}

function main() {
  const content = readThemeContent();
  const { base, light, dark } = extractThemes(content);

  const lightRaw = { ...base, ...toCanonical(light) };
  const darkFinal = { ...base, ...toCanonical(dark) };
  const lightFinal = { ...lightRaw };
  if (lightFinal['--color-muted'] && lightFinal['--color-bg']) {
    lightFinal['--color-muted'] = ensureWcagMuted(
      lightFinal['--color-muted'],
      0.96,
    );
  }

  const json = {
    light: lightFinal,
    dark: darkFinal,
    meta: {
      source: 'Figma Make styles/theme.css',
      figmaSiteUrl: FIGMA_SITE_URL,
      extractedAt: new Date().toISOString(),
    },
  };

  const outDir = path.dirname(OUTPUT_JSON);
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(OUTPUT_JSON, JSON.stringify(json, null, 2), 'utf-8');
  console.log(`Wrote ${OUTPUT_JSON}`);
  console.log(`Source: ${FIGMA_SITE_URL}`);

  const isColorOrLayout = (k: string) =>
    k.startsWith('--color-') ||
    k.startsWith('--text-') ||
    k.startsWith('--space-') ||
    k.startsWith('--font-') ||
    k.startsWith('--radius') ||
    k.startsWith('--max-width');

  const isBaseToken = (k: string) =>
    k.startsWith('--text-') ||
    k.startsWith('--space-') ||
    k.startsWith('--font-') ||
    k.startsWith('--radius') ||
    k.startsWith('--max-width') ||
    k === '--nav-height';

  const isValidColor = (v: string) =>
    !v.includes('rgba(') && !v.includes('rgb(');
  const lightColors = Object.entries(json.light).filter(
    ([k, v]) => k.startsWith('--color-') && isValidColor(v),
  );
  const darkColors = Object.entries(json.dark).filter(
    ([k, v]) => k.startsWith('--color-') && isValidColor(v),
  );
  /* Masthead: light mode = surface bg + dark text; dark mode = surface bg + light text (Figma site parity). */
  const mastheadLightTokens = [
    '  --masthead-bg: hsl(var(--color-surface));',
    '  --masthead-bg-scrolled: hsl(var(--color-surface));',
    '  --masthead-border: hsl(var(--color-border-subtle));',
    '  --masthead-text: var(--color-text);',
    '  --masthead-text-muted: var(--color-muted);',
    '  --masthead-focus: var(--color-focus);',
  ];
  const mastheadDarkTokens = [
    '  --masthead-bg: hsl(var(--color-surface));',
    '  --masthead-bg-scrolled: hsl(var(--color-surface));',
    '  --masthead-border: hsl(var(--color-border-subtle));',
    '  --masthead-text: var(--color-text);',
    '  --masthead-text-muted: var(--color-muted);',
    '  --masthead-focus: var(--color-focus);',
  ];
  const neutralTokens = (colors: Array<[string, string]>) => {
    const map = Object.fromEntries(colors);
    const bg = map['--color-bg'];
    const elevated = map['--color-surface-elevated'];
    const lines: string[] = [];
    if (bg) lines.push('  --color-neutral-50: ' + bg + ';');
    if (elevated) lines.push('  --color-neutral-100: ' + elevated + ';');
    return lines;
  };

  const radiusVal = json.light['--radius'] ?? '0rem';
  const radiusXl = radiusVal === '0' || radiusVal === '0rem' ? '0' : '0.75rem';

  const patchLines = [
    '/* figma-make imported tokens: auto-generated */',
    `/* Source: ${FIGMA_SITE_URL} — MUST be from this project export */`,
    '/* Run: npx tsx tools/import-figma-make.ts [path] */',
    '',
    ':root {',
    ...Object.entries(json.light)
      .filter(([k]) => isBaseToken(k))
      .map(([k, v]) => `  ${k}: ${v};`),
    `  --radius-xl: ${radiusXl};`,
    '  --container-max-width: var(--max-width);',
    '  --hero-display-font: var(--font-serif);',
    '  --hero-lede-font: var(--font-serif);',
    '  --hero-display-size: var(--text-hero);',
    '  --hero-display-line: var(--text-hero-line);',
    '  --hero-lede-size: var(--text-body-large);',
    '  --hero-lede-line: var(--text-body-large-line);',
    '  --font-weight-label: var(--font-weight-medium);',
    '}',
    '',
    ":root[data-theme='light'] {",
    ...lightColors.map(([k, v]) => `  ${k}: ${v};`),
    ...neutralTokens(lightColors),
    ...mastheadLightTokens,
    '}',
    '',
    '/* Fallback when no data-theme (e.g. no-JS). prefers-color-scheme: light */',
    '@media (prefers-color-scheme: light) {',
    "  :root:not([data-theme='dark']) {",
    ...lightColors.map(([k, v]) => `    ${k}: ${v};`),
    ...neutralTokens(lightColors).map((s) => '  ' + s),
    ...mastheadLightTokens.map((s) => '  ' + s),
    '  }',
    '}',
    '',
    '/* Fallback when no data-theme (e.g. no-JS). prefers-color-scheme: dark */',
    '@media (prefers-color-scheme: dark) {',
    "  :root:not([data-theme='light']) {",
    ...darkColors.map(([k, v]) => `    ${k}: ${v};`),
    ...neutralTokens(darkColors).map((s) => '  ' + s),
    ...mastheadDarkTokens.map((s) => '  ' + s),
    '  }',
    '}',
    '',
    ":root[data-theme='dark'] {",
    ...darkColors.map(([k, v]) => `  ${k}: ${v};`),
    ...neutralTokens(darkColors),
    ...mastheadDarkTokens,
    '}',
  ];
  fs.writeFileSync(OUTPUT_PATCH, patchLines.join('\n'), 'utf-8');
  console.log(`Wrote ${OUTPUT_PATCH}`);
}

main();

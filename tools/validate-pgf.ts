/**
 * PGF (Presentation Governance Framework) validation. Mechanical checks only.
 * Run: npx tsx --tsconfig tsconfig.base.json tools/validate-pgf.ts
 * Requires Node 20+; runs on Windows PowerShell.
 */
import path from 'node:path';
import { readFileSync } from 'node:fs';
import { defaultLocale } from '@joelklemmer/i18n';
import { claimRegistry, contactPathways } from '@joelklemmer/content/validate';

const messagesRoot = path.join(
  process.cwd(),
  'libs',
  'i18n',
  'src',
  'messages',
);

/** Core screens for H1/lede uniqueness (meta keys). */
const CORE_META_KEYS = [
  'home',
  'brief',
  'work',
  'books',
  'proof',
  'contact',
  'privacy',
  'terms',
  'accessibility',
  'security',
] as const;

/** CTA labels that may repeat without failing (e.g. generic "Read more"). */
const CTA_ALLOWLIST = new Set<string>(['Read more', 'View English version']);

function readJson(filePath: string): Record<string, unknown> {
  const raw = readFileSync(filePath, 'utf-8');
  return JSON.parse(raw) as Record<string, unknown>;
}

function getByPath(obj: unknown, pathStr: string): unknown {
  let current: unknown = obj;
  for (const part of pathStr.split('.')) {
    if (current == null || typeof current !== 'object') return undefined;
    current = (current as Record<string, unknown>)[part];
  }
  return current;
}

const errors: string[] = [];

// --- Check 1: No duplicate page H1 (meta.title) across core screens (default locale) ---
const metaPath = path.join(messagesRoot, defaultLocale, 'meta.json');
const meta = readJson(metaPath);
const h1ByKey: Record<string, string> = {};
const h1ToKeys: Map<string, string[]> = new Map();
for (const key of CORE_META_KEYS) {
  const page = meta[key] as Record<string, unknown> | undefined;
  const title = page && typeof page.title === 'string' ? page.title.trim() : '';
  if (!title) {
    errors.push(`[PGF] meta.${key}.title is missing or empty (${metaPath}).`);
    continue;
  }
  h1ByKey[key] = title;
  const existing = h1ToKeys.get(title) ?? [];
  existing.push(key);
  h1ToKeys.set(title, existing);
}
for (const [title, keys] of h1ToKeys) {
  if (keys.length > 1) {
    errors.push(
      `[PGF] Duplicate page H1: "${title}" used on multiple core screens: ${keys.join(', ')} (meta keys). File: ${metaPath}`,
    );
  }
}

// --- Check 2: No duplicate lede (meta.description) across core screens (default locale) ---
const ledeToKeys: Map<string, string[]> = new Map();
for (const key of CORE_META_KEYS) {
  const page = meta[key] as Record<string, unknown> | undefined;
  const description =
    page && typeof page.description === 'string' ? page.description.trim() : '';
  if (!description) {
    errors.push(
      `[PGF] meta.${key}.description (lede) is missing or empty (${metaPath}).`,
    );
    continue;
  }
  const existing = ledeToKeys.get(description) ?? [];
  existing.push(key);
  ledeToKeys.set(description, existing);
}
for (const [lede, keys] of ledeToKeys) {
  if (keys.length > 1) {
    const preview = lede.length > 50 ? lede.slice(0, 50) + '…' : lede;
    errors.push(
      `[PGF] Duplicate lede across core screens: "${preview}" used on: ${keys.join(', ')} (meta keys). File: ${metaPath}`,
    );
  }
}

// --- Check 3: Claims registry — no duplicate labelKey or summaryKey ---
const labelKeys = new Map<string, string>();
const summaryKeys = new Map<string, string>();
for (const claim of claimRegistry) {
  if (labelKeys.has(claim.labelKey)) {
    errors.push(
      `[PGF] Duplicate claim labelKey: "${claim.labelKey}" (claims: ${labelKeys.get(claim.labelKey)}, ${claim.id}). Registry: libs/content/src/lib/claims.ts`,
    );
  } else {
    labelKeys.set(claim.labelKey, claim.id);
  }
  if (summaryKeys.has(claim.summaryKey)) {
    errors.push(
      `[PGF] Duplicate claim summaryKey: "${claim.summaryKey}" (claims: ${summaryKeys.get(claim.summaryKey)}, ${claim.id}). Registry: libs/content/src/lib/claims.ts`,
    );
  } else {
    summaryKeys.set(claim.summaryKey, claim.id);
  }
}

// --- Check 4: Primary CTA labels unique (default locale); allowlist for known repeats ---
const contactPath = path.join(messagesRoot, defaultLocale, 'contact.json');
const homePath = path.join(messagesRoot, defaultLocale, 'home.json');
const contactJson = readJson(contactPath);
const homeJson = readJson(homePath);

const ctaLabels: { label: string; source: string }[] = [];
for (const pathway of contactPathways) {
  const cta = getByPath(contactJson, pathway.ctaKey);
  if (typeof cta === 'string' && cta.trim()) {
    ctaLabels.push({
      label: cta.trim(),
      source: `contact.${pathway.ctaKey} (${pathway.id})`,
    });
  }
}
const mailtoButton = getByPath(contactJson, 'mailto.buttonLabel');
if (typeof mailtoButton === 'string' && mailtoButton.trim()) {
  ctaLabels.push({
    label: mailtoButton.trim(),
    source: 'contact.mailto.buttonLabel',
  });
}
const homeCta = getByPath(homeJson, 'hero.cta');
if (typeof homeCta === 'string' && homeCta.trim()) {
  ctaLabels.push({ label: homeCta.trim(), source: 'home.hero.cta' });
}

const ctaLabelToSources = new Map<string, string[]>();
for (const { label, source } of ctaLabels) {
  if (CTA_ALLOWLIST.has(label)) continue;
  const list = ctaLabelToSources.get(label) ?? [];
  list.push(source);
  ctaLabelToSources.set(label, list);
}
for (const [label, sources] of ctaLabelToSources) {
  if (sources.length > 1) {
    errors.push(
      `[PGF] Duplicate primary CTA label: "${label}" used at: ${sources.join('; ')}. Files: ${contactPath}, ${homePath}. Add to allowlist in tools/validate-pgf.ts if intentional.`,
    );
  }
}

// --- Report ---
if (errors.length > 0) {
  const report = [
    'PGF validation failed. Fix the following and re-run nx run web:pgf-validate.',
    '',
    ...errors,
  ].join('\n');
  throw new Error(report);
}

console.log('PGF validation passed.');

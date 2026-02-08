/**
 * Content Operating System validation. Ensures intent map, contentOS intents,
 * meta/CTA presence, and no placeholder language in default-locale copy.
 * Run: npx tsx --tsconfig tsconfig.base.json tools/validate-content-os.ts
 */
import path from 'node:path';
import { readFileSync, existsSync } from 'node:fs';
import { defaultLocale, locales } from '@joelklemmer/i18n';

const repoRoot = process.cwd();
const messagesRoot = path.join(repoRoot, 'libs', 'i18n', 'src', 'messages');
const docsRoot = path.join(repoRoot, 'docs');

const REQUIRED_ROUTES = [
  '/',
  '/brief',
  '/casestudies',
  '/books',
  '/publicrecord',
  '/contact',
];
const CONTENT_OS_INTENT_KEYS = [
  'intents.home.tenSecond',
  'intents.home.sixtySecond',
  'intents.brief.tenSecond',
  'intents.brief.sixtySecond',
  'intents.casestudies.tenSecond',
  'intents.casestudies.sixtySecond',
  'intents.books.tenSecond',
  'intents.books.sixtySecond',
  'intents.publicrecord.tenSecond',
  'intents.publicrecord.sixtySecond',
  'intents.contact.tenSecond',
  'intents.contact.sixtySecond',
] as const;

const META_KEYS = [
  'home',
  'brief',
  'work',
  'books',
  'proof',
  'contact',
] as const;

const PLACEHOLDER_BLOCKLIST = [
  'lorem',
  'placeholder',
  'sample',
  'coming soon',
  'tbd',
  'to be added',
  'draft',
];

const NAMESPACES_TO_SCAN = [
  'home',
  'brief',
  'work',
  'books',
  'publicRecord',
  'contact',
  'meta',
];

const errors: string[] = [];

function readJson(filePath: string): unknown {
  const raw = readFileSync(filePath, 'utf-8');
  return JSON.parse(raw);
}

function getByPath(obj: unknown, pathStr: string): unknown {
  let current: unknown = obj;
  for (const part of pathStr.split('.')) {
    if (current == null || typeof current !== 'object') return undefined;
    current = (current as Record<string, unknown>)[part];
  }
  return current;
}

function collectStringPaths(
  obj: unknown,
  prefix: string,
  out: { path: string; value: string }[],
): void {
  if (obj == null) return;
  if (typeof obj === 'string') {
    out.push({ path: prefix, value: obj });
    return;
  }
  if (Array.isArray(obj)) {
    obj.forEach((item, i) => collectStringPaths(item, `${prefix}[${i}]`, out));
    return;
  }
  if (typeof obj === 'object') {
    for (const [k, v] of Object.entries(obj)) {
      collectStringPaths(v, prefix ? `${prefix}.${k}` : k, out);
    }
  }
}

// A) Page intent map: ensure docs/page-intent-map.md documents all required routes
function validateIntentMap(): void {
  const mapPath = path.join(docsRoot, 'page-intent-map.md');
  if (!existsSync(mapPath)) {
    errors.push(`${mapPath}: file missing`);
    return;
  }
  const content = readFileSync(mapPath, 'utf-8');
  for (const route of REQUIRED_ROUTES) {
    if (!content.includes(route)) {
      errors.push(
        `docs/page-intent-map.md: missing route "${route}" in intent map`,
      );
    }
  }
}

// B) contentOS intent keys exist for all locales
function validateContentOSIntents(): void {
  for (const locale of locales) {
    const filePath = path.join(messagesRoot, locale, 'contentOS.json');
    if (!existsSync(filePath)) {
      errors.push(`${filePath}: missing`);
      continue;
    }
    const data = readJson(filePath) as Record<string, unknown>;
    for (const key of CONTENT_OS_INTENT_KEYS) {
      const value = getByPath(data, key);
      if (typeof value !== 'string' || !value.trim()) {
        errors.push(`${filePath}: missing or empty ${key}`);
      }
    }
  }
}

// C) meta.title, meta.description, and primary CTA for each core page
function validateMetaAndCTA(): void {
  const metaPath = path.join(messagesRoot, defaultLocale, 'meta.json');
  if (!existsSync(metaPath)) {
    errors.push(`${metaPath}: missing`);
    return;
  }
  const meta = readJson(metaPath) as Record<string, unknown>;
  for (const key of META_KEYS) {
    const page = meta[key] as Record<string, unknown> | undefined;
    if (!page || typeof page.title !== 'string' || !String(page.title).trim()) {
      errors.push(`meta.json: meta.${key}.title missing or empty`);
    }
    if (
      !page ||
      typeof page.description !== 'string' ||
      !String(page.description).trim()
    ) {
      errors.push(`meta.json: meta.${key}.description missing or empty`);
    }
  }

  const homePath = path.join(messagesRoot, defaultLocale, 'home.json');
  const contactPath = path.join(messagesRoot, defaultLocale, 'contact.json');
  if (existsSync(homePath)) {
    const home = readJson(homePath) as Record<string, unknown>;
    const cta = getByPath(home, 'hero.cta');
    if (typeof cta !== 'string' || !String(cta).trim()) {
      errors.push(`home.json: hero.cta missing or empty (primary CTA)`);
    }
  } else {
    errors.push(`${homePath}: missing`);
  }
  if (existsSync(contactPath)) {
    const contact = readJson(contactPath) as Record<string, unknown>;
    const pathways = getByPath(contact, 'pathways') as
      | Record<string, { cta?: string }>
      | undefined;
    if (pathways && typeof pathways === 'object') {
      for (const [id, p] of Object.entries(pathways)) {
        if (p && typeof p.cta !== 'string') {
          errors.push(`contact.json: pathways.${id}.cta missing or empty`);
        }
      }
    }
    const mailtoLabel = getByPath(contact, 'mailto.buttonLabel');
    if (typeof mailtoLabel !== 'string' || !String(mailtoLabel).trim()) {
      errors.push(`contact.json: mailto.buttonLabel missing or empty`);
    }
  } else {
    errors.push(`${contactPath}: missing`);
  }
}

// D) No placeholder language in default-locale user-facing strings
function validateNoPlaceholders(): void {
  const lowerBlocklist = PLACEHOLDER_BLOCKLIST.map((s) => s.toLowerCase());
  for (const ns of NAMESPACES_TO_SCAN) {
    const filePath = path.join(messagesRoot, defaultLocale, `${ns}.json`);
    if (!existsSync(filePath)) continue;
    const data = readJson(filePath) as Record<string, unknown>;
    const pairs: { path: string; value: string }[] = [];
    collectStringPaths(data, '', pairs);
    for (const { path: keyPath, value } of pairs) {
      const lower = value.toLowerCase();
      for (const fragment of lowerBlocklist) {
        if (lower.includes(fragment)) {
          errors.push(
            `libs/i18n/src/messages/${defaultLocale}/${ns}.json → ${keyPath}: contains blocklisted "${fragment}"`,
          );
          break;
        }
      }
    }
  }
}

validateIntentMap();
validateContentOSIntents();
validateMetaAndCTA();
validateNoPlaceholders();

if (errors.length > 0) {
  const report = [
    'Content OS validation failed. Fix the following and re-run nx run web:content-os-validate.',
    '',
    ...errors,
  ].join('\n');
  throw new Error(report);
}

console.log('Content OS validation passed.');

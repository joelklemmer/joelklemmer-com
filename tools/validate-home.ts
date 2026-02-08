/**
 * Home subsystem validation. Ensures:
 * - No placeholder blocks in home.json
 * - Required Executive Brief CTA presence
 * - Heading outline enforcement (H1 → H2 → H3)
 * - PGF no-duplication checks on Home headings
 * Run: npx tsx --tsconfig tsconfig.base.json tools/validate-home.ts
 */
import path from 'node:path';
import { readFileSync, existsSync } from 'node:fs';
import { defaultLocale } from '@joelklemmer/i18n';

const repoRoot = process.cwd();
const messagesRoot = path.join(repoRoot, 'libs', 'i18n', 'src', 'messages');
const homeScreenPath = path.join(
  repoRoot,
  'libs',
  'screens',
  'src',
  'lib',
  'HomeScreen.tsx',
);

const PLACEHOLDER_BLOCKLIST = [
  'lorem',
  'placeholder',
  'sample',
  'coming soon',
  'tbd',
  'to be added',
  'draft',
];

const errors: string[] = [];

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
    obj.forEach((item, i) => {
      if (typeof item === 'string') {
        out.push({ path: `${prefix}[${i}]`, value: item });
      } else if (typeof item === 'object' && item != null) {
        collectStringPaths(item, `${prefix}[${i}]`, out);
      }
    });
    return;
  }
  if (typeof obj === 'object') {
    for (const [k, v] of Object.entries(obj)) {
      collectStringPaths(v, prefix ? `${prefix}.${k}` : k, out);
    }
  }
}

// Check 1: No placeholder blocks in home.json
function validateNoPlaceholders(): void {
  const homePath = path.join(messagesRoot, defaultLocale, 'home.json');
  if (!existsSync(homePath)) {
    errors.push(`Missing home.json: ${homePath}`);
    return;
  }

  const home = readJson(homePath);
  const lowerBlocklist = PLACEHOLDER_BLOCKLIST.map((s) => s.toLowerCase());
  const pairs: { path: string; value: string }[] = [];
  collectStringPaths(home, '', pairs);

  for (const { path: keyPath, value } of pairs) {
    const lower = value.toLowerCase();
    for (const fragment of lowerBlocklist) {
      if (lower.includes(fragment)) {
        errors.push(
          `[Home] Placeholder block detected: libs/i18n/src/messages/${defaultLocale}/home.json → ${keyPath}: contains blocklisted "${fragment}"`,
        );
        break;
      }
    }
  }

  // Check for empty strings in required fields
  const heroTitle = getByPath(home, 'hero.title');
  const heroLede = getByPath(home, 'hero.lede');
  const heroCta = getByPath(home, 'hero.cta');
  const routesTitle = getByPath(home, 'routes.title');
  const claimsTitle = getByPath(home, 'claims.title');

  if (typeof heroTitle !== 'string' || !heroTitle.trim()) {
    errors.push(
      `[Home] Missing or empty hero.title in home.json (required for H1)`,
    );
  }
  if (typeof heroLede !== 'string' || !heroLede.trim()) {
    errors.push(`[Home] Missing or empty hero.lede in home.json`);
  }
  if (typeof heroCta !== 'string' || !heroCta.trim()) {
    errors.push(`[Home] Missing or empty hero.cta in home.json (required CTA)`);
  }
  if (typeof routesTitle !== 'string' || !routesTitle.trim()) {
    errors.push(
      `[Home] Missing or empty routes.title in home.json (required for H2)`,
    );
  }
  if (typeof claimsTitle !== 'string' || !claimsTitle.trim()) {
    errors.push(
      `[Home] Missing or empty claims.title in home.json (required for H2)`,
    );
  }
}

// Check 2: Required Executive Brief CTA presence
function validateExecutiveBriefCTA(): void {
  const homePath = path.join(messagesRoot, defaultLocale, 'home.json');
  if (!existsSync(homePath)) {
    return; // Already reported in validateNoPlaceholders
  }

  const home = readJson(homePath);
  const routeItems = getByPath(home, 'routes.items');

  if (!Array.isArray(routeItems) || routeItems.length === 0) {
    errors.push(
      `[Home] Missing or empty routes.items in home.json (required for Executive Brief CTA)`,
    );
    return;
  }

  const executiveBriefItem = routeItems.find(
    (item: unknown) =>
      typeof item === 'object' &&
      item != null &&
      'path' in item &&
      typeof (item as { path: unknown }).path === 'string' &&
      (item as { path: string }).path.includes('/brief'),
  );

  if (!executiveBriefItem) {
    errors.push(
      `[Home] Required Executive Brief CTA missing: routes.items must include an item with path containing "/brief"`,
    );
    return;
  }

  const briefItem = executiveBriefItem as {
    title?: unknown;
    description?: unknown;
    path?: unknown;
  };

  if (typeof briefItem.title !== 'string' || !briefItem.title.trim()) {
    errors.push(
      `[Home] Executive Brief route item missing or empty title in home.json`,
    );
  }
  if (
    typeof briefItem.description !== 'string' ||
    !briefItem.description.trim()
  ) {
    errors.push(
      `[Home] Executive Brief route item missing or empty description in home.json`,
    );
  }
}

// Check 3: Heading outline enforcement (H1 → H2 → H3)
function validateHeadingOutline(): void {
  if (!existsSync(homeScreenPath)) {
    errors.push(`[Home] Missing HomeScreen.tsx: ${homeScreenPath}`);
    return;
  }

  const homeScreenContent = readFileSync(homeScreenPath, 'utf-8');

  // Check that HeroSection is used (which renders H1)
  if (!homeScreenContent.includes('HeroSection')) {
    errors.push(
      `[Home] Heading outline violation: HeroSection must be used to render H1`,
    );
  }

  // Check that HeroSection receives title prop (required for H1)
  if (!homeScreenContent.includes("title={t('hero.title')}")) {
    errors.push(
      `[Home] Heading outline violation: HeroSection must receive title prop from hero.title`,
    );
  }

  // Check that sections use H2 (executiveBrief, routes, claims, doctrine)
  // These are rendered via ListSection, VerificationRailsSection, etc. which use H2
  // We verify by checking that these components are used and have title props

  // Check that VerificationRailsSection is used for routes (renders H2)
  if (
    homeScreenContent.includes('VerificationRailsSection') &&
    !homeScreenContent.includes("title={t('routes.title')}")
  ) {
    errors.push(
      `[Home] Heading outline violation: VerificationRailsSection must receive title prop from routes.title`,
    );
  }

  // Check that ListSection is used for claims (renders H2)
  if (
    homeScreenContent.includes('ListSection') &&
    !homeScreenContent.includes("title={t('claims.title')}")
  ) {
    errors.push(
      `[Home] Heading outline violation: ListSection for claims must receive title prop from claims.title`,
    );
  }

  // Verify H1 is rendered first (HeroSection should be first in HOME_IA_ORDER)
  if (!homeScreenContent.includes("'hero'")) {
    errors.push(
      `[Home] Heading outline violation: Hero section (H1) must be first in HOME_IA_ORDER`,
    );
  } else {
    // Check that hero is first in HOME_IA_ORDER
    const iaOrderMatch = homeScreenContent.match(
      /HOME_IA_ORDER:\s*SectionId\[\]\s*=\s*\[([^\]]+)\]/,
    );
    if (iaOrderMatch) {
      const order = iaOrderMatch[1];
      if (!order.trim().startsWith("'hero'")) {
        errors.push(
          `[Home] Heading outline violation: Hero must be first in HOME_IA_ORDER (H1 must come before H2 sections)`,
        );
      }
    }
  }
}

// Check 4: PGF no-duplication checks on Home headings
function validatePGFNoDuplication(): void {
  const metaPath = path.join(messagesRoot, defaultLocale, 'meta.json');
  const homePath = path.join(messagesRoot, defaultLocale, 'home.json');

  if (!existsSync(metaPath)) {
    errors.push(`[Home] Missing meta.json: ${metaPath}`);
    return;
  }
  if (!existsSync(homePath)) {
    return; // Already reported
  }

  const meta = readJson(metaPath);
  const home = readJson(homePath);

  // Get Home H1 (meta.home.title)
  const homeH1 = (meta.home as Record<string, unknown> | undefined)?.title as
    | string
    | undefined;
  const homeLede = (meta.home as Record<string, unknown> | undefined)
    ?.description as string | undefined;

  if (!homeH1 || !homeH1.trim()) {
    errors.push(`[Home] Missing meta.home.title (H1)`);
    return;
  }

  // Check that Home H1 doesn't duplicate other page H1s
  const CORE_META_KEYS = [
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

  for (const key of CORE_META_KEYS) {
    const page = meta[key] as Record<string, unknown> | undefined;
    const otherTitle =
      page && typeof page.title === 'string' ? page.title.trim() : '';
    if (otherTitle && otherTitle === homeH1.trim()) {
      errors.push(
        `[Home] PGF duplication: Home H1 "${homeH1}" duplicates ${key} page H1. File: ${metaPath}`,
      );
    }
    const otherLede =
      page && typeof page.description === 'string'
        ? page.description.trim()
        : '';
    if (otherLede && otherLede === homeLede?.trim()) {
      errors.push(
        `[Home] PGF duplication: Home lede duplicates ${key} page lede. File: ${metaPath}`,
      );
    }
  }

  // Check that Home H2 section headings don't duplicate other page H1s or ledes
  const routesTitle = getByPath(home, 'routes.title') as string | undefined;
  const claimsTitle = getByPath(home, 'claims.title') as string | undefined;

  if (routesTitle) {
    const trimmed = routesTitle.trim();
    for (const key of CORE_META_KEYS) {
      const page = meta[key] as Record<string, unknown> | undefined;
      const otherTitle =
        page && typeof page.title === 'string' ? page.title.trim() : '';
      const otherLede =
        page && typeof page.description === 'string'
          ? page.description.trim()
          : '';
      if (otherTitle === trimmed) {
        errors.push(
          `[Home] PGF duplication: Home H2 "routes.title" ("${trimmed}") duplicates ${key} page H1. File: ${homePath}`,
        );
      }
      if (otherLede === trimmed) {
        errors.push(
          `[Home] PGF duplication: Home H2 "routes.title" ("${trimmed}") duplicates ${key} page lede. File: ${homePath}`,
        );
      }
    }
  }

  if (claimsTitle) {
    const trimmed = claimsTitle.trim();
    for (const key of CORE_META_KEYS) {
      const page = meta[key] as Record<string, unknown> | undefined;
      const otherTitle =
        page && typeof page.title === 'string' ? page.title.trim() : '';
      const otherLede =
        page && typeof page.description === 'string'
          ? page.description.trim()
          : '';
      if (otherTitle === trimmed) {
        errors.push(
          `[Home] PGF duplication: Home H2 "claims.title" ("${trimmed}") duplicates ${key} page H1. File: ${homePath}`,
        );
      }
      if (otherLede === trimmed) {
        errors.push(
          `[Home] PGF duplication: Home H2 "claims.title" ("${trimmed}") duplicates ${key} page lede. File: ${homePath}`,
        );
      }
    }
  }

  // Check Executive Brief section H2 (from routes.items)
  const routeItems = getByPath(home, 'routes.items') as
    | Array<{ title?: unknown; path?: unknown }>
    | undefined;
  if (Array.isArray(routeItems)) {
    const briefItem = routeItems.find(
      (item) =>
        typeof item === 'object' &&
        item != null &&
        'path' in item &&
        typeof item.path === 'string' &&
        item.path.includes('/brief'),
    );
    if (briefItem && typeof briefItem.title === 'string') {
      const briefTitle = briefItem.title.trim();
      for (const key of CORE_META_KEYS) {
        const page = meta[key] as Record<string, unknown> | undefined;
        const otherTitle =
          page && typeof page.title === 'string' ? page.title.trim() : '';
        const otherLede =
          page && typeof page.description === 'string'
            ? page.description.trim()
            : '';
        if (otherTitle === briefTitle) {
          errors.push(
            `[Home] PGF duplication: Executive Brief section H2 ("${briefTitle}") duplicates ${key} page H1. File: ${homePath}`,
          );
        }
        if (otherLede === briefTitle) {
          errors.push(
            `[Home] PGF duplication: Executive Brief section H2 ("${briefTitle}") duplicates ${key} page lede. File: ${homePath}`,
          );
        }
      }
    }
  }
}

// Run all validations
validateNoPlaceholders();
validateExecutiveBriefCTA();
validateHeadingOutline();
validatePGFNoDuplication();

if (errors.length > 0) {
  const report = [
    'Home subsystem validation failed. Fix the following and re-run nx run web:home-validate.',
    '',
    ...errors,
  ].join('\n');
  throw new Error(report);
}

console.log('Home subsystem validation passed.');

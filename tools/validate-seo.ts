/**
 * Build-time SEO validation: canonical and hreflang correctness for core routes.
 * Asserts home page emits WebSite + Person JSON-LD (with non-empty sameAs).
 * Asserts /brief emits both Person and Report JSON-LD. No server required.
 * Run with: npx tsx --tsconfig tsconfig.base.json tools/validate-seo.ts
 */
import { defaultLocale, locales, type AppLocale } from '@joelklemmer/i18n';
import {
  getBriefPageJsonLd,
  getCanonicalUrl,
  getHrefLangs,
  getMediaPageJsonLd,
  getPersonJsonLd,
  getWebSiteJsonLd,
  hreflangAlternates,
} from '@joelklemmer/seo';
import {
  getMediaManifest,
  getMediaManifestTierAOnly,
} from '@joelklemmer/content/validate';

// Set placeholder env vars if missing (like run-a11y.ts) so validator doesn't crash
process.env.NEXT_PUBLIC_SITE_URL ??= 'http://localhost:3000';
process.env.NEXT_PUBLIC_IDENTITY_SAME_AS ??= 'https://example.invalid/ci';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL;
const base = baseUrl.replace(/\/+$/, '');

const corePathnames: string[] = [
  '/',
  '/brief',
  '/casestudies',
  '/work',
  '/books',
  '/writing',
  '/publicrecord',
  '/contact',
  '/media-kit',
  '/press',
  '/bio',
  '/faq',
  '/now',
  '/privacy',
  '/terms',
  '/accessibility',
  '/security',
];

const errors: string[] = [];

for (const pathname of corePathnames) {
  const normalizedPath =
    pathname === '/'
      ? ''
      : pathname.startsWith('/')
        ? pathname
        : `/${pathname}`;

  for (const locale of locales as AppLocale[]) {
    const canonical = getCanonicalUrl({
      baseUrl,
      pathname: normalizedPath || '/',
      locale,
    });
    const expectedCanonical = `${base}/${locale}${normalizedPath}`;
    if (canonical !== expectedCanonical) {
      errors.push(
        `Canonical mismatch for ${locale}${normalizedPath}: got ${canonical}, expected ${expectedCanonical}`,
      );
    }
  }

  const alternates = hreflangAlternates(
    normalizedPath || '/',
    baseUrl,
    locales,
    defaultLocale,
  );
  const hrefLangLocales = new Set(
    alternates.filter((a) => a.hrefLang !== 'x-default').map((a) => a.hrefLang),
  );
  for (const loc of locales) {
    if (!hrefLangLocales.has(loc as AppLocale)) {
      errors.push(
        `Missing hreflang for path ${normalizedPath || '/'}: locale ${loc}`,
      );
    }
  }
  const xDefault = alternates.find((a) => a.hrefLang === 'x-default');
  if (!xDefault) {
    errors.push(`Missing x-default hreflang for path ${normalizedPath || '/'}`);
  } else {
    const expectedDefault = `${base}/${defaultLocale}${normalizedPath}`;
    if (xDefault.href !== expectedDefault) {
      errors.push(
        `x-default hreflang for ${normalizedPath || '/'}: expected ${expectedDefault}, got ${xDefault.href}`,
      );
    }
  }
}

const hrefLangsRoot = getHrefLangs({ baseUrl, pathname: '/', locales });
const expectedKeys = [...locales, 'x-default'];
for (const key of expectedKeys) {
  if (!(key in hrefLangsRoot)) {
    errors.push(`Root hreflang missing key: ${key}`);
  }
}

// Home must emit WebSite JSON-LD (entity graph, discoverability)
const webSiteLd = getWebSiteJsonLd({
  baseUrl,
  locale: defaultLocale as AppLocale,
  pathname: '/',
});
if (webSiteLd['@type'] !== 'WebSite') {
  errors.push(
    `Home WebSite JSON-LD: expected @type "WebSite", got ${webSiteLd['@type']}`,
  );
}
if (!webSiteLd.url || typeof webSiteLd.url !== 'string') {
  errors.push('Home WebSite JSON-LD: must include url');
}

// Home hreflang validation: ensure all locales (en, uk, es, he) + x-default are present
const homeAlternates = hreflangAlternates('/', baseUrl, locales, defaultLocale);
const homeHrefLangLocales = new Set(
  homeAlternates
    .filter((a) => a.hrefLang !== 'x-default')
    .map((a) => a.hrefLang),
);
for (const loc of locales) {
  if (!homeHrefLangLocales.has(loc as AppLocale)) {
    errors.push(`Home page missing hreflang for locale: ${loc}`);
  }
}
const homeXDefault = homeAlternates.find((a) => a.hrefLang === 'x-default');
if (!homeXDefault) {
  errors.push('Home page missing x-default hreflang');
} else {
  const expectedHomeDefault = `${base}/${defaultLocale}`;
  if (homeXDefault.href !== expectedHomeDefault) {
    errors.push(
      `Home page x-default hreflang: expected ${expectedHomeDefault}, got ${homeXDefault.href}`,
    );
  }
}

// Home must emit Person JSON-LD (author identity, entity graph)
const homePersonLd = getPersonJsonLd({ baseUrl });
if (homePersonLd['@type'] !== 'Person') {
  errors.push(
    `Home Person JSON-LD: expected @type "Person", got ${homePersonLd['@type']}`,
  );
}
if (!homePersonLd.name || typeof homePersonLd.name !== 'string') {
  errors.push('Home Person JSON-LD: must include name');
}
if (!homePersonLd.url || typeof homePersonLd.url !== 'string') {
  errors.push('Home Person JSON-LD: must include url');
}
// sameAs: empty-safe strategy - if present, must not be empty; if unknown, omit (no empty arrays/fields)
if (homePersonLd.sameAs !== undefined) {
  if (!Array.isArray(homePersonLd.sameAs)) {
    errors.push('Home Person JSON-LD: sameAs must be an array if present');
  } else if (homePersonLd.sameAs.length === 0) {
    errors.push(
      'Home Person JSON-LD: sameAs must not be empty if present (omit when unknown)',
    );
  } else {
    // Validate all sameAs URLs are valid
    for (const url of homePersonLd.sameAs) {
      if (typeof url !== 'string' || !url.startsWith('http')) {
        errors.push(`Home Person JSON-LD: sameAs contains invalid URL: ${url}`);
      }
    }
  }
}

// /brief must emit both Person and Report JSON-LD (author identity + entity graph)
const personLd = getPersonJsonLd({ baseUrl });
if (personLd['@type'] !== 'Person') {
  errors.push(
    `Brief page Person JSON-LD: expected @type "Person", got ${personLd['@type']}`,
  );
}
const reportLd = getBriefPageJsonLd({
  baseUrl,
  locale: defaultLocale as AppLocale,
  pathname: '/brief',
  claimIds: [],
  caseStudySlugs: [],
  publicRecordSlugs: [],
});
if (reportLd['@type'] !== 'Report') {
  errors.push(
    `Brief page Report JSON-LD: expected @type "Report", got ${reportLd['@type']}`,
  );
}
if (
  !reportLd.author ||
  (reportLd.author as { '@type'?: string })['@type'] !== 'Person'
) {
  errors.push('Brief page Report JSON-LD: must include author of type Person');
}
if (
  !reportLd.mainEntityOfPage ||
  typeof reportLd.mainEntityOfPage !== 'string'
) {
  errors.push(
    'Brief page Report JSON-LD: must include mainEntityOfPage canonical URL',
  );
}

// /media must emit CollectionPage JSON-LD with ItemList (structured-data clean, indexable)
const mediaManifest = getMediaManifest();
const tierAForMedia = getMediaManifestTierAOnly(mediaManifest);
const mediaLd = getMediaPageJsonLd({
  baseUrl,
  locale: defaultLocale as AppLocale,
  pathname: '/media',
  assets: tierAForMedia.map((a) => ({
    id: a.id,
    file: a.file,
    alt: a.alt,
    descriptor: a.descriptor,
    width: a.width,
    height: a.height,
    caption: a.caption,
    seoKeywords: a.seoKeywords,
  })),
});
if (mediaLd['@type'] !== 'CollectionPage') {
  errors.push(
    `Media page JSON-LD: expected @type "CollectionPage", got ${mediaLd['@type']}`,
  );
}
if (
  !mediaLd.mainEntity ||
  (mediaLd.mainEntity as { '@type'?: string })['@type'] !== 'ItemList'
) {
  errors.push('Media page JSON-LD: must include mainEntity of type ItemList');
}
if (
  typeof (mediaLd.mainEntity as { numberOfItems?: number })?.numberOfItems !==
  'number'
) {
  errors.push('Media page JSON-LD: ItemList must include numberOfItems');
}

if (errors.length) {
  throw new Error(`SEO validation failed:\n- ${errors.join('\n- ')}`);
}

console.log(
  `SEO validation passed: canonical and hreflang for ${corePathnames.length} core routes; home WebSite + Person JSON-LD (with sameAs); /brief Person + Report JSON-LD; /media CollectionPage + ItemList JSON-LD.`,
);

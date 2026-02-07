/**
 * Build-time SEO validation: canonical and hreflang correctness for core routes.
 * Validates metadata builder output; no server required.
 * Run with: npx tsx --tsconfig tsconfig.base.json tools/validate-seo.ts
 */
import { defaultLocale, locales, type AppLocale } from '@joelklemmer/i18n';
import {
  getCanonicalUrl,
  getHrefLangs,
  hreflangAlternates,
} from '@joelklemmer/seo';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
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

if (errors.length) {
  throw new Error(`SEO validation failed:\n- ${errors.join('\n- ')}`);
}

console.log(
  `SEO validation passed: canonical and hreflang for ${corePathnames.length} core routes.`,
);

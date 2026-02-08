/**
 * Build-time sitemap integrity check. Ensures dynamic public record and
 * case study URLs are included for all locales. Run with:
 *   npx tsx --tsconfig tsconfig.base.json tools/validate-sitemap.ts
 */
import {
  getBookSlugsSync,
  getCaseStudySlugsSync,
  getPublicRecordSlugsSync,
} from '@joelklemmer/content/validate';
import { buildSitemapEntries } from '@joelklemmer/seo';
import { locales } from '@joelklemmer/i18n';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

const indexablePaths = [
  '',
  '/brief',
  '/work',
  '/publicrecord',
  '/books',
  '/writing',
  '/contact',
  '/media',
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

const publicRecordSlugs = getPublicRecordSlugsSync();
const caseStudySlugs = getCaseStudySlugsSync();
const bookSlugs = getBookSlugsSync();

const entries = buildSitemapEntries({
  baseUrl,
  locales,
  indexablePaths,
  publicRecordSlugs,
  caseStudySlugs,
  bookSlugs,
});

const urlSet = new Set(entries.map((e) => e.url));
if (urlSet.size !== entries.length) {
  errors.push(
    `Sitemap has duplicate URLs: ${entries.length} entries but ${urlSet.size} unique`,
  );
}

const expectedPerLocale =
  indexablePaths.length +
  publicRecordSlugs.length +
  caseStudySlugs.length +
  bookSlugs.length;
const expectedTotal = locales.length * expectedPerLocale;
if (entries.length !== expectedTotal) {
  errors.push(
    `Expected ${expectedTotal} sitemap entries (${locales.length} locales × ${expectedPerLocale} paths), got ${entries.length}`,
  );
}

for (const locale of locales) {
  const prefix = `${baseUrl}/${locale}`;
  const localeUrls = entries.filter((e) => e.url.startsWith(prefix));
  if (localeUrls.length !== expectedPerLocale) {
    errors.push(
      `Locale ${locale}: expected ${expectedPerLocale} URLs, got ${localeUrls.length}`,
    );
  }
  for (const slug of publicRecordSlugs) {
    const url = `${prefix}/publicrecord/${slug}`;
    if (!urlSet.has(url)) {
      errors.push(`Missing sitemap URL: ${url}`);
    }
  }
  for (const slug of caseStudySlugs) {
    const url = `${prefix}/casestudies/${slug}`;
    if (!urlSet.has(url)) {
      errors.push(`Missing sitemap URL: ${url}`);
    }
  }
  for (const slug of bookSlugs) {
    const url = `${prefix}/books/${slug}`;
    if (!urlSet.has(url)) {
      errors.push(`Missing sitemap URL: ${url}`);
    }
  }
}

if (errors.length) {
  throw new Error(`Sitemap validation failed:\n- ${errors.join('\n- ')}`);
}

console.log(
  `Sitemap validation passed: ${entries.length} URLs across ${locales.length} locales.`,
);

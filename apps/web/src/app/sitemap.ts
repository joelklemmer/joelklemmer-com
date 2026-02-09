import type { MetadataRoute } from 'next';
import {
  getBookSlugs,
  getCaseStudySlugs,
  getPublicRecordSlugs,
  getWritingSlugs,
} from '@joelklemmer/content';
import { buildSitemapEntries } from '@joelklemmer/seo';
import { routing } from '../i18n/routing';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [publicRecordSlugs, caseStudySlugs, bookSlugs, writingSlugs] =
    await Promise.all([
      getPublicRecordSlugs(),
      getCaseStudySlugs(),
      getBookSlugs(),
      getWritingSlugs(),
    ]);
  const entries = buildSitemapEntries({
    baseUrl,
    locales: routing.locales,
    publicRecordSlugs,
    caseStudySlugs,
    bookSlugs,
    writingSlugs,
  });
  const base = baseUrl.replace(/\/+$/, '');
  const highPrioritySegments = ['brief', 'work', 'writing', 'proof', 'contact'];
  return entries.map((entry) => {
    const afterBase = entry.url.replace(`${base}/`, '');
    const pathSegment = afterBase.replace(/^[a-z]{2}\b\/?/, '') ?? '';
    const isHome = routing.locales.some(
      (loc) =>
        entry.url === `${base}/${loc}` || entry.url === `${base}/${loc}/`,
    );
    const firstSegment = pathSegment.split('/')[0] ?? '';
    const isHighPriority =
      firstSegment.length > 0 && highPrioritySegments.includes(firstSegment);
    const priority = isHome ? 1 : isHighPriority ? 0.9 : 0.8;
    const changeFrequency =
      pathSegment.startsWith('writing/') || pathSegment.startsWith('books/')
        ? ('monthly' as const)
        : ('weekly' as const);
    return {
      ...entry,
      changeFrequency,
      priority,
    };
  });
}

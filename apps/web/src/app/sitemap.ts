import type { MetadataRoute } from 'next';
import {
  getCaseStudySlugs,
  getPublicRecordSlugs,
} from '@joelklemmer/content';
import { buildSitemapEntries } from '@joelklemmer/seo';
import { routing } from '../i18n/routing';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [publicRecordSlugs, caseStudySlugs] = await Promise.all([
    getPublicRecordSlugs(),
    getCaseStudySlugs(),
  ]);
  return buildSitemapEntries({
    baseUrl,
    locales: routing.locales,
    publicRecordSlugs,
    caseStudySlugs,
  });
}

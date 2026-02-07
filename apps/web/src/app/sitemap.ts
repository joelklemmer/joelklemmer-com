import type { MetadataRoute } from 'next';
import { getCaseStudyEntries, getPublicRecordEntries } from '@joelklemmer/content';
import { routing } from '../i18n/routing';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

const indexablePaths = [
  '',
  '/brief',
  '/work',
  '/publicrecord',
  '/writing',
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

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();
  const caseStudies = await getCaseStudyEntries();
  const publicRecords = await getPublicRecordEntries();
  const caseStudySlugs = Array.from(
    new Set(caseStudies.map((entry) => entry.frontmatter.slug)),
  );
  const publicRecordSlugs = Array.from(
    new Set(publicRecords.map((entry) => entry.frontmatter.slug)),
  );
  const dynamicPaths = [
    ...caseStudySlugs.map((slug) => `/casestudies/${slug}`),
    ...publicRecordSlugs.map((slug) => `/publicrecord/${slug}`),
  ];
  const allPaths = [...indexablePaths, ...dynamicPaths];
  return routing.locales.flatMap((locale) =>
    allPaths.map((path) => ({
      url: `${baseUrl}/${locale}${path}`,
      lastModified,
    })),
  );
}

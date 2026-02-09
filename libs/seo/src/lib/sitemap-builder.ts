/**
 * Pure sitemap entry builder. Used by the Next.js sitemap route and by
 * tools/validate-sitemap.ts to assert expected structure.
 */
export interface SitemapEntry {
  url: string;
  lastModified: Date;
}

export interface BuildSitemapEntriesInput {
  baseUrl: string;
  locales: readonly string[];
  /** Static path segments; defaults to DEFAULT_INDEXABLE_PATHS if omitted. */
  indexablePaths?: string[];
  publicRecordSlugs: string[];
  caseStudySlugs: string[];
  bookSlugs: string[];
  writingSlugs: string[];
  lastModified?: Date;
}

const DEFAULT_INDEXABLE_PATHS = [
  '',
  '/brief',
  '/work',
  '/proof',
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
  '/cookies',
  '/operating-system',
];

export function buildSitemapEntries({
  baseUrl,
  locales,
  indexablePaths = DEFAULT_INDEXABLE_PATHS,
  publicRecordSlugs,
  caseStudySlugs,
  bookSlugs,
  writingSlugs,
  lastModified = new Date(),
}: BuildSitemapEntriesInput): SitemapEntry[] {
  const base = baseUrl.replace(/\/+$/, '');
  const dynamicPaths = [
    ...caseStudySlugs.map((slug) => `/casestudies/${slug}`),
    ...publicRecordSlugs.map((slug) => `/publicrecord/${slug}`),
    ...publicRecordSlugs.map((slug) => `/proof/${slug}`),
    ...bookSlugs.map((slug) => `/books/${slug}`),
    ...writingSlugs.map((slug) => `/writing/${slug}`),
  ];
  const allPaths = [...indexablePaths, ...dynamicPaths];
  return locales.flatMap((locale) =>
    allPaths.map((normalizedPath) => ({
      url: `${base}/${locale}${normalizedPath}`,
      lastModified,
    })),
  );
}

import { createElement } from 'react';
import type { Metadata } from 'next';
import { defaultLocale, locales, type AppLocale } from '@joelklemmer/i18n';
import { getIdentitySameAs } from './identity';

const DEFAULT_SITE_URL = 'http://localhost:3000';
export interface CanonicalUrlOptions {
  baseUrl?: string;
  pathname?: string;
  locale?: AppLocale;
}

export interface HrefLangOptions {
  baseUrl?: string;
  pathname?: string;
  locales?: readonly AppLocale[];
  defaultLocale?: AppLocale;
}

function normalizeBaseUrl(baseUrl?: string) {
  const resolvedBaseUrl =
    baseUrl ?? process.env.NEXT_PUBLIC_SITE_URL ?? DEFAULT_SITE_URL;
  return resolvedBaseUrl.replace(/\/+$/, '');
}

function normalizePathname(pathname?: string) {
  if (!pathname || pathname === '/') {
    return '';
  }

  return pathname.startsWith('/') ? pathname : `/${pathname}`;
}

export function getCanonicalUrl({
  baseUrl,
  pathname = '/',
  locale = defaultLocale,
}: CanonicalUrlOptions = {}) {
  const siteUrl = normalizeBaseUrl(baseUrl);
  const normalizedPath = normalizePathname(pathname);

  return `${siteUrl}/${locale}${normalizedPath}`;
}

export function getHrefLangs({
  baseUrl,
  pathname = '/',
  locales: supportedLocales = locales,
  defaultLocale: fallbackLocale = defaultLocale,
}: HrefLangOptions = {}) {
  const siteUrl = normalizeBaseUrl(baseUrl);
  const normalizedPath = normalizePathname(pathname);

  const entries = supportedLocales.map((locale) => [
    locale,
    `${siteUrl}/${locale}${normalizedPath}`,
  ]);

  return Object.fromEntries([
    ...entries,
    ['x-default', `${siteUrl}/${fallbackLocale}${normalizedPath}`],
  ]);
}

export function canonicalUrl(
  locale: AppLocale,
  pathname = '/',
  baseUrl?: string,
) {
  return getCanonicalUrl({ locale, pathname, baseUrl });
}

export type HreflangAlternate = {
  hrefLang: AppLocale | 'x-default';
  href: string;
};

export function hreflangAlternates(
  pathname = '/',
  baseUrl?: string,
  supportedLocales: readonly AppLocale[] = locales,
  fallbackLocale: AppLocale = defaultLocale,
): HreflangAlternate[] {
  const hrefLangs = getHrefLangs({
    baseUrl,
    pathname,
    locales: supportedLocales,
    defaultLocale: fallbackLocale,
  }) as Record<string, string>;

  return Object.entries(hrefLangs).map(([hrefLang, href]) => ({
    hrefLang: hrefLang as HreflangAlternate['hrefLang'],
    href,
  }));
}

export interface PageMetadataInput {
  title: string;
  description: string;
  locale: AppLocale;
  pathname?: string;
  baseUrl?: string;
  canonicalLocale?: AppLocale;
  canonicalOverride?: string;
  /** OG image slug (e.g. 'home', 'brief'); image at /media/og/joel-klemmer__og__{slug}__2026-01__01.webp */
  ogImageSlug?: string;
  /** Optional critical preload links (e.g. LCP hero image). Merged into metadata links when supported. */
  criticalPreloadLinks?: CriticalPreloadLink[];
}

const OG_IMAGE_BASENAME = 'joel-klemmer__og__';
const OG_IMAGE_SUFFIX = '__2026-01__01.webp';

/** Link descriptor for preload (e.g. LCP image). Rendered as <link> in head when passed via metadata. */
export type CriticalPreloadLink = {
  rel: 'preload';
  as: 'image';
  href: string;
  fetchPriority?: 'high';
};

/**
 * Critical resource preloads for performance perception (LCP, briefing-critical content).
 * Use in page generateMetadata(); merge into metadata.links when your Next version supports it.
 * Preload only the LCP image for that route.
 */
export function getCriticalPreloadLinks(options: {
  /** Absolute path for LCP/hero image (e.g. /media/portraits/hero.webp). Preloads as image with high priority. */
  heroImageHref?: string;
}): CriticalPreloadLink[] {
  const links: CriticalPreloadLink[] = [];
  if (options.heroImageHref) {
    links.push({
      rel: 'preload',
      as: 'image',
      href: options.heroImageHref,
      fetchPriority: 'high',
    });
  }
  return links;
}

export function createPageMetadata({
  title,
  description,
  locale,
  pathname = '/',
  baseUrl,
  canonicalLocale,
  canonicalOverride,
  ogImageSlug,
  criticalPreloadLinks,
}: PageMetadataInput): Metadata {
  const descriptionValue =
    description?.trim() ||
    'Authority verification ecosystem for executive evaluation and institutional review.';
  const siteUrl = normalizeBaseUrl(baseUrl);
  const canonical =
    canonicalOverride ??
    getCanonicalUrl({
      baseUrl,
      pathname,
      locale: canonicalLocale ?? locale,
    });
  const languages = Object.fromEntries(
    hreflangAlternates(pathname, baseUrl).map((alt) => [
      alt.hrefLang,
      alt.href,
    ]),
  );
  // When baseUrl is set, emit canonical + languages. When undefined, omit alternates
  // so root layout's generateMetadata (request-based canonical) is not overwritten and LHCI passes.
  const alternates = baseUrl ? { canonical, languages } : undefined;
  const openGraph: {
    title: string;
    description: string;
    url: string;
    siteName: string;
    locale: string;
    type: 'website';
    images?: Array<{
      url: string;
      width?: number;
      height?: number;
      alt?: string;
    }>;
  } = {
    title,
    description: descriptionValue,
    url: canonical,
    siteName: title,
    locale,
    type: 'website',
  };
  if (ogImageSlug) {
    openGraph.images = [
      {
        url: `${siteUrl}/media/og/${OG_IMAGE_BASENAME}${ogImageSlug}${OG_IMAGE_SUFFIX}`,
        width: 1200,
        height: 630,
        alt: title,
      },
    ];
  }

  const twitter = {
    card: 'summary_large_image' as const,
    title,
    description: descriptionValue,
    ...(ogImageSlug && {
      images: [
        `${siteUrl}/media/og/${OG_IMAGE_BASENAME}${ogImageSlug}${OG_IMAGE_SUFFIX}`,
      ],
    }),
  };

  const metadata: Metadata = {
    title,
    description: descriptionValue,
    ...(alternates && { alternates }),
    openGraph,
    twitter,
  };
  if (criticalPreloadLinks?.length) {
    (metadata as Record<string, unknown>).links = [
      ...(((metadata as Record<string, unknown>)
        .links as CriticalPreloadLink[]) ?? []),
      ...criticalPreloadLinks,
    ];
  }
  return metadata;
}

export interface PersonJsonLdProps {
  baseUrl?: string;
  sameAs?: string[];
}

/**
 * Build a mailto URL with encoded subject and optional body.
 * Uses encodeURIComponent for subject and body. Safe for use in links; no external services.
 */
export function buildMailtoUrl(
  email: string | undefined,
  subject: string,
  body?: string,
): string {
  const params = new URLSearchParams();
  params.set('subject', subject);
  if (body) {
    params.set('body', body);
  }
  const query = params.toString();
  const base = email ? `mailto:${email}` : 'mailto:';
  return query ? `${base}?${query}` : base;
}

/** Canonical @id for the Person entity (authority identity). Use for sameAs consolidation. */
export function getPersonId(
  baseUrl?: string,
  locale: AppLocale = defaultLocale,
) {
  const url = normalizeBaseUrl(baseUrl);
  return `${url}/${locale}#person`;
}

export function getPersonJsonLd({ baseUrl, sameAs }: PersonJsonLdProps = {}) {
  const url = normalizeBaseUrl(baseUrl);
  const sameAsUrls = sameAs ?? getIdentitySameAs();
  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': getPersonId(baseUrl),
    name: 'Joel Robert Klemmer',
    alternateName: 'Joel R. Klemmer',
    url,
  };
  if (sameAsUrls.length > 0) {
    jsonLd.sameAs = sameAsUrls;
  }
  return jsonLd;
}

export function PersonJsonLd({ baseUrl, sameAs }: PersonJsonLdProps) {
  const jsonLd = getPersonJsonLd({ baseUrl, sameAs });
  return createElement('script', {
    type: 'application/ld+json',
    dangerouslySetInnerHTML: { __html: JSON.stringify(jsonLd) },
  });
}

export interface WebSiteJsonLdProps {
  baseUrl?: string;
  locale?: AppLocale;
  pathname?: string;
  /** Site name for schema.org WebSite; defaults to authority name. */
  name?: string;
}

const WEB_SITE_JSON_LD_NAME = 'Joel R. Klemmer';

/**
 * JSON-LD for the site root: WebSite with url and name for entity graph and discoverability.
 */
/** Canonical @id for the Organization entity (site authority). */
export function getOrganizationId(baseUrl?: string) {
  const url = normalizeBaseUrl(baseUrl);
  return `${url}/#organization`;
}

export interface OrganizationJsonLdProps {
  baseUrl?: string;
  name?: string;
  sameAs?: string[];
}

/**
 * JSON-LD for the site authority: Organization with sameAs for identity consolidation.
 */
export function getOrganizationJsonLd({
  baseUrl,
  name = WEB_SITE_JSON_LD_NAME,
  sameAs,
}: OrganizationJsonLdProps = {}) {
  const siteUrl = normalizeBaseUrl(baseUrl);
  const sameAsUrls = sameAs ?? getIdentitySameAs();
  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': getOrganizationId(baseUrl),
    name,
    url: siteUrl,
  };
  if (sameAsUrls.length > 0) {
    jsonLd.sameAs = sameAsUrls;
  }
  return jsonLd;
}

export function OrganizationJsonLd(props: OrganizationJsonLdProps) {
  const jsonLd = getOrganizationJsonLd(props);
  return createElement('script', {
    type: 'application/ld+json',
    dangerouslySetInnerHTML: { __html: JSON.stringify(jsonLd) },
  });
}

/** Map AppLocale to schema.org inLanguage (BCP 47). */
function localeToInLanguage(locale: AppLocale): string {
  const map: Record<string, string> = {
    en: 'en',
    es: 'es',
    he: 'he',
    uk: 'uk',
  };
  return map[locale] ?? locale;
}

export function getWebSiteJsonLd({
  baseUrl,
  locale = defaultLocale,
  pathname = '/',
  name = WEB_SITE_JSON_LD_NAME,
}: WebSiteJsonLdProps = {}) {
  const siteUrl = normalizeBaseUrl(baseUrl);
  const url = getCanonicalUrl({
    baseUrl: siteUrl,
    pathname: pathname.startsWith('/') ? pathname : `/${pathname}`,
    locale,
  });
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name,
    url,
    inLanguage: localeToInLanguage(locale),
    publisher: { '@id': getOrganizationId(baseUrl) },
  };
}

export function WebSiteJsonLd(props: WebSiteJsonLdProps) {
  const jsonLd = getWebSiteJsonLd(props);
  return createElement('script', {
    type: 'application/ld+json',
    dangerouslySetInnerHTML: { __html: JSON.stringify(jsonLd) },
  });
}

export interface BriefPageJsonLdProps {
  baseUrl?: string;
  locale: AppLocale;
  pathname?: string;
  /** Claim IDs (for #claim-* anchors) */
  claimIds: string[];
  /** Case study slugs (for /casestudies/[slug]) */
  caseStudySlugs: string[];
  /** Public record slugs (for /publicrecord/[slug]) */
  publicRecordSlugs: string[];
}

/**
 * JSON-LD for the Executive Brief page: Report with author, mainEntityOfPage, about, mentions.
 * Uses canonical URLs per locale. Author references the same Person as Person JSON-LD.
 */
export function getBriefPageJsonLd({
  baseUrl,
  locale,
  pathname = '/brief',
  claimIds,
  caseStudySlugs,
  publicRecordSlugs,
}: BriefPageJsonLdProps) {
  const siteUrl = normalizeBaseUrl(baseUrl);
  const normalizedPath = pathname.startsWith('/') ? pathname : `/${pathname}`;
  const mainEntityOfPage = getCanonicalUrl({
    baseUrl: siteUrl,
    pathname: normalizedPath,
    locale,
  });

  const about: string[] = [
    ...claimIds.map((id) => `${mainEntityOfPage}#claim-${id}`),
    ...caseStudySlugs.map((slug) =>
      getCanonicalUrl({
        baseUrl: siteUrl,
        pathname: `/casestudies/${slug}`,
        locale,
      }),
    ),
    ...publicRecordSlugs.map((slug) =>
      getCanonicalUrl({
        baseUrl: siteUrl,
        pathname: `/publicrecord/${slug}`,
        locale,
      }),
    ),
  ].filter(Boolean);

  const personId = getPersonId(siteUrl, locale);
  const author = { '@type': 'Person' as const, '@id': personId };

  return {
    '@context': 'https://schema.org',
    '@type': 'Report',
    name: 'Executive Brief',
    url: mainEntityOfPage,
    mainEntityOfPage,
    author,
    ...(about.length > 0 && {
      about: about.map((url) => ({ '@type': 'Thing', url })),
    }),
    ...(about.length > 0 && {
      mentions: about.map((url) => ({ '@type': 'Thing', url })),
    }),
  };
}

export function BriefPageJsonLd(props: BriefPageJsonLdProps) {
  const jsonLd = getBriefPageJsonLd(props);
  return createElement('script', {
    type: 'application/ld+json',
    dangerouslySetInnerHTML: { __html: JSON.stringify(jsonLd) },
  });
}

export interface MediaPageJsonLdProps {
  baseUrl?: string;
  locale: AppLocale;
  pathname?: string;
  /** Sitemap-eligible assets (Tier A + B) for ItemList */
  assets: Array<{
    id: string;
    file: string;
    alt: string;
    descriptor: string;
    width: number;
    height: number;
    caption?: string;
    seoKeywords?: string[];
  }>;
}

/**
 * JSON-LD for Media Library page: CollectionPage with ItemList of ImageObject.
 * Phase II: creator, creditText, acquireLicensePage, representativeOfPage; Person entity linkage.
 */
export function getMediaPageJsonLd({
  baseUrl,
  locale,
  pathname = '/media',
  assets,
}: MediaPageJsonLdProps) {
  const siteUrl = normalizeBaseUrl(baseUrl);
  const pageUrl = getCanonicalUrl({
    baseUrl: siteUrl,
    pathname,
    locale,
  });
  const personLd = getPersonJsonLd({ baseUrl: siteUrl });
  const licenseUrl = `${siteUrl}/${locale}/terms`;
  const personId = getPersonId(siteUrl, locale);
  const creator = {
    '@type': 'Person' as const,
    '@id': personId,
    name: personLd.name as string,
  };
  const creditText = 'Joel R. Klemmer';
  const itemListElement = assets.map((asset) => {
    const contentUrl = asset.file.startsWith('http')
      ? asset.file
      : `${siteUrl}${asset.file}`;
    const keywords = asset.seoKeywords?.length
      ? asset.seoKeywords
      : asset.descriptor
        ? [asset.descriptor.replace(/-/g, ' ')]
        : undefined;
    return {
      '@type': 'ImageObject' as const,
      '@id': `${pageUrl}#${encodeURIComponent(asset.id)}`,
      contentUrl,
      name: asset.alt.slice(0, 80),
      description: asset.caption ?? asset.alt,
      creator,
      creditText,
      license: licenseUrl,
      acquireLicensePage: licenseUrl,
      representativeOfPage: false,
      width: asset.width,
      height: asset.height,
      ...(keywords?.length && { keywords: keywords.join(', ') }),
    };
  });
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    url: pageUrl,
    name: 'Media Library',
    description:
      'Official imagery archive for authority verification and press use.',
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: itemListElement.length,
      itemListElement,
    },
  };
}

export function MediaPageJsonLd(props: MediaPageJsonLdProps) {
  const jsonLd = getMediaPageJsonLd(props);
  return createElement('script', {
    type: 'application/ld+json',
    dangerouslySetInnerHTML: { __html: JSON.stringify(jsonLd) },
  });
}

// ——— Book ———

export interface BookJsonLdProps {
  baseUrl?: string;
  locale: AppLocale;
  pathname: string;
  name: string;
  description?: string;
  author?: string;
  publisher?: string;
  datePublished?: string;
  isbn?: string;
  url?: string;
}

/**
 * JSON-LD for a book page: schema.org Book with author (Person @id) and publisher.
 */
export function getBookJsonLd({
  baseUrl,
  locale,
  pathname,
  name,
  description,
  author = 'Joel R. Klemmer',
  publisher,
  datePublished,
  isbn,
  url,
}: BookJsonLdProps) {
  const siteUrl = normalizeBaseUrl(baseUrl);
  const pageUrl =
    url ??
    getCanonicalUrl({
      baseUrl: siteUrl,
      pathname: pathname.startsWith('/') ? pathname : `/${pathname}`,
      locale,
    });
  const personId = getPersonId(siteUrl, locale);
  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Book',
    name,
    url: pageUrl,
    author: { '@type': 'Person' as const, '@id': personId },
  };
  if (description) jsonLd.description = description;
  if (publisher) jsonLd.publisher = publisher;
  if (datePublished) jsonLd.datePublished = datePublished;
  if (isbn) jsonLd.isbn = isbn;
  return jsonLd;
}

export function BookJsonLd(props: BookJsonLdProps) {
  const jsonLd = getBookJsonLd(props);
  return createElement('script', {
    type: 'application/ld+json',
    dangerouslySetInnerHTML: { __html: JSON.stringify(jsonLd) },
  });
}

// ——— Article ———

export interface ArticleJsonLdProps {
  baseUrl?: string;
  locale: AppLocale;
  pathname: string;
  headline: string;
  description?: string;
  datePublished?: string;
  dateModified?: string;
  url?: string;
}

/**
 * JSON-LD for article-like pages (case study, writing post, public record): Article with author Person @id.
 */
export function getArticleJsonLd({
  baseUrl,
  locale,
  pathname,
  headline,
  description,
  datePublished,
  dateModified,
  url,
}: ArticleJsonLdProps) {
  const siteUrl = normalizeBaseUrl(baseUrl);
  const pageUrl =
    url ??
    getCanonicalUrl({
      baseUrl: siteUrl,
      pathname: pathname.startsWith('/') ? pathname : `/${pathname}`,
      locale,
    });
  const personId = getPersonId(siteUrl, locale);
  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline,
    url: pageUrl,
    author: { '@type': 'Person' as const, '@id': personId },
  };
  if (description) jsonLd.description = description;
  if (datePublished) jsonLd.datePublished = datePublished;
  if (dateModified) jsonLd.dateModified = dateModified;
  return jsonLd;
}

export function ArticleJsonLd(props: ArticleJsonLdProps) {
  const jsonLd = getArticleJsonLd(props);
  return createElement('script', {
    type: 'application/ld+json',
    dangerouslySetInnerHTML: { __html: JSON.stringify(jsonLd) },
  });
}

// ——— Breadcrumb ———

export interface BreadcrumbJsonLdProps {
  baseUrl?: string;
  locale: AppLocale;
  /** Path segments (e.g. ['books', 'briefing-and-governance'] for /books/briefing-and-governance). */
  pathSegments: string[];
}

/**
 * JSON-LD BreadcrumbList for a page. pathSegments do not include locale.
 */
export function getBreadcrumbListJsonLd({
  baseUrl,
  locale,
  pathSegments,
}: BreadcrumbJsonLdProps) {
  const siteUrl = normalizeBaseUrl(baseUrl);
  const base = `${siteUrl}/${locale}`;
  const items = [
    { name: 'Home', url: base },
    ...pathSegments.map((segment, i) => {
      const path = '/' + pathSegments.slice(0, i + 1).join('/');
      return { name: segment, url: `${base}${path}` };
    }),
  ].map((item, position) => ({
    '@type': 'ListItem' as const,
    position: position + 1,
    name: item.name,
    item: item.url,
  }));
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items,
  };
}

export function BreadcrumbJsonLd(props: BreadcrumbJsonLdProps) {
  const jsonLd = getBreadcrumbListJsonLd(props);
  return createElement('script', {
    type: 'application/ld+json',
    dangerouslySetInnerHTML: { __html: JSON.stringify(jsonLd) },
  });
}

// ——— ProfilePage ———

export interface ProfilePageJsonLdProps {
  baseUrl?: string;
  locale?: AppLocale;
  pathname?: string;
}

/**
 * JSON-LD for profile/bio page: ProfilePage with mainEntity Person.
 */
export function getProfilePageJsonLd({
  baseUrl,
  locale = defaultLocale,
  pathname = '/bio',
}: ProfilePageJsonLdProps = {}) {
  const siteUrl = normalizeBaseUrl(baseUrl);
  const url = getCanonicalUrl({
    baseUrl: siteUrl,
    pathname: pathname.startsWith('/') ? pathname : `/${pathname}`,
    locale,
  });
  const personId = getPersonId(siteUrl, locale);
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    url,
    mainEntity: { '@id': personId },
  };
}

export function ProfilePageJsonLd(props: ProfilePageJsonLdProps) {
  const jsonLd = getProfilePageJsonLd(props);
  return createElement('script', {
    type: 'application/ld+json',
    dangerouslySetInnerHTML: { __html: JSON.stringify(jsonLd) },
  });
}

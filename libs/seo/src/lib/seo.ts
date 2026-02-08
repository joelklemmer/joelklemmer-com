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
}

const OG_IMAGE_BASENAME = 'joel-klemmer__og__';
const OG_IMAGE_SUFFIX = '__2026-01__01.webp';

export function createPageMetadata({
  title,
  description,
  locale,
  pathname = '/',
  baseUrl,
  canonicalLocale,
  canonicalOverride,
  ogImageSlug,
}: PageMetadataInput): Metadata {
  const canonical =
    canonicalOverride ??
    canonicalUrl(canonicalLocale ?? locale, pathname, baseUrl);
  const siteUrl = normalizeBaseUrl(baseUrl);
  const languages = Object.fromEntries(
    hreflangAlternates(pathname, baseUrl).map((alt) => [
      alt.hrefLang,
      alt.href,
    ]),
  );
  const openGraph: {
    title: string;
    description: string;
    url: string;
    siteName: string;
    locale: string;
    type: 'website';
    images?: { url: string }[];
  } = {
    title,
    description,
    url: canonical,
    siteName: title,
    locale,
    type: 'website',
  };
  if (ogImageSlug) {
    openGraph.images = [
      {
        url: `${siteUrl}/media/og/${OG_IMAGE_BASENAME}${ogImageSlug}${OG_IMAGE_SUFFIX}`,
      },
    ];
  }

  return {
    title,
    description,
    alternates: {
      canonical,
      languages,
    },
    openGraph,
  };
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

export function getPersonJsonLd({ baseUrl, sameAs }: PersonJsonLdProps = {}) {
  const url = normalizeBaseUrl(baseUrl);
  const sameAsUrls = sameAs ?? getIdentitySameAs();
  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Person',
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

  const personLd = getPersonJsonLd({ baseUrl: siteUrl });
  const author = { '@type': 'Person' as const, name: personLd.name };

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
  const personId = `${siteUrl}/${locale}`;
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

import { defaultLocale, locales, type AppLocale } from '@i18n';

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
  });

  return Object.entries(hrefLangs).map(([hrefLang, href]) => ({
    hrefLang: hrefLang as HreflangAlternate['hrefLang'],
    href,
  }));
}

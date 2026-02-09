import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { headers } from 'next/headers';

/** Prevent root layout output from being cached so html lang/dir match each request. */
export const dynamic = 'force-dynamic';

/* Root layout: only sets html lang/dir; exception to route-file import rule. */
// eslint-disable-next-line no-restricted-imports -- root layout
import { defaultLocale, isRtlLocale, type AppLocale } from '@joelklemmer/i18n';
import { themeScript } from './theme-script';
import { LOCALE_HEADER, PATHNAME_HEADER } from '../middleware';
import { routing } from '../i18n/routing';

/** Default meta description for LHCI/SEO when segment metadata is not yet applied. */
const DEFAULT_META_DESCRIPTION =
  'Authority verification ecosystem for executive evaluation and institutional review.';

/** Root metadata: description and canonical from request so LHCI/SEO always see them in initial HTML. */
export async function generateMetadata(): Promise<Metadata> {
  const headerStore = await headers();
  const pathname = headerStore.get(PATHNAME_HEADER);
  const headerLocale = headerStore.get(LOCALE_HEADER);
  const locale: AppLocale = (
    headerLocale && routing.locales.includes(headerLocale as AppLocale)
      ? headerLocale
      : localeFromPathname(pathname)
  ) as AppLocale;
  const safeLocale = locale || defaultLocale;
  const host = headerStore.get('host') ?? 'localhost:3000';
  const proto =
    headerStore.get('x-forwarded-proto')?.split(',')[0]?.trim() ?? 'http';
  const pathForCanonical = pathname ?? `/${safeLocale}`;
  const canonical = `${proto}://${host}${pathForCanonical}`;
  return {
    description: DEFAULT_META_DESCRIPTION,
    alternates: { canonical },
  };
}

/** Authority Design Constitution: Primary stack — Inter Variable. Subset + swap to minimize FOIT/FOUT. */
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
  preload: true,
  adjustFontFallback: true,
});

/** Derive locale from pathname so html lang/dir are deterministic for every request. */
function localeFromPathname(pathname: string | null): AppLocale {
  const segment = pathname?.replace(/^\/+/, '').split('/')[0];
  if (segment && routing.locales.includes(segment as AppLocale)) {
    return segment as AppLocale;
  }
  return defaultLocale;
}

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const headerStore = await headers();
  const pathname = headerStore.get(PATHNAME_HEADER);
  const headerLocale = headerStore.get(LOCALE_HEADER);
  const locale: AppLocale = (
    headerLocale && routing.locales.includes(headerLocale as AppLocale)
      ? headerLocale
      : localeFromPathname(pathname)
  ) as AppLocale;
  const safeLocale = locale || defaultLocale;
  const dir = isRtlLocale(safeLocale) ? 'rtl' : 'ltr';

  return (
    <html lang={safeLocale} dir={dir} className={inter.variable}>
      <head>
        {/* description + canonical from root generateMetadata only (single source for LHCI/SEO) */}
        {/* next/font self-hosts Inter; no external font CDN requests */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}

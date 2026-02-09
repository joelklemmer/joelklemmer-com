import type { ReactNode } from 'react';

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
        {/* next/font self-hosts Inter; no external font CDN requests */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}

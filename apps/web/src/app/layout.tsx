import type { ReactNode } from 'react';

import { Inter } from 'next/font/google';
import { getLocale } from 'next-intl/server';

/* Root layout: only sets html lang/dir; exception to route-file import rule. */
// eslint-disable-next-line no-restricted-imports -- root layout
import { isRtlLocale } from '@joelklemmer/i18n';
import { themeScript } from './theme-script';

/** Authority Design Constitution: Primary stack — Inter Variable. Subset + swap to minimize FOIT/FOUT. */
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
  preload: true,
  adjustFontFallback: true,
});

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const locale = await getLocale();
  const dir = isRtlLocale(locale) ? 'rtl' : 'ltr';

  return (
    <html lang={locale} dir={dir} className={inter.variable}>
      <head>
        {/* next/font self-hosts Inter; no external font CDN requests */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}

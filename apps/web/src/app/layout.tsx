import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

/* Root layout: html lang/dir set by script for cacheability (bf-cache). */
// eslint-disable-next-line no-restricted-imports -- root layout
import { themeScript } from './theme-script';

/** Default meta description; segment metadata (pages) set canonical via getMetadataBaseUrl(). */
const DEFAULT_META_DESCRIPTION =
  'Authority verification ecosystem for executive evaluation and institutional review.';

/** Root metadata: description only. Canonical comes from each segment so pages can be cacheable. */
export function generateMetadata(): Promise<Metadata> {
  return Promise.resolve({ description: DEFAULT_META_DESCRIPTION });
}

/** Authority Design Constitution: Primary stack — Inter Variable. Subset + swap to minimize FOIT/FOUT. */
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
  preload: true,
  adjustFontFallback: true,
});

/** Inline script: set html lang/dir from pathname so root layout can be static (bf-cache). Runs before paint. */
const localeDirScript = `
(function(){
  var m = document.location.pathname.match(/^\\/(en|uk|es|he)(?:\\/|$)/);
  var locale = m ? m[1] : 'en';
  var d = document.documentElement;
  d.lang = locale;
  d.dir = locale === 'he' ? 'rtl' : 'ltr';
})();
`;

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en" dir="ltr" className={inter.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script dangerouslySetInnerHTML={{ __html: localeDirScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}

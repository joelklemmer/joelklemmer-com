import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { Inter } from 'next/font/google';

/* Root layout: html lang/dir set by script for cacheability (bf-cache). */
import { themeScript } from './theme-script';

/** Cookie keys for SSR preference attributes (essential; no consent required for a11y preferences). */
const COOKIE_THEME = 'joelklemmer-theme';
const COOKIE_CONTRAST = 'joelklemmer-contrast';
const COOKIE_DENSITY = 'joelklemmer-density';
const COOKIE_EVALUATOR = 'evaluator_mode';

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

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const cookieStore = await cookies();
  const theme = cookieStore.get(COOKIE_THEME)?.value ?? 'system';
  const contrast =
    cookieStore.get(COOKIE_CONTRAST)?.value === 'high' ? 'high' : 'default';
  const density =
    cookieStore.get(COOKIE_DENSITY)?.value === 'on' ? 'on' : 'off';
  const rawEvaluator = cookieStore.get(COOKIE_EVALUATOR)?.value ?? 'default';
  const validEvaluator = [
    'executive',
    'board',
    'public_service',
    'investor',
    'media',
    'default',
  ].includes(rawEvaluator)
    ? rawEvaluator
    : 'default';
  const evaluator = validEvaluator;

  return (
    <html
      lang="en"
      dir="ltr"
      className={inter.variable}
      suppressHydrationWarning
      data-theme={theme}
      data-contrast={contrast}
      data-density={density}
      data-evaluator={evaluator}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script dangerouslySetInnerHTML={{ __html: localeDirScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}

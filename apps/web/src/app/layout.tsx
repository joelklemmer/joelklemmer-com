import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { cookies, headers } from 'next/headers';
import { Inter, Crimson_Pro } from 'next/font/google';

import { PATHNAME_HEADER } from '../middleware';
import { getMetadataBaseUrl } from '../lib/requestBaseUrl';
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

/** Root metadata: metadataBase + description so LHCI meta-description and canonical audits pass. */
export function generateMetadata(): Promise<Metadata> {
  const baseUrl = getMetadataBaseUrl();
  return Promise.resolve({
    metadataBase: new URL(baseUrl),
    description: DEFAULT_META_DESCRIPTION,
  });
}

/** Figma Make: Inter (body) + Crimson Pro (headings). Subset + swap to minimize FOIT/FOUT. */
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
  preload: true,
  adjustFontFallback: true,
});
const crimsonPro = Crimson_Pro({
  weight: ['400', '500', '600'],
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
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
  const [cookieStore, headersList] = await Promise.all([cookies(), headers()]);
  const rawPath = headersList.get(PATHNAME_HEADER) || '/en';
  const pathname = rawPath.startsWith('/') ? rawPath : `/${rawPath}`;
  const baseUrl = getMetadataBaseUrl();
  const canonicalHref = `${baseUrl.replace(/\/$/, '')}${pathname}`;
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
      className={`${inter.variable} ${crimsonPro.variable}`}
      suppressHydrationWarning
      data-theme={theme}
      data-contrast={contrast}
      data-density={density}
      data-evaluator={evaluator}
    >
      <head>
        <meta name="description" content={DEFAULT_META_DESCRIPTION} />
        <link rel="canonical" href={canonicalHref} />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script dangerouslySetInnerHTML={{ __html: localeDirScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}

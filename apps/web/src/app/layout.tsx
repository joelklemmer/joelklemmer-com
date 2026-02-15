import type { ReactNode } from 'react';
import type { Metadata, Viewport } from 'next';
import { cookies, headers } from 'next/headers';
import { Inter, Crimson_Pro } from 'next/font/google';

import { PATHNAME_HEADER } from '../middleware';
import { getMetadataBaseUrl } from '../lib/requestBaseUrl';
// eslint-disable-next-line no-restricted-imports -- root layout needs ThemeSync for theme hydration
import { ThemeSync } from '@joelklemmer/ui';
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

/** Root metadata: metadataBase, icons, manifest, themeColor; child layouts merge title/description. */
export function generateMetadata(): Promise<Metadata> {
  const baseUrl = getMetadataBaseUrl();
  return Promise.resolve({
    metadataBase: new URL(baseUrl),
    description: DEFAULT_META_DESCRIPTION,
    icons: {
      icon: [
        { url: '/icons/favicon.ico', sizes: 'any' },
        { url: '/icons/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
        { url: '/icons/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      ],
      apple: [{ url: '/icons/apple-touch-icon.png', sizes: '180x180' }],
      other: [
        {
          rel: 'mask-icon',
          url: '/icons/safari-pinned-tab.svg',
          color: '#1e1e23',
        },
      ],
    },
    manifest: '/site.webmanifest',
  });
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#1e1e23' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0b' },
  ],
};

/** Figma Make: Inter (body) + Crimson Pro (headings). Subset + swap to minimize FOIT/FOUT. */
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
  preload: true,
  adjustFontFallback: true,
});
const crimsonPro = Crimson_Pro({
  weight: ['400', '500', '600', '700'],
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
      <body>
        <ThemeSync />
        {children}
      </body>
    </html>
  );
}

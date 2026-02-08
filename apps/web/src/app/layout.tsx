import type { ReactNode } from 'react';

import { getLocale } from 'next-intl/server';

/* Root layout: only sets html lang/dir; exception to route-file import rule. */
// eslint-disable-next-line no-restricted-imports -- root layout
import { isRtlLocale } from '@joelklemmer/i18n';

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const locale = await getLocale();
  const dir = isRtlLocale(locale) ? 'rtl' : 'ltr';

  return (
    <html lang={locale} dir={dir}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = localStorage.getItem('joelklemmer-theme');
                  const contrast = localStorage.getItem('joelklemmer-contrast');
                  const motion = localStorage.getItem('joelklemmer-motion');
                  const underlineLinks = localStorage.getItem('joelklemmer-underline-links');
                  const textSize = localStorage.getItem('joelklemmer-text-size');
                  const root = document.documentElement;
                  
                  if (theme && theme !== 'system') {
                    root.setAttribute('data-theme', theme);
                  }
                  if (contrast === 'high') {
                    root.setAttribute('data-contrast', 'high');
                  }
                  if (motion === 'reduced') {
                    root.setAttribute('data-motion', 'reduced');
                    root.classList.add('motion-reduce-force');
                  }
                  if (underlineLinks === 'true') {
                    root.setAttribute('data-underline-links', 'true');
                  }
                  if (textSize === 'large') {
                    root.setAttribute('data-text-size', 'large');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}

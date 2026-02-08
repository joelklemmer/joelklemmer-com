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
                  const underlineLinks = localStorage.getItem('joelklemmer-underline-links');
                  const textSize = localStorage.getItem('joelklemmer-text-size');
                  if (theme && theme !== 'system') {
                    document.documentElement.setAttribute('data-theme', theme);
                  }
                  if (contrast === 'high') {
                    document.documentElement.setAttribute('data-contrast', 'high');
                  }
                  if (underlineLinks === 'true') {
                    document.documentElement.setAttribute('data-underline-links', 'true');
                  }
                  if (textSize === 'large') {
                    document.documentElement.setAttribute('data-text-size', 'large');
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

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
<<<<<<< Current (Your changes)
(function() {
  try {
    const theme = localStorage.getItem('joelklemmer-theme');
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const resolved = theme === 'dark' ? 'dark' : theme === 'light' ? 'light' : (systemDark ? 'dark' : 'light');
    if (resolved === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  } catch (e) {}
})();
=======
              (function() {
                try {
                  const theme = localStorage.getItem('joelklemmer-theme');
                  const contrast = localStorage.getItem('joelklemmer-contrast');
                  const underlineLinks = localStorage.getItem('joelklemmer-underline-links');
                  if (theme && theme !== 'system') {
                    document.documentElement.setAttribute('data-theme', theme);
                  }
                  if (contrast === 'high') {
                    document.documentElement.setAttribute('data-contrast', 'high');
                  }
                  if (underlineLinks === 'true') {
                    document.documentElement.setAttribute('data-underline-links', 'true');
                  }
                } catch (e) {}
              })();
>>>>>>> Incoming (Background Agent changes)
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}

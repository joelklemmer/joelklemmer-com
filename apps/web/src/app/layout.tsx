import type { ReactNode } from 'react';

import { getLocale } from 'next-intl/server';

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
      <body>{children}</body>
    </html>
  );
}

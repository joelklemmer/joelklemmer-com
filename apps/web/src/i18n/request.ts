import { getRequestConfig } from 'next-intl/server';
import { loadMessages, type AppLocale } from '@joelklemmer/i18n';

import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  const locale = await requestLocale;
  const resolvedLocale: AppLocale = routing.locales.includes(
    locale as AppLocale,
  )
    ? (locale as AppLocale)
    : routing.defaultLocale;

  return {
    locale: resolvedLocale,
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    messages: await loadMessages(resolvedLocale, [
      'common',
      'nav',
      'footer',
      'meta',
      'consent',
    ]),
  };
});

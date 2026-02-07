import { defineRouting } from 'next-intl/routing';
import { defaultLocale, locales } from '@joelklemmer/i18n';

export const routing = defineRouting({
  locales,
  defaultLocale,
});

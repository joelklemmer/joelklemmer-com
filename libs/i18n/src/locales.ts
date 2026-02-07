export const locales = ['en', 'uk', 'es', 'he'] as const;
export type AppLocale = (typeof locales)[number];

export const defaultLocale: AppLocale = 'en';

const rtlLocales = new Set<AppLocale>(['he']);

export function isRtlLocale(locale: string): locale is AppLocale {
  return rtlLocales.has(locale as AppLocale);
}

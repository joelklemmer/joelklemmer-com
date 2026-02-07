import type { AppLocale } from './locales';

export async function loadMessages(locale: AppLocale) {
  const [nav, a11y, routes, common] = await Promise.all([
    import(`./messages/${locale}/nav.json`),
    import(`./messages/${locale}/a11y.json`),
    import(`./messages/${locale}/routes.json`),
    import(`./messages/${locale}/common.json`),
  ]);

  return {
    nav: nav.default,
    a11y: a11y.default,
    routes: routes.default,
    common: common.default,
  };
}

import type { Metadata } from 'next';
import { getLocale } from 'next-intl/server';
// eslint-disable-next-line no-restricted-imports -- root not-found needs i18n for metadata and copy
import {
  createScopedTranslator,
  loadMessages,
  defaultLocale,
  type AppLocale,
} from '@joelklemmer/i18n';
import { routing } from '../i18n/routing';

export async function generateMetadata(): Promise<Metadata> {
  const requested = await getLocale();
  const locale: AppLocale = routing.locales.includes(requested as AppLocale)
    ? (requested as AppLocale)
    : defaultLocale;
  const messages = await loadMessages(locale, ['meta']);
  const t = createScopedTranslator(locale, messages, 'meta');
  return { title: t('notFound.title') };
}

export default async function NotFound() {
  const requested = await getLocale();
  const locale: AppLocale = routing.locales.includes(requested as AppLocale)
    ? (requested as AppLocale)
    : defaultLocale;
  const messages = await loadMessages(locale, ['meta', 'common']);
  const t = createScopedTranslator(locale, messages, 'meta');
  const tCommon = createScopedTranslator(locale, messages, 'common');
  const homeHref = `/${locale}`;

  return (
    <main
      className="min-h-[60vh] flex flex-col items-center justify-center p-6"
      role="main"
    >
      <h1 className="text-xl font-semibold text-text">{t('notFound.title')}</h1>
      <p className="mt-2 text-muted">
        <a
          href={homeHref}
          className="underline underline-offset-4 hover:text-accent"
        >
          {tCommon('wordmark')}
        </a>
      </p>
    </main>
  );
}

import { getLocale } from 'next-intl/server';
import {
  createScopedTranslator,
  loadMessages,
  type AppLocale,
} from '@joelklemmer/i18n';
import { createPageMetadata } from '@joelklemmer/seo';
import { HeroSection, ListSection } from '@joelklemmer/sections';

export async function generateMetadata() {
  const locale = (await getLocale()) as AppLocale;
  const messages = await loadMessages(locale, ['meta']);
  const t = createScopedTranslator(locale, messages, 'meta');
  return createPageMetadata({
    title: t('work.title'),
    description: t('work.description'),
    locale,
    pathname: '/work',
  });
}

export const workMetadata = generateMetadata;

export async function WorkScreen() {
  const locale = (await getLocale()) as AppLocale;
  const messages = await loadMessages(locale, ['work']);
  const t = createScopedTranslator(locale, messages, 'work');
  const areas = t.raw('areas.items') as string[];

  return (
    <>
      <HeroSection title={t('hero.title')} lede={t('hero.lede')} />
      <ListSection title={t('areas.title')} items={areas} />
    </>
  );
}

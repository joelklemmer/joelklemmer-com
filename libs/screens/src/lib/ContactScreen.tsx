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
    title: t('contact.title'),
    description: t('contact.description'),
    locale,
    pathname: '/contact',
  });
}

export const contactMetadata = generateMetadata;

export async function ContactScreen() {
  const locale = (await getLocale()) as AppLocale;
  const messages = await loadMessages(locale, ['contact']);
  const t = createScopedTranslator(locale, messages, 'contact');
  const items = t.raw('methods.items') as string[];

  return (
    <>
      <HeroSection title={t('hero.title')} lede={t('hero.lede')} />
      <ListSection title={t('methods.title')} items={items} />
    </>
  );
}

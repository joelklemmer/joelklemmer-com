import { getLocale } from 'next-intl/server';
import {
  createScopedTranslator,
  loadMessages,
  type AppLocale,
} from '@joelklemmer/i18n';
import { createPageMetadata, PersonJsonLd } from '@joelklemmer/seo';
import {
  CardGridSection,
  HeroSection,
  ListSection,
} from '@joelklemmer/sections';

export async function generateMetadata() {
  const locale = (await getLocale()) as AppLocale;
  const messages = await loadMessages(locale, ['meta']);
  const t = createScopedTranslator(locale, messages, 'meta');
  return createPageMetadata({
    title: t('brief.title'),
    description: t('brief.description'),
    locale,
    pathname: '/brief',
  });
}

export const briefMetadata = generateMetadata;

export async function BriefScreen() {
  const locale = (await getLocale()) as AppLocale;
  const messages = await loadMessages(locale, ['brief']);
  const t = createScopedTranslator(locale, messages, 'brief');

  const focusItems = t.raw('focus.items') as string[];

  return (
    <>
      <PersonJsonLd />
      <HeroSection title={t('hero.title')} lede={t('hero.lede')} />
      <ListSection title={t('focus.title')} items={focusItems} />
      <CardGridSection
        title={t('links.title')}
        items={[
          {
            title: t('links.work.label'),
            description: t('links.work.description'),
            href: `/${locale}/work`,
          },
          {
            title: t('links.operatingSystem.label'),
            description: t('links.operatingSystem.description'),
            href: `/${locale}/operating-system`,
          },
          {
            title: t('links.writing.label'),
            description: t('links.writing.description'),
            href: `/${locale}/writing`,
          },
          {
            title: t('links.contact.label'),
            description: t('links.contact.description'),
            href: `/${locale}/contact`,
          },
        ]}
      />
    </>
  );
}

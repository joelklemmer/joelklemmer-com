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
  StartHereSection,
} from '@joelklemmer/sections';

export async function generateMetadata() {
  const locale = (await getLocale()) as AppLocale;
  const messages = await loadMessages(locale, ['meta']);
  const t = createScopedTranslator(locale, messages, 'meta');
  return createPageMetadata({
    title: t('home.title'),
    description: t('home.description'),
    locale,
    pathname: '/',
  });
}

export const homeMetadata = generateMetadata;

export async function HomeScreen() {
  const locale = (await getLocale()) as AppLocale;
  const messages = await loadMessages(locale, ['home']);
  const t = createScopedTranslator(locale, messages, 'home');
  const claimItems = t.raw('claims.items') as string[];
  const routeItems = t.raw('routes.items') as Array<{
    title: string;
    description: string;
    path: string;
  }>;

  return (
    <>
      <PersonJsonLd />
      <HeroSection
        title={t('hero.title')}
        lede={t('hero.lede')}
        actions={[{ label: t('hero.cta'), href: `/${locale}/brief` }]}
      />
      <StartHereSection
        sentence={t('startHere.sentence')}
        linkLabel={t('startHere.linkLabel')}
        href={`/${locale}/brief`}
      />
      <ListSection title={t('claims.title')} items={claimItems} />
      <CardGridSection
        title={t('routes.title')}
        items={routeItems.map((item) => ({
          title: item.title,
          description: item.description,
          href: `/${locale}${item.path}`,
        }))}
      />
    </>
  );
}

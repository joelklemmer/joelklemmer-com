import { getLocale } from 'next-intl/server';
import {
  createScopedTranslator,
  loadMessages,
  type AppLocale,
} from '@joelklemmer/i18n';
import { getProofList, getWritingPosts } from '@joelklemmer/content';
import { createPageMetadata, PersonJsonLd } from '@joelklemmer/seo';
import { CardGridSection, HeroSection } from '@joelklemmer/sections';

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
  const proofEntries = (await getProofList(locale)).slice(0, 2);
  const writingEntries = (await getWritingPosts(locale)).slice(0, 2);

  return (
    <>
      <PersonJsonLd />
      <HeroSection
        title={t('hero.title')}
        lede={t('hero.lede')}
        actions={[{ label: t('hero.cta'), href: `/${locale}/brief` }]}
      />
      {proofEntries.length ? (
        <CardGridSection
          title={t('proof.title')}
          lede={t('proof.lede')}
          items={proofEntries.map((entry) => ({
            title: entry.frontmatter.claim,
            description: entry.frontmatter.summary,
            meta: entry.frontmatter.evidenceType,
          }))}
        />
      ) : null}
      {writingEntries.length ? (
        <CardGridSection
          title={t('writing.title')}
          lede={t('writing.lede')}
          action={{ label: t('writing.cta'), href: `/${locale}/writing` }}
          items={writingEntries.map((entry) => ({
            title: entry.frontmatter.title,
            description: entry.frontmatter.summary,
            meta: entry.frontmatter.date,
            href: `/${locale}/writing/${entry.frontmatter.slug}`,
          }))}
        />
      ) : null}
    </>
  );
}

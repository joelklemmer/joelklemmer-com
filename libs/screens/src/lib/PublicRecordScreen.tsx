import { getLocale } from 'next-intl/server';
import {
  createScopedTranslator,
  loadMessages,
  type AppLocale,
} from '@joelklemmer/i18n';
import { getPublicRecordList } from '@joelklemmer/content';
import { createPageMetadata } from '@joelklemmer/seo';
import { CardGridSection, HeroSection, ListSection } from '@joelklemmer/sections';

export async function generateMetadata() {
  const locale = (await getLocale()) as AppLocale;
  const messages = await loadMessages(locale, ['meta']);
  const t = createScopedTranslator(locale, messages, 'meta');
  return createPageMetadata({
    title: t('proof.title'),
    description: t('proof.description'),
    locale,
    pathname: '/publicrecord',
  });
}

export const publicRecordMetadata = generateMetadata;

export async function PublicRecordScreen() {
  const locale = (await getLocale()) as AppLocale;
  const messages = await loadMessages(locale, ['proof', 'publicRecord']);
  const tProof = createScopedTranslator(locale, messages, 'proof');
  const tIndex = createScopedTranslator(locale, messages, 'publicRecord');
  const entries = await getPublicRecordList(locale);

  return (
    <>
      <HeroSection
        title={tProof('hero.title')}
        lede={tProof('hero.lede')}
      />
      {entries.length ? (
        <CardGridSection
          title={tProof('list.title')}
          lede={tProof('list.lede')}
          items={entries.map((entry) => ({
            title: entry.frontmatter.title,
            description: entry.frontmatter.claimSupported,
            meta: tIndex('index.meta', {
              type: entry.frontmatter.artifactType,
              date: entry.frontmatter.date,
              source: entry.frontmatter.source,
            }),
            href: `/${locale}/publicrecord/${entry.frontmatter.slug}`,
          }))}
        />
      ) : (
        <ListSection
          title={tProof('list.title')}
          items={[tProof('list.empty')]}
        />
      )}
    </>
  );
}

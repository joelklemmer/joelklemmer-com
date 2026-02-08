import { getLocale } from 'next-intl/server';
import {
  createScopedTranslator,
  loadMessages,
  type AppLocale,
} from '@joelklemmer/i18n';
import { getPublicRecordList } from '@joelklemmer/content';
import { createPageMetadata } from '@joelklemmer/seo';
import {
  CardGridSection,
  HeroSection,
  ListSection,
} from '@joelklemmer/sections';
import { DensityAwarePage } from '@joelklemmer/authority-density';

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
  const messages = await loadMessages(locale, [
    'proof',
    'publicRecord',
    'common',
  ]);
  const tProof = createScopedTranslator(locale, messages, 'proof');
  const tIndex = createScopedTranslator(locale, messages, 'publicRecord');
  const tCommon = createScopedTranslator(locale, messages, 'common');
  const entries = await getPublicRecordList(locale);

  return (
    <>
      <HeroSection title={tProof('hero.title')} lede={tProof('hero.lede')} />
      <DensityAwarePage toggleLabel={tCommon('density.toggleLabel')}>
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
                source:
                  typeof entry.frontmatter.source === 'string'
                    ? entry.frontmatter.source
                    : entry.frontmatter.source.sourceName,
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
      </DensityAwarePage>
    </>
  );
}

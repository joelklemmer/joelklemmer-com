import { getLocale } from 'next-intl/server';
import {
  createScopedTranslator,
  loadMessages,
  type AppLocale,
} from '@joelklemmer/i18n';
import { getProofList } from '@joelklemmer/content';
import { createPageMetadata } from '@joelklemmer/seo';
import { CardGridSection, HeroSection } from '@joelklemmer/sections';

export async function generateMetadata() {
  const locale = (await getLocale()) as AppLocale;
  const messages = await loadMessages(locale, ['meta']);
  const t = createScopedTranslator(locale, messages, 'meta');
  return createPageMetadata({
    title: t('proof.title'),
    description: t('proof.description'),
    locale,
    pathname: '/proof',
  });
}

export const proofMetadata = generateMetadata;

export async function ProofScreen() {
  const locale = (await getLocale()) as AppLocale;
  const messages = await loadMessages(locale, ['quiet']);
  const t = createScopedTranslator(locale, messages, 'quiet');
  const entries = await getProofList(locale);

  return (
    <>
      <HeroSection title={t('proof.title')} lede={t('proof.lede')} />
      <CardGridSection
        title={t('proof.title')}
        items={entries.map((entry) => ({
          title: entry.frontmatter.claim,
          description: entry.frontmatter.summary,
          meta: entry.frontmatter.evidenceType,
          href: `/${locale}/proof/${entry.frontmatter.slug}`,
        }))}
      />
    </>
  );
}

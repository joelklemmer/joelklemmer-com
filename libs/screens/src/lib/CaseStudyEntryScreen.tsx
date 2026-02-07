import { notFound } from 'next/navigation';
import { getLocale } from 'next-intl/server';
import { defaultLocale, locales, type AppLocale } from '@joelklemmer/i18n';
import {
  getCaseStudy,
  getCaseStudySlugs,
  getPublicRecordList,
  renderMdx,
} from '@joelklemmer/content';
import { createPageMetadata } from '@joelklemmer/seo';
import { createScopedTranslator, loadMessages } from '@joelklemmer/i18n';
import {
  CaseStudySection,
  FallbackNoticeSection,
  HeroSection,
  MdxSection,
} from '@joelklemmer/sections';

export async function generateStaticParams() {
  const slugs = await getCaseStudySlugs();
  return locales.flatMap((locale) => slugs.map((slug) => ({ locale, slug })));
}

export const caseStudyEntryStaticParams = generateStaticParams;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const locale = (await getLocale()) as AppLocale;
  const entry = await getCaseStudy(locale, slug);
  if (!entry) {
    notFound();
  }

  return createPageMetadata({
    title: entry.frontmatter.title,
    description: entry.frontmatter.summary ?? entry.frontmatter.title,
    locale,
    pathname: `/casestudies/${entry.frontmatter.slug}`,
    canonicalLocale: entry.frontmatter.locale,
    canonicalOverride: entry.frontmatter.canonical,
  });
}

export const caseStudyEntryMetadata = generateMetadata;

export async function CaseStudyEntryScreen({ slug }: { slug: string }) {
  const locale = (await getLocale()) as AppLocale;
  const entry = await getCaseStudy(locale, slug);
  if (!entry) {
    notFound();
  }
  const messages = await loadMessages(locale, ['work', 'common']);
  const t = createScopedTranslator(locale, messages, 'work');
  const tCommon = createScopedTranslator(locale, messages, 'common');
  const publicRecords = await getPublicRecordList(locale);

  const references =
    entry.frontmatter.proofRefs?.map((recordId) => {
      const record = publicRecords.find((item) =>
        [item.frontmatter.slug, item.frontmatter.id].includes(recordId),
      );
      if (!record) {
        return null;
      }

      return {
        label: record.frontmatter.title,
        href: `/${locale}/publicrecord/${record.frontmatter.slug}`,
        meta: record.frontmatter.date,
      };
    }) ?? [];

  const showFallbackNotice = entry.frontmatter.locale !== locale;

  return (
    <>
      {showFallbackNotice ? (
        <FallbackNoticeSection
          title={tCommon('fallbackNotice.title')}
          body={tCommon('fallbackNotice.body')}
          linkLabel={tCommon('fallbackNotice.linkLabel')}
          href={`/${defaultLocale}/casestudies/${entry.frontmatter.slug}`}
        />
      ) : null}
      <HeroSection
        title={entry.frontmatter.title}
        lede={entry.frontmatter.summary}
      />
      <CaseStudySection
        title={t('caseStudies.detailTitle')}
        context={entry.frontmatter.context}
        constraints={entry.frontmatter.constraints}
        actions={entry.frontmatter.actions}
        outcomes={entry.frontmatter.outcomes}
        references={
          references.filter(Boolean) as Array<{
            label: string;
            href: string;
            meta?: string;
          }>
        }
        labels={{
          context: t('caseStudies.labels.context'),
          constraints: t('caseStudies.labels.constraints'),
          actions: t('caseStudies.labels.actions'),
          outcomes: t('caseStudies.labels.outcomes'),
          references: t('caseStudies.labels.references'),
        }}
      />
      {entry.content.trim() ? (
        <MdxSection>{await renderMdx(entry.content)}</MdxSection>
      ) : null}
    </>
  );
}

import { getLocale } from 'next-intl/server';
import {
  createScopedTranslator,
  loadMessages,
  type AppLocale,
} from '@joelklemmer/i18n';
import { getCaseStudies, getPublicRecordList } from '@joelklemmer/content';
import { createPageMetadata } from '@joelklemmer/seo';
import {
  CaseStudySection,
  HeroSection,
  ListSection,
} from '@joelklemmer/sections';

export async function generateMetadata() {
  const locale = (await getLocale()) as AppLocale;
  const messages = await loadMessages(locale, ['meta']);
  const t = createScopedTranslator(locale, messages, 'meta');
  return createPageMetadata({
    title: t('work.title'),
    description: t('work.description'),
    locale,
    pathname: '/casestudies',
  });
}

export const caseStudiesMetadata = generateMetadata;

export async function CaseStudiesScreen() {
  const locale = (await getLocale()) as AppLocale;
  const messages = await loadMessages(locale, ['work']);
  const t = createScopedTranslator(locale, messages, 'work');
  const caseStudies = await getCaseStudies(locale);
  const publicRecords = await getPublicRecordList(locale);
  const labels = {
    context: t('caseStudies.labels.context'),
    constraints: t('caseStudies.labels.constraints'),
    actions: t('caseStudies.labels.actions'),
    outcomes: t('caseStudies.labels.outcomes'),
    references: t('caseStudies.labels.references'),
  };

  return (
    <>
      <HeroSection title={t('hero.title')} lede={t('hero.lede')} />
      {caseStudies.length ? (
        caseStudies.map((study) => {
          const references =
            study.frontmatter.proofRefs?.map((recordId) => {
              const entry = publicRecords.find((record) =>
                [record.frontmatter.slug, record.frontmatter.id].includes(
                  recordId,
                ),
              );
              if (!entry) {
                return null;
              }

              return {
                label: entry.frontmatter.title,
                href: `/${locale}/publicrecord/${entry.frontmatter.slug}`,
                meta: entry.frontmatter.date,
              };
            }) ?? [];

          return (
            <CaseStudySection
              key={study.frontmatter.slug}
              id={study.frontmatter.slug}
              title={study.frontmatter.title}
              summary={study.frontmatter.summary}
              meta={
                study.frontmatter.date
                  ? t('caseStudies.meta', { date: study.frontmatter.date })
                  : undefined
              }
              detailLink={{
                label: t('caseStudies.detailLink'),
                href: `/${locale}/casestudies/${study.frontmatter.slug}`,
              }}
              context={study.frontmatter.context}
              constraints={study.frontmatter.constraints}
              actions={study.frontmatter.actions}
              outcomes={study.frontmatter.outcomes}
              references={
                references.filter(Boolean) as Array<{
                  label: string;
                  href: string;
                  meta?: string;
                }>
              }
              labels={labels}
            />
          );
        })
      ) : (
        <ListSection
          title={t('caseStudies.title')}
          items={[t('caseStudies.empty')]}
        />
      )}
    </>
  );
}

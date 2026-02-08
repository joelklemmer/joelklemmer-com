import { getLocale } from 'next-intl/server';
import {
  createScopedTranslator,
  loadMessages,
  type AppLocale,
} from '@joelklemmer/i18n';
import {
  getCaseStudyList,
  getPublicRecordId,
  getPublicRecordList,
} from '@joelklemmer/content';
import { createPageMetadata } from '@joelklemmer/seo';
import { CaseStudySection, ListSection } from '@joelklemmer/sections';
import { Container } from '@joelklemmer/ui';
import { DensityAwarePage } from '@joelklemmer/authority-density';

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
  const messages = await loadMessages(locale, ['work', 'common']);
  const t = createScopedTranslator(locale, messages, 'work');
  const tCommon = createScopedTranslator(locale, messages, 'common');
  const caseStudies = await getCaseStudyList(locale);
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
      <DensityAwarePage toggleLabel={tCommon('density.toggleLabel')}>
        <section className="section-shell">
          <Container className="section-shell">
            <h1 className="text-display font-semibold tracking-tight">
              {t('caseStudies.title')}
            </h1>
          </Container>
        </section>
        {caseStudies.length ? (
          caseStudies.map((study) => {
            const references =
              study.frontmatter.proofRefs?.map((recordId) => {
                const entry = publicRecords.find(
                  (record) =>
                    getPublicRecordId(record.frontmatter) === recordId,
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

            const contextStr = study.frontmatter.context;
            const verificationCount = study.frontmatter.proofRefs?.length ?? 0;
            const meta = study.frontmatter.date
              ? t('caseStudies.meta', { date: study.frontmatter.date }) +
                ' · ' +
                t('caseStudies.verificationCount', { count: verificationCount })
              : t('caseStudies.verificationCount', {
                  count: verificationCount,
                });

            return (
              <CaseStudySection
                key={study.frontmatter.slug}
                id={study.frontmatter.slug}
                title={study.frontmatter.title}
                summary={study.frontmatter.summary}
                meta={meta}
                detailLink={{
                  label: t('caseStudies.detailLink'),
                  href: `/${locale}/casestudies/${study.frontmatter.slug}`,
                }}
                context={Array.isArray(contextStr) ? contextStr : [contextStr]}
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
      </DensityAwarePage>
    </>
  );
}

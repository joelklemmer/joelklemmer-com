import { notFound } from 'next/navigation';
import { getLocale } from 'next-intl/server';
import { defaultLocale, locales, type AppLocale } from '@joelklemmer/i18n';
import {
  getAllClaims,
  getCaseStudyEntry,
  getCaseStudySlugs,
  getPublicRecordId,
  getPublicRecordList,
  renderMdx,
} from '@joelklemmer/content';
import { createPageMetadata } from '@joelklemmer/seo';
import { createScopedTranslator, loadMessages } from '@joelklemmer/i18n';
import {
  DefinitionListSection,
  FallbackNoticeSection,
  LinkListSection,
  MdxSection,
} from '@joelklemmer/sections';
import { Container } from '@joelklemmer/ui';

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
  const entry = await getCaseStudyEntry(locale, slug);
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
  const entry = await getCaseStudyEntry(locale, slug);
  if (!entry) {
    notFound();
  }
  const messages = await loadMessages(locale, ['work', 'common', 'brief']);
  const t = createScopedTranslator(locale, messages, 'work');
  const tCommon = createScopedTranslator(locale, messages, 'common');
  const tBrief = createScopedTranslator(locale, messages, 'brief');
  const publicRecords = await getPublicRecordList(locale);
  const claims = getAllClaims();

  const verificationItems =
    entry.frontmatter.proofRefs
      ?.map((recordId) => {
        const record = publicRecords.find(
          (item) => getPublicRecordId(item.frontmatter) === recordId,
        );
        if (!record) {
          return null;
        }
        return {
          label: record.frontmatter.title,
          href: `/${locale}/publicrecord/${record.frontmatter.slug}`,
        };
      })
      .filter(Boolean) ?? [];

  const claimRefs = entry.frontmatter.claimRefs ?? [];
  const supportsClaimsItems = claimRefs.map((claimId) => {
    const claim = claims.find((c) => c.id === claimId);
    return {
      label: claim ? tBrief(claim.labelKey) : claimId,
      href: `/${locale}/brief#claim-${claimId}`,
    };
  });

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
      <section className="section-shell">
        <Container className="section-shell">
          <h1 className="text-display-heading font-semibold">
            {entry.frontmatter.title}
          </h1>
          <DefinitionListSection
            title={t('caseStudies.detailTitle')}
            items={[
              {
                label: t('caseStudies.labels.date'),
                value: entry.frontmatter.date,
              },
              ...(entry.frontmatter.tags?.length
                ? [
                    {
                      label: t('caseStudies.labels.tags'),
                      value: entry.frontmatter.tags.join(', '),
                    },
                  ]
                : []),
            ]}
          />
        </Container>
      </section>
      <section className="section-shell">
        <Container className="section-shell">
          <h2 className="text-base font-semibold">
            {t('caseStudies.labels.context')}
          </h2>
          <p className="text-base text-muted">{entry.frontmatter.context}</p>
        </Container>
      </section>
      <section className="section-shell">
        <Container className="section-shell">
          <h2 className="text-base font-semibold">
            {t('caseStudies.labels.constraints')}
          </h2>
          <ul className="grid gap-2 text-sm text-muted">
            {entry.frontmatter.constraints.map((c) => (
              <li key={c} className="flex gap-2">
                <span aria-hidden>•</span>
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </Container>
      </section>
      <section className="section-shell">
        <Container className="section-shell">
          <h2 className="text-base font-semibold">
            {t('caseStudies.labels.actions')}
          </h2>
          <ol className="list-decimal grid gap-2 pl-5 text-sm text-muted">
            {entry.frontmatter.actions.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ol>
        </Container>
      </section>
      <section className="section-shell">
        <Container className="section-shell">
          <h2 className="text-base font-semibold">
            {t('caseStudies.labels.outcomes')}
          </h2>
          <ul className="grid gap-2 text-sm text-muted">
            {entry.frontmatter.outcomes.map((o) => (
              <li key={o} className="flex gap-2">
                <span aria-hidden>•</span>
                <span>{o}</span>
              </li>
            ))}
          </ul>
        </Container>
      </section>
      <LinkListSection
        title={t('caseStudies.verification')}
        items={verificationItems as Array<{ label: string; href: string }>}
      />
      {supportsClaimsItems.length > 0 ? (
        <LinkListSection
          title={t('caseStudies.supportsClaims')}
          items={supportsClaimsItems}
        />
      ) : null}
      {entry.content.trim() ? (
        <MdxSection title={t('caseStudies.narrativeNotes')}>
          {await renderMdx(entry.content)}
        </MdxSection>
      ) : null}
    </>
  );
}

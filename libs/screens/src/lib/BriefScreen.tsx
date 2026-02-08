import { getLocale } from 'next-intl/server';
import {
  createScopedTranslator,
  loadMessages,
  type AppLocale,
} from '@joelklemmer/i18n';
import {
  CLAIM_CATEGORIES,
  claimRegistry,
  getFeaturedClaims,
  getCaseStudies,
  getCaseStudiesByClaimIdMap,
  getLastVerifiedFromRecordDates,
  getBriefContent,
  getPublicRecordList,
  getExecutiveBriefArtifact,
} from '@joelklemmer/content';
import {
  createPageMetadata,
  PersonJsonLd,
  BriefPageJsonLd,
} from '@joelklemmer/seo';
import {
  IdentityScopeSection,
  ReadPathSection,
  VerificationGuidanceSection,
  ListSection,
  QuantifiedOutcomesSection,
  CardGridSection,
  ArtifactSingleSection,
  ContactPathwaySection,
  HeroSection,
} from '@joelklemmer/sections';
import { Container } from '@joelklemmer/ui';
import { BriefNavigator } from './BriefNavigator.client';

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

const CLAIMS_DEFAULT_COUNT = 9;
const CASE_STUDIES_MAX = 3;
const PUBLIC_RECORD_HIGHLIGHTS_MAX = 10;

export async function BriefScreen() {
  const locale = (await getLocale()) as AppLocale;
  const messages = await loadMessages(locale, ['brief']);
  const t = createScopedTranslator(locale, messages, 'brief');

  const publicRecords = await getPublicRecordList(locale);
  const recordLookup = new Map(
    publicRecords.flatMap((record) => {
      const pairs: [string, (typeof publicRecords)[number]][] = [
        [record.frontmatter.slug, record],
      ];
      if (record.frontmatter.id) {
        pairs.push([record.frontmatter.id, record]);
      }
      return pairs;
    }),
  );
  const recordIdToDate = new Map<string, string>();
  for (const record of publicRecords) {
    const date = record.frontmatter.date;
    if (!date) continue;
    recordIdToDate.set(record.frontmatter.slug, date);
    if (record.frontmatter.id) {
      recordIdToDate.set(record.frontmatter.id, date);
    }
  }

  const featuredClaims = getFeaturedClaims();
  const caseStudiesByClaim = await getCaseStudiesByClaimIdMap(
    featuredClaims.map((c) => c.id),
  );
  const claimCards = featuredClaims.map((claim) => {
    const supportingLinks = claim.recordIds
      .map((recordId) => {
        const entry = recordLookup.get(recordId);
        if (!entry) return null;
        return {
          label: entry.frontmatter.title,
          href: `/${locale}/publicrecord/${entry.frontmatter.slug}`,
        };
      })
      .filter(Boolean) as Array<{ label: string; href: string }>;
    const caseStudies = caseStudiesByClaim.get(claim.id) ?? [];
    const lastVerified = getLastVerifiedFromRecordDates(
      claim.recordIds,
      recordIdToDate,
    );
    return {
      id: claim.id,
      label: t(claim.labelKey),
      summary: t(claim.summaryKey),
      category: t(`claims.categories.${claim.category}`),
      categoryId: claim.category,
      verificationStrength: claim.recordIds.length,
      lastVerified,
      supportingLinks,
      caseStudies,
      casestudiesBasePath: `/${locale}/casestudies`,
      supportingRecordsLabel: t('claims.supportingRecords'),
      supportingCaseStudiesLabel: t('claims.supportingCaseStudies'),
      verificationConnectionsLabel: t('claims.verificationConnections'),
      lastVerifiedLabel: t('claims.lastVerified'),
    };
  });

  const categoryOptions = CLAIM_CATEGORIES.map((id) => ({
    id,
    label: t(`claims.categories.${id}`),
  }));
  const maxStrength = claimCards.length
    ? Math.max(...claimCards.map((c) => c.verificationStrength), 1)
    : 1;
  const maxCaseStudies = claimCards.length
    ? Math.max(...claimCards.map((c) => c.caseStudies.length), 0)
    : 0;
  const strengthMinByCount: Record<number, string> = {};
  for (let n = 1; n <= maxStrength; n++) {
    strengthMinByCount[n] = t('navigator.strengthMin', { count: n });
  }
  const recordCountByCount: Record<number, string> = {};
  for (let n = 0; n <= maxStrength; n++) {
    recordCountByCount[n] = t('navigator.recordCount', { count: n });
  }
  const caseStudyCountByCount: Record<number, string> = {};
  for (let n = 0; n <= maxCaseStudies; n++) {
    caseStudyCountByCount[n] = t('navigator.caseStudyCount', { count: n });
  }
  const navigatorLabels = {
    viewGrid: t('navigator.viewGrid'),
    viewGraph: t('navigator.viewGraph'),
    viewModeLabel: t('navigator.viewModeLabel'),
    filterCategoryLegend: t('navigator.filterCategoryLegend'),
    filterStrengthLegend: t('navigator.filterStrengthLegend'),
    categoryAll: t('navigator.categoryAll'),
    strengthAll: t('navigator.strengthAll'),
    strengthMinByCount,
    closePanel: t('navigator.closePanel'),
    viewInBrief: t('navigator.viewInBrief'),
    recordCountByCount,
    caseStudyCountByCount,
  };

  const readPathRoutes = (
    t.raw('readPath.routes') as Array<{
      label: string;
      path: string;
    }>
  ).map((r) => ({ label: r.label, href: `/${locale}${r.path}` }));

  const caseStudies = (await getCaseStudies(locale)).slice(0, CASE_STUDIES_MAX);
  const recordHighlights = publicRecords.slice(0, PUBLIC_RECORD_HIGHLIGHTS_MAX);

  let executiveBriefArtifact: {
    title: string;
    version: string;
    date: string;
    href: string;
    checksum?: string;
    scopeLabel?: string;
  } | null = null;
  try {
    const artifact = getExecutiveBriefArtifact();
    if (artifact) {
      executiveBriefArtifact = {
        title: artifact.title,
        version: artifact.version,
        date: artifact.date,
        href: `/artifacts/${artifact.filename}`,
        checksum: artifact.sha256,
        scopeLabel: t('artifacts.executiveBriefScope'),
      };
    }
  } catch {
    // Manifest or file validation failed; show not published in dev
  }

  const selectedOutcomesItems = t.raw('selectedOutcomes.items') as string[];
  const hasMoreClaims = claimRegistry.length > CLAIMS_DEFAULT_COUNT;
  const briefContent = await getBriefContent(locale);
  const quantifiedOutcomes = briefContent?.quantifiedOutcomes ?? [];

  return (
    <>
      <PersonJsonLd />
      <BriefPageJsonLd
        locale={locale}
        claimIds={featuredClaims.map((c) => c.id)}
        caseStudySlugs={caseStudies.map((s) => s.frontmatter.slug)}
        publicRecordSlugs={recordHighlights.map((r) => r.frontmatter.slug)}
      />
      <HeroSection title={t('hero.title')} lede={t('hero.lede')} />

      <IdentityScopeSection body={t('identityScope')} />

      <ReadPathSection
        title={t('readPath.title')}
        lede={t('readPath.lede')}
        routes={readPathRoutes}
      />

      <VerificationGuidanceSection
        title={t('verificationGuidance.title')}
        body={t('verificationGuidance.body')}
      />

      <section id="claims" className="section-shell">
        <Container className="section-shell">
          <div className="section-shell">
            <h2 className="text-title font-semibold">{t('claims.title')}</h2>
            <p className="text-base text-muted">{t('claims.lede')}</p>
          </div>
          <BriefNavigator
            claimCards={claimCards}
            briefAnchorBase={`/${locale}/brief`}
            categoryOptions={categoryOptions}
            labels={navigatorLabels}
          />
          {hasMoreClaims ? (
            <p className="mt-3 text-sm text-muted">
              {t('claims.allClaimsExpander')}
            </p>
          ) : null}
        </Container>
      </section>

      <ListSection
        title={t('selectedOutcomes.title')}
        items={selectedOutcomesItems}
      />

      {quantifiedOutcomes.length > 0 ? (
        <QuantifiedOutcomesSection
          title={t('quantifiedOutcomes.title')}
          items={quantifiedOutcomes}
        />
      ) : null}

      <CardGridSection
        title={t('caseStudies.title')}
        lede={t('caseStudies.lede')}
        items={caseStudies.map((study) => ({
          title: study.frontmatter.title,
          description: study.frontmatter.summary,
          meta: study.frontmatter.date,
          href: `/${locale}/casestudies/${study.frontmatter.slug}`,
        }))}
      />

      <CardGridSection
        title={t('publicRecordHighlights.title')}
        lede={t('publicRecordHighlights.lede')}
        items={recordHighlights.map((record) => ({
          title: record.frontmatter.title,
          description: record.frontmatter.claimSupported,
          meta: record.frontmatter.date,
          href: `/${locale}/publicrecord/${record.frontmatter.slug}`,
        }))}
      />

      <ArtifactSingleSection
        title={t('artifacts.title')}
        lede={t('artifacts.lede')}
        artifact={executiveBriefArtifact}
        notPublishedMessage={t('artifacts.notPublished')}
        downloadLabel={t('artifacts.downloadLabel')}
        checksumLabel={t('artifacts.checksum')}
        scopeLabelHeading={t('artifacts.scopeLabel')}
      />

      <ContactPathwaySection
        title={t('contactPathway.title')}
        linkLabel={t('contactPathway.linkLabel')}
        href={`/${locale}/contact`}
      />
    </>
  );
}

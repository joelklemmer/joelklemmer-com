import { getLocale } from 'next-intl/server';
import {
  createScopedTranslator,
  loadMessages,
  type AppLocale,
} from '@joelklemmer/i18n';
import {
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
  BriefClaimsSection,
  ListSection,
  QuantifiedOutcomesSection,
  CardGridSection,
  ArtifactSingleSection,
  ContactPathwaySection,
  HeroSection,
} from '@joelklemmer/sections';

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
      verificationStrength: claim.recordIds.length,
      lastVerified,
      supportingLinks,
      caseStudies,
      casestudiesBasePath: `/${locale}/casestudies`,
      publicrecordBasePath: `/${locale}/proof`,
      supportingRecordsLabel: t('claims.supportingRecords'),
      supportingCaseStudiesLabel: t('claims.supportingCaseStudies'),
      verificationConnectionsLabel: t('claims.verificationConnections'),
      lastVerifiedLabel: t('claims.lastVerified'),
    };
  });

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

      <BriefClaimsSection
        id="claims"
        title={t('claims.title')}
        lede={t('claims.lede')}
        claims={claimCards}
        showAllExpander={hasMoreClaims}
        allClaimsExpanderLabel={t('claims.allClaimsExpander')}
      />

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

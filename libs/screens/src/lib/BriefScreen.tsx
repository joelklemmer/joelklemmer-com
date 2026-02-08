import { getLocale } from 'next-intl/server';
import { cookies } from 'next/headers';
import {
  createScopedTranslator,
  loadMessages,
  type AppLocale,
} from '@joelklemmer/i18n';
import { resolveEvaluatorMode } from '@joelklemmer/evaluator-mode';
import {
  CLAIM_CATEGORIES,
  claimRegistry,
  getFeaturedClaims,
  getCaseStudies,
  getCaseStudiesByClaimIdMap,
  getFrameworkList,
  getLastVerifiedFromRecordDates,
  getBriefContent,
  getPublicRecordList,
  getExecutiveBriefArtifact,
} from '@joelklemmer/content';
import {
  populateRegistryFromConfig,
  getEntitySignalVector,
  getStructuredMapping,
  getEntropyContribution,
} from '@joelklemmer/authority-mapping';
import {
  getDominantSignalIdFromEffective,
  getEffectiveWeights,
  AUTHORITY_SIGNAL_IDS,
} from '@joelklemmer/authority-signals';
import {
  computeOrchestrationHints,
  type SignalVectorInput,
} from '@joelklemmer/authority-orchestration';
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
  FrameworkDetailSection,
  HeroSection,
  EvidenceGraphSection,
  AECBriefingPanel,
} from '@joelklemmer/sections';
import type { AECFormattedResult } from '@joelklemmer/aec';
import { AEC_QUERY_INTENTS } from '@joelklemmer/aec';
import { getEntityGraph } from '@joelklemmer/intelligence';
import type { EntityGraph } from '@joelklemmer/intelligence';
import { Container } from '@joelklemmer/ui';
import { DensityAwarePage } from '@joelklemmer/authority-density';
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

export interface BriefScreenProps {
  /** When provided, AEC briefing panel is rendered and uses this action. */
  queryBriefingAction?: (formData: FormData) => Promise<AECFormattedResult>;
}

const CLAIMS_DEFAULT_COUNT = 9;
const CASE_STUDIES_MAX = 3;
const PUBLIC_RECORD_HIGHLIGHTS_MAX = 10;

export async function BriefScreen(props?: BriefScreenProps) {
  const { queryBriefingAction } = props ?? {};
  const locale = (await getLocale()) as AppLocale;
  const messages = await loadMessages(locale, [
    'brief',
    'common',
    'frameworks',
  ]);
  const t = createScopedTranslator(locale, messages, 'brief');
  const tCommon = createScopedTranslator(locale, messages, 'common');
  const tFw = createScopedTranslator(locale, messages, 'frameworks');

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
  const cookieStore = await cookies();
  const evaluatorMode = resolveEvaluatorMode({
    cookies: cookieStore.toString(),
    isDev: process.env.NODE_ENV !== 'production',
  });

  const recordIdToDate = new Map<string, string>();
  for (const record of publicRecords) {
    const date = record.frontmatter.date;
    if (!date) continue;
    recordIdToDate.set(record.frontmatter.slug, date);
    if (record.frontmatter.id) {
      recordIdToDate.set(record.frontmatter.id, date);
    }
  }

  populateRegistryFromConfig();
  const featuredClaims = getFeaturedClaims();
  const caseStudiesByClaim = await getCaseStudiesByClaimIdMap(
    featuredClaims.map((c) => c.id),
  );
  const signalOrder = new Map(AUTHORITY_SIGNAL_IDS.map((id, i) => [id, i]));
  const mapping = getStructuredMapping();
  const claimEntries = mapping.entries.filter((e) => e.entityKind === 'claim');
  const claimVectors = claimEntries.map((e) => ({
    entityId: e.entityId,
    effective: getEffectiveWeights(e.signalVector),
  }));
  const meanVector = AUTHORITY_SIGNAL_IDS.reduce(
    (acc, id) => {
      const sum = claimVectors.reduce((s, v) => s + v.effective[id], 0);
      acc[id] = claimVectors.length ? sum / claimVectors.length : 0;
      return acc;
    },
    {} as Record<(typeof AUTHORITY_SIGNAL_IDS)[number], number>,
  );

  const claimCardsUnsorted = featuredClaims.map((claim) => {
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
    const vector = getEntitySignalVector('claim', claim.id, evaluatorMode);
    const effectiveVector = vector ? getEffectiveWeights(vector) : undefined;
    const dominantSignalId = vector
      ? getDominantSignalIdFromEffective(vector)
      : undefined;
    const entropyContribution = effectiveVector
      ? getEntropyContribution(effectiveVector, meanVector)
      : 0;
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
      dominantSignalId,
      entropyContribution,
    };
  });

  const signalVectorsForOrchestration: SignalVectorInput[] =
    claimCardsUnsorted.map((c) => ({
      entityKind: 'claims',
      entityId: c.id,
      signalScore:
        c.dominantSignalId != null
          ? 0.5 + (signalOrder.get(c.dominantSignalId) ?? 99) * 0.01
          : 0.5,
      entropyContribution: c.entropyContribution,
    }));
  const orchestrationHints = computeOrchestrationHints({
    evaluatorMode,
    signalVectors: signalVectorsForOrchestration,
  });

  const bySignalThenEntropy = [...claimCardsUnsorted].sort((a, b) => {
    const emphasisA = orchestrationHints.entityEmphasisScores[a.id] ?? 0;
    const emphasisB = orchestrationHints.entityEmphasisScores[b.id] ?? 0;
    if (emphasisB !== emphasisA) return emphasisB - emphasisA;
    const orderA = a.dominantSignalId
      ? (signalOrder.get(a.dominantSignalId) ?? 99)
      : 99;
    const orderB = b.dominantSignalId
      ? (signalOrder.get(b.dominantSignalId) ?? 99)
      : 99;
    if (orderA !== orderB) return orderA - orderB;
    if (b.entropyContribution !== a.entropyContribution)
      return b.entropyContribution - a.entropyContribution;
    return a.id.localeCompare(b.id);
  });

  const bySignal = new Map<string, typeof bySignalThenEntropy>();
  for (const card of bySignalThenEntropy) {
    const key = card.dominantSignalId ?? '_';
    if (!bySignal.has(key)) bySignal.set(key, []);
    bySignal.get(key)!.push(card);
  }
  const signalOrderList = [...signalOrder.entries()]
    .sort((a, b) => a[1] - b[1])
    .map(([id]) => id);
  const maxLen = Math.max(
    ...Array.from(bySignal.values()).map((arr) => arr.length),
    1,
  );
  const claimCards: typeof claimCardsUnsorted = [];
  for (let i = 0; i < maxLen; i++) {
    for (const signalId of signalOrderList) {
      const group = bySignal.get(signalId) ?? [];
      if (group[i]) claimCards.push(group[i]);
    }
  }

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
  const frameworkList = await getFrameworkList();

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

  const entityGraph: EntityGraph = await getEntityGraph(undefined, {
    getSignalVector: (kind, id) =>
      getEntitySignalVector(kind, id, evaluatorMode),
  });
  const labelByNodeId = new Map<string, string>();
  const hrefByNodeId = new Map<string, string>();
  for (const node of entityGraph.nodes) {
    const label =
      node.kind === 'claim'
        ? t(node.labelKey)
        : node.kind === 'framework'
          ? tFw(node.titleKey)
          : (node as { title: string }).title;
    labelByNodeId.set(node.id, label);
    if (node.kind === 'record' && 'slug' in node) {
      hrefByNodeId.set(node.id, `/${locale}/publicrecord/${node.slug}`);
    } else if (node.kind === 'caseStudy' && 'slug' in node) {
      hrefByNodeId.set(node.id, `/${locale}/casestudies/${node.slug}`);
    } else if (node.kind === 'book' && 'slug' in node) {
      hrefByNodeId.set(node.id, `/${locale}/books/${node.slug}`);
    } else if (node.kind === 'framework') {
      hrefByNodeId.set(node.id, `/${locale}/brief#doctrine`);
    }
  }
  const linkedLabelsByNodeId = new Map<string, string[]>();
  for (const node of entityGraph.nodes) {
    const linked = new Set<string>();
    for (const edge of entityGraph.edges) {
      if (edge.fromId === node.id) {
        const other = labelByNodeId.get(edge.toId);
        if (other) linked.add(other);
      } else if (edge.toId === node.id) {
        const other = labelByNodeId.get(edge.fromId);
        if (other) linked.add(other);
      }
    }
    linkedLabelsByNodeId.set(node.id, [...linked]);
  }
  const evidenceGraphNodes = entityGraph.nodes.map((node) => ({
    id: node.id,
    label: labelByNodeId.get(node.id) ?? node.id,
    href: hrefByNodeId.get(node.id),
    linkedLabels: linkedLabelsByNodeId.get(node.id) ?? [],
  }));

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

      <DensityAwarePage
        toggleLabel={tCommon('density.toggleLabel')}
        densityDefault={orchestrationHints.densityDefaultSuggestion}
      >
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

        {queryBriefingAction ? (
          <AECBriefingPanel
            title={t('aec.title')}
            placeholder={t('aec.placeholder')}
            intentOptions={AEC_QUERY_INTENTS.map((value) => ({
              value,
              label: t(`aec.intents.${value}`),
            }))}
            submitLabel={t('aec.submitLabel')}
            collapseLabel={t('aec.collapseLabel')}
            expandLabel={t('aec.expandLabel')}
            loadingLabel={t('aec.loadingLabel')}
            linksLabel={t('aec.linksLabel')}
            queryAction={queryBriefingAction}
          />
        ) : null}

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

        <EvidenceGraphSection
          title={t('evidenceGraph.title')}
          tracePathLabel={t('evidenceGraph.tracePath')}
          nodes={evidenceGraphNodes}
        />

        {frameworkList.length > 0 ? (
          <FrameworkDetailSection
            id="doctrine"
            title={tFw('section.title')}
            lede={tFw('section.lede')}
            expandLabel={tFw('section.expandLabel')}
            items={frameworkList.map((fw) => ({
              title: tFw(fw.frontmatter.titleKey),
              intent10: tFw(fw.frontmatter.intent10Key),
              intent60: tFw(fw.frontmatter.intent60Key),
            }))}
          />
        ) : null}

        <ContactPathwaySection
          title={t('contactPathway.title')}
          linkLabel={t('contactPathway.linkLabel')}
          href={`/${locale}/contact`}
        />
      </DensityAwarePage>
    </>
  );
}

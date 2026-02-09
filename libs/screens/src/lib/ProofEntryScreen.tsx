import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getLocale } from 'next-intl/server';
import { defaultLocale, locales, type AppLocale } from '@joelklemmer/i18n';
import {
  getBooksByRecordId,
  getCaseStudiesByRecordId,
  getClaimsSupportingRecord,
  getPublicRecordEntry,
  getPublicRecordId,
  getPublicRecordSlugs,
  renderMdx,
} from '@joelklemmer/content';
import { ArticleJsonLd, createPageMetadata } from '@joelklemmer/seo';
import { createScopedTranslator, loadMessages } from '@joelklemmer/i18n';
import { focusRingClass } from '@joelklemmer/a11y';
import {
  DefinitionListSection,
  FallbackNoticeSection,
  HeroSection,
  LinkListSection,
  MdxSection,
} from '@joelklemmer/sections';
import { Container } from '@joelklemmer/ui';
import { CopySha256Button } from './CopySha256Button';
import { AttachmentLink } from './AttachmentLink';

export async function generateStaticParams() {
  const slugs = await getPublicRecordSlugs();
  return locales.flatMap((locale) => slugs.map((slug) => ({ locale, slug })));
}

export const proofEntryStaticParams = generateStaticParams;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const locale = (await getLocale()) as AppLocale;
  const entry = await getPublicRecordEntry(locale, slug);
  if (!entry) {
    notFound();
  }

  return createPageMetadata({
    title: entry.frontmatter.title,
    description: entry.frontmatter.claimSupported,
    locale,
    pathname: `/publicrecord/${entry.frontmatter.slug}`,
    canonicalLocale: entry.frontmatter.locale,
    canonicalOverride: entry.frontmatter.canonical,
  });
}

export const proofEntryMetadata = generateMetadata;

export async function ProofEntryScreen({ slug }: { slug: string }) {
  const locale = (await getLocale()) as AppLocale;
  const entry = await getPublicRecordEntry(locale, slug);
  if (!entry) {
    notFound();
  }
  const messages = await loadMessages(locale, [
    'proof',
    'brief',
    'common',
    'publicRecord',
  ]);
  const t = createScopedTranslator(locale, messages, 'publicRecord');
  const tBrief = createScopedTranslator(locale, messages, 'brief');
  const tCommon = createScopedTranslator(locale, messages, 'common');
  const recordId = getPublicRecordId(entry.frontmatter);
  const supportingClaims = getClaimsSupportingRecord(recordId);
  const referencedByCaseStudies = await getCaseStudiesByRecordId(recordId);
  const referencedByBooks = await getBooksByRecordId(recordId);
  const showFallbackNotice = entry.frontmatter.locale !== locale;
  const source = entry.frontmatter.source;
  const sourceDisplay =
    typeof source === 'string' ? (
      source
    ) : (
      <>
        {source.sourceUrl ? (
          <Link
            href={source.sourceUrl}
            className={`${focusRingClass} rounded-sm underline underline-offset-4`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {source.sourceName}
          </Link>
        ) : (
          source.sourceName
        )}
      </>
    );
  const verification = entry.frontmatter.verification;
  const attachments = entry.frontmatter.attachments ?? [];

  const sourceOneLiner =
    typeof source === 'string' ? source : source.sourceName;

  return (
    <>
      <ArticleJsonLd
        locale={locale}
        pathname={`/publicrecord/${entry.frontmatter.slug}`}
        headline={entry.frontmatter.title}
        description={entry.frontmatter.claimSupported}
        datePublished={entry.frontmatter.date}
      />
      {showFallbackNotice ? (
        <FallbackNoticeSection
          title={tCommon('fallbackNotice.title')}
          body={tCommon('fallbackNotice.body')}
          linkLabel={tCommon('fallbackNotice.linkLabel')}
          href={`/${defaultLocale}/publicrecord/${entry.frontmatter.slug}`}
        />
      ) : null}

      {/* Layer 1: Scan — minimal surface, at-a-glance summary and claim binding */}
      <section data-layer="scan" aria-label={t('layers.scan')}>
        <HeroSection
          title={entry.frontmatter.title}
          lede={entry.frontmatter.claimSupported}
        />
        <Container className="section-shell">
          <p className="text-body-analytical text-muted">
            {entry.frontmatter.artifactType} · {entry.frontmatter.date} ·{' '}
            {sourceOneLiner}
          </p>
          {supportingClaims.length > 0 ? (
            <p className="mt-2 text-sm text-muted">
              {t('substantiates')}:{' '}
              {supportingClaims.map((claim, i) => (
                <span key={claim.id}>
                  {i > 0 ? ', ' : ''}
                  <Link
                    href={`/${locale}/brief#claim-${claim.id}`}
                    className={`${focusRingClass} rounded-sm underline underline-offset-4`}
                  >
                    {tBrief(claim.labelKey)}
                  </Link>
                </span>
              ))}
            </p>
          ) : null}
        </Container>
      </section>

      {/* Doctrine: how to read this page — verification method legible without marketing */}
      <section
        data-doctrine="how-to-read"
        className="section-shell"
        aria-labelledby="doctrine-heading"
      >
        <Container className="section-shell">
          <h2
            id="doctrine-heading"
            className="text-section-heading font-semibold"
          >
            {t('doctrine.howToReadHeading')}
          </h2>
          <p className="text-body-analytical text-muted">
            {t('doctrine.howToReadBody')}
          </p>
        </Container>
      </section>

      {/* Layer 2: Substantiation — verification, source, metadata, claim/case/book links */}
      <section
        data-layer="substantiation"
        aria-label={t('layers.substantiation')}
      >
        <DefinitionListSection
          title={t('metadata.title')}
          items={[
            {
              label: t('metadata.labels.claimSupported'),
              value: entry.frontmatter.claimSupported,
            },
            {
              label: t('metadata.labels.type'),
              value: entry.frontmatter.artifactType,
            },
            {
              label: t('metadata.labels.date'),
              value: entry.frontmatter.date,
            },
            {
              label: t('metadata.labels.source'),
              value: sourceDisplay,
            },
            {
              label: t('metadata.labels.verification'),
              value: entry.frontmatter.verificationNotes,
            },
            {
              label: t('metadata.labels.claimLink'),
              value: (
                <Link
                  href={`/${locale}/brief#claims`}
                  className={`${focusRingClass} rounded-sm underline underline-offset-4`}
                >
                  {t('metadata.claimLinkAction')}
                </Link>
              ),
            },
          ]}
        />
        {verification ? (
          <DefinitionListSection
            title={t('verification.heading')}
            items={[
              {
                label: t('verification.method'),
                value: t(`verification.methodValue.${verification.method}`),
              },
              {
                label: t('verification.confidence'),
                value: t(
                  `verification.confidenceValue.${verification.confidence}`,
                ),
              },
              ...(verification.verifiedDate
                ? [
                    {
                      label: t('verification.verifiedDate'),
                      value: verification.verifiedDate,
                    },
                  ]
                : []),
            ]}
          />
        ) : null}
        {typeof source === 'object' ? (
          <DefinitionListSection
            title={t('source.heading')}
            items={[
              {
                label: t('source.type'),
                value: t(`source.typeValue.${source.sourceType}`),
              },
              { label: t('source.name'), value: source.sourceName },
              ...(source.sourceUrl
                ? [
                    {
                      label: t('source.url'),
                      value: (
                        <Link
                          href={source.sourceUrl}
                          className={`${focusRingClass} rounded-sm underline underline-offset-4`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {source.sourceUrl}
                        </Link>
                      ),
                    },
                  ]
                : []),
            ]}
          />
        ) : null}
        <LinkListSection
          title={t('supportsClaims.heading')}
          items={supportingClaims.map((claim) => ({
            label: tBrief(claim.labelKey),
            href: `/${locale}/brief#claim-${claim.id}`,
          }))}
          emptyMessage={t('supportsClaims.empty')}
        />
        <LinkListSection
          title={t('referencedByCaseStudies.heading')}
          items={referencedByCaseStudies.map((cs) => ({
            label: cs.title,
            href: `/${locale}/casestudies/${cs.slug}`,
          }))}
          emptyMessage={t('referencedByCaseStudies.empty')}
        />
        <LinkListSection
          title={t('referencedByBooks.heading')}
          items={referencedByBooks.map((b) => ({
            label: b.title,
            href: `/${locale}/books/${b.slug}`,
          }))}
          emptyMessage={t('referencedByBooks.empty')}
        />
      </section>

      {/* Layer 3: Artifact — attachments (with SHA copy) and body */}
      <section data-layer="artifact" aria-label={t('layers.artifact')}>
        {attachments.length > 0 ? (
          <section
            className="section-shell"
            aria-labelledby="attachments-heading"
          >
            <Container className="section-shell">
              <h2
                id="attachments-heading"
                className="text-section-heading font-semibold"
              >
                {t('attachments.heading')}
              </h2>
              <dl className="grid gap-4 text-sm text-muted md:grid-cols-2">
                {attachments.map((att) => (
                  <div
                    key={att.id}
                    className="section-shell"
                    data-attachment-id={att.id}
                    data-attachment-sha={att.sha256}
                  >
                    <dt className="text-xs font-semibold uppercase tracking-wide text-text">
                      {t(`attachments.labels.${att.labelKey}`)}
                    </dt>
                    <dd className="text-base text-muted">
                      <AttachmentLink
                        href={`/proof/files/${att.filename}`}
                        filename={att.filename}
                        download={att.filename}
                        className={`${focusRingClass} rounded-sm underline underline-offset-4`}
                        aria-label={`${t('attachments.download')}: ${att.filename}`}
                      >
                        {att.filename}
                      </AttachmentLink>
                      <span className="ml-2 font-mono text-xs">
                        {att.sha256.slice(0, 8)}…
                      </span>
                      <CopySha256Button
                        sha256={att.sha256}
                        copyLabel={t('attachments.copyHash')}
                      />
                    </dd>
                  </div>
                ))}
              </dl>
            </Container>
          </section>
        ) : null}
        <MdxSection>{await renderMdx(entry.content)}</MdxSection>
      </section>
    </>
  );
}

/**
 * Executive Brief: Briefing room composition.
 * Quiet authority, proof-forward, scannable structure.
 */
import { getLocale } from 'next-intl/server';
import {
  createScopedTranslator,
  loadMessages,
  type AppLocale,
} from '@joelklemmer/i18n';
import { getExecutiveBriefArtifact } from '@joelklemmer/content';
import { PersonJsonLd, BriefPageJsonLd } from '@joelklemmer/seo';
import { BriefTocMobile, BriefTocCompact } from '@joelklemmer/sections';
import { Container } from '@joelklemmer/ui';
import Link from 'next/link';
import { focusRingClass } from '@joelklemmer/a11y';

export async function generateMetadata(options?: { baseUrl?: string }) {
  const locale = (await getLocale()) as AppLocale;
  const messages = await loadMessages(locale, ['seo', 'meta']);
  const { buildMetadata } = await import('@joelklemmer/seo');
  return buildMetadata({
    locale,
    routeKey: 'brief',
    pathname: '/brief',
    baseUrl: options?.baseUrl,
    messages,
    ogImageSlug: 'brief',
  });
}

export const briefMetadata = generateMetadata;

export interface BriefScreenProps {
  queryBriefingAction?: (formData: FormData) => Promise<unknown>;
}

export async function BriefScreen(_props?: BriefScreenProps) {
  const locale = (await getLocale()) as AppLocale;
  const messages = await loadMessages(locale, ['brief', 'common']);
  const t = createScopedTranslator(locale, messages, 'brief');

  let pdfHref: string | null = null;
  let lastUpdated: string | null = null;
  try {
    const artifact = getExecutiveBriefArtifact();
    if (artifact) {
      pdfHref = `/artifacts/${artifact.filename}`;
      lastUpdated = artifact.date ?? null;
    }
  } catch {
    // Manifest or file validation failed
  }

  const base = `/${locale}`;

  const tocItems = [
    { id: 'operating-architecture', label: t('toc.operatingArchitecture') },
    { id: 'structural-impact', label: t('toc.structuralImpact') },
    { id: 'governance-trust', label: t('toc.governanceTrust') },
    { id: 'leadership-envelope', label: t('toc.leadershipEnvelope') },
    { id: 'verification', label: t('toc.verification') },
  ];

  const signals = t.raw('signals.items') as Array<{
    metric: string;
    label: string;
    qualifier: string;
  }>;

  const doctrineLines = t.raw('doctrine.lines') as string[];
  const impactBlocks = t.raw('impact.blocks') as Array<{
    context: string;
    intervention: string;
    outcome: string;
    structuralOutcome: string;
  }>;
  const governanceLines = t.raw('governance.lines') as Array<{
    lead: string;
    body: string;
  }>;
  const envelopeItems = t.raw('envelope.items') as string[];

  const verificationLinks: Array<{ label: string; href: string }> = [
    { label: t('verificationLinks.publicRecord'), href: `${base}/proof` },
    { label: t('verificationLinks.caseStudies'), href: `${base}/work` },
  ];
  if (t('verificationLinks.mediaKit')) {
    verificationLinks.push({
      label: t('verificationLinks.mediaKit'),
      href: `${base}/media-kit`,
    });
  }
  verificationLinks.push({
    label: t('verificationLinks.contact'),
    href: `${base}/contact`,
  });
  if (pdfHref) {
    verificationLinks.push({
      label: t('verificationLinks.executiveBriefPdf'),
      href: pdfHref,
    });
  }
  if (t('verificationLinks.bio')) {
    verificationLinks.push({
      label: t('verificationLinks.bio'),
      href: `${base}/bio`,
    });
  }

  return (
    <div className="brief-page-root" data-route="brief">
      <PersonJsonLd />
      <BriefPageJsonLd
        locale={locale}
        claimIds={[]}
        caseStudySlugs={[]}
        publicRecordSlugs={[]}
      />

      <Container variant="wide" className="section-shell">
        <main className="min-w-0 max-w-[56rem]">
          {/* Hero: single column, no side rail */}
          <header className="section-shell pb-6">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              <p className="text-xs uppercase tracking-wider text-muted">
                {t('hero.eyebrow')}
              </p>
              {lastUpdated ? (
                <p className="text-xs text-muted">
                  {t('hero.lastUpdated')}: {lastUpdated}
                </p>
              ) : null}
            </div>
            <h1
              id="brief-title"
              className="mt-3 text-2xl md:text-3xl font-serif font-normal leading-tight max-w-prose text-text"
            >
              {t('hero.headline')}
            </h1>
            <p className="mt-2 text-body-analytical text-muted max-w-prose">
              {t('hero.subhead')}
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-4 hero-actions">
              {pdfHref ? (
                <Link
                  href={pdfHref}
                  className={`${focusRingClass} hero-action-link hero-action-primary`}
                >
                  {t('hero.ctaPrimary')}
                </Link>
              ) : null}
              <Link
                href={`${base}/proof`}
                className={`${focusRingClass} hero-action-link hero-action-secondary`}
              >
                {t('hero.ctaSecondary')}
              </Link>
              <Link
                href={`${base}/work`}
                className={`${focusRingClass} text-sm text-muted hover:text-accent`}
              >
                {t('hero.ctaTertiary')}
              </Link>
            </div>
          </header>

          {/* Scope signals */}
          <section
            className="section-shell border-t border-border-subtle pt-8"
            aria-labelledby="signals-heading"
          >
            <h2 id="signals-heading" className="sr-only">
              {t('signals.title')}
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {signals.map((item, i) => (
                <div
                  key={i}
                  className="flex flex-col gap-0.5 p-4 bg-muted/5 rounded-sm"
                >
                  <span className="text-lg font-serif font-medium text-text">
                    {item.metric}
                  </span>
                  <span className="text-sm font-medium text-text">
                    {item.label}
                  </span>
                  <span className="text-xs text-muted">{item.qualifier}</span>
                </div>
              ))}
            </div>
          </section>

          {/* In this brief: compact below metrics; mobile collapsible, desktop inline */}
          <BriefTocMobile items={tocItems} jumpToLabel={t('toc.jumpTo')} />
          <BriefTocCompact items={tocItems} jumpToLabel={t('toc.jumpTo')} />

          {/* Operating Architecture */}
          <section
            id="operating-architecture"
            className="section-shell border-t border-border-subtle pt-10"
          >
            <Container variant="readable" className="section-shell">
              <h2 className="text-section-heading font-semibold pt-0">
                {t('operatingArchitecture.title')}
              </h2>
              <p className="mt-2 text-body-analytical text-muted">
                {t('operatingArchitecture.intro')}
              </p>
              <ul className="authority-list text-base mt-4">
                {doctrineLines.map((line) => (
                  <li key={line} className="flex gap-2">
                    <span aria-hidden className="authority-list-bullet">
                      •
                    </span>
                    <span className="authority-list-item-text flex-1">
                      {line}
                    </span>
                  </li>
                ))}
              </ul>
            </Container>
          </section>

          {/* Structural Impact */}
          <section
            id="structural-impact"
            className="section-shell border-t border-border-subtle pt-10"
          >
            <Container variant="readable" className="section-shell">
              <h2 className="text-section-heading font-semibold pt-0">
                {t('impact.title')}
              </h2>
              <p className="mt-2 text-body-analytical text-muted">
                {t('impact.intro')}
              </p>
              <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
                {impactBlocks.map((block, i) => (
                  <div
                    key={i}
                    className="flex flex-col gap-3 p-4 bg-muted/5 rounded-sm"
                  >
                    <div>
                      <p className="text-meta-label font-semibold uppercase tracking-wide text-text">
                        {t('impact.labels.context')}
                      </p>
                      <p className="text-body-analytical text-muted">
                        {block.context}
                      </p>
                    </div>
                    <div>
                      <p className="text-meta-label font-semibold uppercase tracking-wide text-text">
                        {t('impact.labels.intervention')}
                      </p>
                      <p className="text-body-analytical text-muted">
                        {block.intervention}
                      </p>
                    </div>
                    <div>
                      <p className="text-meta-label font-semibold uppercase tracking-wide text-text">
                        {t('impact.labels.outcome')}
                      </p>
                      <p className="text-body-analytical text-muted">
                        {block.outcome}
                      </p>
                    </div>
                    <div>
                      <p className="text-meta-label font-semibold uppercase tracking-wide text-text">
                        {t('impact.labels.structuralOutcome')}
                      </p>
                      <p className="text-body-analytical text-muted">
                        {block.structuralOutcome}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Container>
          </section>

          {/* Governance and Public Trust */}
          <section
            id="governance-trust"
            className="section-shell border-t border-border-subtle pt-10"
          >
            <Container variant="readable" className="section-shell">
              <h2 className="text-section-heading font-semibold pt-0">
                {t('governance.title')}
              </h2>
              <p className="mt-2 text-body-analytical text-muted">
                {t('governance.intro')}
              </p>
              <dl className="mt-4 grid gap-3">
                {governanceLines.map((item, i) => (
                  <div key={i} className="flex flex-col gap-1">
                    <dt className="text-sm font-semibold text-text">
                      {item.lead}
                    </dt>
                    <dd className="text-body-analytical text-muted">
                      {item.body}
                    </dd>
                  </div>
                ))}
              </dl>
            </Container>
          </section>

          {/* Leadership Envelope */}
          <section
            id="leadership-envelope"
            className="section-shell border-t border-border-subtle pt-10"
          >
            <Container variant="readable" className="section-shell">
              <h2 className="text-section-heading font-semibold pt-0">
                {t('envelope.title')}
              </h2>
              <p className="mt-2 text-body-analytical text-muted">
                {t('envelope.intro')}
              </p>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {envelopeItems.slice(0, 4).map((item) => (
                  <li
                    key={item}
                    className="p-3 bg-muted/5 rounded-sm text-body-analytical"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </Container>
          </section>

          {/* Verification and Evidence */}
          <section
            id="verification"
            className="section-shell border-t border-border-subtle pt-10"
          >
            <Container variant="readable" className="section-shell">
              <h2 className="text-section-heading font-semibold pt-0">
                {t('verification.title')}
              </h2>
              <p className="mt-2 text-body-analytical text-muted">
                {t('verification.intro')}
              </p>
              <ul className="mt-4 grid gap-2 text-base">
                {verificationLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className={`${focusRingClass} text-muted underline underline-offset-4 hover:text-accent`}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </Container>
          </section>
        </main>
      </Container>
    </div>
  );
}

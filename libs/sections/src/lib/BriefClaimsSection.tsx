import Link from 'next/link';
import { focusRingClass } from '@joelklemmer/a11y';
import { Container } from '@joelklemmer/ui';

export interface ClaimCardItem {
  id: string;
  label: string;
  summary: string;
  category?: string;
  verificationStrength: number;
  lastVerified?: string;
  supportingLinks: Array<{ label: string; href: string }>;
  /** Case studies referencing this claim */
  caseStudies: Array<{ slug: string; title: string }>;
  casestudiesBasePath: string;
  publicrecordBasePath: string;
  supportingRecordsLabel: string;
  supportingCaseStudiesLabel: string;
  verificationConnectionsLabel: string;
  lastVerifiedLabel: string;
}

export interface BriefClaimsSectionProps {
  id?: string;
  title: string;
  lede?: string;
  claims: ClaimCardItem[];
  allClaimsExpanderLabel?: string;
  showAllExpander?: boolean;
  onExpandAll?: () => void;
}

export function BriefClaimsSection({
  id,
  title,
  lede,
  claims,
  allClaimsExpanderLabel,
  showAllExpander,
}: BriefClaimsSectionProps) {
  return (
    <section id={id} className="section-shell">
      <Container className="section-shell">
        <div className="section-shell">
          <h2 className="text-section-heading font-semibold">{title}</h2>
          {lede ? (
            <p className="text-body-analytical text-muted">{lede}</p>
          ) : null}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {claims.map((claim) => (
            <article
              key={claim.id}
              id={`claim-${claim.id}`}
              className="authority-card section-shell rounded-card border border-border p-4"
            >
              <h3 className="text-lg font-semibold text-text">{claim.label}</h3>
              {claim.category ? (
                <p className="text-meta-label text-muted">{claim.category}</p>
              ) : null}
              <p className="text-body-analytical text-sm text-muted">
                {claim.summary}
              </p>
              <dl className="mt-2 text-xs text-muted">
                <div>
                  <dt className="sr-only">Verification strength</dt>
                  <dd>
                    <span className="font-medium">
                      {claim.verificationStrength}{' '}
                      {claim.verificationStrength === 1 ? 'record' : 'records'}{' '}
                      linked
                    </span>
                  </dd>
                </div>
                {claim.lastVerified ? (
                  <div className="mt-1">
                    <dt className="sr-only">{claim.lastVerifiedLabel}</dt>
                    <dd>{claim.lastVerified}</dd>
                  </div>
                ) : null}
              </dl>
              <div
                className="mt-2"
                role="group"
                aria-label={claim.verificationConnectionsLabel}
              >
                <p className="text-xs font-medium text-muted">
                  {claim.verificationConnectionsLabel}
                </p>
                <ul className="mt-1 list-none space-y-1 text-xs">
                  <li>
                    <Link
                      href={`${claim.publicrecordBasePath}`}
                      className={`inline-flex min-h-[44px] min-w-[44px] items-center ${focusRingClass} underline underline-offset-4 hover:text-accent`}
                    >
                      {claim.supportingRecordsLabel} (
                      {claim.supportingLinks.length})
                    </Link>
                  </li>
                  <li>
                    <Link
                      href={claim.casestudiesBasePath}
                      className={`inline-flex min-h-[44px] min-w-[44px] items-center ${focusRingClass} underline underline-offset-4 hover:text-accent`}
                    >
                      {claim.supportingCaseStudiesLabel} (
                      {claim.caseStudies.length})
                    </Link>
                  </li>
                </ul>
              </div>
              {claim.supportingLinks.length > 0 ? (
                <p className="mt-2 text-xs text-muted">
                  <span className="font-medium">Supporting: </span>
                  {claim.supportingLinks.map((link, i) => (
                    <span key={link.href}>
                      {i > 0 ? ', ' : ''}
                      <Link
                        href={link.href}
                        className={`${focusRingClass} underline underline-offset-4 hover:text-accent`}
                      >
                        {link.label}
                      </Link>
                    </span>
                  ))}
                </p>
              ) : null}
            </article>
          ))}
        </div>
        {showAllExpander && allClaimsExpanderLabel ? (
          <p className="mt-3 text-sm text-muted">{allClaimsExpanderLabel}</p>
        ) : null}
      </Container>
    </section>
  );
}

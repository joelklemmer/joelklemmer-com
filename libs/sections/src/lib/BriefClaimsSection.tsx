import Link from 'next/link';
import { focusRingClass } from '@joelklemmer/a11y';
import { Container } from '@joelklemmer/ui';

export interface ClaimCardItem {
  id: string;
  label: string;
  summary: string;
  supportingLinks: Array< { label: string; href: string } >;
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
          <h2 className="text-title font-semibold">{title}</h2>
          {lede ? <p className="text-base text-muted">{lede}</p> : null}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {claims.map((claim) => (
            <article
              key={claim.id}
              id={`claim-${claim.id}`}
              className="section-shell rounded-card border border-border bg-surface p-4"
            >
              <h3 className="text-lg font-semibold text-text">{claim.label}</h3>
              <p className="text-sm text-muted">{claim.summary}</p>
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

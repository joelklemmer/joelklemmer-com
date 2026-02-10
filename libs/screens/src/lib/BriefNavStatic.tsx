/**
 * Server-safe static rendering of the brief claim list (plain links, no filters or expand).
 * No client code, no zod. Used for SSR and as initial render before BriefNavigator hydrates.
 */
import Link from 'next/link';
import type { BriefNavigatorProps } from './briefNavigatorTypes';

export function BriefNavStatic({
  claimCards,
  briefAnchorBase,
  labels,
}: BriefNavigatorProps) {
  return (
    <div className="space-y-4" role="group" aria-label="Claims">
      <div className="grid gap-4 md:grid-cols-2">
        {claimCards.map((claim) => (
          <article
            key={claim.id}
            id={`claim-${claim.id}`}
            className="authority-card section-shell overflow-hidden"
          >
            <Link
              href={`${briefAnchorBase}#claim-${claim.id}`}
              className="block p-4 text-left rounded-card transition-colors duration-fast motion-reduce:transition-none hover:bg-muted/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent"
            >
              <h3 className="text-lg font-semibold text-text">{claim.label}</h3>
              {claim.category ? (
                <p className="text-xs text-muted mt-0.5">{claim.category}</p>
              ) : null}
              <p className="text-sm text-muted mt-1">{claim.summary}</p>
              <dl className="mt-2 text-xs text-muted">
                <div>
                  <dt className="sr-only">Verification strength</dt>
                  <dd className="font-medium">
                    {labels.recordCountByCount[claim.verificationStrength] ??
                      `${claim.verificationStrength}`}
                  </dd>
                </div>
                <div>
                  <dt className="sr-only">Case studies</dt>
                  <dd>
                    {labels.caseStudyCountByCount[claim.caseStudies.length] ??
                      `${claim.caseStudies.length}`}
                  </dd>
                </div>
                {claim.lastVerified ? (
                  <div className="mt-1">
                    <dt className="sr-only">{claim.lastVerifiedLabel}</dt>
                    <dd>{claim.lastVerified}</dd>
                  </div>
                ) : null}
              </dl>
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}

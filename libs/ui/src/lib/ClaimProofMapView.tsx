'use client';

import Link from 'next/link';
import { focusRingClass } from '@joelklemmer/a11y';

/** Single proof link for display. */
export interface ClaimProofMapViewProof {
  id: string;
  label: string;
  href: string;
  date?: string;
}

/** One claim row in the map. */
export interface ClaimProofMapViewEntry {
  claimId: string;
  claimLabel: string;
  claimSummary: string;
  proofs: ClaimProofMapViewProof[];
  caseStudyCount: number;
  lastVerified?: string;
  /** Precomputed hash href for the claim anchor (e.g. #claim-xyz). Server must pass; serializable. */
  claimHref?: string;
}

export interface ClaimProofMapViewProps {
  entries: ClaimProofMapViewEntry[];
  title: string;
  supportingRecordsLabel: string;
  caseStudiesLabel: string;
  lastVerifiedLabel: string;
}

export function ClaimProofMapView({
  entries,
  title,
  supportingRecordsLabel,
  caseStudiesLabel,
  lastVerifiedLabel,
}: ClaimProofMapViewProps) {
  if (entries.length === 0) return null;

  return (
    <section className="section-shell" aria-label={title}>
      <h2 className="text-section-heading font-semibold">{title}</h2>
      <ul className="mt-3 space-y-3 list-none p-0 m-0">
        {entries.map((entry) => {
          const claimHref =
            entry.claimHref ??
            (entry.claimId ? `#claim-${entry.claimId}` : undefined);
          return (
            <li
              key={entry.claimId}
              className="border border-border rounded-none overflow-hidden bg-surface"
            >
              <div className="p-4">
                <a
                  href={claimHref}
                  className={`font-medium text-text ${claimHref ? focusRingClass : ''} underline-offset-4 hover:text-accent ${claimHref ? 'underline' : ''}`}
                >
                  {entry.claimLabel}
                </a>
                <p className="text-sm text-muted mt-1">{entry.claimSummary}</p>
                <dl className="mt-2 text-xs text-muted">
                  <div>
                    <dt className="sr-only">{supportingRecordsLabel}</dt>
                    <dd>{entry.proofs.length} records</dd>
                  </div>
                  {entry.caseStudyCount > 0 ? (
                    <div>
                      <dt className="sr-only">{caseStudiesLabel}</dt>
                      <dd>{entry.caseStudyCount} case studies</dd>
                    </div>
                  ) : null}
                  {entry.lastVerified ? (
                    <div>
                      <dt className="sr-only">{lastVerifiedLabel}</dt>
                      <dd>{entry.lastVerified}</dd>
                    </div>
                  ) : null}
                </dl>
                {entry.proofs.length > 0 ? (
                  <ul className="mt-2 list-none space-y-1">
                    {entry.proofs.map((proof) => (
                      <li key={proof.id}>
                        <Link
                          href={proof.href}
                          className={`text-xs ${focusRingClass} underline underline-offset-4 hover:text-accent text-muted`}
                        >
                          {proof.label}
                          {proof.date ? ` (${proof.date})` : ''}
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { focusRingClass, visuallyHiddenClass } from '@joelklemmer/a11y';
import type {
  BriefNavigatorClaimCard,
  BriefNavigatorLabels,
  BriefNavigatorProps,
} from './briefNavigatorTypes';

export type {
  BriefNavigatorClaimCard,
  BriefNavigatorLabels,
  BriefNavigatorProps,
};

type ViewMode = 'grid' | 'graph';

export function BriefNavigator({
  claimCards,
  briefAnchorBase,
  categoryOptions,
  labels,
}: BriefNavigatorProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [strengthFilter, setStrengthFilter] = useState<number>(0);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const triggerRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const maxStrength = useMemo(
    () =>
      claimCards.length
        ? Math.max(...claimCards.map((c) => c.verificationStrength), 1)
        : 1,
    [claimCards],
  );
  const strengthOptions = useMemo(
    () => [0, ...Array.from({ length: maxStrength }, (_, i) => i + 1)],
    [maxStrength],
  );

  const filteredClaims = useMemo(() => {
    return claimCards.filter((claim) => {
      if (categoryFilter && (claim.categoryId ?? '') !== categoryFilter) {
        return false;
      }
      if (strengthFilter > 0 && claim.verificationStrength < strengthFilter) {
        return false;
      }
      return true;
    });
  }, [claimCards, categoryFilter, strengthFilter]);

  const expand = useCallback((id: string) => {
    setExpandedId(id);
    requestAnimationFrame(() => {
      closeButtonRef.current?.focus();
    });
  }, []);

  const close = useCallback(() => {
    const prev = expandedId;
    setExpandedId(null);
    requestAnimationFrame(() => {
      if (prev) {
        const el = triggerRefs.current.get(prev);
        el?.focus();
      }
    });
  }, [expandedId]);

  const handleCardKeyDown = useCallback(
    (e: React.KeyboardEvent, id: string) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setExpandedId((current) => (current === id ? null : id));
        if (expandedId !== id) {
          requestAnimationFrame(() => closeButtonRef.current?.focus());
        } else {
          const el = triggerRefs.current.get(id);
          el?.focus();
        }
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        setExpandedId(null);
        triggerRefs.current.get(id)?.focus();
      }
    },
    [expandedId],
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4 gap-y-3">
        <fieldset className="border-0 p-0 m-0 min-w-0">
          <legend className={visuallyHiddenClass}>
            {labels.filterCategoryLegend}
          </legend>
          <label
            htmlFor="brief-nav-category"
            className="me-2 text-sm text-muted"
          >
            <span className="sr-only">{labels.filterCategoryLegend}</span>
          </label>
          <select
            id="brief-nav-category"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            aria-label={labels.filterCategoryLegend}
            className={`rounded border border-border bg-surface px-2 py-1.5 text-sm text-text ${focusRingClass}`}
          >
            <option value="">{labels.categoryAll}</option>
            {categoryOptions.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>
        </fieldset>
        <fieldset className="border-0 p-0 m-0 min-w-0">
          <legend className={visuallyHiddenClass}>
            {labels.filterStrengthLegend}
          </legend>
          <label
            htmlFor="brief-nav-strength"
            className="me-2 text-sm text-muted"
          >
            <span className="sr-only">{labels.filterStrengthLegend}</span>
          </label>
          <select
            id="brief-nav-strength"
            value={strengthFilter}
            onChange={(e) => setStrengthFilter(Number(e.target.value))}
            aria-label={labels.filterStrengthLegend}
            className={`rounded border border-border bg-surface px-2 py-1.5 text-sm text-text ${focusRingClass}`}
          >
            <option value={0}>{labels.strengthAll}</option>
            {strengthOptions.slice(1).map((n) => (
              <option key={n} value={n}>
                {labels.strengthMinByCount[n] ?? `${n}+`}
              </option>
            ))}
          </select>
        </fieldset>
        <div role="group" aria-label={labels.viewModeLabel}>
          <span className="me-2 text-sm text-muted" id="brief-nav-view-label">
            {labels.viewModeLabel}:
          </span>
          <span className="inline-flex rounded border border-border bg-surface">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              aria-pressed={viewMode === 'grid'}
              aria-describedby="brief-nav-view-label"
              className={`rounded-s border-e border-border px-2 py-1.5 text-sm transition-colors motion-reduce:transition-none ${focusRingClass} ${
                viewMode === 'grid'
                  ? 'bg-accent/20 text-accent-strong'
                  : 'text-text hover:bg-muted/50'
              }`}
            >
              {labels.viewGrid}
            </button>
            <button
              type="button"
              onClick={() => setViewMode('graph')}
              aria-pressed={viewMode === 'graph'}
              aria-describedby="brief-nav-view-label"
              className={`rounded-e px-2 py-1.5 text-sm transition-colors motion-reduce:transition-none ${focusRingClass} ${
                viewMode === 'graph'
                  ? 'bg-accent/20 text-accent-strong'
                  : 'text-text hover:bg-muted/50'
              }`}
            >
              {labels.viewGraph}
            </button>
          </span>
        </div>
      </div>

      {viewMode === 'grid' && (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredClaims.map((claim) => {
            const isExpanded = expandedId === claim.id;
            const panelId = `claim-panel-${claim.id}`;
            return (
              <article
                key={claim.id}
                id={`claim-${claim.id}`}
                className="authority-card section-shell overflow-hidden"
                {...(claim.dominantSignalId
                  ? { 'data-dominant-signal': claim.dominantSignalId }
                  : {})}
              >
                <button
                  type="button"
                  ref={(el) => {
                    if (el) triggerRefs.current.set(claim.id, el);
                  }}
                  onClick={() =>
                    setExpandedId((c) => (c === claim.id ? null : claim.id))
                  }
                  onKeyDown={(e) => handleCardKeyDown(e, claim.id)}
                  aria-expanded={isExpanded}
                  aria-controls={panelId}
                  className={`w-full p-4 text-left ${focusRingClass} rounded-card transition-colors duration-fast motion-reduce:transition-none`}
                >
                  <h3 className="text-lg font-semibold text-text">
                    {claim.label}
                  </h3>
                  {claim.category ? (
                    <p className="text-xs text-muted mt-0.5">
                      {claim.category}
                    </p>
                  ) : null}
                  <p className="text-sm text-muted mt-1">{claim.summary}</p>
                  <dl className="mt-2 text-xs text-muted">
                    <div>
                      <dt className="sr-only">Verification strength</dt>
                      <dd className="font-medium">
                        {labels.recordCountByCount[
                          claim.verificationStrength
                        ] ?? `${claim.verificationStrength}`}
                      </dd>
                    </div>
                    <div>
                      <dt className="sr-only">Case studies</dt>
                      <dd>
                        {labels.caseStudyCountByCount[
                          claim.caseStudies.length
                        ] ?? `${claim.caseStudies.length}`}
                      </dd>
                    </div>
                    {claim.lastVerified ? (
                      <div className="mt-1">
                        <dt className="sr-only">{claim.lastVerifiedLabel}</dt>
                        <dd>{claim.lastVerified}</dd>
                      </div>
                    ) : null}
                  </dl>
                </button>
                {isExpanded && (
                  <div
                    id={panelId}
                    role="region"
                    aria-label={claim.verificationConnectionsLabel}
                    className="border-t border-border bg-muted/20 px-4 py-3"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="text-sm font-medium text-text">
                        {claim.verificationConnectionsLabel}
                      </h4>
                      <button
                        ref={
                          expandedId === claim.id ? closeButtonRef : undefined
                        }
                        type="button"
                        onClick={close}
                        onKeyDown={(e) => {
                          if (e.key === 'Escape') {
                            e.preventDefault();
                            close();
                          }
                        }}
                        aria-label={labels.closePanel}
                        className={`shrink-0 rounded border border-border bg-surface px-2 py-1 text-xs ${focusRingClass}`}
                      >
                        {labels.closePanel}
                      </button>
                    </div>
                    <p className="mt-2 text-xs text-muted">
                      <Link
                        href={`${briefAnchorBase}#claim-${claim.id}`}
                        className={`${focusRingClass} underline underline-offset-4 hover:text-accent`}
                      >
                        {labels.viewInBrief}
                      </Link>
                    </p>
                    {claim.supportingLinks.length > 0 ? (
                      <p className="mt-2 text-xs">
                        <span className="font-medium text-muted">
                          {claim.supportingRecordsLabel}:
                        </span>{' '}
                        <span className="text-muted">
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
                        </span>
                      </p>
                    ) : null}
                    {claim.caseStudies.length > 0 ? (
                      <p className="mt-2 text-xs">
                        <span className="font-medium text-muted">
                          {claim.supportingCaseStudiesLabel}:
                        </span>{' '}
                        <span className="text-muted">
                          {claim.caseStudies.map((cs, i) => (
                            <span key={cs.slug}>
                              {i > 0 ? ', ' : ''}
                              <Link
                                href={`${claim.casestudiesBasePath}/${cs.slug}`}
                                className={`${focusRingClass} underline underline-offset-4 hover:text-accent`}
                              >
                                {cs.title}
                              </Link>
                            </span>
                          ))}
                        </span>
                      </p>
                    ) : null}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}

      {viewMode === 'graph' && (
        <div
          className="space-y-0 authority-panel overflow-hidden"
          role="group"
          aria-label="Verification graph"
        >
          {filteredClaims.map((claim) => (
            <div
              key={claim.id}
              className="border-b border-border last:border-b-0"
              {...(claim.dominantSignalId
                ? { 'data-dominant-signal': claim.dominantSignalId }
                : {})}
            >
              <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr] gap-2 sm:gap-4 p-4">
                <div className="flex items-start gap-2">
                  <span
                    className="shrink-0 w-2 mt-1.5 h-2 rounded-full bg-accent border border-border"
                    aria-hidden
                  />
                  <div>
                    <span className="font-medium text-text">{claim.label}</span>
                    {claim.category ? (
                      <span className="text-xs text-muted ms-1">
                        ({claim.category})
                      </span>
                    ) : null}
                    <p className="text-xs text-muted mt-0.5">{claim.summary}</p>
                  </div>
                </div>
                <div className="sm:ps-4 sm:border-s border-border border-s-2 border-t-0 border-b-0 border-e-0 ps-6 sm:ps-4">
                  <ul className="list-none space-y-1 text-xs text-muted">
                    {claim.supportingLinks.map((link) => (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          className={`${focusRingClass} underline underline-offset-4 hover:text-accent`}
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                    {claim.caseStudies.map((cs) => (
                      <li key={cs.slug}>
                        <Link
                          href={`${claim.casestudiesBasePath}/${cs.slug}`}
                          className={`${focusRingClass} underline underline-offset-4 hover:text-accent`}
                        >
                          {cs.title}
                        </Link>
                      </li>
                    ))}
                    {claim.supportingLinks.length === 0 &&
                      claim.caseStudies.length === 0 && (
                        <li className="italic">—</li>
                      )}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

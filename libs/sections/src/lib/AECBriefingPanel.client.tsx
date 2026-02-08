'use client';

import { useCallback, useRef, useState } from 'react';
import Link from 'next/link';
import { focusRingClass, visuallyHiddenClass } from '@joelklemmer/a11y';
import type { AECFormattedResult } from '@joelklemmer/aec';

export interface AECIntentOption {
  value: string;
  label: string;
}

export interface AECBriefingPanelProps {
  /** Section title (e.g. from brief.aec.title). */
  title: string;
  /** Placeholder for intent selector (e.g. brief.aec.placeholder). */
  placeholder: string;
  /** Intent options (value = AECQueryIntent, label from i18n). */
  intentOptions: AECIntentOption[];
  /** Submit button label. */
  submitLabel: string;
  /** Collapse toggle label when expanded. */
  collapseLabel: string;
  /** Expand toggle label when collapsed. */
  expandLabel: string;
  /** Loading state label. */
  loadingLabel: string;
  /** Label for entity links list. */
  linksLabel: string;
  /** Server action: (formData: FormData) => Promise<AECFormattedResult>. */
  queryAction: (formData: FormData) => Promise<AECFormattedResult>;
}

export function AECBriefingPanel({
  title,
  placeholder,
  intentOptions,
  submitLabel,
  collapseLabel,
  expandLabel,
  loadingLabel,
  linksLabel,
  queryAction,
}: AECBriefingPanelProps) {
  const [expanded, setExpanded] = useState(false);
  const [result, setResult] = useState<AECFormattedResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const handleToggle = useCallback(() => {
    setExpanded((e) => !e);
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape' && expanded) {
        setExpanded(false);
        toggleRef.current?.focus();
      }
    },
    [expanded],
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const form = e.currentTarget;
      const formData = new FormData(form);
      setError(null);
      setLoading(true);
      try {
        const data = await queryAction(formData);
        setResult(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Query failed.');
        setResult(null);
      } finally {
        setLoading(false);
      }
    },
    [queryAction],
  );

  return (
    <section
      className="authority-card section-shell border border-border/60 rounded-lg overflow-hidden"
      aria-label={title}
      onKeyDown={handleKeyDown}
    >
      <div className="section-shell">
        <button
          ref={toggleRef}
          type="button"
          onClick={handleToggle}
          aria-expanded={expanded}
          aria-controls="aec-briefing-panel"
          id="aec-briefing-toggle"
          className={`w-full flex items-center justify-between text-left font-semibold text-section-heading ${focusRingClass} p-2 rounded transition-colors duration-fast motion-reduce:transition-none`}
        >
          <span>{title}</span>
          <span className="text-sm font-normal text-muted">
            {expanded ? collapseLabel : expandLabel}
          </span>
        </button>
        <div
          ref={panelRef}
          id="aec-briefing-panel"
          role="region"
          aria-labelledby="aec-briefing-toggle"
          hidden={!expanded}
          className={expanded ? 'block border-t border-border/60' : 'hidden'}
        >
          <div className="p-3 space-y-3">
            <form onSubmit={handleSubmit} className="space-y-2">
              <label htmlFor="aec-intent" className={visuallyHiddenClass}>
                {placeholder}
              </label>
              <select
                id="aec-intent"
                name="intent"
                required
                aria-label={placeholder}
                className={`w-full max-w-md text-base border border-border rounded bg-bg text-text p-2 ${focusRingClass}`}
              >
                <option value="">{placeholder}</option>
                {intentOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                disabled={loading}
                aria-busy={loading}
                className={`inline-block px-3 py-2 text-sm font-medium rounded border border-border bg-bg text-text hover:bg-muted/50 disabled:opacity-70 ${focusRingClass}`}
              >
                {loading ? loadingLabel : submitLabel}
              </button>
            </form>
            {error ? (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            ) : null}
            {result ? (
              <div className="space-y-2 text-sm text-muted">
                <p className="font-medium text-text">{result.summary}</p>
                {result.bullets.length > 0 ? (
                  <ul className="list-disc list-inside space-y-1">
                    {result.bullets.map((b, i) => (
                      <li key={i}>{b}</li>
                    ))}
                  </ul>
                ) : null}
                {result.entityLinks.length > 0 ? (
                  <div>
                    <p className="font-medium text-text mb-1">{linksLabel}</p>
                    <ul className="list-none p-0 m-0 space-y-1">
                      {result.entityLinks.map((link) => (
                        <li key={link.id}>
                          <Link
                            href={link.href}
                            className={`${focusRingClass} underline underline-offset-4 hover:text-accent`}
                          >
                            {link.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

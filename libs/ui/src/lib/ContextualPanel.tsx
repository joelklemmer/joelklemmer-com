'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { focusRingClass, visuallyHiddenClass } from '@joelklemmer/a11y';

/** Props for the contextual briefing panel (scope + read path). Deterministic content. */
export interface ContextualPanelProps {
  /** 2–4 sentence scope summary. */
  scopeSummary: string;
  /** Short read-path links. */
  readPathLinks: Array<{ label: string; href: string }>;
  /** Panel title (e.g. "Briefing context"). */
  title: string;
  /** Accessible label for expand/collapse. */
  expandLabel: string;
  collapseLabel: string;
  /** Initial expanded state. */
  defaultExpanded?: boolean;
}

export function ContextualPanel({
  scopeSummary,
  readPathLinks,
  title,
  expandLabel,
  collapseLabel,
  defaultExpanded = true,
}: ContextualPanelProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const toggle = useCallback(() => setExpanded((e) => !e), []);

  return (
    <section
      className="section-shell border border-border rounded-none bg-muted/10"
      aria-label={title}
    >
      <h2 className={visuallyHiddenClass}>{title}</h2>
      <button
        type="button"
        onClick={toggle}
        aria-expanded={expanded}
        aria-controls="contextual-panel-content"
        className={`w-full flex items-center justify-between gap-2 p-4 text-left ${focusRingClass} rounded-t-none transition-colors motion-reduce:transition-none`}
      >
        <span className="font-medium text-text">{title}</span>
        <span className="text-sm text-muted" aria-hidden>
          {expanded ? collapseLabel : expandLabel}
        </span>
      </button>
      <div
        id="contextual-panel-content"
        role="region"
        aria-label={title}
        hidden={!expanded}
        className="border-t border-border px-4 pb-4 pt-2"
      >
        <p className="text-body-analytical text-muted">{scopeSummary}</p>
        {readPathLinks.length > 0 ? (
          <p className="mt-3 text-sm text-muted">
            <span className="font-medium text-text">Read path: </span>
            {readPathLinks.map((link, i) => (
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
      </div>
    </section>
  );
}

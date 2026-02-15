'use client';

import { focusRingClass } from '@joelklemmer/a11y';

/** Single item for "what matters" compression. */
export interface WhatMattersBlockItem {
  id: string;
  label: string;
  summary: string;
  refId: string;
  verificationStrength: number;
  /** Precomputed href for the item (e.g. /en/brief#claim-xyz). Server must pass; serializable. */
  href?: string;
}

export interface WhatMattersBlockProps {
  items: WhatMattersBlockItem[];
  title: string;
}

/**
 * Deterministic "what matters" block: compressed highlights for briefing-at-a-glance.
 * No AI; content is precomputed from claim/proof map.
 */
export function WhatMattersBlock({ items, title }: WhatMattersBlockProps) {
  if (items.length === 0) return null;

  return (
    <section className="section-shell" aria-label={title}>
      <h2 className="text-section-heading font-semibold">{title}</h2>
      <ul className="mt-3 list-none space-y-2 p-0 m-0">
        {items.map((item) => {
          const href = item.href;
          const baseClass =
            'block p-3 rounded-none border border-border bg-muted/10 transition-colors motion-reduce:transition-none';
          return (
            <li key={item.id}>
              {href ? (
                <a
                  href={href}
                  className={`${baseClass} hover:bg-muted/20 ${focusRingClass}`}
                >
                  <span className="font-medium text-text">{item.label}</span>
                  <p className="text-sm text-muted mt-1">{item.summary}</p>
                </a>
              ) : (
                <span className={baseClass}>
                  <span className="font-medium text-text">{item.label}</span>
                  <p className="text-sm text-muted mt-1">{item.summary}</p>
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

'use client';

import { useDensityView } from '@joelklemmer/authority-density';
import type { ReactNode } from 'react';

export interface FrameworkIntentBandProps {
  /** Already-translated 10s intent (i18n). */
  intent10: string;
  /** Already-translated 60s intent (i18n). */
  intent60: string;
  /** Optional deep content (e.g. MDX or paragraph). Collapsed in density mode. */
  deepContent?: ReactNode;
  /** Already-translated label for "Expand full context" (i18n). */
  expandLabel?: string;
}

/**
 * Intent band: 10s, 60s, and optional deep content.
 * Density mode: emphasize intent10 and intent60, collapse deep.
 * Default mode: show intent60 and optionally deep.
 * All visible strings must be i18n-resolved.
 */
const DEFAULT_EXPAND_LABEL = 'Expand full context';

export function FrameworkIntentBand({
  intent10,
  intent60,
  deepContent,
  expandLabel = DEFAULT_EXPAND_LABEL,
}: FrameworkIntentBandProps) {
  const { isDensityOn } = useDensityView();

  return (
    <div className="section-shell space-y-2">
      {isDensityOn ? (
        <>
          <p className="text-sm font-medium text-text" data-intent="10s">
            {intent10}
          </p>
          <p className="text-sm text-muted" data-intent="60s">
            {intent60}
          </p>
          {deepContent ? (
            <details className="text-sm text-muted">
              <summary className="cursor-pointer font-medium">
                {expandLabel}
              </summary>
              <div className="mt-2">{deepContent}</div>
            </details>
          ) : null}
        </>
      ) : (
        <>
          <p className="text-base text-muted" data-intent="60s">
            {intent60}
          </p>
          {deepContent ? (
            <div className="text-sm text-muted" data-intent="deep">
              {deepContent}
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { focusRingClass } from '@joelklemmer/a11y';
import { useConsentV2 } from './ConsentContextV2';

export interface ConsentSurfaceV2Props {
  /** Path to preferences page (e.g. /en/preferences). */
  preferencesHref: string;
}

/** Delay after first paint before showing consent so hero/main content can win LCP. 2.5s keeps banner visible within 3s while reducing chance consent is LCP. */
const CONSENT_DISPLAY_DELAY_MS = 2500;

/**
 * Initial consent decision surface. Shown when user has not made a choice.
 * Deferred until after first paint (double rAF) + short delay so main content can win LCP on media route.
 * Accessible: focus order, keyboard, no auto-dismiss. RTL-safe via next-intl.
 */
export function ConsentSurfaceV2({ preferencesHref }: ConsentSurfaceV2Props) {
  const t = useTranslations('consent.banner');
  const { choiceMade, acceptAll, rejectNonEssential } = useConsentV2();
  const [afterFirstPaint, setAfterFirstPaint] = useState(false);
  const [delayElapsed, setDelayElapsed] = useState(false);

  useEffect(() => {
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => setAfterFirstPaint(true));
    });
    return () => {
      cancelAnimationFrame(raf1);
      if (raf2) cancelAnimationFrame(raf2);
    };
  }, []);

  useEffect(() => {
    if (!afterFirstPaint) return;
    const timeoutId = window.setTimeout(
      () => setDelayElapsed(true),
      CONSENT_DISPLAY_DELAY_MS,
    );
    return () => clearTimeout(timeoutId);
  }, [afterFirstPaint]);

  if (choiceMade || !afterFirstPaint || !delayElapsed) return null;

  return (
    <div
      role="dialog"
      aria-labelledby="consent-surface-title"
      aria-describedby="consent-surface-desc"
      aria-modal="true"
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-bg p-4 shadow-lg"
    >
      <div className="mx-auto flex max-w-3xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2
            id="consent-surface-title"
            className="text-sm font-semibold text-text"
          >
            {t('title')}
          </h2>
          <p id="consent-surface-desc" className="mt-1 text-sm text-muted">
            {t('description')}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={acceptAll}
            className={`${focusRingClass} rounded-none bg-text px-3 py-2 text-sm text-bg hover:opacity-90`}
          >
            {t('acceptAll')}
          </button>
          <button
            type="button"
            onClick={rejectNonEssential}
            className={`${focusRingClass} rounded-none border border-border bg-surface px-3 py-2 text-sm text-text hover:bg-border`}
          >
            {t('rejectNonEssential')}
          </button>
          <Link
            href={preferencesHref}
            className={`${focusRingClass} rounded-none border border-border px-3 py-2 text-sm text-text hover:bg-border`}
          >
            {t('customise')}
          </Link>
        </div>
      </div>
    </div>
  );
}

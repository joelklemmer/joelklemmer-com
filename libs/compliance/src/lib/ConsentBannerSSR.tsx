/**
 * Server-rendered consent banner. Renders immediately when no choice made (no client delay).
 * Buttons are enhanced by ConsentActionsIsland (client) which attaches click handlers.
 */
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { focusRingClass } from '@joelklemmer/a11y';

export interface ConsentBannerSSRProps {
  preferencesHref: string;
}

export async function ConsentBannerSSR({
  preferencesHref,
}: ConsentBannerSSRProps) {
  const t = await getTranslations('consent.banner');
  return (
    <div
      id="consent-banner"
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
            data-consent-action="accept"
            className={`${focusRingClass} rounded-md bg-text px-3 py-2 text-sm text-bg hover:opacity-90`}
          >
            {t('acceptAll')}
          </button>
          <button
            type="button"
            data-consent-action="reject"
            className={`${focusRingClass} rounded-md border border-border bg-surface px-3 py-2 text-sm text-text hover:bg-border`}
          >
            {t('rejectNonEssential')}
          </button>
          <Link
            href={preferencesHref}
            className={`${focusRingClass} rounded-md border border-border px-3 py-2 text-sm text-text hover:bg-border`}
          >
            {t('customise')}
          </Link>
        </div>
      </div>
    </div>
  );
}

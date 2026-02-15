/**
 * Server-rendered consent banner. Renders immediately when no choice made (no client delay).
 * Buttons are enhanced by /deferred/islands.js which attaches click handlers (data-consent-action).
 */
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
      className="consent-banner-masthead fixed bottom-0 left-0 right-0 z-50 border-t p-3 shadow-[0_-2px_8px_rgba(0,0,0,0.15)]"
    >
      <div className="mx-auto flex max-w-3xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1">
          <div
            id="consent-surface-title"
            role="heading"
            aria-level={2}
            className="text-xs font-semibold text-text"
          >
            {t('title')}
          </div>
          <p
            id="consent-surface-desc"
            className="mt-1 max-w-[48ch] text-sm text-muted line-clamp-3 overflow-hidden text-ellipsis sm:line-clamp-2"
          >
            {t('bannerShort')}
          </p>
        </div>
        <div className="flex flex-shrink-0 flex-wrap items-center gap-2">
          <button
            type="button"
            data-consent-action="accept"
            className={`${focusRingClass} rounded-none bg-text px-3 py-2 text-sm text-bg hover:opacity-90`}
          >
            {t('acceptAll')}
          </button>
          <button
            type="button"
            data-consent-action="reject"
            className={`${focusRingClass} rounded-none border border-border bg-surface px-3 py-2 text-sm text-text hover:bg-border`}
          >
            {t('rejectNonEssential')}
          </button>
          <button
            type="button"
            data-consent-action="details"
            data-preferences-href={preferencesHref}
            className={`${focusRingClass} rounded-none border border-border px-3 py-2 text-sm text-text hover:bg-border`}
          >
            {t('managePreferences')}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Server-only header controls: SSR buttons/links with data-* hooks for islands.js.
 * No React interactivity; no "use client". Replaces ClientDeferredControlsSlot.
 */
import Link from 'next/link';
import { focusRingClass, visuallyHiddenClass } from '@joelklemmer/a11y';

export interface HeaderDeferredSSRProps {
  themeToggleLabel: string;
  contrastToggleLabel: string;
  densityToggleLabel: string;
  evaluatorToggleLabel: string;
  cookiePrefsLabel: string;
  accessibilityLabel: string;
  preferencesHref: string;
  accessibilityHref: string;
}

export function HeaderDeferredSSR({
  themeToggleLabel,
  contrastToggleLabel,
  densityToggleLabel,
  evaluatorToggleLabel,
  cookiePrefsLabel,
  accessibilityLabel,
  preferencesHref,
  accessibilityHref,
}: HeaderDeferredSSRProps) {
  return (
    <>
      <button
        type="button"
        data-theme-toggle
        aria-label={themeToggleLabel}
        className={`${focusRingClass} masthead-touch-target masthead-icon flex items-center justify-center rounded-sm text-muted hover:text-text transition-colors motion-reduce:transition-none min-h-[44px] min-w-[44px] p-1`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
        </svg>
        <span className={visuallyHiddenClass}>{themeToggleLabel}</span>
      </button>
      <button
        type="button"
        data-contrast-toggle
        aria-label={contrastToggleLabel}
        className={`${focusRingClass} masthead-touch-target masthead-icon flex items-center justify-center rounded-sm text-muted hover:text-text min-h-[44px] min-w-[44px] p-1`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
        </svg>
        <span className={visuallyHiddenClass}>{contrastToggleLabel}</span>
      </button>
      <button
        type="button"
        data-density-toggle
        aria-label={densityToggleLabel}
        className={`${focusRingClass} masthead-touch-target masthead-icon flex items-center justify-center rounded-sm text-muted hover:text-text min-h-[44px] min-w-[44px] p-1`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
        </svg>
        <span className={visuallyHiddenClass}>{densityToggleLabel}</span>
      </button>
      <button
        type="button"
        data-evaluator-toggle
        aria-label={evaluatorToggleLabel}
        className={`${focusRingClass} masthead-touch-target masthead-icon flex items-center justify-center rounded-sm text-muted hover:text-text min-h-[44px] min-w-[44px] p-1`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M12 3v18M3 12h18M6 6l12 12M18 6L6 18" />
        </svg>
        <span className={visuallyHiddenClass}>{evaluatorToggleLabel}</span>
      </button>
      <Link
        href={preferencesHref}
        className={`${focusRingClass} masthead-touch-target flex items-center justify-center rounded-sm text-muted hover:text-text text-sm min-h-[44px] px-2 py-1 truncate max-w-[8rem]`}
        aria-label={cookiePrefsLabel}
      >
        {cookiePrefsLabel}
      </Link>
      <Link
        href={accessibilityHref}
        className={`${focusRingClass} masthead-touch-target flex items-center justify-center rounded-sm text-muted hover:text-text text-sm min-h-[44px] px-2 py-1 truncate max-w-[8rem]`}
        aria-label={accessibilityLabel}
      >
        {accessibilityLabel}
      </Link>
    </>
  );
}

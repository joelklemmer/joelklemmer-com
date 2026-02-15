'use client';

import { useTheme } from './ThemeProvider';
import { focusRingClass, visuallyHiddenClass } from '@joelklemmer/a11y';
import { useTranslations } from 'next-intl';

function SunIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="m4.93 4.93 1.41 1.41" />
      <path d="m17.66 17.66 1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="m6.34 17.66-1.41 1.41" />
      <path d="m19.07 4.93-1.41 1.41" />
    </svg>
  );
}

function MoonIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
  );
}

/**
 * Single masthead toggle: Light ↔ Dark.
 * System is baseline only (default when no override in localStorage); not shown as a selectable state.
 * Persistence: user override saved to localStorage; clearing storage restores system default.
 */
export function ThemeToggle() {
  const common = useTranslations('common');
  const { theme, setTheme, resolvedTheme } = useTheme();

  const nextTheme = resolvedTheme === 'dark' ? 'light' : 'dark';
  const currentLabel =
    resolvedTheme === 'dark'
      ? common('a11y.themeDark')
      : common('a11y.themeLight');
  const actionLabel =
    nextTheme === 'light'
      ? common('a11y.themeSwitchToLight')
      : common('a11y.themeSwitchToDark');
  const ariaLabel = `${common('a11y.themeLabel')}: ${currentLabel}. ${actionLabel}`;

  /* Icon reflects target: Sun = click to go light (when dark), Moon = click to go dark (when light). */
  const showSunIcon = resolvedTheme === 'dark';

  return (
    <button
      type="button"
      onClick={() => setTheme(nextTheme)}
      onKeyDown={(e) => {
        if (e.key === ' ') e.preventDefault(); // Prevent scroll when activating with Space
      }}
      aria-label={ariaLabel}
      title={ariaLabel}
      className={`${focusRingClass} masthead-touch-target masthead-icon flex items-center justify-center rounded-none text-muted hover:text-text transition-colors motion-reduce:transition-none cursor-pointer min-h-[44px] min-w-[44px]`}
    >
      {showSunIcon ? <SunIcon /> : <MoonIcon />}
      <span className={visuallyHiddenClass}>{ariaLabel}</span>
    </button>
  );
}

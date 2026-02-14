/**
 * Server-only header controls: theme toggle, globe (language), settings (accessibility).
 * SSR buttons with data-* hooks for islands.js. No "use client".
 */
import { focusRingClass, visuallyHiddenClass } from '@joelklemmer/a11y';

export interface HeaderDeferredSSRProps {
  themeToggleLabel: string;
  languageSwitcherLabel: string;
  accessibilityLabel: string;
  labels: Record<string, string>;
  locales: readonly string[];
  currentLocale: string;
  pathWithoutLocale: string;
  contrastLabel: string;
  contrastDefaultLabel: string;
  contrastHighLabel: string;
  motionLabel: string;
  textSizeDefaultLabel: string;
  textSizeLargeLabel: string;
  textSizeLabel: string;
}

function SunIcon() {
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
      data-theme-icon="sun"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  );
}

function MoonIcon() {
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
      data-theme-icon="moon"
    >
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
  );
}

export function HeaderDeferredSSR({
  themeToggleLabel,
  languageSwitcherLabel,
  accessibilityLabel,
  labels,
  locales,
  currentLocale,
  pathWithoutLocale,
  contrastLabel,
  contrastDefaultLabel,
  contrastHighLabel,
  motionLabel,
  textSizeDefaultLabel,
  textSizeLargeLabel,
  textSizeLabel,
}: HeaderDeferredSSRProps) {
  const restPath = pathWithoutLocale.startsWith('/')
    ? pathWithoutLocale
    : `/${pathWithoutLocale}`;

  return (
    <>
      <button
        type="button"
        data-theme-toggle
        aria-label={themeToggleLabel}
        className={`${focusRingClass} masthead-touch-target masthead-icon flex items-center justify-center rounded-sm text-muted hover:text-text transition-colors motion-reduce:transition-none min-h-[44px] min-w-[44px] p-1`}
      >
        <span data-theme-icon-sun className="hidden" aria-hidden>
          <SunIcon />
        </span>
        <span data-theme-icon-moon aria-hidden>
          <MoonIcon />
        </span>
        <span className={visuallyHiddenClass}>{themeToggleLabel}</span>
      </button>
      <div className="relative" data-language-switcher>
        <button
          type="button"
          data-language-trigger
          aria-label={languageSwitcherLabel}
          aria-haspopup="menu"
          aria-expanded="false"
          aria-controls="language-menu"
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
            <circle cx="12" cy="12" r="10" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            <path d="M2 12h20" />
          </svg>
          <span className={visuallyHiddenClass}>{languageSwitcherLabel}</span>
        </button>
        <ul
          id="language-menu"
          role="menu"
          data-language-menu
          className="absolute end-0 top-full z-50 mt-1 min-w-[10rem] rounded-md border border-border bg-surface shadow-lg list-none py-1 m-0 px-0 hidden"
          aria-hidden="true"
        >
          {locales.map((loc) => {
            const href = `/${loc}${restPath === '/' ? '' : restPath}`;
            const label = labels[loc] ?? loc;
            return (
              <li key={loc} role="none">
                <a
                  href={href}
                  role="menuitem"
                  lang={loc}
                  data-locale-link
                  data-locale={loc}
                  className={`${focusRingClass} block w-full px-4 py-2 text-sm text-start rounded-sm hover:bg-muted/50 ${currentLocale === loc ? 'bg-accent/10 text-accent font-semibold' : 'text-text'}`}
                >
                  {label}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
      <div className="relative" data-accessibility-menu>
        <button
          type="button"
          data-accessibility-trigger
          aria-label={accessibilityLabel}
          aria-haspopup="menu"
          aria-expanded="false"
          aria-controls="accessibility-menu"
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
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          <span className={visuallyHiddenClass}>{accessibilityLabel}</span>
        </button>
        <div
          id="accessibility-menu"
          role="menu"
          data-accessibility-menu-panel
          className="absolute end-0 top-full z-50 mt-1 w-64 rounded-md border border-border bg-surface shadow-lg p-4 hidden"
          aria-hidden="true"
        >
          <div className="space-y-3">
            <div>
              <label
                htmlFor="a11y-contrast"
                className="block text-sm font-medium text-text mb-1"
              >
                {contrastLabel}
              </label>
              <select
                id="a11y-contrast"
                data-a11y-contrast
                className={`${focusRingClass} w-full rounded border border-border bg-bg px-3 py-2 text-sm text-text`}
              >
                <option value="default">{contrastDefaultLabel}</option>
                <option value="high">{contrastHighLabel}</option>
              </select>
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm text-text">
                <input
                  type="checkbox"
                  data-a11y-motion
                  className={`${focusRingClass} rounded border-border text-accent`}
                />
                <span>{motionLabel}</span>
              </label>
            </div>
            <div>
              <label
                htmlFor="a11y-text-size"
                className="block text-sm font-medium text-text mb-1"
              >
                {textSizeLabel}
              </label>
              <select
                id="a11y-text-size"
                data-a11y-text-size
                className={`${focusRingClass} w-full rounded border border-border bg-bg px-3 py-2 text-sm text-text`}
              >
                <option value="default">{textSizeDefaultLabel}</option>
                <option value="large">{textSizeLargeLabel}</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

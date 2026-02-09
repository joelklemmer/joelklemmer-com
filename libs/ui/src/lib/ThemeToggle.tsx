'use client';

import { useTheme } from './ThemeProvider';
import { focusRingClass, visuallyHiddenClass } from '@joelklemmer/a11y';
import { useTranslations } from 'next-intl';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const common = useTranslations('common');

  const cycleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('system');
    } else {
      setTheme('light');
    }
  };

  const getLabel = () => {
    if (theme === 'light') return common('a11y.themeLight');
    if (theme === 'dark') return common('a11y.themeDark');
    return common('a11y.themeSystem');
  };

  const getIcon = () => {
    const iconProps = {
      xmlns: 'http://www.w3.org/2000/svg' as const,
      width: 20,
      height: 20,
      viewBox: '0 0 24 24',
      fill: 'none' as const,
      stroke: 'currentColor',
      strokeWidth: 2,
      strokeLinecap: 'round' as const,
      strokeLinejoin: 'round' as const,
      'aria-hidden': true,
      className: 'shrink-0',
    };
    if (theme === 'light') {
      return (
        <svg {...iconProps}>
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
    if (theme === 'dark') {
      return (
        <svg {...iconProps}>
          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
        </svg>
      );
    }
    return (
      <svg {...iconProps}>
        <rect width="18" height="18" x="3" y="3" rx="2" />
        <path d="M8 12h.01" />
        <path d="M12 12h.01" />
        <path d="M16 12h.01" />
        <path d="M8 8h.01" />
        <path d="M12 8h.01" />
        <path d="M16 8h.01" />
        <path d="M8 16h.01" />
        <path d="M12 16h.01" />
        <path d="M16 16h.01" />
      </svg>
    );
  };

  return (
    <button
      type="button"
      onClick={cycleTheme}
      aria-label={getLabel()}
      className={`${focusRingClass} masthead-touch-target flex items-center justify-center rounded-sm text-muted hover:text-text transition-colors motion-reduce:transition-none`}
      title={getLabel()}
    >
      {getIcon()}
      <span className={visuallyHiddenClass}>{getLabel()}</span>
    </button>
  );
}

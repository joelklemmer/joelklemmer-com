'use client';

import { useTheme } from './ThemeProvider';
import { focusRingClass } from '@joelklemmer/a11y';

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();

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
    if (theme === 'system') {
      return `Theme: System (${resolvedTheme})`;
    }
    return `Theme: ${theme === 'light' ? 'Light' : 'Dark'}`;
  };

  return (
    <button
      type="button"
      onClick={cycleTheme}
      aria-label={getLabel()}
      className={`${focusRingClass} flex items-center justify-center w-8 h-8 rounded-sm text-sm text-muted hover:text-text transition-colors motion-reduce:transition-none`}
      title={getLabel()}
    >
      {resolvedTheme === 'dark' ? '🌙' : '☀️'}
      <span className="sr-only">{getLabel()}</span>
    </button>
  );
}

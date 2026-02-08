'use client';

import { useTheme } from './ThemeProvider';
import { useContrast } from './ContrastProvider';
import { focusRingClass } from '@joelklemmer/a11y';

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { contrast } = useContrast();

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
    const themeLabel = theme === 'system' ? `System (${resolvedTheme})` : theme === 'light' ? 'Light' : 'Dark';
    const contrastLabel = contrast === 'high' ? 'High Contrast' : '';
    return `Theme: ${themeLabel}${contrastLabel ? `, ${contrastLabel}` : ''}`;
  };

  // Show moon for dark, sun for light, adjust for high contrast
  const getIcon = () => {
    if (contrast === 'high') {
      return resolvedTheme === 'dark' ? '🌑' : '☀️';
    }
    return resolvedTheme === 'dark' ? '🌙' : '☀️';
  };

  return (
    <button
      type="button"
      onClick={cycleTheme}
      aria-label={getLabel()}
      className={`${focusRingClass} flex items-center justify-center w-8 h-8 rounded-sm text-sm text-muted hover:text-text transition-colors motion-reduce:transition-none`}
      title={getLabel()}
    >
      <span aria-hidden="true">{getIcon()}</span>
      <span className="sr-only">{getLabel()}</span>
    </button>
  );
}

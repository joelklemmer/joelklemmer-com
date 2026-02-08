'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { focusRingClass } from '@joelklemmer/a11y';

type Theme = 'light' | 'dark' | 'system';
type Contrast = 'default' | 'high';
type Motion = 'default' | 'reduced';
type TextSize = 'default' | 'large';

const THEME_STORAGE_KEY = 'joelklemmer-theme';
const CONTRAST_STORAGE_KEY = 'joelklemmer-contrast';
const MOTION_STORAGE_KEY = 'joelklemmer-motion';
const TEXT_SIZE_STORAGE_KEY = 'joelklemmer-text-size';

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

function getStoredValue<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  const stored = localStorage.getItem(key);
  return (stored as T) ?? defaultValue;
}

function applyTheme(theme: Theme) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;

  if (theme === 'system') {
    root.removeAttribute('data-theme');
    const systemTheme = getSystemTheme();
    root.setAttribute('data-theme', systemTheme);
  } else {
    root.setAttribute('data-theme', theme);
  }
}

function applyContrast(contrast: Contrast) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (contrast === 'high') {
    root.setAttribute('data-contrast', 'high');
  } else {
    root.removeAttribute('data-contrast');
  }
}

function applyMotion(motion: Motion) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (motion === 'reduced') {
    root.setAttribute('data-motion', 'reduced');
  } else {
    root.removeAttribute('data-motion');
  }
}

function applyTextSize(textSize: TextSize) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (textSize === 'large') {
    root.setAttribute('data-text-size', 'large');
  } else {
    root.removeAttribute('data-text-size');
  }
}

export function AccessibilityPanel() {
  const common = useTranslations('common');
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const [theme, setTheme] = useState<Theme>(() =>
    getStoredValue(THEME_STORAGE_KEY, 'system'),
  );
  const [contrast, setContrast] = useState<Contrast>(() =>
    getStoredValue(CONTRAST_STORAGE_KEY, 'default'),
  );
  const [motion, setMotion] = useState<Motion>(() =>
    getStoredValue(MOTION_STORAGE_KEY, 'default'),
  );
  const [textSize, setTextSize] = useState<TextSize>(() =>
    getStoredValue(TEXT_SIZE_STORAGE_KEY, 'default'),
  );

  useEffect(() => {
    setMounted(true);
    const storedTheme = getStoredValue(THEME_STORAGE_KEY, 'system');
    const storedContrast = getStoredValue(CONTRAST_STORAGE_KEY, 'default');
    const storedMotion = getStoredValue(MOTION_STORAGE_KEY, 'default');
    const storedTextSize = getStoredValue(TEXT_SIZE_STORAGE_KEY, 'default');

    setTheme(storedTheme);
    setContrast(storedContrast);
    setMotion(storedMotion);
    setTextSize(storedTextSize);

    applyTheme(storedTheme);
    applyContrast(storedContrast);
    applyMotion(storedMotion);
    applyTextSize(storedTextSize);

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleThemeChange = () => {
      if (storedTheme === 'system') {
        applyTheme('system');
      }
    };

    mediaQuery.addEventListener('change', handleThemeChange);
    return () => mediaQuery.removeEventListener('change', handleThemeChange);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    applyTheme(theme);
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme, mounted]);

  useEffect(() => {
    if (!mounted) return;
    applyContrast(contrast);
    localStorage.setItem(CONTRAST_STORAGE_KEY, contrast);
  }, [contrast, mounted]);

  useEffect(() => {
    if (!mounted) return;
    applyMotion(motion);
    localStorage.setItem(MOTION_STORAGE_KEY, motion);
  }, [motion, mounted]);

  useEffect(() => {
    if (!mounted) return;
    applyTextSize(textSize);
    localStorage.setItem(TEXT_SIZE_STORAGE_KEY, textSize);
  }, [textSize, mounted]);

  const handleToggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    requestAnimationFrame(() => {
      buttonRef.current?.focus();
    });
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        handleClose();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, handleClose]);

  const panelId = 'accessibility-panel';
  const buttonId = 'accessibility-button';

  if (!mounted) {
    return (
      <button
        ref={buttonRef}
        type="button"
        aria-label="Accessibility settings"
        className={`${focusRingClass} h-8 w-8 rounded-sm p-1.5 text-muted`}
        disabled
      >
        <svg
          aria-hidden="true"
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
          />
        </svg>
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        id={buttonId}
        type="button"
        aria-expanded={isOpen}
        aria-controls={panelId}
        aria-haspopup="true"
        aria-label="Accessibility settings"
        onClick={handleToggle}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleToggle();
          }
        }}
        className={`${focusRingClass} h-8 w-8 rounded-sm p-1.5 text-muted hover:text-text transition-colors motion-reduce:transition-none`}
      >
        <svg
          aria-hidden="true"
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
          />
        </svg>
      </button>
      {isOpen && (
        <div
          ref={panelRef}
          id={panelId}
          role="dialog"
          aria-labelledby={buttonId}
          aria-modal="true"
          className="absolute top-full mt-1 w-64 rounded-md border border-border bg-surface shadow-lg z-50 p-4"
          style={{ insetInlineEnd: 0 }}
        >
          <h3 className="text-sm font-semibold text-text mb-3">
            Accessibility
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Theme
              </label>
              <div className="flex gap-2">
                {(['light', 'dark', 'system'] as const).map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setTheme(option)}
                    className={`${focusRingClass} flex-1 rounded-sm border px-2 py-1.5 text-xs transition-colors motion-reduce:transition-none ${
                      theme === option
                        ? 'border-accent bg-surface-elevated text-text font-medium'
                        : 'border-border text-muted hover:text-text'
                    }`}
                  >
                    {option === 'system' ? 'System' : option.charAt(0).toUpperCase() + option.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Contrast
              </label>
              <div className="flex gap-2">
                {(['default', 'high'] as const).map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setContrast(option)}
                    className={`${focusRingClass} flex-1 rounded-sm border px-2 py-1.5 text-xs transition-colors motion-reduce:transition-none ${
                      contrast === option
                        ? 'border-accent bg-surface-elevated text-text font-medium'
                        : 'border-border text-muted hover:text-text'
                    }`}
                  >
                    {option === 'default' ? 'Default' : 'High'}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Motion
              </label>
              <div className="flex gap-2">
                {(['default', 'reduced'] as const).map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setMotion(option)}
                    className={`${focusRingClass} flex-1 rounded-sm border px-2 py-1.5 text-xs transition-colors motion-reduce:transition-none ${
                      motion === option
                        ? 'border-accent bg-surface-elevated text-text font-medium'
                        : 'border-border text-muted hover:text-text'
                    }`}
                  >
                    {option === 'default' ? 'Default' : 'Reduced'}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Text size
              </label>
              <div className="flex gap-2">
                {(['default', 'large'] as const).map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setTextSize(option)}
                    className={`${focusRingClass} flex-1 rounded-sm border px-2 py-1.5 text-xs transition-colors motion-reduce:transition-none ${
                      textSize === option
                        ? 'border-accent bg-surface-elevated text-text font-medium'
                        : 'border-border text-muted hover:text-text'
                    }`}
                  >
                    {option === 'default' ? 'Default' : 'Large'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

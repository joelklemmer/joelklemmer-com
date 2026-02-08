'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useTheme } from './ThemeProvider';
import { useContrast } from './ContrastProvider';
import { focusRingClass, visuallyHiddenClass } from '@joelklemmer/a11y';

export function AccessibilityPanel() {
  const common = useTranslations('common');
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { contrast, setContrast } = useContrast();
  const [motionReduced, setMotionReduced] = useState(false);
  const [textSize, setTextSize] = useState<'default' | 'large'>('default');

  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const panelId = 'accessibility-panel';
  const triggerId = 'accessibility-panel-trigger';

  const handleToggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    triggerRef.current?.focus();
  }, []);

  // Apply motion reduction
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    if (motionReduced) {
      root.classList.add('motion-reduce-force');
    } else {
      root.classList.remove('motion-reduce-force');
    }
  }, [motionReduced]);

  // Apply text size
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    if (textSize === 'large') {
      root.setAttribute('data-text-size', 'large');
    } else {
      root.removeAttribute('data-text-size');
    }
  }, [textSize]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, handleClose]);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        handleClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, handleClose]);

  // Focus first control when opening
  useEffect(() => {
    if (isOpen && panelRef.current) {
      requestAnimationFrame(() => {
        const firstControl = panelRef.current?.querySelector('button, select');
        if (firstControl instanceof HTMLElement) {
          firstControl.focus();
        }
      });
    }
  }, [isOpen]);

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        id={triggerId}
        type="button"
        aria-expanded={isOpen}
        aria-controls={panelId}
        aria-haspopup="true"
        aria-label={common('a11y.accessibilityPanelLabel')}
        onClick={handleToggle}
        className={`${focusRingClass} flex items-center justify-center w-8 h-8 rounded-sm text-sm text-muted hover:text-text transition-colors motion-reduce:transition-none`}
        title={common('a11y.accessibilityPanelLabel')}
      >
        ♿
        <span className="sr-only">{common('a11y.accessibilityPanelLabel')}</span>
      </button>

      {isOpen && (
        <div
          ref={panelRef}
          id={panelId}
          role="dialog"
          aria-labelledby={triggerId}
          aria-modal="true"
          className="absolute end-0 top-full mt-1 w-64 rounded-md border border-border bg-surface shadow-lg z-50 p-4"
        >
          <h2 className={visuallyHiddenClass}>{common('a11y.accessibilityPanelLabel')}</h2>

          <div className="space-y-4">
            {/* Theme */}
            <div>
              <label
                htmlFor="a11y-theme"
                className="block text-sm font-medium text-text mb-2"
              >
                {common('a11y.themeLabel')}
              </label>
              <select
                id="a11y-theme"
                value={theme}
                onChange={(e) => setTheme(e.target.value as 'light' | 'dark' | 'system')}
                className={`${focusRingClass} w-full rounded border border-border bg-bg px-3 py-2 text-sm text-text`}
                aria-label={common('a11y.themeLabel')}
              >
                <option value="light">{common('a11y.themeLight')}</option>
                <option value="dark">{common('a11y.themeDark')}</option>
                <option value="system">{common('a11y.themeSystem')}</option>
              </select>
            </div>

            {/* Contrast */}
            <div>
              <label
                htmlFor="a11y-contrast"
                className="block text-sm font-medium text-text mb-2"
              >
                {common('a11y.contrastLabel')}
              </label>
              <select
                id="a11y-contrast"
                value={contrast}
                onChange={(e) => setContrast(e.target.value as 'default' | 'high')}
                className={`${focusRingClass} w-full rounded border border-border bg-bg px-3 py-2 text-sm text-text`}
                aria-label={common('a11y.contrastLabel')}
              >
                <option value="default">{common('a11y.contrastDefault')}</option>
                <option value="high">{common('a11y.contrastHigh')}</option>
              </select>
            </div>

            {/* Motion */}
            <div>
              <label className="flex items-center gap-2 text-sm text-text">
                <input
                  type="checkbox"
                  checked={motionReduced}
                  onChange={(e) => setMotionReduced(e.target.checked)}
                  className={`${focusRingClass} rounded border-border text-accent`}
                  aria-label={common('a11y.motionLabel')}
                />
                <span>{common('a11y.motionLabel')}</span>
              </label>
            </div>

            {/* Text Size */}
            <div>
              <label
                htmlFor="a11y-text-size"
                className="block text-sm font-medium text-text mb-2"
              >
                {common('a11y.textSizeLabel')}
              </label>
              <select
                id="a11y-text-size"
                value={textSize}
                onChange={(e) => setTextSize(e.target.value as 'default' | 'large')}
                className={`${focusRingClass} w-full rounded border border-border bg-bg px-3 py-2 text-sm text-text`}
                aria-label={common('a11y.textSizeLabel')}
              >
                <option value="default">{common('a11y.textSizeDefault')}</option>
                <option value="large">{common('a11y.textSizeLarge')}</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

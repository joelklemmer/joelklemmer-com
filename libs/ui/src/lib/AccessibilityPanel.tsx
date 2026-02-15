'use client';

/**
 * Accessibility Control Panel (ACP)
 *
 * Governed popover dialog for managing accessibility preferences:
 * - Contrast (via ContrastProvider)
 * - Motion reduction (via ACPProvider)
 * - Text sizing (via ACPProvider)
 * - Underline links (via ACPProvider)
 *
 * Features:
 * - Full keyboard operation
 * - Focus trap when open
 * - Focus returns to trigger on close
 * - Proper ARIA attributes
 * - Persistence across reloads
 */

import { createPortal } from 'react-dom';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useContrast } from './ContrastProvider';
import { useACP } from '@joelklemmer/a11y';
import { focusRingClass, visuallyHiddenClass } from '@joelklemmer/a11y';

const PANEL_ID = 'accessibility-panel';
const TRIGGER_ID = 'accessibility-panel-trigger';
const TITLE_ID = 'accessibility-panel-title';

export function AccessibilityPanel() {
  const common = useTranslations('common');
  const { contrast, setContrast } = useContrast();
  const { preferences, setMotion, setTextSize, setUnderlineLinks } = useACP();

  const [isOpen, setIsOpen] = useState(false);
  const [panelPos, setPanelPos] = useState<{
    top: number;
    insetInlineEnd: number;
  } | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedElementRef = useRef<HTMLElement | null>(null);

  const handleToggle = useCallback(() => {
    setIsOpen((prev) => {
      const newIsOpen = !prev;
      if (newIsOpen) {
        previouslyFocusedElementRef.current =
          document.activeElement as HTMLElement;
        if (triggerRef.current) {
          const rect = triggerRef.current.getBoundingClientRect();
          const isRtl = document.documentElement.dir === 'rtl';
          setPanelPos({
            top: rect.bottom + 4,
            insetInlineEnd: isRtl ? rect.left : window.innerWidth - rect.right,
          });
        }
      } else {
        setPanelPos(null);
      }
      return newIsOpen;
    });
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    setPanelPos(null);
    requestAnimationFrame(() => {
      const elementToFocus =
        triggerRef.current || previouslyFocusedElementRef.current;
      elementToFocus?.focus();
      previouslyFocusedElementRef.current = null;
    });
  }, []);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
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
      const target = event.target as Node;
      if (
        panelRef.current &&
        !panelRef.current.contains(target) &&
        triggerRef.current &&
        !triggerRef.current.contains(target)
      ) {
        handleClose();
      }
    };

    // Use capture phase to handle clicks before they bubble
    document.addEventListener('mousedown', handleClickOutside, true);
    return () =>
      document.removeEventListener('mousedown', handleClickOutside, true);
  }, [isOpen, handleClose]);

  // Focus trap: keep focus within panel when open
  useEffect(() => {
    if (!isOpen || !panelRef.current) return;

    const getFocusableElements = (): HTMLElement[] => {
      const focusableSelectors = [
        'button:not([disabled])',
        '[href]',
        'input:not([disabled])',
        'select:not([disabled])',
        'textarea:not([disabled])',
        '[tabindex]:not([tabindex="-1"])',
      ].join(', ');

      return Array.from(
        panelRef.current?.querySelectorAll<HTMLElement>(focusableSelectors) ||
          [],
      );
    };

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      const focusableElements = getFocusableElements();
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      const activeElement = document.activeElement as HTMLElement;

      // If focus is outside the panel, bring it to the first element
      if (!focusableElements.includes(activeElement)) {
        e.preventDefault();
        firstElement.focus();
        return;
      }

      if (e.shiftKey) {
        // Shift+Tab: if focus is on first element, wrap to last
        if (activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab: if focus is on last element, wrap to first
        if (activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    document.addEventListener('keydown', handleTabKey);
    return () => document.removeEventListener('keydown', handleTabKey);
  }, [isOpen]);

  // Focus first control when opening
  useEffect(() => {
    if (!isOpen || !panelRef.current) return;

    requestAnimationFrame(() => {
      const firstControl = panelRef.current?.querySelector<HTMLElement>(
        'button:not([disabled]), select:not([disabled]), input:not([disabled])',
      );
      if (firstControl) {
        firstControl.focus();
      }
    });
  }, [isOpen]);

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        id={TRIGGER_ID}
        type="button"
        aria-expanded={isOpen}
        aria-controls={PANEL_ID}
        aria-haspopup="dialog"
        aria-label={common('a11y.accessibilityPanelLabel')}
        onClick={handleToggle}
        onKeyDown={(e) => {
          if (e.key === ' ') e.preventDefault(); // Prevent scroll when activating with Space
        }}
        className={`${focusRingClass} masthead-touch-target masthead-icon flex items-center justify-center rounded-none text-muted hover:text-text transition-colors motion-reduce:transition-none`}
        title={common('a11y.accessibilityPanelLabel')}
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
        <span className={visuallyHiddenClass}>
          {common('a11y.accessibilityPanelLabel')}
        </span>
      </button>

      {isOpen &&
        panelPos &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            ref={panelRef}
            id={PANEL_ID}
            role="dialog"
            aria-modal="true"
            aria-labelledby={TITLE_ID}
            className="fixed z-[9999] w-64 rounded-none border border-border bg-surface shadow-lg p-4 focus:outline-none"
            style={{
              top: panelPos.top,
              insetInlineEnd: panelPos.insetInlineEnd,
              insetInlineStart: 'auto',
            }}
          >
            <h2 id={TITLE_ID} className={visuallyHiddenClass}>
              {common('a11y.accessibilityPanelLabel')}
            </h2>

            <div className="space-y-4">
              {/* Theme controlled by masthead toggle only; no duplicate control here */}

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
                  onChange={(e) =>
                    setContrast(e.target.value as 'default' | 'high')
                  }
                  className={`${focusRingClass} w-full rounded-none border border-border bg-bg px-3 py-2 text-sm text-text`}
                  aria-label={common('a11y.contrastLabel')}
                >
                  <option value="default">
                    {common('a11y.contrastDefault')}
                  </option>
                  <option value="high">{common('a11y.contrastHigh')}</option>
                </select>
              </div>

              {/* Motion */}
              <div>
                <label className="flex items-center gap-2 text-sm text-text">
                  <input
                    type="checkbox"
                    checked={preferences.motion === 'reduced'}
                    onChange={(e) =>
                      setMotion(e.target.checked ? 'reduced' : 'default')
                    }
                    className={`${focusRingClass} rounded-none border-border text-accent`}
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
                  value={preferences.textSize}
                  onChange={(e) =>
                    setTextSize(e.target.value as 'default' | 'large')
                  }
                  className={`${focusRingClass} w-full rounded-none border border-border bg-bg px-3 py-2 text-sm text-text`}
                  aria-label={common('a11y.textSizeLabel')}
                >
                  <option value="default">
                    {common('a11y.textSizeDefault')}
                  </option>
                  <option value="large">{common('a11y.textSizeLarge')}</option>
                </select>
              </div>

              {/* Underline Links */}
              <div>
                <label className="flex items-center gap-2 text-sm text-text">
                  <input
                    type="checkbox"
                    checked={preferences.underlineLinks}
                    onChange={(e) => setUnderlineLinks(e.target.checked)}
                    className={`${focusRingClass} rounded-none border-border text-accent`}
                    aria-label={common('a11y.underlineLinksLabel')}
                  />
                  <span>{common('a11y.underlineLinksLabel')}</span>
                </label>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}

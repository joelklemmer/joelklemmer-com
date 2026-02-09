'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useTranslations } from 'next-intl';
import { focusRingClass, visuallyHiddenClass } from '@joelklemmer/a11y';
import { useConsent } from './ConsentContext';
import type { ConsentState } from './consent-state';

export interface CookiePreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Optional: render trigger that opens the modal (e.g. button). */
  trigger?: ReactNode;
}

export function CookiePreferencesModal({
  isOpen,
  onClose,
}: CookiePreferencesModalProps) {
  const t = useTranslations('common');
  const {
    consentState,
    updateConsent,
    acceptAll,
    rejectNonEssential,
    withdraw,
  } = useConsent();
  const modalRef = useRef<HTMLDivElement>(null);
  const firstFocusableRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    firstFocusableRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const [localAnalytics, setLocalAnalytics] = useState(consentState.analytics);
  const [localFunctional, setLocalFunctional] = useState(
    consentState.functional,
  );
  const [localMarketing, setLocalMarketing] = useState(consentState.marketing);

  useEffect(() => {
    setLocalAnalytics(consentState.analytics);
    setLocalFunctional(consentState.functional);
    setLocalMarketing(consentState.marketing);
  }, [consentState.analytics, consentState.functional, consentState.marketing]);

  const handleSave = useCallback(() => {
    const state: ConsentState = {
      ...consentState,
      version: consentState.version,
      timestamp: Date.now(),
      choiceMade: true,
      analytics: localAnalytics,
      functional: localFunctional,
      marketing: localMarketing,
    };
    updateConsent(state);
    onClose();
  }, [
    consentState,
    localAnalytics,
    localFunctional,
    localMarketing,
    updateConsent,
    onClose,
  ]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="presentation"
      aria-hidden={!isOpen}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cookie-preferences-title"
        aria-describedby="cookie-preferences-desc"
        className="max-h-[90vh] w-full max-w-lg overflow-auto rounded-lg border border-border bg-bg p-6 shadow-lg"
      >
        <h2
          id="cookie-preferences-title"
          className="text-lg font-semibold text-text"
        >
          {t('cookiePreferences.modalTitle')}
        </h2>
        <p id="cookie-preferences-desc" className="mt-2 text-sm text-muted">
          {t('cookiePreferences.essentialNote')}
        </p>

        <div
          className="mt-4 space-y-3"
          role="group"
          aria-label="Cookie categories"
        >
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={localAnalytics}
              onChange={(e) => setLocalAnalytics(e.target.checked)}
              className={focusRingClass}
            />
            <span className="text-sm font-medium text-text">
              {t('cookiePreferences.analyticsLabel')}
            </span>
          </label>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={localFunctional}
              onChange={(e) => setLocalFunctional(e.target.checked)}
              className={focusRingClass}
            />
            <span className="text-sm font-medium text-text">
              {t('cookiePreferences.functionalLabel')}
            </span>
          </label>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={localMarketing}
              onChange={(e) => setLocalMarketing(e.target.checked)}
              className={focusRingClass}
            />
            <span className="text-sm font-medium text-text">
              {t('cookiePreferences.marketingLabel')}
            </span>
          </label>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <button
            ref={firstFocusableRef}
            type="button"
            onClick={acceptAll}
            className={`${focusRingClass} rounded-md border border-border bg-surface px-3 py-2 text-sm text-text hover:bg-border`}
          >
            {t('cookiePreferences.acceptAll')}
          </button>
          <button
            type="button"
            onClick={rejectNonEssential}
            className={`${focusRingClass} rounded-md border border-border bg-surface px-3 py-2 text-sm text-text hover:bg-border`}
          >
            {t('cookiePreferences.rejectNonEssential')}
          </button>
          <button
            type="button"
            onClick={handleSave}
            className={`${focusRingClass} rounded-md bg-text px-3 py-2 text-sm text-bg hover:opacity-90`}
          >
            {t('cookiePreferences.save')}
          </button>
          <button
            type="button"
            onClick={() => {
              withdraw();
              onClose();
            }}
            className={`${focusRingClass} rounded-md border border-border px-3 py-2 text-sm text-muted hover:text-text`}
          >
            {t('cookiePreferences.withdraw')}
          </button>
        </div>

        <button
          type="button"
          onClick={onClose}
          className={`${focusRingClass} mt-4 text-sm text-muted hover:text-text ${visuallyHiddenClass}`}
        >
          Close dialog
        </button>
      </div>
    </div>
  );
}

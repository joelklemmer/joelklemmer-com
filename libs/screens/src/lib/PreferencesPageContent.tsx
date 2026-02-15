'use client';

/**
 * Client content for Preferences page: cookie consent section + accessibility controls.
 * Change cookie settings opens ConsentClient dialog; sync via jk:consent-changed / jk:open-consent.
 * Labels passed as props from server (no useTranslations).
 */
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  readConsentFromDocumentV2,
  useConsentV2,
  openConsentBanner,
  EVENT_CONSENT_CHANGED,
} from '@joelklemmer/compliance';
import {
  type AccessibilityPrefs,
  type ContrastMode,
  useAccessibilityPrefs,
} from '@joelklemmer/behavior-runtime';
import { focusRingClass } from '@joelklemmer/a11y';

export interface PreferencesPageLabels {
  cookieConsent: string;
  consentSaved: string;
  noPreferenceSaved: string;
  changeCookieSettings: string;
  clearCookiePreference: string;
  clearedNote: string;
  accessibilityPreferences: string;
  contrastLabel: string;
  contrastDefault: string;
  contrastHigh: string;
  motionLabel: string;
  textSizeLabel: string;
  textSizeDefault: string;
  textSizeMedium: string;
  textSizeLarge: string;
  lineHeightComfortable: string;
  letterSpacingIncreased: string;
  dyslexiaFontLabel: string;
  resetToDefaults: string;
}

function textScaleToRadioValue(scale: AccessibilityPrefs['textScale']): string {
  return scale === '1.12' ? 'medium' : scale === '1.25' ? 'large' : 'default';
}

function radioValueToTextScale(value: string): AccessibilityPrefs['textScale'] {
  return value === 'large' ? '1.25' : value === 'medium' ? '1.12' : '1';
}

export interface PreferencesPageContentProps {
  labels: PreferencesPageLabels;
}

export function PreferencesPageContent({
  labels,
}: PreferencesPageContentProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [consentFromDoc, setConsentFromDoc] =
    useState<ReturnType<typeof readConsentFromDocumentV2>>(null);
  const [clearedNote, setClearedNote] = useState(false);
  const { choiceMade, withdraw } = useConsentV2();

  const { prefs, setPref, reset } = useAccessibilityPrefs();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    setConsentFromDoc(readConsentFromDocumentV2());
  }, [mounted, choiceMade]);

  useEffect(() => {
    const sync = () => setConsentFromDoc(readConsentFromDocumentV2());
    window.addEventListener(EVENT_CONSENT_CHANGED, sync);
    return () => window.removeEventListener(EVENT_CONSENT_CHANGED, sync);
  }, []);

  const handleClearCookiePreference = useCallback(() => {
    withdraw();
    setConsentFromDoc(null);
    setClearedNote(true);
    openConsentBanner();
    router.refresh();
  }, [withdraw, router]);

  const handleChangeCookieSettings = useCallback(() => {
    openConsentBanner();
  }, []);

  const handleContrast = useCallback(
    (value: string) => {
      const v = value as ContrastMode;
      if (v === 'default' || v === 'high') setPref({ contrast: v });
    },
    [setPref],
  );

  const handleTextSize = useCallback(
    (value: string) => setPref({ textScale: radioValueToTextScale(value) }),
    [setPref],
  );

  const handleMotion = useCallback(
    (checked: boolean) => setPref({ motion: checked ? 'reduced' : 'full' }),
    [setPref],
  );

  const handleLineHeight = useCallback(
    (checked: boolean) =>
      setPref({ lineHeight: checked ? 'comfortable' : 'default' }),
    [setPref],
  );

  const handleLetterSpacing = useCallback(
    (checked: boolean) =>
      setPref({ letterSpacing: checked ? 'increased' : 'default' }),
    [setPref],
  );

  const handleDyslexiaFont = useCallback(
    (checked: boolean) => setPref({ dyslexiaFont: checked }),
    [setPref],
  );

  const contrast = mounted ? prefs.contrast : 'default';
  const textSize = mounted ? textScaleToRadioValue(prefs.textScale) : 'default';

  return (
    <div className="grid gap-6 md:grid-cols-2 md:gap-8">
      {/* Panel 1: Cookie consent */}
      <section
        aria-labelledby="cookie-consent-heading"
        className="rounded-2xl border border-border bg-surface p-6 shadow-sm"
      >
        <h2
          id="cookie-consent-heading"
          className="text-sm font-semibold text-text mb-3"
        >
          {labels.cookieConsent}
        </h2>
        <p className="text-sm text-muted mb-4">
          {(consentFromDoc?.choiceMade ?? choiceMade)
            ? labels.consentSaved
            : labels.noPreferenceSaved}
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleChangeCookieSettings}
            className={`${focusRingClass} rounded-none border border-border px-3 py-2 text-sm text-text hover:bg-border`}
          >
            {labels.changeCookieSettings}
          </button>
          <button
            type="button"
            onClick={handleClearCookiePreference}
            className={`${focusRingClass} rounded-none border border-border px-3 py-2 text-sm text-muted hover:text-text`}
          >
            {labels.clearCookiePreference}
          </button>
        </div>
        {clearedNote && (
          <p className="text-sm text-muted mt-3" role="status">
            {labels.clearedNote}
          </p>
        )}
      </section>

      {/* Panel 2: Accessibility preferences */}
      <section
        aria-labelledby="a11y-prefs-heading"
        className="rounded-2xl border border-border bg-surface p-6 shadow-sm"
      >
        <h2
          id="a11y-prefs-heading"
          className="text-sm font-semibold text-text mb-4"
        >
          {labels.accessibilityPreferences}
        </h2>
        <div className="space-y-4">
          {/* Contrast */}
          <fieldset aria-labelledby="a11y-contrast-legend">
            <legend
              id="a11y-contrast-legend"
              className="text-sm font-medium text-text mb-2 block"
            >
              {labels.contrastLabel}
            </legend>
            <div className="flex flex-wrap gap-4">
              {(['default', 'high'] as const).map((value) => (
                <label
                  key={value}
                  className={`flex items-center gap-2 cursor-pointer ${focusRingClass}`}
                >
                  <input
                    type="radio"
                    name="contrast"
                    value={value}
                    checked={contrast === value}
                    onChange={() => handleContrast(value)}
                    className="accent-accent"
                  />
                  <span className="text-sm text-text">
                    {value === 'default'
                      ? labels.contrastDefault
                      : labels.contrastHigh}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          {/* Motion */}
          <div>
            <label
              className={`flex items-center gap-3 cursor-pointer ${focusRingClass}`}
            >
              <input
                type="checkbox"
                checked={prefs.motion === 'reduced'}
                onChange={(e) => handleMotion(e.target.checked)}
                className="accent-accent"
              />
              <span className="text-sm font-medium text-text">
                {labels.motionLabel}
              </span>
            </label>
          </div>

          {/* Text size */}
          <fieldset aria-labelledby="a11y-textsize-legend">
            <legend
              id="a11y-textsize-legend"
              className="text-sm font-medium text-text mb-2 block"
            >
              {labels.textSizeLabel}
            </legend>
            <div className="flex flex-wrap gap-4">
              {(['default', 'medium', 'large'] as const).map((value) => (
                <label
                  key={value}
                  className={`flex items-center gap-2 cursor-pointer ${focusRingClass}`}
                >
                  <input
                    type="radio"
                    name="textSize"
                    value={value}
                    checked={textSize === value}
                    onChange={() => handleTextSize(value)}
                    className="accent-accent"
                  />
                  <span className="text-sm text-text">
                    {value === 'default'
                      ? labels.textSizeDefault
                      : value === 'medium'
                        ? labels.textSizeMedium
                        : labels.textSizeLarge}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          {/* Line height */}
          <div>
            <label
              className={`flex items-center gap-3 cursor-pointer ${focusRingClass}`}
            >
              <input
                type="checkbox"
                checked={prefs.lineHeight === 'comfortable'}
                onChange={(e) => handleLineHeight(e.target.checked)}
                className="accent-accent"
              />
              <span className="text-sm font-medium text-text">
                {labels.lineHeightComfortable}
              </span>
            </label>
          </div>

          {/* Letter spacing */}
          <div>
            <label
              className={`flex items-center gap-3 cursor-pointer ${focusRingClass}`}
            >
              <input
                type="checkbox"
                checked={prefs.letterSpacing === 'increased'}
                onChange={(e) => handleLetterSpacing(e.target.checked)}
                className="accent-accent"
              />
              <span className="text-sm font-medium text-text">
                {labels.letterSpacingIncreased}
              </span>
            </label>
          </div>

          {/* Dyslexia font */}
          <div>
            <label
              className={`flex items-center gap-3 cursor-pointer ${focusRingClass}`}
            >
              <input
                type="checkbox"
                checked={prefs.dyslexiaFont}
                onChange={(e) => handleDyslexiaFont(e.target.checked)}
                className="accent-accent"
              />
              <span className="text-sm font-medium text-text">
                {labels.dyslexiaFontLabel}
              </span>
            </label>
          </div>

          {/* Reset accessibility */}
          <button
            type="button"
            onClick={reset}
            className={`${focusRingClass} rounded-none border border-border px-3 py-2 text-sm text-muted hover:text-text`}
            aria-label={labels.resetToDefaults}
          >
            {labels.resetToDefaults}
          </button>
        </div>
      </section>
    </div>
  );
}

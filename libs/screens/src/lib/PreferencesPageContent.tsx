'use client';

/**
 * Client content for Preferences page: cookie consent section + accessibility controls.
 * Reuses ConsentPreferencesForm, clearConsentCookieV2, and behavior-runtime accessibility APIs.
 */
import { useEffect, useState, useRef, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import {
  readConsentFromDocumentV2,
  useConsentV2,
  ConsentPreferencesForm,
} from '@joelklemmer/compliance';
import {
  readAccessibilityPrefs,
  setAccessibilityPref,
  resetAccessibilityPrefs,
  type AccessibilityPrefs,
  type ContrastMode,
} from '@joelklemmer/behavior-runtime';
import { focusRingClass } from '@joelklemmer/a11y';

function textScaleToRadioValue(scale: AccessibilityPrefs['textScale']): string {
  return scale === '1.12' ? 'medium' : scale === '1.25' ? 'large' : 'default';
}

function radioValueToTextScale(value: string): AccessibilityPrefs['textScale'] {
  return value === 'large' ? '1.25' : value === 'medium' ? '1.12' : '1';
}

export function PreferencesPageContent() {
  const tPrefs = useTranslations('common.preferences');
  const tA11y = useTranslations('common.a11y');
  const router = useRouter();
  const cookieFormRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [consentFromDoc, setConsentFromDoc] =
    useState<ReturnType<typeof readConsentFromDocumentV2>>(null);
  const [clearedNote, setClearedNote] = useState(false);
  const { choiceMade, withdraw } = useConsentV2();

  const [prefs, setPrefs] = useState<AccessibilityPrefs>(() =>
    readAccessibilityPrefs(),
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    setConsentFromDoc(readConsentFromDocumentV2());
  }, [mounted, choiceMade]);

  const handleClearCookiePreference = useCallback(() => {
    withdraw();
    setConsentFromDoc(null);
    setClearedNote(true);
    router.refresh();
  }, [withdraw, router]);

  const handleChangeCookieSettings = useCallback(() => {
    cookieFormRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (mounted) {
      setPrefs(readAccessibilityPrefs());
    }
  }, [mounted]);

  const handleContrast = useCallback((value: string) => {
    const v = value as ContrastMode;
    if (v === 'default' || v === 'high') {
      setPrefs(setAccessibilityPref({ contrast: v }));
    }
  }, []);

  const handleTextSize = useCallback((value: string) => {
    setPrefs(setAccessibilityPref({ textScale: radioValueToTextScale(value) }));
  }, []);

  const handleMotion = useCallback((checked: boolean) => {
    setPrefs(setAccessibilityPref({ motion: checked ? 'reduced' : 'full' }));
  }, []);

  const handleLineHeight = useCallback((checked: boolean) => {
    setPrefs(
      setAccessibilityPref({
        lineHeight: checked ? 'comfortable' : 'default',
      }),
    );
  }, []);

  const handleLetterSpacing = useCallback((checked: boolean) => {
    setPrefs(
      setAccessibilityPref({
        letterSpacing: checked ? 'increased' : 'default',
      }),
    );
  }, []);

  const handleDyslexiaFont = useCallback((checked: boolean) => {
    setPrefs(setAccessibilityPref({ dyslexiaFont: checked }));
  }, []);

  const handleResetA11y = useCallback(() => {
    resetAccessibilityPrefs();
    setPrefs(readAccessibilityPrefs());
  }, []);

  const contrast = mounted ? prefs.contrast : 'default';
  const textSize = mounted ? textScaleToRadioValue(prefs.textScale) : 'default';

  return (
    <div className="space-y-12">
      {/* Section 1: Cookie consent */}
      <section aria-labelledby="cookie-consent-heading">
        <h2
          id="cookie-consent-heading"
          className="text-sm font-semibold text-text mb-3"
        >
          {tPrefs('cookieConsent')}
        </h2>
        <p className="text-sm text-muted mb-3">
          {(consentFromDoc?.choiceMade ?? choiceMade)
            ? tPrefs('consentSaved')
            : tPrefs('noPreferenceSaved')}
        </p>
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            type="button"
            onClick={handleChangeCookieSettings}
            className={`${focusRingClass} rounded-none border border-border px-3 py-2 text-sm text-text hover:bg-border`}
          >
            {tPrefs('changeCookieSettings')}
          </button>
          <button
            type="button"
            onClick={handleClearCookiePreference}
            className={`${focusRingClass} rounded-none border border-border px-3 py-2 text-sm text-muted hover:text-text`}
          >
            {tPrefs('clearCookiePreference')}
          </button>
        </div>
        {clearedNote && (
          <p className="text-sm text-muted" role="status">
            {tPrefs('clearedNote')}
          </p>
        )}
      </section>

      {/* Cookie form (ConsentPreferencesForm) */}
      <div ref={cookieFormRef}>
        <ConsentPreferencesForm />
      </div>

      {/* Section 2: Accessibility preferences */}
      <section aria-labelledby="a11y-prefs-heading">
        <h2
          id="a11y-prefs-heading"
          className="text-sm font-semibold text-text mb-4"
        >
          {tPrefs('accessibilityPreferences')}
        </h2>
        <div className="space-y-6">
          {/* Contrast */}
          <fieldset aria-labelledby="a11y-contrast-legend">
            <legend
              id="a11y-contrast-legend"
              className="text-sm font-medium text-text mb-2 block"
            >
              {tA11y('contrastLabel')}
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
                  />
                  <span className="text-sm text-text">
                    {value === 'default'
                      ? tA11y('contrastDefault')
                      : tA11y('contrastHigh')}
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
              />
              <span className="text-sm font-medium text-text">
                {tA11y('motionLabel')}
              </span>
            </label>
          </div>

          {/* Text size */}
          <fieldset aria-labelledby="a11y-textsize-legend">
            <legend
              id="a11y-textsize-legend"
              className="text-sm font-medium text-text mb-2 block"
            >
              {tA11y('textSizeLabel')}
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
                  />
                  <span className="text-sm text-text">
                    {value === 'default'
                      ? tA11y('textSizeDefault')
                      : value === 'medium'
                        ? tA11y('textSizeMedium')
                        : tA11y('textSizeLarge')}
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
              />
              <span className="text-sm font-medium text-text">
                {tA11y('lineHeightComfortable')}
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
              />
              <span className="text-sm font-medium text-text">
                {tA11y('letterSpacingIncreased')}
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
              />
              <span className="text-sm font-medium text-text">
                {tA11y('dyslexiaFontLabel')}
              </span>
            </label>
          </div>

          {/* Reset accessibility */}
          <button
            type="button"
            onClick={handleResetA11y}
            className={`${focusRingClass} rounded-none border border-border px-3 py-2 text-sm text-muted hover:text-text`}
            aria-label={tA11y('resetToDefaults')}
          >
            {tA11y('resetToDefaults')}
          </button>
        </div>
      </section>
    </div>
  );
}

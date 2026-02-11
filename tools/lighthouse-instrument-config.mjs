/**
 * Pinned Lighthouse collection profile for deterministic LCP measurement.
 * Desktop, provided throttling (no simulation), fixed categories. Single source of truth for
 * formFactor, throttlingMethod, onlyCategories, screenEmulation. Used by dump-lighthouse-instrument.mjs
 * and collect-lhr-single.mjs. Do not change without updating CI env (LH_FORM_FACTOR, LH_THROTTLING_METHOD),
 * tools/validate-lighthouse-harness.ts, and docs/audit/lighthouse-visual-fix-report.md.
 */
import {
  defaultSettings,
  screenEmulationMetrics,
} from 'lighthouse/core/config/constants.js';

/** Pinned settings: desktop, provided (no CPU/network simulation), fixed categories. */
export const instrumentSettings = {
  formFactor: 'desktop',
  throttlingMethod: 'provided',
  throttling: defaultSettings.throttling,
  screenEmulation: screenEmulationMetrics.desktop,
  disableStorageReset: false,
  locale: 'en-US',
  onlyCategories: ['performance', 'accessibility', 'seo', 'best-practices'],
};

/** Config for startFlow: extend default so artifacts/audits exist; override only settings. */
export const flowConfig = {
  extends: 'lighthouse:default',
  settings: instrumentSettings,
};

/** Effective instrument summary for validation (formFactor, throttlingMethod). */
export function getInstrumentSummary() {
  return {
    formFactor: instrumentSettings.formFactor,
    throttlingMethod: instrumentSettings.throttlingMethod,
    onlyCategories: instrumentSettings.onlyCategories,
  };
}

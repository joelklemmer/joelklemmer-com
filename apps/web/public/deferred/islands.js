/**
 * Deferred micro-islands: vanilla JS for consent, theme, contrast, density, evaluator.
 * Writes cookies and documentElement data-* attributes. No React in critical path.
 * Loaded via next/script afterInteractive.
 */
(function () {
  'use strict';

  const MAIN_CONTENT_ID = 'main-content';
  const BANNER_ID = 'consent-banner';
  const CONSENT_COOKIE = 'consent';
  const CONSENT_MAX_AGE_DAYS = 365;
  const THEME_COOKIE = 'joelklemmer-theme';
  const THEME_MAX_AGE = 365 * 86400;
  const CONTRAST_COOKIE = 'joelklemmer-contrast';
  const CONTRAST_MAX_AGE = 365 * 86400;
  const DENSITY_COOKIE = 'joelklemmer-density';
  const DENSITY_MAX_AGE = 365 * 86400;
  const EVALUATOR_COOKIE = 'evaluator_mode';
  const EVALUATOR_MAX_AGE = 365 * 86400;
  const EVALUATOR_MODES = [
    'default',
    'executive',
    'board',
    'public_service',
    'investor',
    'media',
  ];

  function setCookie(name, value, maxAge) {
    try {
      document.cookie =
        name +
        '=' +
        encodeURIComponent(value) +
        '; path=/; max-age=' +
        maxAge +
        '; SameSite=Lax';
    } catch {
      // Cookie write can fail in some contexts
    }
  }

  // --- Consent (v2 state encoding to match compliance lib) ---
  function consentStateToValue(s) {
    const raw = JSON.stringify({
      v: s.version,
      t: s.timestamp,
      c: s.choiceMade,
      cat: s.categories,
      pur: s.purposes,
      model: s.modelParticipation,
    });
    return btoa(unescape(encodeURIComponent(raw)));
  }

  function acceptAllState() {
    return {
      version: 2,
      timestamp: Date.now(),
      choiceMade: true,
      categories: {
        essential: true,
        functional: true,
        analytics: true,
        experience: true,
        marketing: true,
      },
      purposes: {
        measurement: true,
        experimentation: true,
        personalization: true,
        security: true,
        fraud: true,
        recommendation: true,
        profiling: true,
      },
      modelParticipation: false,
    };
  }

  function rejectNonEssentialState() {
    return {
      version: 2,
      timestamp: Date.now(),
      choiceMade: true,
      categories: {
        essential: true,
        functional: false,
        analytics: false,
        experience: false,
        marketing: false,
      },
      purposes: {
        measurement: false,
        experimentation: false,
        personalization: false,
        security: false,
        fraud: false,
        recommendation: false,
        profiling: false,
      },
      modelParticipation: false,
    };
  }

  function saveConsent(state) {
    const value = consentStateToValue(state);
    setCookie(CONSENT_COOKIE, value, CONSENT_MAX_AGE_DAYS * 86400);
  }

  function hideBanner() {
    const banner = document.getElementById(BANNER_ID);
    if (banner) {
      banner.setAttribute('hidden', '');
      banner.setAttribute('aria-hidden', 'true');
    }
  }

  function focusMain() {
    requestAnimationFrame(function () {
      const main = document.getElementById(MAIN_CONTENT_ID);
      if (main && typeof main.focus === 'function') main.focus();
    });
  }

  function onConsentAccept(e) {
    e.preventDefault();
    saveConsent(acceptAllState());
    hideBanner();
    focusMain();
  }

  function onConsentReject(e) {
    e.preventDefault();
    saveConsent(rejectNonEssentialState());
    hideBanner();
    focusMain();
  }

  function onConsentDetails(e) {
    e.preventDefault();
    const banner = document.getElementById(BANNER_ID);
    const a = banner && banner.querySelector('a[href*="/preferences"]');
    if (a && a.href) window.location.href = a.href;
  }

  // --- Theme ---
  function getSystemTheme() {
    return typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  }

  function applyTheme(theme) {
    const resolved = theme === 'system' ? getSystemTheme() : theme;
    document.documentElement.setAttribute('data-theme', resolved);
  }

  function onThemeToggle(e) {
    e.preventDefault();
    const current =
      document.documentElement.getAttribute('data-theme') || getSystemTheme();
    const next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    setCookie(THEME_COOKIE, next, THEME_MAX_AGE);
  }

  // --- Contrast ---
  function onContrastToggle(e) {
    e.preventDefault();
    const root = document.documentElement;
    const current = root.getAttribute('data-contrast');
    const next = current === 'high' ? 'default' : 'high';
    if (next === 'high') root.setAttribute('data-contrast', 'high');
    else root.removeAttribute('data-contrast');
    setCookie(CONTRAST_COOKIE, next, CONTRAST_MAX_AGE);
  }

  // --- Density ---
  function onDensityToggle(e) {
    e.preventDefault();
    const root = document.documentElement;
    const current = root.getAttribute('data-density');
    const next = current === 'on' ? 'off' : 'on';
    root.setAttribute('data-density', next);
    setCookie(DENSITY_COOKIE, next, DENSITY_MAX_AGE);
  }

  // --- Evaluator ---
  function onEvaluatorToggle(e) {
    e.preventDefault();
    const current =
      document.documentElement.getAttribute('data-evaluator') || 'default';
    const idx = EVALUATOR_MODES.indexOf(current);
    const nextIdx = idx === -1 ? 0 : (idx + 1) % EVALUATOR_MODES.length;
    const next = EVALUATOR_MODES[nextIdx];
    document.documentElement.setAttribute('data-evaluator', next);
    setCookie(EVALUATOR_COOKIE, next, EVALUATOR_MAX_AGE);
  }

  // --- Masthead: scroll focused utility into view (overflow-x-auto row) ---
  function onMastheadFocusIn(ev) {
    const el =
      ev.target &&
      ev.target.closest &&
      ev.target.closest(
        '.masthead-utilities button, .masthead-utilities a[href]',
      );
    if (el && typeof el.scrollIntoView === 'function') {
      el.scrollIntoView({
        block: 'nearest',
        inline: 'nearest',
        behavior: 'instant',
      });
    }
  }

  // --- Bind delegates ---
  function delegate(selector, event, handler) {
    document.body.addEventListener(event, function (ev) {
      const el = ev.target && ev.target.closest && ev.target.closest(selector);
      if (el) handler.call(el, ev);
    });
  }

  function run() {
    delegate('[data-consent-action="accept"]', 'click', onConsentAccept);
    delegate('[data-consent-action="reject"]', 'click', onConsentReject);
    delegate('[data-consent-action="details"]', 'click', onConsentDetails);
    delegate('[data-theme-toggle]', 'click', onThemeToggle);
    delegate('[data-contrast-toggle]', 'click', onContrastToggle);
    delegate('[data-density-toggle]', 'click', onDensityToggle);
    delegate('[data-evaluator-toggle]', 'click', onEvaluatorToggle);

    const masthead = document.querySelector('[data-testid="masthead"]');
    if (masthead) masthead.addEventListener('focusin', onMastheadFocusIn);

    // Optional: load telemetry when consent allows (after idle)
    if (
      typeof window.__INITIAL_ANALYTICS_CONSENT__ === 'boolean' &&
      window.__INITIAL_ANALYTICS_CONSENT__
    ) {
      if (typeof requestIdleCallback === 'function') {
        requestIdleCallback(
          function () {
            // Dynamic import of TelemetryLayer would go here if we had a bundled chunk URL
          },
          { timeout: 2000 },
        );
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();

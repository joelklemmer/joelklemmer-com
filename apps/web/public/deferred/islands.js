/**
 * Deferred micro-islands: consent only.
 * Theme, language, accessibility are handled by HeaderControlsClient (React).
 * Loaded via next/script afterInteractive.
 */
(function () {
  'use strict';

  const MAIN_CONTENT_ID = 'main-content';
  const BANNER_ID = 'consent-banner';
  const CONSENT_COOKIE = 'consent';
  const CONSENT_MAX_AGE_DAYS = 365;

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
    const btn =
      banner && banner.querySelector('[data-consent-action="details"]');
    const href =
      (btn && btn.getAttribute('data-preferences-href')) ||
      (banner && (banner.querySelector('a[href*="/preferences"]') || {}).href);
    if (href) window.location.href = href;
  }

  // --- Masthead: scroll focused utility into view ---
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

    const masthead = document.querySelector('[data-testid="masthead"]');
    if (masthead) masthead.addEventListener('focusin', onMastheadFocusIn);

    if (
      typeof window.__INITIAL_ANALYTICS_CONSENT__ === 'boolean' &&
      window.__INITIAL_ANALYTICS_CONSENT__
    ) {
      if (typeof requestIdleCallback === 'function') {
        requestIdleCallback(
          function () {
            /* Reserved for TelemetryLayer load when consent allows */
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

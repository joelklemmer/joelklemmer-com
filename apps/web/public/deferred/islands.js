/**
 * Deferred micro-islands: masthead focus-in scroll only.
 * Consent: handled by ConsentClient (React). Theme, language, accessibility: HeaderControlsClient (React).
 * Loaded via next/script afterInteractive.
 */
(function () {
  'use strict';

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

  function run() {
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

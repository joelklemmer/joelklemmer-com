/**
 * Deferred micro-islands: consent, theme, language, accessibility.
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
  const ACP_MOTION_KEY = 'joelklemmer-motion';
  const ACP_TEXT_SIZE_KEY = 'joelklemmer-text-size';

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

  // --- Theme ---
  function getSystemTheme() {
    return typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  }

  function getResolvedTheme() {
    const t =
      document.documentElement.getAttribute('data-theme') || getSystemTheme();
    return t === 'system' ? getSystemTheme() : t;
  }

  function applyTheme(theme) {
    const resolved = theme === 'system' ? getSystemTheme() : theme;
    document.documentElement.setAttribute('data-theme', resolved);
  }

  function updateThemeIcon() {
    const resolved = getResolvedTheme();
    const btn = document.querySelector('[data-theme-toggle]');
    if (!btn) return;
    const sun = btn.querySelector('[data-theme-icon-sun]');
    const moon = btn.querySelector('[data-theme-icon-moon]');
    if (sun && moon) {
      if (resolved === 'dark') {
        sun.classList.remove('hidden');
        moon.classList.add('hidden');
      } else {
        sun.classList.add('hidden');
        moon.classList.remove('hidden');
      }
    }
  }

  function onThemeToggle(e) {
    e.preventDefault();
    const current = getResolvedTheme();
    const next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    setCookie(THEME_COOKIE, next, THEME_MAX_AGE);
    updateThemeIcon();
  }

  // --- Language switcher ---
  function closeLanguageMenu() {
    const trigger = document.querySelector('[data-language-trigger]');
    const menu = document.querySelector('[data-language-menu]');
    if (trigger) {
      trigger.setAttribute('aria-expanded', 'false');
    }
    if (menu) {
      menu.classList.add('hidden');
      menu.setAttribute('aria-hidden', 'true');
    }
  }

  function openLanguageMenu() {
    const trigger = document.querySelector('[data-language-trigger]');
    const menu = document.querySelector('[data-language-menu]');
    if (trigger) trigger.setAttribute('aria-expanded', 'true');
    if (menu) {
      menu.classList.remove('hidden');
      menu.setAttribute('aria-hidden', 'false');
    }
  }

  function onLanguageTriggerClick(e) {
    e.preventDefault();
    const menu = document.querySelector('[data-language-menu]');
    const isOpen = menu && !menu.classList.contains('hidden');
    if (isOpen) closeLanguageMenu();
    else openLanguageMenu();
  }

  function onAccessibilityTriggerClick(e) {
    e.preventDefault();
    const panel = document.querySelector('[data-accessibility-menu-panel]');
    const isOpen = panel && !panel.classList.contains('hidden');
    const trigger = document.querySelector('[data-accessibility-trigger]');
    if (trigger) trigger.setAttribute('aria-expanded', String(!isOpen));
    if (panel) {
      if (isOpen) {
        panel.classList.add('hidden');
        panel.setAttribute('aria-hidden', 'true');
      } else {
        panel.classList.remove('hidden');
        panel.setAttribute('aria-hidden', 'false');
      }
    }
  }

  // --- ACP (accessibility): motion, text size, contrast ---
  function applyMotion(v) {
    const root = document.documentElement;
    if (v === 'reduced') {
      root.setAttribute('data-motion', 'reduced');
      root.classList.add('motion-reduce-force');
    } else {
      root.removeAttribute('data-motion');
      root.classList.remove('motion-reduce-force');
    }
  }

  function applyTextSize(v) {
    const root = document.documentElement;
    if (v === 'large') root.setAttribute('data-text-size', 'large');
    else root.removeAttribute('data-text-size');
  }

  function applyContrast(v) {
    const root = document.documentElement;
    if (v === 'high') root.setAttribute('data-contrast', 'high');
    else root.removeAttribute('data-contrast');
  }

  function initACPFromStorage() {
    try {
      const motion = localStorage.getItem(ACP_MOTION_KEY);
      const textSize = localStorage.getItem(ACP_TEXT_SIZE_KEY);
      if (motion === 'reduced') applyMotion('reduced');
      if (textSize === 'large') applyTextSize('large');
    } catch {
      /* localStorage unavailable */
    }
  }

  function syncAccessibilityPanelFromDOM() {
    const root = document.documentElement;
    const contrast =
      root.getAttribute('data-contrast') === 'high' ? 'high' : 'default';
    const motion =
      root.getAttribute('data-motion') === 'reduced' ||
      document.documentElement.classList.contains('motion-reduce-force');
    const textSize =
      root.getAttribute('data-text-size') === 'large' ? 'large' : 'default';

    const contrastEl = document.querySelector('[data-a11y-contrast]');
    const motionEl = document.querySelector('[data-a11y-motion]');
    const textSizeEl = document.querySelector('[data-a11y-text-size]');
    if (contrastEl) contrastEl.value = contrast;
    if (motionEl) motionEl.checked = motion;
    if (textSizeEl) textSizeEl.value = textSize;
  }

  function onA11yContrastChange(e) {
    const v = e.target.value;
    applyContrast(v);
    setCookie(CONTRAST_COOKIE, v, CONTRAST_MAX_AGE);
  }

  function onA11yMotionChange(e) {
    const v = e.target.checked ? 'reduced' : 'default';
    applyMotion(v);
    try {
      localStorage.setItem(ACP_MOTION_KEY, v);
    } catch {
      /* localStorage unavailable */
    }
  }

  function onA11yTextSizeChange(e) {
    const v = e.target.value;
    applyTextSize(v);
    try {
      localStorage.setItem(ACP_TEXT_SIZE_KEY, v);
    } catch {
      /* localStorage unavailable */
    }
  }

  // --- Close menus on outside click and Escape ---
  function setupMenuCloseHandlers() {
    document.addEventListener('click', function (ev) {
      const target = ev.target;
      if (
        !target.closest('[data-language-switcher]') &&
        !target.closest('[data-accessibility-menu]')
      ) {
        closeLanguageMenu();
        const panel = document.querySelector('[data-accessibility-menu-panel]');
        const trigger = document.querySelector('[data-accessibility-trigger]');
        if (panel && !panel.classList.contains('hidden')) {
          panel.classList.add('hidden');
          panel.setAttribute('aria-hidden', 'true');
          if (trigger) trigger.setAttribute('aria-expanded', 'false');
        }
      }
    });

    document.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape') {
        closeLanguageMenu();
        const panel = document.querySelector('[data-accessibility-menu-panel]');
        const trigger = document.querySelector('[data-accessibility-trigger]');
        if (panel && !panel.classList.contains('hidden')) {
          panel.classList.add('hidden');
          panel.setAttribute('aria-hidden', 'true');
          if (trigger) {
            trigger.setAttribute('aria-expanded', 'false');
            trigger.focus();
          }
        }
      }
    });
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
    delegate('[data-theme-toggle]', 'click', onThemeToggle);
    delegate('[data-language-trigger]', 'click', onLanguageTriggerClick);
    delegate(
      '[data-accessibility-trigger]',
      'click',
      onAccessibilityTriggerClick,
    );

    document.body.addEventListener('change', function (ev) {
      const el = ev.target;
      if (el && el.matches && el.matches('[data-a11y-contrast]')) {
        onA11yContrastChange(ev);
      } else if (el && el.matches && el.matches('[data-a11y-motion]')) {
        onA11yMotionChange(ev);
      } else if (el && el.matches && el.matches('[data-a11y-text-size]')) {
        onA11yTextSizeChange(ev);
      }
    });

    initACPFromStorage();
    updateThemeIcon();
    syncAccessibilityPanelFromDOM();
    setupMenuCloseHandlers();

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

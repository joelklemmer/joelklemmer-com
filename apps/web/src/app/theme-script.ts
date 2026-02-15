/**
 * Theme and a11y prefs: runs before paint to avoid flash.
 * - Theme: resolves data-theme when "system" or unset.
 * - A11y: rehydrates from localStorage (joelklemmer-a11y-prefs) to documentElement.
 * Canonical contract: data-contrast, data-motion, data-text-scale, data-line-height,
 * data-letter-spacing, data-dyslexia-font; --jk-text-scale, --jk-line-height, --jk-letter-spacing.
 * Falls back to legacy keys if unified key absent.
 * Silently fails if localStorage blocked.
 */
export const themeScript = `
(function() {
  try {
    var root = document.documentElement;
    var theme = root.getAttribute('data-theme');
    if (!theme || theme === 'system') {
      var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    }
    var prefs = null;
    var raw = localStorage.getItem('joelklemmer-a11y-prefs');
    if (raw) {
      try { prefs = JSON.parse(raw); } catch (e) {}
    }
    if (!prefs) {
      var c = localStorage.getItem('joelklemmer-contrast');
      var rm = localStorage.getItem('joelklemmer-reduce-motion');
      var legacyM = localStorage.getItem('joelklemmer-motion');
      var t = localStorage.getItem('joelklemmer-text-size');
      var lh = localStorage.getItem('joelklemmer-line-height');
      var ls = localStorage.getItem('joelklemmer-letter-spacing');
      var df = localStorage.getItem('joelklemmer-dyslexia-font');
      prefs = {
        contrast: c === 'high' ? 'high' : 'default',
        motion: (rm === 'true' || legacyM === 'reduced') ? 'reduced' : 'full',
        textScale: t === 'large' ? '1.25' : t === 'medium' ? '1.12' : '1',
        lineHeight: lh === 'comfortable' ? 'comfortable' : 'default',
        letterSpacing: ls === 'increased' ? 'increased' : 'default',
        dyslexiaFont: df === 'true'
      };
    }
    if (prefs.contrast === 'high') root.setAttribute('data-contrast', 'high');
    else root.removeAttribute('data-contrast');
    if (prefs.motion === 'reduced') root.setAttribute('data-motion', 'reduced');
    else root.removeAttribute('data-motion');
    var ts = prefs.textScale === '1.12' || prefs.textScale === '1.25' ? prefs.textScale : '1';
    root.setAttribute('data-text-scale', ts);
    root.style.setProperty('--jk-text-scale', ts);
    if (prefs.lineHeight === 'comfortable') {
      root.setAttribute('data-line-height', 'comfortable');
      root.style.setProperty('--jk-line-height', '1.6');
    } else {
      root.removeAttribute('data-line-height');
      root.style.removeProperty('--jk-line-height');
    }
    if (prefs.letterSpacing === 'increased') {
      root.setAttribute('data-letter-spacing', 'increased');
      root.style.setProperty('--jk-letter-spacing', '0.02em');
    } else {
      root.removeAttribute('data-letter-spacing');
      root.style.removeProperty('--jk-letter-spacing');
    }
    if (prefs.dyslexiaFont) root.setAttribute('data-dyslexia-font', 'true');
    else root.removeAttribute('data-dyslexia-font');
  } catch (e) {}
})();
`;

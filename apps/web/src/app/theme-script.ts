/**
 * Theme initialization script: resolves data-theme when it is "system" or unset.
 * Server sets data-theme, data-contrast, data-density, data-evaluator from cookies.
 * This script runs before paint and only resolves system theme so CSS works without client hydration.
 */
export const themeScript = `
(function() {
  try {
    const root = document.documentElement;
    const theme = root.getAttribute('data-theme');
    if (!theme || theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    }
  } catch (e) {}
})();
`;

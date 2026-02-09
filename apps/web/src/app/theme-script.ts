/**
 * Theme initialization script to prevent flash of unstyled content.
 * Must be inline in <head> before any CSS loads.
 *
 * Applies all ACP preferences (motion, text size, underline links) along with theme and contrast.
 */
export const themeScript = `
(function() {
  try {
    const raw = localStorage.getItem('joelklemmer-theme');
    const theme =
      raw === 'light' || raw === 'dark' || raw === 'system' ? raw : 'system';
    const contrast = localStorage.getItem('joelklemmer-contrast') || 'default';
    const motion = localStorage.getItem('joelklemmer-motion') || 'default';
    const textSize = localStorage.getItem('joelklemmer-text-size') || 'default';
    const underlineLinks = localStorage.getItem('joelklemmer-underline-links') || 'false';
    const root = document.documentElement;
    
    if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    } else {
      root.setAttribute('data-theme', theme);
    }
    
    if (contrast === 'high') {
      root.setAttribute('data-contrast', 'high');
    }
    
    if (motion === 'reduced') {
      root.setAttribute('data-motion', 'reduced');
      root.classList.add('motion-reduce-force');
    }
    
    if (textSize === 'large') {
      root.setAttribute('data-text-size', 'large');
    }
    
    if (underlineLinks === 'true') {
      root.setAttribute('data-underline-links', 'true');
    }
  } catch (e) {
    // Silently fail if localStorage is not available
  }
})();
`;

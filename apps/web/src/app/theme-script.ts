/**
 * Theme initialization script to prevent flash of unstyled content.
 * Must be inline in <head> before any CSS loads.
 */
export const themeScript = `
(function() {
  try {
    const theme = localStorage.getItem('joelklemmer-theme') || 'system';
    const contrast = localStorage.getItem('joelklemmer-contrast') || 'default';
    const motion = localStorage.getItem('joelklemmer-motion') || 'default';
    const textSize = localStorage.getItem('joelklemmer-text-size') || 'default';
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
    }
    
    if (textSize === 'large') {
      root.setAttribute('data-text-size', 'large');
    }
  } catch (e) {
    // Silently fail if localStorage is not available
  }
})();
`;

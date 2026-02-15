'use client';

/**
 * Sets data-masthead-scrolled on document root when user scrolls past threshold.
 * Enables translucent header background and shadow. Respects reduced motion.
 */
import { useEffect } from 'react';

const SCROLL_THRESHOLD = 10;

export function MastheadScrollEffect() {
  useEffect(() => {
    const root = document.documentElement;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    const update = () => {
      if (mediaQuery.matches) {
        root.removeAttribute('data-masthead-scrolled');
        return;
      }
      if (window.scrollY > SCROLL_THRESHOLD) {
        root.setAttribute('data-masthead-scrolled', '');
      } else {
        root.removeAttribute('data-masthead-scrolled');
      }
    };

    window.addEventListener('scroll', update, { passive: true });
    update();

    return () => window.removeEventListener('scroll', update);
  }, []);

  return null;
}

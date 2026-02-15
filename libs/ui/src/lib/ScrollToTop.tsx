'use client';

/**
 * Scroll-to-top button. Appears after scrolling down.
 * Respects prefers-reduced-motion (no smooth scroll when reduced).
 * Accessible: aria-label, keyboard focus, WCAG 2.2 AA.
 */
import { useState, useEffect, useCallback } from 'react';
import { focusRingClass } from '@joelklemmer/a11y';

const SCROLL_THRESHOLD_PERCENT = 30;

export interface ScrollToTopProps {
  /** i18n label for the button */
  label?: string;
}

function ChevronUpIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="m18 15-6-6-6 6" />
    </svg>
  );
}

export function ScrollToTop({ label = 'Scroll to top' }: ScrollToTopProps) {
  const [isVisible, setIsVisible] = useState(false);

  const updateVisibility = useCallback(() => {
    const scrollHeight =
      document.documentElement.scrollHeight - window.innerHeight;
    if (scrollHeight <= 0) {
      setIsVisible(false);
      return;
    }
    const scrollPercentage = (window.scrollY / scrollHeight) * 100;
    setIsVisible(scrollPercentage > SCROLL_THRESHOLD_PERCENT);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', updateVisibility, { passive: true });
    updateVisibility();
    return () => window.removeEventListener('scroll', updateVisibility);
  }, [updateVisibility]);

  const scrollToTop = useCallback(() => {
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
    });
  }, []);

  if (!isVisible) return null;

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label={label}
      className={`${focusRingClass} scroll-to-top fixed bottom-6 end-6 z-50 flex size-12 items-center justify-center rounded-none bg-accent text-text-on-accent transition-colors motion-reduce:transition-none hover:bg-accent-strong`}
    >
      <span className="size-5">
        <ChevronUpIcon />
      </span>
    </button>
  );
}

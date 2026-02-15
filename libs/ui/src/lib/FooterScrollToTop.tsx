'use client';

/**
 * Footer scroll-to-top button. Always visible in footer bottom bar.
 * Matches Figma Make design: dark rectangular button with chevron-up.
 */
import { useCallback } from 'react';
import { focusRingClass } from '@joelklemmer/a11y';

export interface FooterScrollToTopProps {
  label: string;
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

export function FooterScrollToTop({ label }: FooterScrollToTopProps) {
  const scrollToTop = useCallback(() => {
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
    });
  }, []);

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label={label}
      className={`${focusRingClass} footer-scroll-to-top flex size-10 items-center justify-center rounded-none bg-accent text-text-on-accent transition-colors motion-reduce:transition-none hover:bg-accent-strong`}
    >
      <span className="size-5">
        <ChevronUpIcon />
      </span>
    </button>
  );
}

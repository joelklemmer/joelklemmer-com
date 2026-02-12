export const visuallyHiddenClass = 'sr-only';

/** Default main landmark id; must match Shell mainId for skip link target. */
export const MAIN_CONTENT_ID = 'main-content';

/**
 * Focus ring: outline-based (WCAG 2.2 AA+). Outlines are not clipped by overflow,
 * unlike box-shadow/ring. Token-driven color/offset. Transition uses motion-duration-feedback.
 */
export const focusRingClass =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus transition-[outline-color,outline-width,outline-offset] duration-feedback ease-out motion-reduce:transition-none data-[contrast=high]:focus-visible:outline-4 data-[contrast=high]:focus-visible:outline-offset-3';

/**
 * Skip link: sr-only until focused; then visible, fixed, high z-index. No focus trap.
 */
export const skipLinkClass =
  'sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-surface focus:px-4 focus:py-2 focus:text-sm focus:text-text focus:shadow';

/**
 * Interaction transition: hover/focus/press feedback timing (token-driven, respects reduced motion).
 * Use with transition-colors or transition-[box-shadow] etc. for consistent micro-physics.
 */
export const interactionTransitionClass =
  'transition-colors duration-feedback ease-out motion-reduce:transition-none';

/** Tab order contract: skip link → identity → nav → utilities → main → footer. */
export const FOCUS_ORDER = {
  skipLink: 1,
  header: 2,
  nav: 3,
  main: 4,
  footer: 5,
} as const;

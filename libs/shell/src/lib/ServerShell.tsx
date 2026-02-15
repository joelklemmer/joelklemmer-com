/**
 * Server shell: masthead, static nav links, main, footer.
 * No 'use client'. Outputs full HTML so LCP is not blocked by client hydration.
 *
 * Figma pixel match (https://pages-tile-41445691.figma.site/):
 * - Header: 76px height, lighter logo/nav weight, thinner icon stroke (1.5), lighter divider
 * - Container: max 1320px at 1440px viewport, 60px horizontal padding for less boxed feel
 * - Masthead bar: same max-width as content; aligned via shared container tokens
 */
import type { ReactNode } from 'react';
import Link from 'next/link';
import { MastheadNavLinks } from './MastheadNavLinks.client';
import {
  MAIN_CONTENT_ID,
  skipLinkClass,
  focusRingClass,
  visuallyHiddenClass,
} from '@joelklemmer/a11y';
import { Container, PageFrame } from '@joelklemmer/ui';

export interface ServerShellNavItem {
  href: string;
  label: string;
  rank?: 'primary' | 'secondary' | 'tertiary';
}

export interface ServerShellProps {
  skipLabel: string;
  headerLabel: string;
  navLabel: string;
  footerLabel: string;
  wordmark: string;
  /** Optional wordmark parts (Figma Make). When both provided, rendered as "Joel R. Klemmer" — one line by default, wraps to two responsively at <wbr>. */
  wordmarkLine1?: string;
  wordmarkLine2?: string;
  homeHref: string;
  navItems: ServerShellNavItem[];
  footerContent: ReactNode;
  /** Optional critical slot (legacy). Prefer built-in SSR mobile nav (details/summary); pass null for zero-JS masthead. */
  headerCriticalSlot?: ReactNode | null;
  /** Optional SSR language links for first paint; hidden when deferred popover mounts. */
  languageLinksSlot?: ReactNode;
  /** Deferred: theme, contrast, cookie, a11y panel, language popover, etc. Mounted after first paint; container reserved to avoid CLS. */
  headerDeferredSlot: ReactNode;
  /** Mobile nav: shadcn Sheet (hamburger + nav links). Replaces details/summary when provided. */
  mobileNavSlot?: ReactNode;
  /** Consent banner + client island when no choice made. Rendered at end of layout-root. */
  consentSlot?: ReactNode;
  /** Current locale for UA-only header adjustments (e.g. nav visibility). */
  locale?: string;
  children: ReactNode;
  mainId?: string;
}

export function ServerShell({
  skipLabel,
  headerLabel,
  navLabel,
  footerLabel,
  wordmark,
  wordmarkLine1,
  wordmarkLine2,
  homeHref,
  navItems,
  footerContent,
  headerCriticalSlot,
  languageLinksSlot,
  headerDeferredSlot,
  mobileNavSlot,
  consentSlot,
  locale,
  children,
  mainId = MAIN_CONTENT_ID,
}: ServerShellProps) {
  const isUk = locale === 'uk';
  return (
    <div className="layout-root min-h-screen bg-bg text-text">
      <a href={`#${mainId}`} className={skipLinkClass} data-skip-link>
        {skipLabel}
      </a>
      <header
        role="banner"
        aria-label={headerLabel}
        data-testid="masthead"
        className="sticky top-0 z-40"
        {...(isUk && { 'data-locale': 'uk' })}
      >
        <div className="masthead-outer home-canonical-container py-2 md:py-2 min-w-0">
          <div
            data-system="masthead-bar"
            data-testid="masthead-bar"
            className="masthead-bar flex flex-nowrap items-center w-full min-w-0 gap-[var(--masthead-bar-gap,1rem)]"
          >
            {/* Left: wordmark — truncates on narrow; Figma site: uniform weight and size */}
            <div className="masthead-identity flex-shrink min-w-0 overflow-hidden">
              <Link
                href={homeHref}
                className={`masthead-identity-link ${focusRingClass} rounded-none flex items-center min-h-[var(--masthead-bar-height)] leading-tight overflow-hidden text-ellipsis whitespace-nowrap`}
              >
                {wordmarkLine1 != null && wordmarkLine2 != null ? (
                  <>
                    <span className="masthead-wordmark-line1">
                      {wordmarkLine1}
                    </span>{' '}
                    <wbr />
                    <span className="masthead-wordmark-line2">
                      {wordmarkLine2}
                    </span>
                  </>
                ) : (
                  wordmark
                )}
              </Link>
            </div>

            {/* Right: nav + utilities as single unit — never wraps, always tappable (TV→IoT) */}
            <div className="masthead-controls flex flex-shrink-0 flex-nowrap items-center gap-[var(--masthead-bar-gap,1rem)] min-h-[var(--masthead-bar-height)]">
              <div className="masthead-nav masthead-nav-primary flex items-center flex-shrink-0">
                <nav
                  aria-label={navLabel}
                  className="nav-primary flex items-center min-h-[var(--masthead-bar-height)]"
                >
                  <MastheadNavLinks
                    items={navItems}
                    className={isUk ? 'masthead-nav-uk' : ''}
                  />
                  {mobileNavSlot != null ? (
                    <div
                      className="nav-primary-mobile relative flex items-center shrink-0"
                      data-testid="masthead-mobile-nav"
                      data-nav="mobile"
                    >
                      {mobileNavSlot}
                    </div>
                  ) : (
                    <details
                      className="nav-primary-mobile relative flex items-center shrink-0"
                      data-nav="mobile"
                      aria-label={navLabel}
                      data-testid="masthead-mobile-nav"
                    >
                      <summary
                        id="primary-nav-trigger"
                        className={`${focusRingClass} masthead-touch-target masthead-icon flex items-center justify-center rounded-none text-muted hover:text-text cursor-pointer list-none [&::-webkit-details-marker]:hidden min-h-[44px] min-w-[44px]`}
                      >
                        <span className={visuallyHiddenClass}>{navLabel}</span>
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
                          <path d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                      </summary>
                      <ul className="nav-primary-menu absolute end-0 top-full mt-1 min-w-[12rem] rounded-none border border-border bg-surface shadow-lg z-50 text-start py-1 list-none m-0">
                        {navItems.map((item) => (
                          <li key={item.href}>
                            <Link
                              href={item.href}
                              prefetch={false}
                              {...(item.rank && {
                                'data-nav-rank': item.rank,
                              })}
                              className={`nav-primary-menu-item ${focusRingClass} block w-full text-sm text-start px-3 py-2 rounded-none hover:bg-border/50`}
                            >
                              {item.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </details>
                  )}
                </nav>
              </div>
              <div
                className="masthead-utilities-wrap flex flex-shrink-0 items-center overflow-visible"
                data-masthead-utilities
              >
                <div className="masthead-utilities masthead-nav-secondary flex flex-nowrap items-center min-h-[var(--masthead-bar-height)] shrink-0">
                  {headerCriticalSlot != null ? headerCriticalSlot : null}
                  {languageLinksSlot != null ? (
                    <span data-language-links-ssr>{languageLinksSlot}</span>
                  ) : null}
                  <div className="masthead-deferred-slot flex flex-nowrap items-center min-h-[var(--masthead-bar-height)] shrink-0">
                    {headerDeferredSlot}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
      <main
        id={mainId}
        data-testid="main-content"
        className="vacel-main pt-2 pb-8 md:pt-4 md:pb-10"
        tabIndex={-1}
      >
        <PageFrame contentStage>{children}</PageFrame>
      </main>
      <footer
        role="contentinfo"
        aria-label={footerLabel}
        className="footer-root border-t border-border-subtle"
      >
        <Container className="py-8 md:py-10">{footerContent}</Container>
      </footer>
      {consentSlot != null ? consentSlot : null}
    </div>
  );
}

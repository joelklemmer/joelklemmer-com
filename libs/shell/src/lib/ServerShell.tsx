/**
 * Server shell: masthead, static nav links, main, footer.
 * No 'use client'. Outputs full HTML so LCP is not blocked by client hydration.
 * Interactive header: critical slot (Nav + language) + deferred slot (theme, cookie, a11y) after first paint.
 */
import type { ReactNode } from 'react';
import Link from 'next/link';
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
  homeHref: string;
  navItems: ServerShellNavItem[];
  footerContent: ReactNode;
  /** Optional critical slot (legacy). Prefer built-in SSR mobile nav (details/summary); pass null for zero-JS masthead. */
  headerCriticalSlot?: ReactNode | null;
  /** Optional SSR language links for first paint; hidden when deferred popover mounts. */
  languageLinksSlot?: ReactNode;
  /** Deferred: theme, contrast, cookie, a11y panel, language popover, etc. Mounted after first paint; container reserved to avoid CLS. */
  headerDeferredSlot: ReactNode;
  children: ReactNode;
  mainId?: string;
}

export function ServerShell({
  skipLabel,
  headerLabel,
  navLabel,
  footerLabel,
  wordmark,
  homeHref,
  navItems,
  footerContent,
  headerCriticalSlot,
  languageLinksSlot,
  headerDeferredSlot,
  children,
  mainId = MAIN_CONTENT_ID,
}: ServerShellProps) {
  return (
    <div className="layout-root min-h-screen bg-bg text-text">
      <a href={`#${mainId}`} className={skipLinkClass} data-skip-link>
        {skipLabel}
      </a>
      <header
        aria-label={headerLabel}
        data-testid="masthead"
        className="border-b border-border"
      >
        <Container className="py-2 md:py-3">
          <div
            data-system="masthead-bar"
            data-testid="masthead-bar"
            className="masthead-bar flex flex-nowrap items-center w-full gap-8"
          >
            <div className="masthead-identity flex-shrink-0">
              <Link
                href={homeHref}
                className={`masthead-identity-link ${focusRingClass} rounded-sm text-base font-semibold tracking-tight flex items-center min-h-[var(--masthead-bar-height)]`}
              >
                {wordmark}
              </Link>
            </div>
            <div className="masthead-nav masthead-nav-primary flex-1 min-w-0 flex items-center justify-center">
              <nav
                aria-label={navLabel}
                className="nav-primary flex items-center min-h-[var(--masthead-bar-height)]"
              >
                <ul className="nav-primary-list hidden md:flex min-h-[var(--masthead-bar-height)]">
                  {navItems.map((item) => (
                    <li key={item.href} className="flex items-center h-full">
                      <Link
                        href={item.href}
                        prefetch={false}
                        {...(item.rank && { 'data-nav-rank': item.rank })}
                        className={`nav-primary-link ${focusRingClass} rounded-sm h-full flex items-center relative`}
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
                {/* Mobile: zero-JS open/close via details/summary; no client Nav. */}
                <details
                  className="nav-primary-mobile md:hidden relative flex items-center"
                  aria-label={navLabel}
                  data-testid="masthead-mobile-nav"
                >
                  <summary
                    id="primary-nav-trigger"
                    className={`${focusRingClass} masthead-touch-target masthead-icon flex items-center justify-center rounded-sm text-muted hover:text-text cursor-pointer list-none [&::-webkit-details-marker]:hidden min-h-[44px] min-w-[44px]`}
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
                  <ul className="nav-primary-menu absolute end-0 top-full mt-1 min-w-[12rem] rounded-md border border-border bg-surface shadow-lg z-50 text-start py-1 list-none m-0">
                    {navItems.map((item) => (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          prefetch={false}
                          {...(item.rank && { 'data-nav-rank': item.rank })}
                          className={`nav-primary-menu-item ${focusRingClass} block w-full text-sm text-start px-3 py-2 rounded-sm hover:bg-border/50`}
                        >
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </details>
              </nav>
            </div>
            <div className="masthead-utilities masthead-nav-secondary flex-shrink-0 flex items-center gap-6 min-h-[var(--masthead-bar-height)]">
              {headerCriticalSlot != null ? headerCriticalSlot : null}
              {languageLinksSlot != null ? (
                <span data-language-links-ssr>{languageLinksSlot}</span>
              ) : null}
              {/* Reserved space for deferred controls; no CLS when they mount */}
              <div className="masthead-deferred-slot flex items-center gap-6 min-w-[8rem] min-h-[var(--masthead-bar-height)]">
                {headerDeferredSlot}
              </div>
            </div>
          </div>
        </Container>
      </header>
      <main
        id={mainId}
        data-testid="main-content"
        className="vacel-main py-8"
        tabIndex={-1}
      >
        <PageFrame contentStage>{children}</PageFrame>
      </main>
      <footer aria-label={footerLabel} className="border-t border-border">
        <Container className="py-6">{footerContent}</Container>
      </footer>
    </div>
  );
}

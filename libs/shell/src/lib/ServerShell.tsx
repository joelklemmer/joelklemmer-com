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
  /** Critical path: mobile nav + language switcher only. Rendered immediately. */
  headerCriticalSlot: ReactNode;
  /** Deferred: theme, contrast, cookie, a11y panel, etc. Mounted after first paint; container reserved to avoid CLS. */
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
  headerDeferredSlot,
  children,
  mainId = MAIN_CONTENT_ID,
}: ServerShellProps) {
  return (
    <div className="layout-root min-h-screen bg-bg text-text">
      <a href={`#${mainId}`} className={skipLinkClass} data-skip-link>
        {skipLabel}
      </a>
      <header aria-label={headerLabel} className="border-b border-border">
        <Container className="py-2 md:py-3">
          <div
            data-system="masthead-bar"
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
                <ul
                  className="nav-primary-list hidden md:flex min-h-[var(--masthead-bar-height)]"
                  role="list"
                >
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
              </nav>
            </div>
            <div className="masthead-utilities masthead-nav-secondary flex-shrink-0 flex items-center gap-6 min-h-[var(--masthead-bar-height)]">
              {headerCriticalSlot}
              {/* Reserved space for deferred controls; no CLS when they mount */}
              <div className="masthead-deferred-slot flex items-center gap-6 min-w-[8rem] min-h-[var(--masthead-bar-height)]">
                {headerDeferredSlot}
              </div>
            </div>
          </div>
        </Container>
      </header>
      <main id={mainId} className="vacel-main py-8" tabIndex={-1}>
        <PageFrame contentStage>{children}</PageFrame>
      </main>
      <footer aria-label={footerLabel} className="border-t border-border">
        <Container className="py-6">{footerContent}</Container>
      </footer>
    </div>
  );
}

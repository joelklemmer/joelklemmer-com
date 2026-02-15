'use client';

import type { ReactNode } from 'react';

import { useTranslations } from 'next-intl';
import { MAIN_CONTENT_ID, skipLinkClass } from '@joelklemmer/a11y';
import { Container } from './Container';
import { PageFrame } from './PageFrame';

export interface ShellProps {
  children: ReactNode;
  headerContent?: ReactNode;
  navContent?: ReactNode;
  footerContent?: ReactNode;
  mainId?: string;
}

export function Shell({
  children,
  headerContent,
  navContent,
  footerContent,
  mainId = MAIN_CONTENT_ID,
}: ShellProps) {
  const a11y = useTranslations('common');

  // Tab order contract: skip link → identity → nav → utilities (headerContent order in Header)
  return (
    <div className="layout-root min-h-screen bg-bg text-text">
      <a href={`#${mainId}`} className={skipLinkClass} data-skip-link>
        {a11y('a11y.skipToContent')}
      </a>
      <header
        role="banner"
        aria-label={a11y('a11y.headerLabel')}
        className="border-b border-border"
      >
        <Container className="py-2 md:py-3">{headerContent}</Container>
        {navContent && (
          <nav
            aria-label={a11y('a11y.navLabel')}
            className="border-t border-border relative"
          >
            <Container className="py-2 md:py-2">{navContent}</Container>
          </nav>
        )}
      </header>
      <main id={mainId} className="vacel-main py-8" tabIndex={-1}>
        <PageFrame contentStage>{children}</PageFrame>
      </main>
      <footer
        role="contentinfo"
        aria-label={a11y('a11y.footerLabel')}
        className="border-t border-border"
      >
        <Container className="py-6">{footerContent}</Container>
      </footer>
    </div>
  );
}

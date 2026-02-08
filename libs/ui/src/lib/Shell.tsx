import type { ReactNode } from 'react';

import { useTranslations } from 'next-intl';
import { skipLinkClass } from '@joelklemmer/a11y';
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
  mainId = 'main-content',
}: ShellProps) {
  const a11y = useTranslations('common');

  return (
    <div className="min-h-screen bg-bg text-text">
      <a href={`#${mainId}`} className={skipLinkClass}>
        {a11y('a11y.skipToContent')}
      </a>
      <header
        aria-label={a11y('a11y.headerLabel')}
        className="border-b border-border"
      >
        <Container className="flex items-center justify-between py-4">
          {headerContent}
        </Container>
        <nav
          aria-label={a11y('a11y.navLabel')}
          className="border-t border-border relative"
        >
          <Container className="py-3 flex items-center justify-between">{navContent}</Container>
        </nav>
      </header>
      <main id={mainId} className="vacel-main py-8">
        <PageFrame contentStage>{children}</PageFrame>
      </main>
      <footer
        aria-label={a11y('a11y.footerLabel')}
        className="border-t border-border"
      >
        <Container className="py-6">{footerContent}</Container>
      </footer>
    </div>
  );
}

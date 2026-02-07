import type { ReactNode } from 'react';

import { useTranslations } from 'next-intl';

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
  mainId = 'content',
}: ShellProps) {
  const a11y = useTranslations('a11y');

  return (
    <div>
      <a href={`#${mainId}`}>{a11y('skipToContent')}</a>
      <header aria-label={a11y('headerLabel')}>{headerContent}</header>
      <nav aria-label={a11y('navLabel')}>{navContent}</nav>
      <main id={mainId}>{children}</main>
      <footer aria-label={a11y('footerLabel')}>{footerContent}</footer>
    </div>
  );
}

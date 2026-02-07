import type { ReactNode } from 'react';

export interface ShellProps {
  children: ReactNode;
  skipToContentLabel: string;
  headerLabel: string;
  navLabel: string;
  footerLabel: string;
  headerContent?: ReactNode;
  navContent?: ReactNode;
  footerContent?: ReactNode;
  mainId?: string;
}

export function Shell({
  children,
  skipToContentLabel,
  headerLabel,
  navLabel,
  footerLabel,
  headerContent,
  navContent,
  footerContent,
  mainId = 'content',
}: ShellProps) {
  return (
    <div>
      <a href={`#${mainId}`}>{skipToContentLabel}</a>
      <header aria-label={headerLabel}>{headerContent}</header>
      <nav aria-label={navLabel}>{navContent}</nav>
      <main id={mainId}>{children}</main>
      <footer aria-label={footerLabel}>{footerContent}</footer>
    </div>
  );
}

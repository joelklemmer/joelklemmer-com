import type { ReactNode } from 'react';
import Link from 'next/link';
import { focusRingClass } from '@joelklemmer/a11y';

export interface HeaderProps {
  wordmark: string;
  homeHref: string;
  /** Center region: typically primary Nav. Omit for identity-only bar. */
  centerContent?: ReactNode;
  headerControls?: ReactNode;
}

export function Header({
  wordmark,
  homeHref,
  centerContent,
  headerControls,
}: HeaderProps) {
  return (
    <div className="masthead-bar flex items-center w-full gap-4">
      <div className="masthead-identity flex-shrink-0">
        <Link
          href={homeHref}
          className={`masthead-identity-link ${focusRingClass} rounded-sm text-base font-semibold tracking-tight flex items-center min-h-[var(--masthead-bar-height)]`}
        >
          {wordmark}
        </Link>
      </div>
      {centerContent && (
        <div className="masthead-nav flex-1 min-w-0 flex items-center justify-center">
          {centerContent}
        </div>
      )}
      {headerControls && (
        <div className="masthead-utilities flex-shrink-0 flex items-center gap-1">
          {headerControls}
        </div>
      )}
    </div>
  );
}

import type { ReactNode } from 'react';
import Link from 'next/link';
import { focusRingClass } from '@joelklemmer/a11y';

export interface HeaderProps {
  wordmark: string;
  homeHref: string;
  headerControls?: ReactNode;
}

export function Header({ wordmark, homeHref, headerControls }: HeaderProps) {
  return (
    <div className="flex items-center justify-between gap-3 w-full h-10 md:h-11">
      <Link
        href={homeHref}
        className={`${focusRingClass} rounded-sm text-base font-semibold tracking-tight flex items-center`}
      >
        {wordmark}
      </Link>
      {headerControls && (
        <div className="flex items-center gap-1 flex-shrink-0">
          {headerControls}
        </div>
      )}
    </div>
  );
}

import type { ReactNode } from 'react';
import Link from 'next/link';
import { focusRingClass } from '@joelklemmer/a11y';

export interface HeaderSectionProps {
  wordmark: string;
  homeHref: string;
  headerControls?: ReactNode;
}

export function HeaderSection({
  wordmark,
  homeHref,
  headerControls,
}: HeaderSectionProps) {
  return (
    <div className="flex items-baseline justify-between gap-4 w-full">
      <Link
        href={homeHref}
        className={`${focusRingClass} rounded-none text-base font-semibold tracking-tight`}
      >
        {wordmark}
      </Link>
      {headerControls && (
        <div className="flex items-center gap-2 flex-shrink-0">
          {headerControls}
        </div>
      )}
    </div>
  );
}

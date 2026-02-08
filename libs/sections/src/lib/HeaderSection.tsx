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
    <div className="flex items-center justify-between gap-4">
      <Link
        href={homeHref}
        className={`${focusRingClass} rounded-sm text-base font-semibold tracking-tight`}
      >
        {wordmark}
      </Link>
      {headerControls && (
        <div className="flex items-center gap-2">{headerControls}</div>
      )}
    </div>
  );
}

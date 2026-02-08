import type { ReactNode } from 'react';
import Link from 'next/link';
import { focusRingClass } from '@joelklemmer/a11y';

export interface HeaderSectionProps {
  wordmark: string;
  homeHref: string;
  languageSwitcher?: ReactNode;
  themeToggle?: ReactNode;
  accessibilityPanel?: ReactNode;
}

export function HeaderSection({
  wordmark,
  homeHref,
  languageSwitcher,
  themeToggle,
  accessibilityPanel,
}: HeaderSectionProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <Link
        href={homeHref}
        className={`${focusRingClass} rounded-sm text-base font-semibold tracking-tight`}
      >
        {wordmark}
      </Link>
      <div className="flex items-center gap-2">
<<<<<<< Current (Your changes)
        {languageSwitcher}
        {themeToggle}
        {accessibilityPanel}
=======
        {themeToggle}
        {accessibilityPanel}
        {languageSwitcher}
>>>>>>> Incoming (Background Agent changes)
      </div>
    </div>
  );
}

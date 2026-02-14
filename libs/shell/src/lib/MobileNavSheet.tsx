'use client';

/**
 * Mobile nav as shadcn Sheet. Hamburger trigger opens Sheet with nav links.
 * Closes on navigation (Link click).
 */
import { useState } from 'react';
import Link from 'next/link';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@joelklemmer/ui';
import { focusRingClass, visuallyHiddenClass } from '@joelklemmer/a11y';
import { cn } from '@joelklemmer/ui';
import type { ServerShellNavItem } from './ServerShell';

export interface MobileNavSheetProps {
  navItems: ServerShellNavItem[];
  navLabel: string;
}

export function MobileNavSheet({ navItems, navLabel }: MobileNavSheetProps) {
  const [open, setOpen] = useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        className={cn(
          focusRingClass,
          'masthead-touch-target masthead-icon flex md:hidden items-center justify-center rounded-sm text-muted hover:text-text min-h-[44px] min-w-[44px]',
        )}
        aria-label={navLabel}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </SheetTrigger>
      <SheetContent side="end" className="w-[min(20rem,85vw)]">
        <SheetHeader>
          <SheetTitle className={visuallyHiddenClass}>{navLabel}</SheetTitle>
        </SheetHeader>
        <nav aria-label={navLabel} className="mt-6 flex flex-col gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              prefetch={false}
              {...(item.rank && { 'data-nav-rank': item.rank })}
              className={`${focusRingClass} block w-full rounded-sm px-4 py-3 text-start text-text hover:bg-border/50`}
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}

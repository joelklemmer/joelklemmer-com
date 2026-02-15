'use client';

/**
 * Mobile nav as shadcn Sheet. Hamburger trigger opens Sheet with nav links.
 * Closes on navigation (Link click).
 * Defers Radix render until after mount to avoid hydration mismatch (radix ID generation).
 */
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
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

const HamburgerIcon = () => (
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
);

export interface MobileNavSheetProps {
  navItems: ServerShellNavItem[];
  navLabel: string;
}

export function MobileNavSheet({ navItems, navLabel }: MobileNavSheetProps) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className={cn(
          focusRingClass,
          'masthead-touch-target masthead-icon flex items-center justify-center rounded-none text-muted min-h-[44px] min-w-[44px]',
        )}
        aria-label={navLabel}
      >
        <HamburgerIcon />
      </div>
    );
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        id="primary-nav-trigger"
        aria-haspopup="dialog"
        aria-controls="primary-nav-menu"
        className={cn(
          focusRingClass,
          'masthead-touch-target masthead-icon flex items-center justify-center rounded-none text-muted hover:text-text min-h-[44px] min-w-[44px]',
        )}
        aria-label={navLabel}
      >
        <HamburgerIcon />
      </SheetTrigger>
      <SheetContent
        id="primary-nav-menu"
        side="end"
        className="mobile-nav-sheet w-[min(20rem,85vw)]"
        aria-label={navLabel}
      >
        <SheetHeader>
          <SheetTitle className={visuallyHiddenClass}>{navLabel}</SheetTitle>
        </SheetHeader>
        <nav aria-label={navLabel} className="mt-6 flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch={false}
                {...(item.rank && { 'data-nav-rank': item.rank })}
                className={`nav-primary-menu-item ${focusRingClass} block w-full rounded-none px-4 py-3 text-start ${
                  isActive ? 'nav-primary-menu-item--active' : ''
                }`}
                aria-current={isActive ? 'page' : undefined}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </SheetContent>
    </Sheet>
  );
}

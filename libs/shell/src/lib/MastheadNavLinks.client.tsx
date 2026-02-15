'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { focusRingClass } from '@joelklemmer/a11y';
import type { ServerShellNavItem } from './ServerShell';

export interface MastheadNavLinksProps {
  items: ServerShellNavItem[];
  /** Optional class for uk locale variant */
  className?: string;
}

export function MastheadNavLinks({
  items,
  className = '',
}: MastheadNavLinksProps) {
  const pathname = usePathname();

  return (
    <ul
      className={`nav-primary-list flex-nowrap items-center min-h-[var(--masthead-bar-height)] whitespace-nowrap ${className}`.trim()}
      data-nav="desktop"
    >
      {items.map((item) => {
        const isActive = pathname === item.href;
        return (
          <li key={item.href} className="flex items-center h-full">
            <Link
              href={item.href}
              prefetch={false}
              {...(item.rank && { 'data-nav-rank': item.rank })}
              className={`nav-primary-link ${focusRingClass} rounded-none h-full flex items-center relative ${
                isActive ? 'nav-primary-link--active' : ''
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

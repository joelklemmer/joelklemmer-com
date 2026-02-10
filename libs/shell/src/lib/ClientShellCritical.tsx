'use client';

/**
 * Minimal client island for above-the-fold header only: mobile nav trigger.
 * Language switcher is deferred (SSR links for first paint; popover in headerDeferredSlot).
 * No ThemeProvider, ContrastProvider, etc.; keeps critical JS small for LCP.
 */
import { Nav } from '@joelklemmer/ui';

export interface ClientShellCriticalProps {
  navItems: {
    href: string;
    label: string;
    rank?: 'primary' | 'secondary' | 'tertiary';
  }[];
}

export function ClientShellCritical({ navItems }: ClientShellCriticalProps) {
  return <Nav items={navItems} desktopRendered />;
}

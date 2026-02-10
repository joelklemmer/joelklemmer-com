'use client';

/**
 * Minimal client island for above-the-fold header only: mobile nav trigger + language switcher.
 * No ThemeProvider, ContrastProvider, ACPProvider, EvaluatorModeProvider, DensityViewProvider.
 * Keeps critical JS small so LCP is not blocked by provider hydration.
 */
import { Nav, LanguageSwitcherPopover } from '@joelklemmer/ui';

export interface ClientShellCriticalProps {
  navItems: {
    href: string;
    label: string;
    rank?: 'primary' | 'secondary' | 'tertiary';
  }[];
}

export function ClientShellCritical({ navItems }: ClientShellCriticalProps) {
  return (
    <>
      <Nav items={navItems} desktopRendered />
      <LanguageSwitcherPopover />
    </>
  );
}

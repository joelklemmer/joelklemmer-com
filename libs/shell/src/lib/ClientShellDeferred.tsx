'use client';

/**
 * Header controls: theme toggle, language switcher (globe), accessibility (settings).
 * Mounted after first paint (DeferMount) so it does not block LCP.
 * On mount, hides SSR language links so the popover takes over.
 * NextIntlClientProvider wraps this island only (not first paint).
 * No cookie preferences in header (footer only).
 */
import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import {
  ThemeProvider,
  ContrastProvider,
  ThemeToggle,
  AccessibilityPanel,
  LanguageSwitcherPopover,
} from '@joelklemmer/ui';
import { ACPProvider } from '@joelklemmer/a11y';

export interface ClientShellDeferredProps {
  locale: string;
  messages: Record<string, unknown>;
  children?: ReactNode;
}

export function ClientShellDeferred({
  locale,
  messages,
  children,
}: ClientShellDeferredProps) {
  useEffect(() => {
    document.querySelectorAll('[data-language-links-ssr]').forEach((el) => {
      el.setAttribute('aria-hidden', 'true');
      (el as HTMLElement).classList.add('hidden');
    });
  }, []);

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <ThemeProvider>
        <ContrastProvider>
          <ACPProvider>
            <ThemeToggle />
            <LanguageSwitcherPopover />
            <AccessibilityPanel />
            {children}
          </ACPProvider>
        </ContrastProvider>
      </ThemeProvider>
    </NextIntlClientProvider>
  );
}

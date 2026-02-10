'use client';

/**
 * Full header controls suite: theme, contrast, ACP, cookie prefs, a11y panel, language popover, evaluator/density.
 * Mounted after first paint (DeferMount) so it does not block LCP.
 * On mount, hides SSR language links so the popover takes over.
 */
import type { ReactNode } from 'react';
import { useEffect } from 'react';
import {
  ThemeProvider,
  ContrastProvider,
  ThemeToggle,
  AccessibilityPanel,
  LanguageSwitcherPopover,
} from '@joelklemmer/ui';
import { ACPProvider } from '@joelklemmer/a11y';
import { CookiePreferencesTrigger } from '@joelklemmer/compliance';
import { EvaluatorModeProvider } from '@joelklemmer/evaluator-mode';
import { DensityViewProvider } from '@joelklemmer/authority-density';

export interface ClientShellDeferredProps {
  initialEvaluatorMode?: string;
  children?: ReactNode;
}

export function ClientShellDeferred({
  initialEvaluatorMode = 'default',
  children,
}: ClientShellDeferredProps) {
  useEffect(() => {
    document.querySelectorAll('[data-language-links-ssr]').forEach((el) => {
      el.setAttribute('aria-hidden', 'true');
      (el as HTMLElement).classList.add('hidden');
    });
  }, []);

  return (
    <ThemeProvider>
      <ContrastProvider>
        <ACPProvider>
          <EvaluatorModeProvider
            initialMode={
              initialEvaluatorMode as
                | 'default'
                | 'executive'
                | 'board'
                | 'public_service'
                | 'investor'
                | 'media'
            }
          >
            <DensityViewProvider syncWithHash>
              <ThemeToggle />
              <LanguageSwitcherPopover />
              <CookiePreferencesTrigger />
              <AccessibilityPanel />
              {children}
            </DensityViewProvider>
          </EvaluatorModeProvider>
        </ACPProvider>
      </ContrastProvider>
    </ThemeProvider>
  );
}

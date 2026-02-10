'use client';

/**
 * Full header controls suite: theme, contrast, ACP, cookie prefs, a11y panel, evaluator/density.
 * Mounted after first paint (DeferMount) so it does not block LCP.
 * Theme/contrast/density/evaluator are applied via SSR attributes; providers here sync and offer toggles.
 */
import type { ReactNode } from 'react';
import {
  ThemeProvider,
  ContrastProvider,
  ThemeToggle,
  AccessibilityPanel,
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

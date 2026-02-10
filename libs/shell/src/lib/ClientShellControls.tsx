'use client';

/**
 * Client island: mobile nav, language, theme, cookie prefs, a11y panel.
 * Wraps only these controls in Theme/Contrast/ACP/Evaluator/Density providers
 * so the rest of the page is not inside those providers (reduces hydration before LCP).
 */
import type { ReactNode } from 'react';
import {
  ThemeProvider,
  ContrastProvider,
  ThemeToggle,
  Nav,
  LanguageSwitcherPopover,
  AccessibilityPanel,
} from '@joelklemmer/ui';
import { ACPProvider } from '@joelklemmer/a11y';
import { CookiePreferencesTrigger } from '@joelklemmer/compliance';
import { EvaluatorModeProvider } from '@joelklemmer/evaluator-mode';
import { DensityViewProvider } from '@joelklemmer/authority-density';

export interface ClientShellControlsProps {
  navItems: {
    href: string;
    label: string;
    rank?: 'primary' | 'secondary' | 'tertiary';
  }[];
  initialEvaluatorMode?: string;
  children?: ReactNode;
}

/**
 * Providers only wrap the shell controls, not the full page.
 * Desktop nav links are server-rendered; Nav here is mobile-only (desktopRendered).
 */
export function ClientShellControls({
  navItems,
  initialEvaluatorMode = 'default',
  children,
}: ClientShellControlsProps) {
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
              <Nav items={navItems} desktopRendered />
              <LanguageSwitcherPopover />
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

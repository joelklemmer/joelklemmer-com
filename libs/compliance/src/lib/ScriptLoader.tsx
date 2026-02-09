'use client';

import type { ReactNode } from 'react';
import type { ConsentState } from './consent-state';
import { useConsent } from './ConsentContext';
import {
  canLoadAnalytics,
  canLoadFunctional,
  canLoadMarketing,
} from './policy-adapter';

export type ScriptCategory = 'analytics' | 'functional' | 'marketing';

export interface ScriptLoaderProps {
  category: ScriptCategory;
  /** Only rendered when consent for this category is granted. Not loaded before consent. */
  children: ReactNode;
}

function categoryAllowed(
  category: ScriptCategory,
  state: ConsentState | null,
): boolean {
  switch (category) {
    case 'analytics':
      return canLoadAnalytics(state);
    case 'functional':
      return canLoadFunctional(state);
    case 'marketing':
      return canLoadMarketing(state);
    default:
      return false;
  }
}

/**
 * Renders children only when consent for the given category is granted.
 * Use for analytics scripts, third-party embeds, or any non-essential script.
 * Refuses to load (does not render) until consent is given.
 */
export function ScriptLoader({ category, children }: ScriptLoaderProps) {
  const { consentState } = useConsent();
  if (!categoryAllowed(category, consentState)) {
    return null;
  }
  return <>{children}</>;
}

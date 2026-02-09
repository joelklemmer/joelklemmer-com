'use client';

import type { ReactNode } from 'react';
import type { ConsentCategory } from './categories';
import { useConsentV2 } from './ConsentContextV2';
import { canLoadCategoryV2 } from './policy-adapter-v2';

export type ScriptCategoryV2 =
  | 'analytics'
  | 'functional'
  | 'experience'
  | 'marketing';

export interface ScriptLoaderV2Props {
  category: ScriptCategoryV2;
  children: ReactNode;
}

/**
 * Renders children only when consent for the given category is granted.
 * Use for analytics, functional, experience (e.g. session replay), or marketing scripts.
 */
export function ScriptLoaderV2({ category, children }: ScriptLoaderV2Props) {
  const { consentState } = useConsentV2();
  if (!canLoadCategoryV2(consentState, category)) {
    return null;
  }
  return <>{children}</>;
}

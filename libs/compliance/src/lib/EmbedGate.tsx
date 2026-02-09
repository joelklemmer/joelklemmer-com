'use client';

import type { ReactNode } from 'react';
import type { ConsentCategory } from './categories';
import { useConsentV2 } from './ConsentContextV2';
import { canLoadCategoryV2 } from './policy-adapter-v2';

export interface EmbedGateProps {
  /** Category required to show embed (e.g. analytics, experience, marketing). */
  category: ConsentCategory;
  /** Optional: purpose required (e.g. personalization for recommendations). */
  purpose?: string;
  children: ReactNode;
}

/**
 * Renders children only when consent for the given category (and optional purpose) is granted.
 * Use for iframes, embeds (YouTube, social), session replay, heatmaps.
 */
export function EmbedGate({ category, purpose, children }: EmbedGateProps) {
  const { consentState } = useConsentV2();
  if (!canLoadCategoryV2(consentState, category)) return null;
  if (
    purpose &&
    !consentState.purposes[purpose as keyof typeof consentState.purposes]
  ) {
    return null;
  }
  return <>{children}</>;
}

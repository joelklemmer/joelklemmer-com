'use client';

import type { ReactNode } from 'react';
import { ConsentProviderV2 } from '@joelklemmer/compliance';
import type { ConsentStateV2 } from '@joelklemmer/compliance';

export interface ConsentProviderWrapperProps {
  initialConsentState: ConsentStateV2 | null;
  children: ReactNode;
}

/**
 * Wraps children with ConsentProviderV2 so useConsentV2 works app-wide
 * (e.g. Preferences page, ConsentPreferencesForm).
 */
export function ConsentProviderWrapper({
  initialConsentState,
  children,
}: ConsentProviderWrapperProps) {
  return (
    <ConsentProviderV2 initialConsentState={initialConsentState}>
      {children}
    </ConsentProviderV2>
  );
}

'use client';

import { useEffect } from 'react';
import { useConsent } from '@joelklemmer/compliance';
import { useTelemetry } from '@joelklemmer/authority-telemetry';

/**
 * Syncs consent.analytics to TelemetryProvider.setConsent so that route_view and
 * other events are only sent when the user has accepted analytics.
 * Must be rendered inside both ConsentProvider and TelemetryProvider.
 */
export function SyncConsentToTelemetry() {
  const { consentState } = useConsent();
  const { setConsent } = useTelemetry();

  useEffect(() => {
    setConsent(consentState.choiceMade && consentState.analytics);
  }, [consentState.choiceMade, consentState.analytics, setConsent]);

  return null;
}

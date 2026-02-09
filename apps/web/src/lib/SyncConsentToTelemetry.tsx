'use client';

import { useEffect } from 'react';
import { useConsentV2 } from '@joelklemmer/compliance';
import { useTelemetry } from '@joelklemmer/authority-telemetry';

/**
 * Syncs consent categories.analytics to TelemetryProvider.setConsent so that
 * route_view and other events are only sent when the user has accepted analytics.
 * Must be rendered inside both ConsentProviderV2 and TelemetryProvider.
 */
export function SyncConsentToTelemetry() {
  const { consentState } = useConsentV2();
  const { setConsent } = useTelemetry();

  useEffect(() => {
    setConsent(
      consentState.choiceMade === true &&
        consentState.categories.analytics === true,
    );
  }, [consentState.choiceMade, consentState.categories.analytics, setConsent]);

  return null;
}

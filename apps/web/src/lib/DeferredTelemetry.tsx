'use client';

import { useEffect, useState } from 'react';
import { TelemetryProvider } from '@joelklemmer/authority-telemetry';
import { ConsentProviderV2 } from '@joelklemmer/compliance';
import type { ConsentStateV2 } from '@joelklemmer/compliance';
import { RouteViewTracker, AuthorityTelemetryListener } from './telemetry';
import { SyncConsentToTelemetry } from './SyncConsentToTelemetry';

/** Schedules telemetry after first paint so LCP is not blocked by provider + listeners. */
const DEFER_TIMEOUT_MS = 500;

/**
 * Telemetry as a sibling listener layer: mounts after idle without wrapping page children.
 * Renders ConsentProviderV2 (only here, not in first paint) + TelemetryProvider + SyncConsentToTelemetry, etc.
 * ConsentProviderV2 is in this deferred tree so it does not block LCP.
 */
export function TelemetryLayer({
  initialAnalyticsConsent,
  initialConsentState,
}: {
  initialAnalyticsConsent: boolean;
  initialConsentState: ConsentStateV2 | null;
}) {
  const [afterPaint, setAfterPaint] = useState(false);

  useEffect(() => {
    const schedule =
      typeof requestIdleCallback !== 'undefined'
        ? (cb: () => void) =>
            requestIdleCallback(cb, { timeout: DEFER_TIMEOUT_MS })
        : (cb: () => void) => window.setTimeout(cb, 0);
    const cancel =
      typeof cancelIdleCallback !== 'undefined'
        ? cancelIdleCallback
        : clearTimeout;

    const id = schedule(() => setAfterPaint(true));
    return () => cancel(id as number);
  }, []);

  if (!afterPaint) {
    return null;
  }

  return (
    <ConsentProviderV2 initialConsentState={initialConsentState}>
      <TelemetryProvider
        initialConsent={initialAnalyticsConsent}
        trackInputMode
        persistToStorage={false}
      >
        <SyncConsentToTelemetry />
        <RouteViewTracker />
        <AuthorityTelemetryListener />
      </TelemetryProvider>
    </ConsentProviderV2>
  );
}

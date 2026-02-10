'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { TelemetryProvider } from '@joelklemmer/authority-telemetry';
import { RouteViewTracker, AuthorityTelemetryListener } from './telemetry';
import { SyncConsentToTelemetry } from './SyncConsentToTelemetry';

/** Schedules telemetry after first paint so LCP is not blocked by provider + listeners. */
const DEFER_TIMEOUT_MS = 500;

export function DeferredTelemetry({
  children,
  initialAnalyticsConsent,
}: {
  children: ReactNode;
  initialAnalyticsConsent: boolean;
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
    return <>{children}</>;
  }

  return (
    <TelemetryProvider
      initialConsent={initialAnalyticsConsent}
      trackInputMode
      persistToStorage={false}
    >
      <SyncConsentToTelemetry />
      <RouteViewTracker />
      <AuthorityTelemetryListener />
      {children}
    </TelemetryProvider>
  );
}

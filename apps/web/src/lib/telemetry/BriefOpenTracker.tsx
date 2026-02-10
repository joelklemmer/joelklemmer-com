'use client';

import { useEffect, useRef } from 'react';
import {
  useTelemetry,
  TELEMETRY_EVENTS,
  type BriefOpenPayload,
} from '@joelklemmer/authority-telemetry';

/**
 * Fires brief_open once when the brief page is opened. Renders nothing.
 * Place on the brief page (inside TelemetryProvider).
 * Locale is passed from server so no NextIntlClientProvider is required.
 */
export function BriefOpenTracker({ locale }: { locale: string }) {
  const { track } = useTelemetry();
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    const payload: BriefOpenPayload = { locale };
    track(TELEMETRY_EVENTS.BRIEF_OPEN, payload);
  }, [locale, track]);

  return null;
}

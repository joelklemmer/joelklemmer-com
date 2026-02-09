'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';
import {
  useTelemetry,
  TELEMETRY_EVENTS,
  type RouteViewPayload,
} from '@joelklemmer/authority-telemetry';
import { useLocale } from 'next-intl';

/**
 * Fires route_view when the pathname changes. Renders nothing.
 * Place once inside the locale layout (inside TelemetryProvider).
 */
export function RouteViewTracker() {
  const pathname = usePathname();
  const locale = useLocale();
  const { track } = useTelemetry();
  const prevPathname = useRef<string | null>(null);

  useEffect(() => {
    if (pathname == null) return;
    if (prevPathname.current === pathname) return;
    prevPathname.current = pathname;
    const payload: RouteViewPayload = { pathname, locale };
    track(TELEMETRY_EVENTS.ROUTE_VIEW, payload);
  }, [pathname, locale, track]);

  return null;
}

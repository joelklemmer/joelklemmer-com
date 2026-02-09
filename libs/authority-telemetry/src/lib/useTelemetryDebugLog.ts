'use client';

import { useSyncExternalStore, useCallback } from 'react';
import {
  getDebugEvents,
  clearDebugEvents,
  subscribeToDebugEvents,
} from './debug';
import type { TelemetryEventRecord } from './types';

/**
 * Hook for debug dashboard: subscribe to the in-memory telemetry event log.
 * No visual UI is rendered by this hook; consumers can use the returned data to render a dashboard.
 */
export function useTelemetryDebugLog(): {
  events: TelemetryEventRecord[];
  clear: () => void;
} {
  const events = useSyncExternalStore(
    subscribeToDebugEvents,
    getDebugEvents,
    getDebugEvents,
  );
  const clear = useCallback(clearDebugEvents, []);
  return { events, clear };
}

'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { TelemetryProviderBackend } from './types';
import type { TelemetryEventName } from './events';
import type { TelemetryPayload, TelemetryEventRecord } from './types';
import { noOpProvider } from './provider';
import { pushDebugEvent } from './debug';

export interface TelemetryContextValue {
  /** Log an event. Only sent to provider when consent is true. Always appended to debug buffer. */
  track: (name: TelemetryEventName | string, payload: TelemetryPayload) => void;
  /** Whether analytics consent is granted. When false, provider is not called. */
  consent: boolean;
  /** Set analytics consent. Typically driven by cookie banner or settings. */
  setConsent: (granted: boolean) => void;
}

const TelemetryContext = createContext<TelemetryContextValue | null>(null);

export interface TelemetryProviderProps {
  children: ReactNode;
  /** Pluggable provider (e.g. GA, Plausible, or custom). Default: no-op. */
  provider?: TelemetryProviderBackend;
  /** Initial consent. Default false (privacy-first). */
  initialConsent?: boolean;
  /** Reserved for future input/INP tracking. Accepted for layout compatibility. */
  trackInputMode?: boolean;
  /** Reserved for persistence of consent/session. Accepted for layout compatibility. */
  persistToStorage?: boolean;
}

/**
 * Provides telemetry and consent state. Events are only sent to the provider when consent is true.
 * All events are always pushed to the debug buffer for dashboard hooks.
 */
export function TelemetryProvider({
  children,
  provider = noOpProvider,
  initialConsent = false,
  trackInputMode: _trackInputMode,
  persistToStorage: _persistToStorage,
}: TelemetryProviderProps) {
  const [consent, setConsentState] = useState(initialConsent);

  const setConsent = useCallback((granted: boolean) => {
    setConsentState(granted);
  }, []);

  const track = useCallback(
    (name: TelemetryEventName | string, payload: TelemetryPayload) => {
      const record: TelemetryEventRecord = {
        name,
        payload,
        timestamp: Date.now(),
      };
      pushDebugEvent(record);
      if (consent) {
        try {
          provider.track(record);
        } catch {
          // Don't break app if provider throws
        }
      }
    },
    [consent, provider],
  );

  const value = useMemo<TelemetryContextValue>(
    () => ({ track, consent, setConsent }),
    [track, consent, setConsent],
  );

  return (
    <TelemetryContext.Provider value={value}>
      {children}
    </TelemetryContext.Provider>
  );
}

export function useTelemetry(): TelemetryContextValue {
  const ctx = useContext(TelemetryContext);
  if (!ctx) {
    return {
      track: () => {},
      consent: false,
      setConsent: () => {},
    };
  }
  return ctx;
}

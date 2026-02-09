'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useEffect,
  type ReactNode,
} from 'react';
import type { ConsentState } from './consent-state';
import {
  createDefaultConsentState,
  createAcceptedAllConsentState,
  createRejectNonEssentialConsentState,
} from './consent-state';
import {
  readConsentFromDocument,
  writeConsentToDocument,
  clearConsentCookie,
} from './consent-store';
import {
  canLoadAnalytics,
  canLoadFunctional,
  canLoadMarketing,
} from './policy-adapter';

export interface ConsentContextValue {
  /** Current consent state. Before choice: choiceMade false, all non-essential false. */
  consentState: ConsentState;
  /** User has made an explicit choice (even if "reject non-essential"). */
  choiceMade: boolean;
  /** Update consent and persist to cookie. Call only after user action. */
  updateConsent: (state: ConsentState) => void;
  /** Accept all categories and persist. */
  acceptAll: () => void;
  /** Reject all non-essential and persist. */
  rejectNonEssential: () => void;
  /** Withdraw: clear cookie and reset to no choice. */
  withdraw: () => void;
  /** Gate helpers for script loading. */
  canLoadAnalytics: boolean;
  canLoadFunctional: boolean;
  canLoadMarketing: boolean;
}

const ConsentContext = createContext<ConsentContextValue | null>(null);

export interface ConsentProviderProps {
  children: ReactNode;
  /** Server-derived initial state (from cookie). Use null for no cookie. */
  initialConsentState: ConsentState | null;
}

export function ConsentProvider({
  children,
  initialConsentState,
}: ConsentProviderProps) {
  const [consentState, setConsentState] = useState<ConsentState>(
    () => initialConsentState ?? createDefaultConsentState(),
  );

  useEffect(() => {
    const fromDoc = readConsentFromDocument();
    if (fromDoc && fromDoc.choiceMade) {
      setConsentState(fromDoc);
    }
  }, []);

  const updateConsent = useCallback((state: ConsentState) => {
    setConsentState(state);
    writeConsentToDocument(state);
  }, []);

  const acceptAll = useCallback(() => {
    const state = createAcceptedAllConsentState();
    updateConsent(state);
  }, [updateConsent]);

  const rejectNonEssential = useCallback(() => {
    const state = createRejectNonEssentialConsentState();
    updateConsent(state);
  }, [updateConsent]);

  const withdraw = useCallback(() => {
    clearConsentCookie();
    setConsentState(createDefaultConsentState());
  }, []);

  const choiceMade = consentState?.choiceMade ?? false;

  const value = useMemo<ConsentContextValue>(
    () => ({
      consentState,
      choiceMade,
      updateConsent,
      acceptAll,
      rejectNonEssential,
      withdraw,
      canLoadAnalytics: canLoadAnalytics(consentState),
      canLoadFunctional: canLoadFunctional(consentState),
      canLoadMarketing: canLoadMarketing(consentState),
    }),
    [
      consentState,
      choiceMade,
      updateConsent,
      acceptAll,
      rejectNonEssential,
      withdraw,
    ],
  );

  return (
    <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>
  );
}

export function useConsent(): ConsentContextValue {
  const ctx = useContext(ConsentContext);
  if (!ctx) {
    const defaultState = createDefaultConsentState();
    return {
      consentState: defaultState,
      choiceMade: false,
      updateConsent: () => {},
      acceptAll: () => {},
      rejectNonEssential: () => {},
      withdraw: () => {},
      canLoadAnalytics: false,
      canLoadFunctional: false,
      canLoadMarketing: false,
    };
  }
  return ctx;
}

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
import type { ConsentState } from './consent-state-v2';
import {
  createDefaultConsentState,
  createAcceptedAllConsentState,
  createRejectNonEssentialConsentState,
} from './consent-state-v2';
import {
  readConsentFromDocumentV2,
  saveConsentWithReceipt,
  clearConsentCookieV2,
  clearStoredReceipt,
} from './consent-store-v2';
import {
  canLoadAnalyticsV2,
  canLoadFunctionalV2,
  canLoadMarketingV2,
  canLoadExperienceV2,
  canUsePersonalization,
} from './policy-adapter-v2';
import { createConsentReceiptSync, type ConsentReceipt } from './receipt';
import { appendConsentHistory } from './consent-history';
import { captureGpcDntAudit } from './gpc-dnt';
import { runRevocationHooks } from './revocation-hooks';
import {
  dispatchConsentChanged,
  EVENT_CONSENT_CHANGED,
} from './consent-events';

export interface ConsentContextValueV2 {
  consentState: ConsentState;
  choiceMade: boolean;
  /** Last stored receipt (after grant/update). */
  receipt: ConsentReceipt | null;
  updateConsent: (state: ConsentState) => void;
  acceptAll: () => void;
  rejectNonEssential: () => void;
  withdraw: () => void;
  canLoadAnalytics: boolean;
  canLoadFunctional: boolean;
  canLoadMarketing: boolean;
  canLoadExperience: boolean;
  canUsePersonalization: boolean;
}

const ConsentContextV2 = createContext<ConsentContextValueV2 | null>(null);

export interface ConsentProviderV2Props {
  children: ReactNode;
  initialConsentState: ConsentState | null;
}

export function ConsentProviderV2({
  children,
  initialConsentState,
}: ConsentProviderV2Props) {
  const [consentState, setConsentState] = useState<ConsentState>(
    () => initialConsentState ?? createDefaultConsentState(),
  );
  const [receipt, setReceipt] = useState<ConsentReceipt | null>(null);

  useEffect(() => {
    const syncFromDoc = () => {
      const fromDoc = readConsentFromDocumentV2();
      if (fromDoc) {
        setConsentState(fromDoc);
        setReceipt(createConsentReceiptSync(fromDoc));
      } else {
        setConsentState(createDefaultConsentState());
        setReceipt(null);
      }
    };
    syncFromDoc();
    window.addEventListener(EVENT_CONSENT_CHANGED, syncFromDoc);
    return () => window.removeEventListener(EVENT_CONSENT_CHANGED, syncFromDoc);
  }, []);

  const updateConsent = useCallback((state: ConsentState) => {
    setConsentState(state);
    saveConsentWithReceipt(state);
    const r = createConsentReceiptSync(state);
    setReceipt(r);
    const audit = captureGpcDntAudit();
    appendConsentHistory({
      timestamp: Date.now(),
      type: 'update',
      receiptHash: r.hash,
      gpc: audit.gpc,
      dnt: audit.dnt,
    });
    dispatchConsentChanged();
  }, []);

  const acceptAll = useCallback(() => {
    const state = createAcceptedAllConsentState();
    updateConsent(state);
    appendConsentHistory({
      ...captureGpcDntAudit(),
      timestamp: Date.now(),
      type: 'accept_all',
      receiptHash: createConsentReceiptSync(state).hash,
    });
  }, [updateConsent]);

  const rejectNonEssential = useCallback(() => {
    const state = createRejectNonEssentialConsentState();
    updateConsent(state);
    appendConsentHistory({
      ...captureGpcDntAudit(),
      timestamp: Date.now(),
      type: 'reject_non_essential',
      receiptHash: createConsentReceiptSync(state).hash,
    });
  }, [updateConsent]);

  const withdraw = useCallback(async () => {
    clearConsentCookieV2();
    clearStoredReceipt();
    setConsentState(createDefaultConsentState());
    setReceipt(null);
    const audit = captureGpcDntAudit();
    appendConsentHistory({
      timestamp: Date.now(),
      type: 'withdraw',
      gpc: audit.gpc,
      dnt: audit.dnt,
    });
    dispatchConsentChanged();
    await runRevocationHooks();
  }, []);

  const value = useMemo<ConsentContextValueV2>(
    () => ({
      consentState,
      choiceMade: consentState.choiceMade,
      receipt,
      updateConsent,
      acceptAll,
      rejectNonEssential,
      withdraw,
      canLoadAnalytics: canLoadAnalyticsV2(consentState),
      canLoadFunctional: canLoadFunctionalV2(consentState),
      canLoadMarketing: canLoadMarketingV2(consentState),
      canLoadExperience: canLoadExperienceV2(consentState),
      canUsePersonalization: canUsePersonalization(consentState),
    }),
    [
      consentState,
      receipt,
      updateConsent,
      acceptAll,
      rejectNonEssential,
      withdraw,
    ],
  );

  return (
    <ConsentContextV2.Provider value={value}>
      {children}
    </ConsentContextV2.Provider>
  );
}

export function useConsentV2(): ConsentContextValueV2 {
  const ctx = useContext(ConsentContextV2);
  if (!ctx) {
    const defaultState = createDefaultConsentState();
    return {
      consentState: defaultState,
      choiceMade: false,
      receipt: null,
      updateConsent: () => {},
      acceptAll: () => {},
      rejectNonEssential: () => {},
      withdraw: () => {},
      canLoadAnalytics: false,
      canLoadFunctional: false,
      canLoadMarketing: false,
      canLoadExperience: false,
      canUsePersonalization: false,
    };
  }
  return ctx;
}

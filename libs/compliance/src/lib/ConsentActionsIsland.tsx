'use client';

/**
 * Small client island: attaches click handlers to consent banner buttons (rendered by ConsentBannerSSR).
 * On accept/reject: persists consent via cookie and reloads so gated scripts and next paint see the new state.
 * On details: opens cookie preferences modal without reload (via CookiePreferencesOpenContext).
 */
import { useEffect } from 'react';
import {
  createAcceptedAllConsentState,
  createRejectNonEssentialConsentState,
} from './consent-state-v2';
import { saveConsentWithReceipt } from './consent-store-v2';
import { appendConsentHistory } from './consent-history';
import { captureGpcDntAudit } from './gpc-dnt';
import { createConsentReceiptSync } from './receipt';
import { useCookiePreferencesOpen } from './CookiePreferencesOpenContext';

const BANNER_ID = 'consent-banner';
const ACCEPT_SELECTOR = '[data-consent-action="accept"]';
const REJECT_SELECTOR = '[data-consent-action="reject"]';
const DETAILS_SELECTOR = '[data-consent-action="details"]';

export function ConsentActionsIsland() {
  const { open: openPreferences } = useCookiePreferencesOpen();

  useEffect(() => {
    const banner = document.getElementById(BANNER_ID);
    if (!banner) return;

    const acceptBtn = banner.querySelector<HTMLButtonElement>(ACCEPT_SELECTOR);
    const rejectBtn = banner.querySelector<HTMLButtonElement>(REJECT_SELECTOR);
    const detailsBtn =
      banner.querySelector<HTMLButtonElement>(DETAILS_SELECTOR);

    const handleAccept = (e: Event) => {
      e.preventDefault();
      const state = createAcceptedAllConsentState();
      saveConsentWithReceipt(state);
      appendConsentHistory({
        ...captureGpcDntAudit(),
        timestamp: Date.now(),
        type: 'accept_all',
        receiptHash: createConsentReceiptSync(state).hash,
      });
      window.location.reload();
    };

    const handleReject = (e: Event) => {
      e.preventDefault();
      const state = createRejectNonEssentialConsentState();
      saveConsentWithReceipt(state);
      appendConsentHistory({
        ...captureGpcDntAudit(),
        timestamp: Date.now(),
        type: 'reject_non_essential',
        receiptHash: createConsentReceiptSync(state).hash,
      });
      window.location.reload();
    };

    const handleDetails = (e: Event) => {
      e.preventDefault();
      openPreferences();
    };

    if (acceptBtn) acceptBtn.addEventListener('click', handleAccept);
    if (rejectBtn) rejectBtn.addEventListener('click', handleReject);
    if (detailsBtn) detailsBtn.addEventListener('click', handleDetails);
    return () => {
      if (acceptBtn) acceptBtn.removeEventListener('click', handleAccept);
      if (rejectBtn) rejectBtn.removeEventListener('click', handleReject);
      if (detailsBtn) detailsBtn.removeEventListener('click', handleDetails);
    };
  }, [openPreferences]);

  return null;
}

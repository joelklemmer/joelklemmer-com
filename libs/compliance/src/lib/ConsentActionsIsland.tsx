'use client';

/**
 * Micro-island: attaches click handlers to consent banner buttons (rendered by ConsentBannerSSR).
 * No provider dependency: writes consent cookie + receipt via store, hides banner via DOM, moves focus to main.
 * "Details" navigates to preferences page (link in banner); no modal in critical path.
 */
import { useEffect } from 'react';
import { createAcceptedAllConsentState } from './consent-state-v2';
import { createRejectNonEssentialConsentState } from './consent-state-v2';
import { saveConsentWithReceipt } from './consent-store-v2';
import { createConsentReceiptSync } from './receipt';
import { appendConsentHistory } from './consent-history';
import { captureGpcDntAudit } from './gpc-dnt';
import { MAIN_CONTENT_ID } from '@joelklemmer/a11y';

const BANNER_ID = 'consent-banner';
const ACCEPT_SELECTOR = '[data-consent-action="accept"]';
const REJECT_SELECTOR = '[data-consent-action="reject"]';
const DETAILS_SELECTOR = '[data-consent-action="details"]';

function moveFocusToMain(): void {
  requestAnimationFrame(() => {
    const main = document.getElementById(MAIN_CONTENT_ID);
    if (main && typeof main.focus === 'function') {
      main.focus();
    }
  });
}

function hideBanner(): void {
  const banner = document.getElementById(BANNER_ID);
  if (banner) {
    banner.setAttribute('hidden', '');
    banner.setAttribute('aria-hidden', 'true');
  }
}

export function ConsentActionsIsland() {
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
      const audit = captureGpcDntAudit();
      appendConsentHistory({
        ...audit,
        timestamp: Date.now(),
        type: 'accept_all',
        receiptHash: createConsentReceiptSync(state).hash,
      });
      hideBanner();
      moveFocusToMain();
    };

    const handleReject = (e: Event) => {
      e.preventDefault();
      const state = createRejectNonEssentialConsentState();
      saveConsentWithReceipt(state);
      const audit = captureGpcDntAudit();
      appendConsentHistory({
        ...audit,
        timestamp: Date.now(),
        type: 'reject_non_essential',
        receiptHash: createConsentReceiptSync(state).hash,
      });
      hideBanner();
      moveFocusToMain();
    };

    const handleDetails = (e: Event) => {
      e.preventDefault();
      const preferencesHref = banner
        .querySelector<HTMLAnchorElement>('a[href*="/preferences"]')
        ?.getAttribute('href');
      if (preferencesHref) {
        window.location.href = preferencesHref;
      }
    };

    if (acceptBtn) acceptBtn.addEventListener('click', handleAccept);
    if (rejectBtn) rejectBtn.addEventListener('click', handleReject);
    if (detailsBtn) detailsBtn.addEventListener('click', handleDetails);
    return () => {
      if (acceptBtn) acceptBtn.removeEventListener('click', handleAccept);
      if (rejectBtn) rejectBtn.removeEventListener('click', handleReject);
      if (detailsBtn) detailsBtn.removeEventListener('click', handleDetails);
    };
  }, []);

  return null;
}

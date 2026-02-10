'use client';

/**
 * Small client island: attaches click handlers to consent banner buttons (rendered by ConsentBannerSSR).
 * On accept/reject: persists consent via context + cookie, hides banner without reload, moves focus to main.
 * On details: opens cookie preferences modal (CookiePreferencesOpenContext).
 */
import { useEffect } from 'react';
import { useConsentV2 } from './ConsentContextV2';
import { useCookiePreferencesOpen } from './CookiePreferencesOpenContext';
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

export function ConsentActionsIsland() {
  const { acceptAll, rejectNonEssential } = useConsentV2();
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
      acceptAll();
      moveFocusToMain();
    };

    const handleReject = (e: Event) => {
      e.preventDefault();
      rejectNonEssential();
      moveFocusToMain();
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
  }, [acceptAll, rejectNonEssential, openPreferences]);

  return null;
}

'use client';

/**
 * Client island: hooks Accept/Reject on SSR banner, opens shadcn Dialog for Manage Preferences.
 * No provider: uses saveConsentWithReceipt, readConsentFromDocumentV2 directly.
 * Replaces consent handling in islands.js.
 */
import { useCallback, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Button,
} from '@joelklemmer/ui';
import { focusRingClass } from '@joelklemmer/a11y';
import {
  createDefaultConsentState,
  createAcceptedAllConsentState,
  createRejectNonEssentialConsentState,
} from './consent-state-v2';
import {
  saveConsentWithReceipt,
  readConsentFromDocumentV2,
} from './consent-store-v2';
import type { ConsentState } from './consent-state-v2';
import { createConsentReceiptSync } from './receipt';
import { appendConsentHistory } from './consent-history';
import { captureGpcDntAudit } from './gpc-dnt';
import { MAIN_CONTENT_ID } from '@joelklemmer/a11y';

const BANNER_ID = 'consent-banner';
const ACCEPT_SELECTOR = '[data-consent-action="accept"]';
const REJECT_SELECTOR = '[data-consent-action="reject"]';
const DETAILS_SELECTOR = '[data-consent-action="details"]';

const NON_ESSENTIAL_CATEGORIES = [
  'functional',
  'analytics',
  'experience',
  'marketing',
] as const;

function moveFocusToMain(): void {
  requestAnimationFrame(() => {
    const main = document.getElementById(MAIN_CONTENT_ID);
    if (main && typeof main.focus === 'function') main.focus();
  });
}

function hideBanner(): void {
  const banner = document.getElementById(BANNER_ID);
  if (banner) {
    banner.setAttribute('hidden', '');
    banner.setAttribute('aria-hidden', 'true');
  }
}

export interface ConsentClientProps {
  /** Optional; used only when Dialog is closed without saving (fallback link). */
  preferencesHref?: string;
}

export function ConsentClient({ preferencesHref }: ConsentClientProps) {
  const t = useTranslations('consent.banner');
  const tCommon = useTranslations('common');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [localCategories, setLocalCategories] = useState<
    Record<string, boolean>
  >(() => {
    const base = createDefaultConsentState().categories;
    return { ...base };
  });

  const resetLocalFromDoc = useCallback(() => {
    const fromDoc = readConsentFromDocumentV2();
    const base = fromDoc?.categories ?? createDefaultConsentState().categories;
    setLocalCategories({ ...base });
  }, []);

  useEffect(() => {
    resetLocalFromDoc();
  }, [resetLocalFromDoc]);

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
      resetLocalFromDoc();
      setDialogOpen(true);
    };

    if (acceptBtn) acceptBtn.addEventListener('click', handleAccept);
    if (rejectBtn) rejectBtn.addEventListener('click', handleReject);
    if (detailsBtn) detailsBtn.addEventListener('click', handleDetails);
    return () => {
      if (acceptBtn) acceptBtn.removeEventListener('click', handleAccept);
      if (rejectBtn) rejectBtn.removeEventListener('click', handleReject);
      if (detailsBtn) detailsBtn.removeEventListener('click', handleDetails);
    };
  }, [resetLocalFromDoc]);

  const handleCategoryChange = useCallback((cat: string, value: boolean) => {
    setLocalCategories((prev) => ({ ...prev, [cat]: value }));
  }, []);

  const handleSave = useCallback(() => {
    const fromDoc = readConsentFromDocumentV2();
    const base = fromDoc ?? createDefaultConsentState();
    const state: ConsentState = {
      ...base,
      timestamp: Date.now(),
      choiceMade: true,
      categories: { ...base.categories, ...localCategories },
    };
    saveConsentWithReceipt(state);
    const audit = captureGpcDntAudit();
    appendConsentHistory({
      ...audit,
      timestamp: Date.now(),
      type: 'update',
      receiptHash: createConsentReceiptSync(state).hash,
    });
    hideBanner();
    setDialogOpen(false);
    moveFocusToMain();
  }, [localCategories]);

  const handleAcceptAllInDialog = useCallback(() => {
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
    setDialogOpen(false);
    moveFocusToMain();
  }, []);

  const handleRejectInDialog = useCallback(() => {
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
    setDialogOpen(false);
    moveFocusToMain();
  }, []);

  const labelMap: Record<string, string> = {
    functional: tCommon('cookiePreferences.functionalLabel'),
    analytics: tCommon('cookiePreferences.analyticsLabel'),
    experience: tCommon('cookiePreferences.experienceLabel'),
    marketing: tCommon('cookiePreferences.marketingLabel'),
  };

  return (
    <>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent
          aria-describedby="consent-dialog-desc"
          className="max-h-[90vh] overflow-y-auto"
        >
          <DialogHeader>
            <DialogTitle>{tCommon('cookiePreferences.modalTitle')}</DialogTitle>
            <DialogDescription id="consent-dialog-desc">
              {t('description')}
            </DialogDescription>
            <p className="text-sm text-muted">
              {tCommon('cookiePreferences.essentialNote')}
            </p>
          </DialogHeader>
          <div
            className="space-y-3"
            role="group"
            aria-label={tCommon('cookiePreferences.modalTitle')}
          >
            {NON_ESSENTIAL_CATEGORIES.map((cat) => (
              <label key={cat} className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={localCategories[cat] ?? false}
                  onChange={(e) => handleCategoryChange(cat, e.target.checked)}
                  className={focusRingClass}
                />
                <span className="text-sm font-medium text-text">
                  {labelMap[cat]}
                </span>
              </label>
            ))}
          </div>
          <DialogFooter className="flex flex-wrap gap-2 sm:justify-between">
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleAcceptAllInDialog}
              >
                {tCommon('cookiePreferences.acceptAll')}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRejectInDialog}
              >
                {tCommon('cookiePreferences.rejectNonEssential')}
              </Button>
            </div>
            <Button size="sm" onClick={handleSave}>
              {tCommon('cookiePreferences.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

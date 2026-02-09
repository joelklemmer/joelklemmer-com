'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { focusRingClass } from '@joelklemmer/a11y';
import { CookiePreferencesModal } from './CookiePreferencesModal';

/**
 * Button that opens the cookie preferences modal. Place in header or footer.
 * Keyboard accessible; use with CookiePreferencesModal in the same tree.
 */
export function CookiePreferencesTrigger() {
  const [isOpen, setIsOpen] = useState(false);
  const t = useTranslations('common');

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-label={t('cookiePreferences.openLabel')}
        className={`${focusRingClass} masthead-touch-target flex items-center rounded-sm px-2 text-sm text-muted hover:text-text`}
      >
        {t('cookiePreferences.openLabel')}
      </button>
      <CookiePreferencesModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
}

'use client';

import { useTranslations } from 'next-intl';
import { focusRingClass } from '@joelklemmer/a11y';
import { useCookiePreferencesOpen } from './CookiePreferencesOpenContext';

/**
 * Button that opens the cookie preferences modal. Place in header or footer.
 * Keyboard accessible. Modal is rendered by CookiePreferencesOpenProvider.
 */
export function CookiePreferencesTrigger() {
  const { open, isOpen } = useCookiePreferencesOpen();
  const t = useTranslations('common');

  return (
    <button
      type="button"
      onClick={open}
      aria-haspopup="dialog"
      aria-expanded={isOpen}
      aria-label={t('cookiePreferences.openLabel')}
      className={`${focusRingClass} masthead-touch-target flex items-center rounded-none px-2 text-sm text-muted hover:text-text`}
    >
      {t('cookiePreferences.openLabel')}
    </button>
  );
}

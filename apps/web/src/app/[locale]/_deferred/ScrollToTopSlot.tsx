/**
 * Server wrapper for scroll-to-top button. Passes i18n label to client component.
 * Layout stays server-only; this file has no "use client".
 */
import { getTranslations } from 'next-intl/server';
import { ScrollToTop } from '@joelklemmer/ui';

export async function ScrollToTopSlot() {
  const common = await getTranslations('common');
  const label = common('a11y.scrollToTop');
  return <ScrollToTop label={label} />;
}

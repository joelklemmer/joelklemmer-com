/**
 * Server slot: renders ConsentBannerSSR + ConsentClient when no choice made.
 * Layout stays server-only; this file imports the client component.
 * Wraps ConsentClient with NextIntlClientProvider so useTranslations works.
 */
import { getMessages } from 'next-intl/server';
import { NextIntlClientProvider } from 'next-intl';
import { ConsentBannerSSR, ConsentClient } from '@joelklemmer/compliance';

export interface ConsentDeferredSlotProps {
  showBanner: boolean;
  preferencesHref: string;
  locale: string;
}

export async function ConsentDeferredSlot({
  showBanner,
  preferencesHref,
  locale,
}: ConsentDeferredSlotProps) {
  if (!showBanner) return null;
  const messages = await getMessages();
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return (
    <>
      <ConsentBannerSSR preferencesHref={preferencesHref} />
      <NextIntlClientProvider
        locale={locale}
        messages={messages ?? {}}
        timeZone={timeZone}
      >
        <ConsentClient preferencesHref={preferencesHref} />
      </NextIntlClientProvider>
    </>
  );
}

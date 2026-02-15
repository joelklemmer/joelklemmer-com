/**
 * Server slot: ConsentBannerSSR when no choice made; ConsentClient always mounted
 * so it can respond to jk:open-consent (e.g. from Preferences page).
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
  const messages = await getMessages();
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return (
    <>
      {showBanner && <ConsentBannerSSR preferencesHref={preferencesHref} />}
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

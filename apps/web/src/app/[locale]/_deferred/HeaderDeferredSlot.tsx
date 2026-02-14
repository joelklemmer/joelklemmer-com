/**
 * Server wrapper for header controls island. Passes locale and messages to client component.
 * Layout stays server-only; this file imports the client component.
 */
import { getMessages } from 'next-intl/server';
import { HeaderControlsClient } from '@joelklemmer/shell';

export interface HeaderDeferredSlotProps {
  locale: string;
}

export async function HeaderDeferredSlot({ locale }: HeaderDeferredSlotProps) {
  const messages = await getMessages();
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return (
    <HeaderControlsClient
      locale={locale}
      messages={messages as Record<string, unknown>}
      timeZone={timeZone}
    />
  );
}

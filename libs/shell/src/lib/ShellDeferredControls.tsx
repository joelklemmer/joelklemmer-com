'use client';

/**
 * Client wrapper: mounts ClientShellDeferred after first paint via DeferMount.
 * Used as headerDeferredSlot so deferred controls do not block LCP.
 */
import { DeferMount } from './DeferMount';
import { ClientShellDeferred } from './ClientShellDeferred';

export interface ShellDeferredControlsProps {
  locale: string;
  messages: Record<string, unknown>;
}

export function ShellDeferredControls({
  locale,
  messages,
}: ShellDeferredControlsProps) {
  return (
    <DeferMount idleTimeout={500}>
      <ClientShellDeferred locale={locale} messages={messages} />
    </DeferMount>
  );
}

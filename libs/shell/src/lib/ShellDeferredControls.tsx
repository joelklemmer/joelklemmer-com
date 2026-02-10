'use client';

/**
 * Client wrapper: mounts ClientShellDeferred after first paint via DeferMount.
 * Used as headerDeferredSlot so deferred controls do not block LCP.
 */
import { DeferMount } from './DeferMount';
import { ClientShellDeferred } from './ClientShellDeferred';

export interface ShellDeferredControlsProps {
  initialEvaluatorMode?: string;
  locale: string;
  messages: Record<string, unknown>;
}

export function ShellDeferredControls({
  initialEvaluatorMode = 'default',
  locale,
  messages,
}: ShellDeferredControlsProps) {
  return (
    <DeferMount idleTimeout={500}>
      <ClientShellDeferred
        initialEvaluatorMode={initialEvaluatorMode}
        locale={locale}
        messages={messages}
      />
    </DeferMount>
  );
}

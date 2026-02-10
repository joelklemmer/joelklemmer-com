'use client';

/**
 * Client wrapper: mounts ClientShellDeferred after first paint via DeferMount.
 * Used as headerDeferredSlot so deferred controls do not block LCP.
 */
import { DeferMount } from './DeferMount';
import { ClientShellDeferred } from './ClientShellDeferred';

export interface ShellDeferredControlsProps {
  initialEvaluatorMode?: string;
}

export function ShellDeferredControls({
  initialEvaluatorMode = 'default',
}: ShellDeferredControlsProps) {
  return (
    <DeferMount idleTimeout={500}>
      <ClientShellDeferred initialEvaluatorMode={initialEvaluatorMode} />
    </DeferMount>
  );
}

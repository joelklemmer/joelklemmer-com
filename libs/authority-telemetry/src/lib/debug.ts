import type { TelemetryEventRecord } from './types';

const DEBUG_BUFFER_MAX = 100;

const buffer: TelemetryEventRecord[] = [];
const subscribers = new Set<() => void>();

function notify() {
  subscribers.forEach((cb) => cb());
}

/**
 * Append an event to the debug buffer. Called internally when track() runs.
 * Debug dashboard can subscribe via useTelemetryDebugLog().
 */
export function pushDebugEvent(event: TelemetryEventRecord): void {
  buffer.push(event);
  if (buffer.length > DEBUG_BUFFER_MAX) {
    buffer.shift();
  }
  notify();
}

/**
 * Read current debug buffer (copy). For use in debug dashboard.
 */
export function getDebugEvents(): TelemetryEventRecord[] {
  return [...buffer];
}

/**
 * Clear the debug buffer. For use in debug dashboard.
 */
export function clearDebugEvents(): void {
  buffer.length = 0;
  notify();
}

/**
 * Subscribe to debug buffer changes. Returns unsubscribe.
 */
export function subscribeToDebugEvents(onChange: () => void): () => void {
  subscribers.add(onChange);
  return () => subscribers.delete(onChange);
}

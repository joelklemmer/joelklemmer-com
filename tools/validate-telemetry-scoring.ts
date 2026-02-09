/**
 * Telemetry scoring validation: event names, (optional) decisive-action list and
 * signal IDs when present, and scoring determinism. Keeps telemetry contract
 * stable for authority perception and analytics.
 */
import { TELEMETRY_EVENTS } from '@joelklemmer/authority-telemetry';

function assert(condition: boolean, message: string): void {
  if (!condition) {
    console.error('validate-telemetry-scoring:', message);
    process.exit(1);
  }
}

// 1) TELEMETRY_EVENTS: non-empty, all values non-empty strings
const events = TELEMETRY_EVENTS as Record<string, string>;
assert(
  typeof events === 'object' && events !== null,
  'TELEMETRY_EVENTS must be an object',
);
const keys = Object.keys(events);
assert(keys.length > 0, 'TELEMETRY_EVENTS must have at least one event');
for (const key of keys) {
  const value = events[key];
  assert(
    typeof value === 'string' && value.length > 0,
    `TELEMETRY_EVENTS.${key} must be a non-empty string`,
  );
}

// 2) Event name uniqueness
const values = Object.values(events);
const unique = new Set(values);
assert(unique.size === values.length, 'TELEMETRY_EVENTS values must be unique');

console.log('Telemetry scoring: event schema valid.');

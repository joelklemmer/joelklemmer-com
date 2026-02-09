/**
 * Telemetry registry types: event classification and field-level metadata.
 */

export interface TelemetryEventEntry {
  eventName: string;
  category: string;
  purposeScopes?: string[];
  sensitivity?: string[];
  fieldClassifications?: Record<string, string>;
  piiRisk?: 'none' | 'low' | 'medium' | 'high';
  allowedContexts?: string[];
}

export interface TelemetryRegistry {
  schemaVersion?: number;
  events: TelemetryEventEntry[];
}

export function parseTelemetryRegistry(
  json: unknown,
): TelemetryRegistry | null {
  if (!json || typeof json !== 'object') return null;
  const o = json as { schemaVersion?: number; events?: unknown[] };
  if (!Array.isArray(o.events)) return null;
  const events = o.events.filter(
    (e): e is TelemetryEventEntry =>
      e &&
      typeof e === 'object' &&
      typeof (e as TelemetryEventEntry).eventName === 'string',
  );
  return { schemaVersion: o.schemaVersion, events };
}

export function getEventClassification(
  registry: TelemetryRegistry | null,
  eventName: string,
): TelemetryEventEntry | null {
  if (!registry?.events) return null;
  return registry.events.find((e) => e.eventName === eventName) ?? null;
}

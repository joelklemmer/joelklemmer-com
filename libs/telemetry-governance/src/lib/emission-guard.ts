/**
 * Runtime emission guard: blocks emitting disallowed categories and high-risk fields
 * unless permitted by consent and purpose.
 */
import type { TelemetryRegistry, TelemetryEventEntry } from './registry-types';

export interface ConsentStateForGuard {
  choiceMade: boolean;
  categories: Record<string, boolean>;
  purposes: Record<string, boolean>;
}

/**
 * Whether the event may be emitted given consent state and registry.
 * Returns false if: no consent, event not in registry, category not consented, or purpose not consented.
 */
export function shouldEmitEvent(
  registry: TelemetryRegistry | null,
  eventName: string,
  _payload: Record<string, unknown>,
  consent: ConsentStateForGuard | null,
): boolean {
  if (!consent?.choiceMade) return false;
  const entry =
    registry?.events?.find((e) => e.eventName === eventName) ?? null;
  if (!entry) return false;
  const category = entry.category as keyof ConsentStateForGuard['categories'];
  if (!consent.categories[category]) return false;
  const purposes = entry.purposeScopes ?? [];
  if (purposes.length > 0) {
    const hasPurpose = purposes.some(
      (p) => consent.purposes[p as keyof ConsentStateForGuard['purposes']],
    );
    if (!hasPurpose) return false;
  }
  return true;
}

/**
 * Filter payload to only allowed fields per registry. Removes high-risk fields when not in allowedContexts.
 */
export function filterPayloadByClassification(
  entry: TelemetryEventEntry | null,
  payload: Record<string, unknown>,
  allowedContext: string,
): Record<string, unknown> {
  if (!entry?.fieldClassifications) return payload;
  const allowedContexts = entry.allowedContexts ?? [];
  if (allowedContexts.length > 0 && !allowedContexts.includes(allowedContext)) {
    return {};
  }
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(payload)) {
    const classification = entry.fieldClassifications[key];
    if (classification !== undefined) out[key] = value;
  }
  return Object.keys(out).length ? out : payload;
}

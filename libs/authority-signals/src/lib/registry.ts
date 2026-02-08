/**
 * Central registry for authority signal bindings.
 * Pages, claims, case studies, books, and executive brief nodes declare signal bindings
 * for system-wide awareness of signal coverage.
 */

import type { AuthoritySignalId } from './authoritySignalTypes';
import type { SignalBinding, SignalWeightVector } from './signalBindingSchema';

/** In-memory registry: entity key (kind:id) → binding. */
const bindingMap = new Map<string, SignalBinding>();

/** Register a signal binding for an entity. */
export function registerBinding(binding: SignalBinding): void {
  const key = `${binding.entityKind}:${binding.entityId}`;
  bindingMap.set(key, binding);
}

/** Get binding by entity kind and id. */
export function getBinding(
  entityKind: SignalBinding['entityKind'],
  entityId: string,
): SignalBinding | undefined {
  return bindingMap.get(`${entityKind}:${entityId}`);
}

/**
 * Get signal weight vector for an entity, if registered.
 * If context is provided and the binding has contextOverrides[context], returns a copy
 * of the vector with weights overridden by that map (contextual override hook).
 */
export function getSignalVector(
  entityKind: SignalBinding['entityKind'],
  entityId: string,
  context?: string,
): SignalWeightVector | undefined {
  const binding = getBinding(entityKind, entityId);
  const vector = binding?.signalVector;
  if (!vector) return undefined;
  if (context && vector.contextOverrides?.[context]) {
    return {
      ...vector,
      weights: { ...vector.weights, ...vector.contextOverrides[context] },
    };
  }
  return vector;
}

/** All registered bindings. */
export function getAllBindings(): SignalBinding[] {
  return Array.from(bindingMap.values());
}

/** Bindings for a given entity kind. */
export function getBindingsByKind(
  entityKind: SignalBinding['entityKind'],
): SignalBinding[] {
  return getAllBindings().filter((b) => b.entityKind === entityKind);
}

/** Clear all bindings (for tests or re-init). */
export function clearRegistry(): void {
  bindingMap.clear();
}

/**
 * Aggregate coverage: total weight per signal across all bindings.
 * Useful for diagnostics (imbalance, starvation, overconcentration).
 */
export function getAggregateCoverage(): Record<AuthoritySignalId, number> {
  const agg: Record<AuthoritySignalId, number> = {
    strategic_cognition: 0,
    systems_construction: 0,
    operational_transformation: 0,
    institutional_leadership: 0,
    public_service_statesmanship: 0,
  };
  for (const b of bindingMap.values()) {
    const w = b.signalVector.weights ?? {};
    for (const id of Object.keys(w) as AuthoritySignalId[]) {
      if (id in agg) agg[id] += w[id] ?? 0;
    }
  }
  return agg;
}

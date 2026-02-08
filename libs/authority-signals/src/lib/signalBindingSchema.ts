/**
 * Signal binding schema: ContentEntity → SignalWeightVector → Intelligence Layer consumption.
 * Defines the structure for mapping content entities to weighted authority signals.
 */

import { z } from 'zod';
import {
  AUTHORITY_SIGNAL_IDS,
  type AuthoritySignalId,
} from './authoritySignalTypes';

/** Weight per signal: 0–1 normalized. Sum typically 1.0 but not required. */
const signalWeightSchema = z.record(
  z.string(),
  z.number().min(0).max(1),
) as z.ZodType<Partial<Record<AuthoritySignalId, number>>>;

export type SignalWeightMap = z.infer<typeof signalWeightSchema>;

/**
 * Signal weight vector: one weight per authority signal.
 * Used for search ranking modulation, graph traversal weighting, AI context, adaptive UX.
 */
export interface SignalWeightVector {
  /** Weights keyed by AuthoritySignalId. Omitted keys treated as 0. */
  weights: Partial<Record<AuthoritySignalId, number>>;
}

export const signalWeightVectorSchema: z.ZodType<SignalWeightVector> = z.object(
  {
    weights: z.record(z.string(), z.number().min(0).max(1)).default({}),
  },
);

/** Content entity kind for binding scope. */
export type ContentEntityKind =
  | 'claim'
  | 'record'
  | 'caseStudy'
  | 'book'
  | 'briefNode';

/**
 * Binding record: entity id + kind + weight vector.
 * Enables registry and Intelligence Layer to resolve vectors by entity.
 */
export interface SignalBinding {
  entityKind: ContentEntityKind;
  entityId: string;
  signalVector: SignalWeightVector;
}

export const signalBindingSchema: z.ZodType<SignalBinding> = z.object({
  entityKind: z.enum(['claim', 'record', 'caseStudy', 'book', 'briefNode']),
  entityId: z.string().min(1),
  signalVector: signalWeightVectorSchema,
});

/**
 * Normalize a partial weight map into a full vector (missing = 0).
 */
export function toFullVector(
  weights: Partial<Record<AuthoritySignalId, number>>,
): Record<AuthoritySignalId, number> {
  const out = {} as Record<AuthoritySignalId, number>;
  for (const id of AUTHORITY_SIGNAL_IDS) {
    out[id] = Math.min(1, Math.max(0, weights[id] ?? 0));
  }
  return out;
}

/**
 * Sum of all weights (for density checks).
 */
export function vectorSum(v: SignalWeightVector): number {
  const full = toFullVector(v.weights ?? {});
  return AUTHORITY_SIGNAL_IDS.reduce((s, id) => s + full[id], 0);
}

/**
 * Returns the signal id with the highest weight (for clustering/traversal).
 * Returns undefined if all weights are 0 or vector is empty.
 */
export function getDominantSignalId(
  v: SignalWeightVector,
): AuthoritySignalId | undefined {
  const w = v.weights ?? {};
  let maxId: AuthoritySignalId | undefined;
  let maxVal = 0;
  for (const id of AUTHORITY_SIGNAL_IDS) {
    const val = w[id] ?? 0;
    if (val > maxVal) {
      maxVal = val;
      maxId = id;
    }
  }
  return maxId;
}

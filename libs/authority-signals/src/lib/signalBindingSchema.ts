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
 * ASTD: supports secondary emphasis, tertiary modulation, optional negative weighting,
 * and contextual override hooks while remaining backward compatible (weights-only vectors still valid).
 */
export interface SignalWeightVector {
  /** Primary weights keyed by AuthoritySignalId. Omitted keys treated as 0. */
  weights: Partial<Record<AuthoritySignalId, number>>;
  /** Secondary emphasis weighting (0–1). Applied with factor in effective weight. */
  secondary?: Partial<Record<AuthoritySignalId, number>>;
  /** Tertiary modulation (0–1). Applied with factor in effective weight. */
  tertiary?: Partial<Record<AuthoritySignalId, number>>;
  /** Optional negative weighting (0–1). Subtracted in effective weight for contrast. */
  negative?: Partial<Record<AuthoritySignalId, number>>;
  /** Contextual override hooks: context key → weight overrides for resolution. */
  contextOverrides?: Record<string, Partial<Record<AuthoritySignalId, number>>>;
}

const weightRecordSchema = z.record(z.string(), z.number().min(0).max(1));

export const signalWeightVectorSchema: z.ZodType<SignalWeightVector> = z.object(
  {
    weights: weightRecordSchema.default({}),
    secondary: weightRecordSchema.optional(),
    tertiary: weightRecordSchema.optional(),
    negative: weightRecordSchema.optional(),
    contextOverrides: z.record(z.string(), weightRecordSchema).optional(),
  },
);

/** Content entity kind for binding scope. */
export type ContentEntityKind =
  | 'claim'
  | 'record'
  | 'caseStudy'
  | 'book'
  | 'briefNode'
  | 'framework';

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
  entityKind: z.enum([
    'claim',
    'record',
    'caseStudy',
    'book',
    'briefNode',
    'framework',
  ]),
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
 * Uses primary weights only; backward compatible.
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

/** Factors for effective weight: secondary and tertiary add; negative subtracts. */
const SECONDARY_FACTOR = 0.3;
const TERTIARY_FACTOR = 0.1;
const NEGATIVE_FACTOR = 0.2;

/**
 * Compute effective weights from primary + secondary emphasis + tertiary modulation - negative.
 * Backward compatible: vectors with only weights get weights returned as-is (normalized 0–1).
 */
export function getEffectiveWeights(
  v: SignalWeightVector,
): Record<AuthoritySignalId, number> {
  const base = toFullVector(v.weights ?? {});
  const sec = v.secondary ?? {};
  const ter = v.tertiary ?? {};
  const neg = v.negative ?? {};
  const out = {} as Record<AuthoritySignalId, number>;
  for (const id of AUTHORITY_SIGNAL_IDS) {
    let val =
      base[id] +
      (sec[id] ?? 0) * SECONDARY_FACTOR +
      (ter[id] ?? 0) * TERTIARY_FACTOR -
      (neg[id] ?? 0) * NEGATIVE_FACTOR;
    out[id] = Math.min(1, Math.max(0, val));
  }
  return out;
}

/**
 * Full vector from effective weights (for density/entropy calculations).
 */
export function toFullVectorFromVector(
  v: SignalWeightVector,
): Record<AuthoritySignalId, number> {
  return getEffectiveWeights(v);
}

/**
 * Dominant signal from effective weights (for ordering when using ASTD).
 */
export function getDominantSignalIdFromEffective(
  v: SignalWeightVector,
): AuthoritySignalId | undefined {
  const w = getEffectiveWeights(v);
  let maxId: AuthoritySignalId | undefined;
  let maxVal = 0;
  for (const id of AUTHORITY_SIGNAL_IDS) {
    if (w[id] > maxVal) {
      maxVal = w[id];
      maxId = id;
    }
  }
  return maxId;
}

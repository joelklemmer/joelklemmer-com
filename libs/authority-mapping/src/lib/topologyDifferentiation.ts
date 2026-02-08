/**
 * Topology Differentiation Engine (ASTD).
 * Generates differentiated bindings to minimize identical vector signatures,
 * maximize orthogonality between entities, preserve doctrinal coverage,
 * and maintain five-signal presence.
 */

import {
  AUTHORITY_SIGNAL_IDS,
  getEffectiveWeights,
  type AuthoritySignalId,
  type SignalWeightVector,
} from '@joelklemmer/authority-signals';
import type { EntityBindingConfig } from './entityBindingsConfig';

/** Round to 2 decimals for signature stability. */
function round2(x: number): number {
  return Math.round(x * 100) / 100;
}

/**
 * Canonical signature for a weight vector (effective weights).
 * Used to detect duplicate or near-duplicate vectors.
 */
export function vectorSignature(v: SignalWeightVector): string {
  const w = getEffectiveWeights(v);
  const parts = AUTHORITY_SIGNAL_IDS.map(
    (id) => `${id}:${round2(w[id] ?? 0)}`,
  ).sort();
  return parts.join('|');
}

/**
 * Small modulation step for secondary/tertiary to differentiate without breaking doctrine.
 */
const MODULATION_STEP = 0.08;
const MAX_SECONDARY = 0.4;
const MAX_TERTIARY = 0.2;

/**
 * Generate differentiated bindings from base config.
 * - Minimizes identical vector signatures by adding secondary/tertiary modulation.
 * - Prefers orthogonality: shifts emphasis to under-used signals in the cluster.
 * - Preserves doctrinal coverage (primary weights unchanged; five-signal presence maintained).
 * - Keeps at least five-signal presence (no zeroing out of all signals).
 */
export function generateDifferentiatedBindings(
  base: EntityBindingConfig[],
): EntityBindingConfig[] {
  const effectiveSignatures = new Map<string, EntityBindingConfig[]>();
  for (const b of base) {
    const sig = vectorSignature(b.signalVector);
    if (!effectiveSignatures.has(sig)) effectiveSignatures.set(sig, []);
    effectiveSignatures.get(sig)!.push(b);
  }

  const result: EntityBindingConfig[] = [];
  for (const b of base) {
    const sig = vectorSignature(b.signalVector);
    const cluster = effectiveSignatures.get(sig)!;
    if (cluster.length <= 1) {
      result.push({ ...b, signalVector: { ...b.signalVector } });
      continue;
    }
    const indexInCluster = cluster.findIndex(
      (c) => c.entityKind === b.entityKind && c.entityId === b.entityId,
    );
    const secondary: Partial<Record<AuthoritySignalId, number>> = {};
    const tertiary: Partial<Record<AuthoritySignalId, number>> = {};
    const effective = getEffectiveWeights(b.signalVector);
    const signalOrder = [...AUTHORITY_SIGNAL_IDS].sort(
      (a, b) => (effective[a] ?? 0) - (effective[b] ?? 0),
    );
    const emphasisIndex = indexInCluster % signalOrder.length;
    const underUsedSignal = signalOrder[emphasisIndex];
    secondary[underUsedSignal] = Math.min(
      MAX_SECONDARY,
      MODULATION_STEP * (emphasisIndex + 1),
    );
    const dominantSignal = signalOrder[signalOrder.length - 1];
    tertiary[dominantSignal] = Math.min(
      MAX_TERTIARY,
      MODULATION_STEP * 0.5 * (indexInCluster + 1),
    );
    result.push({
      entityKind: b.entityKind,
      entityId: b.entityId,
      signalVector: {
        weights: { ...b.signalVector.weights },
        ...(Object.keys(secondary).length ? { secondary } : {}),
        ...(Object.keys(tertiary).length ? { tertiary } : {}),
        ...(b.signalVector.negative
          ? { negative: b.signalVector.negative }
          : {}),
        ...(b.signalVector.contextOverrides
          ? { contextOverrides: b.signalVector.contextOverrides }
          : {}),
      },
    });
  }

  return result;
}

/**
 * Validator: detect vector duplication (same effective signature for multiple entities).
 */
export function findVectorDuplication(
  bindings: EntityBindingConfig[],
): Array<{ signature: string; entityKeys: string[] }> {
  const bySig = new Map<string, string[]>();
  for (const b of bindings) {
    const sig = vectorSignature(b.signalVector);
    if (!bySig.has(sig)) bySig.set(sig, []);
    bySig.get(sig)!.push(`${b.entityKind}:${b.entityId}`);
  }
  return Array.from(bySig.entries())
    .filter(([, keys]) => keys.length > 1)
    .map(([signature, entityKeys]) => ({ signature, entityKeys }));
}

/**
 * Validator: flag low-entropy clusters (many entities share same or very similar profile).
 */
export function findLowEntropyClusters(
  bindings: EntityBindingConfig[],
  clusterSizeThreshold: number = 4,
): Array<{ signature: string; count: number; entityKeys: string[] }> {
  const bySig = new Map<string, string[]>();
  for (const b of bindings) {
    const sig = vectorSignature(b.signalVector);
    if (!bySig.has(sig)) bySig.set(sig, []);
    bySig.get(sig)!.push(`${b.entityKind}:${b.entityId}`);
  }
  return Array.from(bySig.entries())
    .filter(([, keys]) => keys.length >= clusterSizeThreshold)
    .map(([signature, entityKeys]) => ({
      signature,
      count: entityKeys.length,
      entityKeys,
    }));
}

/**
 * Validator: signal flattening = all entities converge to similar distribution (e.g. all balanced).
 */
export function detectSignalFlattening(
  bindings: EntityBindingConfig[],
  varianceThreshold: number = 0.01,
): boolean {
  if (bindings.length <= 1) return false;
  const vectors = bindings.map((b) => getEffectiveWeights(b.signalVector));
  const meanPerSignal: Record<AuthoritySignalId, number> = {} as Record<
    AuthoritySignalId,
    number
  >;
  for (const id of AUTHORITY_SIGNAL_IDS) {
    meanPerSignal[id] =
      vectors.reduce((s, v) => s + (v[id] ?? 0), 0) / vectors.length;
  }
  let totalVariance = 0;
  for (const v of vectors) {
    for (const id of AUTHORITY_SIGNAL_IDS) {
      const d = (v[id] ?? 0) - meanPerSignal[id];
      totalVariance += d * d;
    }
  }
  const avgVariance =
    totalVariance / (vectors.length * AUTHORITY_SIGNAL_IDS.length);
  return avgVariance < varianceThreshold;
}

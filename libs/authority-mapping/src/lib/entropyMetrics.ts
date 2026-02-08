/**
 * Entropy metrics for Authority Signal Topology (ASTD).
 * Signal entropy score, topology dimensionality index, variance distribution report.
 */

import {
  AUTHORITY_SIGNAL_IDS,
  getEffectiveWeights,
  type AuthoritySignalId,
} from '@joelklemmer/authority-signals';
import type { EntityBindingConfig } from './entityBindingsConfig';
import { vectorSignature } from './topologyDifferentiation';

function shannonEntropy(probs: number[]): number {
  let h = 0;
  for (const p of probs) {
    if (p > 0) h -= p * Math.log2(p);
  }
  return h;
}

/** Max entropy for 5 outcomes is log2(5) ≈ 2.32. Normalize to 0–1. */
const MAX_ENTROPY_BITS = Math.log2(AUTHORITY_SIGNAL_IDS.length);

/**
 * Signal entropy score: mean over signals of (entropy of that signal's weight distribution across entities).
 * Higher = more diversity across entities. Range 0–1.
 */
export function computeSignalEntropyScore(
  bindings: EntityBindingConfig[],
): number {
  if (bindings.length === 0) return 0;
  const vectors = bindings.map((b) => getEffectiveWeights(b.signalVector));
  let totalEntropy = 0;
  for (const id of AUTHORITY_SIGNAL_IDS) {
    const values = vectors.map((v) => v[id] ?? 0);
    const sum = values.reduce((a, b) => a + b, 0);
    if (sum <= 0) continue;
    const probs = values.map((x) => x / sum);
    totalEntropy += shannonEntropy(probs);
  }
  const meanEntropy = totalEntropy / AUTHORITY_SIGNAL_IDS.length;
  return Math.min(1, meanEntropy / MAX_ENTROPY_BITS);
}

/**
 * Topology dimensionality index: ratio of unique effective vector signatures to total entities.
 * Higher = more differentiated. Range 0–1.
 */
export function computeTopologyDimensionalityIndex(
  bindings: EntityBindingConfig[],
): number {
  if (bindings.length === 0) return 0;
  const sigs = new Set(bindings.map((b) => vectorSignature(b.signalVector)));
  return sigs.size / bindings.length;
}

export interface VarianceDistributionReport {
  perSignal: Record<AuthoritySignalId, { mean: number; variance: number }>;
  overallVariance: number;
  uniqueSignatures: number;
  totalEntities: number;
}

/**
 * Variance distribution report: per-signal mean and variance across entities.
 */
export function getVarianceDistributionReport(
  bindings: EntityBindingConfig[],
): VarianceDistributionReport {
  const vectors = bindings.map((b) => getEffectiveWeights(b.signalVector));
  const perSignal: Record<
    AuthoritySignalId,
    { mean: number; variance: number }
  > = {} as Record<AuthoritySignalId, { mean: number; variance: number }>;
  const n = vectors.length;
  for (const id of AUTHORITY_SIGNAL_IDS) {
    const values = vectors.map((v) => v[id] ?? 0);
    const mean = values.reduce((a, b) => a + b, 0) / n;
    const variance =
      n <= 1 ? 0 : values.reduce((s, x) => s + (x - mean) ** 2, 0) / (n - 1);
    perSignal[id] = { mean, variance };
  }
  const overallVariance =
    Object.values(perSignal).reduce((s, p) => s + p.variance, 0) /
    AUTHORITY_SIGNAL_IDS.length;
  const uniqueSignatures = new Set(
    bindings.map((b) => vectorSignature(b.signalVector)),
  ).size;
  return {
    perSignal,
    overallVariance,
    uniqueSignatures,
    totalEntities: bindings.length,
  };
}

/** Baseline below which we consider "severe collapse" (fail). */
export const SEVERE_ENTROPY_THRESHOLD = 0.12;
export const SEVERE_DIMENSIONALITY_THRESHOLD = 0.15;

/**
 * Returns true if topology has severely collapsed (fail validation).
 */
export function isSevereCollapse(bindings: EntityBindingConfig[]): {
  severe: boolean;
  reason?: string;
} {
  const entropy = computeSignalEntropyScore(bindings);
  const dim = computeTopologyDimensionalityIndex(bindings);
  if (entropy < SEVERE_ENTROPY_THRESHOLD) {
    return {
      severe: true,
      reason: `Signal entropy score ${entropy.toFixed(3)} below threshold ${SEVERE_ENTROPY_THRESHOLD}`,
    };
  }
  if (dim < SEVERE_DIMENSIONALITY_THRESHOLD) {
    return {
      severe: true,
      reason: `Topology dimensionality index ${dim.toFixed(3)} below threshold ${SEVERE_DIMENSIONALITY_THRESHOLD}`,
    };
  }
  return { severe: false };
}

/**
 * Per-entity entropy contribution: squared L2 distance of this entity's effective vector from the mean.
 * Higher = more distinctive. Used for adaptive ordering (BriefScreen).
 */
export function getEntropyContribution(
  entityVector: Record<AuthoritySignalId, number>,
  meanVector: Record<AuthoritySignalId, number>,
): number {
  let sumSq = 0;
  for (const id of AUTHORITY_SIGNAL_IDS) {
    const d = (entityVector[id] ?? 0) - (meanVector[id] ?? 0);
    sumSq += d * d;
  }
  return sumSq;
}

/**
 * Mean effective weight vector per entity kind. Used for entropy contribution (ASTD).
 */
export function getMeanVectorsByKind(
  bindings: EntityBindingConfig[],
): Map<string, Record<AuthoritySignalId, number>> {
  const byKind = new Map<string, Record<AuthoritySignalId, number>[]>();
  for (const b of bindings) {
    const v = getEffectiveWeights(b.signalVector);
    if (!byKind.has(b.entityKind)) byKind.set(b.entityKind, []);
    byKind.get(b.entityKind)!.push(v);
  }
  const out = new Map<string, Record<AuthoritySignalId, number>>();
  for (const [kind, vectors] of byKind) {
    const mean = AUTHORITY_SIGNAL_IDS.reduce(
      (acc, id) => {
        const sum = vectors.reduce((s, v) => s + (v[id] ?? 0), 0);
        acc[id] = vectors.length ? sum / vectors.length : 0;
        return acc;
      },
      {} as Record<AuthoritySignalId, number>,
    );
    out.set(kind, mean);
  }
  return out;
}

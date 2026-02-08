/**
 * Signal mapping engine: maps each case study, public record, claim, book,
 * and executive brief node to one or more authority signals. Validates
 * minimum signal coverage density and provides diagnostics.
 */

import {
  AUTHORITY_SIGNAL_IDS,
  type AuthoritySignalId,
} from '@joelklemmer/authority-signals';
import {
  clearRegistry,
  getAggregateCoverage,
  getEffectiveWeights,
  getSignalVector,
  registerBinding,
  type SignalWeightVector,
} from '@joelklemmer/authority-signals';
import type { ContentEntityKind } from '@joelklemmer/authority-signals';
import { ENTITY_BINDINGS_CONFIG } from './entityBindingsConfig';
import {
  generateDifferentiatedBindings,
  findVectorDuplication,
  findLowEntropyClusters,
  detectSignalFlattening,
} from './topologyDifferentiation';
import { getEntropyContribution, getMeanVectorsByKind } from './entropyMetrics';

export type EntityIdSet = {
  claimIds: Set<string>;
  recordIds: Set<string>;
  caseStudyIds: Set<string>;
  bookIds: Set<string>;
};

/** Structured mapping output for Intelligence Layer consumption. */
export interface StructuredMappingEntry {
  entityKind: ContentEntityKind;
  entityId: string;
  signalVector: SignalWeightVector;
}

export interface StructuredMapping {
  entries: StructuredMappingEntry[];
  aggregateCoverage: Record<AuthoritySignalId, number>;
}

/** Minimum weight sum per entity to consider "covered" (e.g. 0.2). */
const MIN_ENTITY_DENSITY = 0.2;

/** Max ratio of one signal's aggregate to mean (e.g. 2.5) before "overconcentration" warning. */
const OVERCONCENTRATION_RATIO = 2.5;

/** Min ratio of signal aggregate to mean before "starvation" warning (e.g. 0.25). */
const STARVATION_RATIO = 0.25;

/** Differentiated bindings (ASTD): used for registry and structured mapping. */
let cachedDifferentiatedBindings: typeof ENTITY_BINDINGS_CONFIG | null = null;

function getDifferentiatedBindings(): typeof ENTITY_BINDINGS_CONFIG {
  if (!cachedDifferentiatedBindings) {
    cachedDifferentiatedBindings = generateDifferentiatedBindings(
      ENTITY_BINDINGS_CONFIG,
    );
  }
  return cachedDifferentiatedBindings;
}

/**
 * Populate the central registry from the canonical bindings config.
 * Uses differentiated bindings (ASTD) to eliminate redundancy clusters.
 * Call once before using getSignalVector or running diagnostics.
 */
export function populateRegistryFromConfig(): void {
  clearRegistry();
  const bindings = getDifferentiatedBindings();
  for (const b of bindings) {
    registerBinding({
      entityKind: b.entityKind,
      entityId: b.entityId,
      signalVector: b.signalVector,
    });
  }
}

/**
 * Get the full structured mapping for Intelligence Layer consumption.
 * Uses differentiated bindings (ASTD). Does not mutate the registry.
 */
export function getStructuredMapping(): StructuredMapping {
  const bindings = getDifferentiatedBindings();
  const entries: StructuredMappingEntry[] = bindings.map((b) => ({
    entityKind: b.entityKind,
    entityId: b.entityId,
    signalVector: b.signalVector,
  }));
  const aggregateCoverage = getAggregateCoverageFromBindings(bindings);
  return { entries, aggregateCoverage };
}

function getAggregateCoverageFromBindings(
  bindings: Array<{ signalVector: SignalWeightVector }>,
): Record<AuthoritySignalId, number> {
  const agg: Record<AuthoritySignalId, number> = {
    strategic_cognition: 0,
    systems_construction: 0,
    operational_transformation: 0,
    institutional_leadership: 0,
    public_service_statesmanship: 0,
  };
  for (const b of bindings) {
    const w = getEffectiveWeights(b.signalVector);
    for (const id of AUTHORITY_SIGNAL_IDS) {
      agg[id] += w[id] ?? 0;
    }
  }
  return agg;
}

/**
 * Resolve signal vector for an entity. Registry must be populated first.
 * When context (e.g. evaluator mode) is provided, bindings with contextOverrides use it.
 */
export function getEntitySignalVector(
  entityKind: ContentEntityKind,
  entityId: string,
  context?: string,
): SignalWeightVector | undefined {
  return getSignalVector(entityKind, entityId, context);
}

/**
 * ASTD: entropy contribution for an entity (for semantic index ranking / graph clustering).
 * Higher = more distinctive vector vs same-kind mean. Call after populateRegistryFromConfig.
 */
export function getEntityEntropyContribution(
  entityKind: ContentEntityKind,
  entityId: string,
): number | undefined {
  const bindings = getDifferentiatedBindings();
  const meanByKind = getMeanVectorsByKind(bindings);
  const binding = bindings.find(
    (b) => b.entityKind === entityKind && b.entityId === entityId,
  );
  if (!binding) return undefined;
  const mean = meanByKind.get(binding.entityKind);
  if (!mean) return undefined;
  const vector = getEffectiveWeights(binding.signalVector);
  return getEntropyContribution(vector, mean);
}

/**
 * Check that every entity in the provided sets has a binding.
 */
export function validateAllEntitiesMapped(entityIds: EntityIdSet): string[] {
  const errors: string[] = [];
  const configKeys = new Set(
    ENTITY_BINDINGS_CONFIG.map((b) => `${b.entityKind}:${b.entityId}`),
  );

  for (const id of entityIds.claimIds) {
    if (!configKeys.has(`claim:${id}`)) {
      errors.push(`Claim "${id}" has no authority signal binding.`);
    }
  }
  for (const id of entityIds.recordIds) {
    if (!configKeys.has(`record:${id}`)) {
      errors.push(`Record "${id}" has no authority signal binding.`);
    }
  }
  for (const id of entityIds.caseStudyIds) {
    if (!configKeys.has(`caseStudy:${id}`)) {
      errors.push(`Case study "${id}" has no authority signal binding.`);
    }
  }
  for (const id of entityIds.bookIds) {
    if (!configKeys.has(`book:${id}`)) {
      errors.push(`Book "${id}" has no authority signal binding.`);
    }
  }

  if (!configKeys.has('briefNode:brief')) {
    errors.push(
      'Executive brief node "brief" has no authority signal binding.',
    );
  }

  return errors;
}

/**
 * Validate minimum signal coverage density per entity (optional soft check).
 */
export function validateMinimumDensity(): string[] {
  const warnings: string[] = [];
  for (const b of ENTITY_BINDINGS_CONFIG) {
    const w = b.signalVector.weights ?? {};
    const sum = Object.values(w).reduce((s, v) => s + (v ?? 0), 0);
    if (sum < MIN_ENTITY_DENSITY) {
      warnings.push(
        `Entity ${b.entityKind}:${b.entityId} has low signal density (${sum.toFixed(2)}).`,
      );
    }
  }
  return warnings;
}

/**
 * Diagnostics: signal imbalance, coverage gaps, redundancy clusters.
 * Returns human-readable messages; does not throw.
 */
export function getMappingDiagnostics(entityIds: EntityIdSet): {
  errors: string[];
  warnings: string[];
  info: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];
  const info: string[] = [];

  populateRegistryFromConfig();

  const unmapped = validateAllEntitiesMapped(entityIds);
  errors.push(...unmapped);

  const densityWarnings = validateMinimumDensity();
  warnings.push(...densityWarnings);

  const agg = getAggregateCoverage();
  const mean =
    AUTHORITY_SIGNAL_IDS.reduce((s, id) => s + agg[id], 0) /
    AUTHORITY_SIGNAL_IDS.length;
  if (mean > 0) {
    for (const id of AUTHORITY_SIGNAL_IDS) {
      const ratio = agg[id] / mean;
      if (ratio >= OVERCONCENTRATION_RATIO) {
        warnings.push(
          `Signal "${id}" is overconcentrated (ratio ${ratio.toFixed(2)} of mean).`,
        );
      }
      if (ratio <= STARVATION_RATIO) {
        warnings.push(
          `Signal "${id}" may be starved (ratio ${ratio.toFixed(2)} of mean).`,
        );
      }
    }
  }

  const mapping = getStructuredMapping();
  const vectorKey = (v: SignalWeightVector) =>
    JSON.stringify(Object.keys(v.weights ?? {}).sort());
  const byVector = new Map<string, StructuredMappingEntry[]>();
  for (const e of mapping.entries) {
    const k = vectorKey(e.signalVector);
    if (!byVector.has(k)) byVector.set(k, []);
    byVector.get(k)!.push(e);
  }
  for (const [, entries] of byVector) {
    if (entries.length >= 4) {
      info.push(
        `Redundancy cluster: ${entries.length} entities share the same signal profile.`,
      );
    }
  }

  const differentiated = getDifferentiatedBindings();
  const dups = findVectorDuplication(differentiated);
  for (const { signature, entityKeys } of dups) {
    warnings.push(
      `Vector duplication: ${entityKeys.join(', ')} share signature ${signature.slice(0, 40)}…`,
    );
  }
  const lowEntropy = findLowEntropyClusters(differentiated, 4);
  for (const { count, entityKeys } of lowEntropy) {
    warnings.push(
      `Low entropy cluster: ${count} entities (${entityKeys.slice(0, 3).join(', ')}…) share same vector.`,
    );
  }
  if (detectSignalFlattening(differentiated)) {
    warnings.push(
      'Signal flattening detected: entity vectors are too similar (low variance).',
    );
  }

  return { errors, warnings, info };
}

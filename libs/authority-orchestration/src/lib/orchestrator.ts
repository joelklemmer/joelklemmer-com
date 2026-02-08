/**
 * Adaptive Authority Orchestration Engine (AAOE): orchestrator.
 * Consumes evaluator mode, signal vectors, and entropy metrics;
 * outputs section ordering hints, entity emphasis scores, and density default suggestion.
 */

import type { EvaluatorMode } from '@joelklemmer/evaluator-mode';
import {
  surfacePriorityMatrix,
  signalAmplificationMatrix,
  densityDefaultMatrix,
  type SurfaceEntityKind,
  type SurfacePriorityWeights,
} from './orchestrationModel';

/** Lightweight signal vector representation (e.g. effective weights sum or keyed scores). */
export interface SignalVectorInput {
  entityKind: SurfaceEntityKind;
  entityId: string;
  /** Optional base score from authority signals (e.g. sum of effective weights). */
  signalScore?: number;
  /** Optional entropy contribution for diversity ordering. */
  entropyContribution?: number;
}

/** Entropy metrics summary (e.g. from authority-mapping). */
export interface EntropyMetricsInput {
  /** Overall signal entropy score 0–1. */
  signalEntropyScore?: number;
  /** Topology dimensionality index 0–1. */
  topologyDimensionalityIndex?: number;
}

/** Section identifiers for ordering hints. */
export type SectionId =
  | 'hero'
  | 'startHere'
  | 'claims'
  | 'doctrine'
  | 'routes'
  | 'identityScope'
  | 'readPath'
  | 'verificationGuidance'
  | 'aec'
  | 'selectedOutcomes'
  | 'quantifiedOutcomes'
  | 'caseStudies'
  | 'publicRecordHighlights'
  | 'artifacts'
  | 'evidenceGraph'
  | 'contactPathway';

export interface OrchestrationHints {
  /** Suggested section order (section ids). Non-destructive: only reorder, no add/remove. */
  sectionOrderingHint: SectionId[];
  /** Entity id → emphasis score (higher = surface earlier). */
  entityEmphasisScores: Record<string, number>;
  /** Suggested initial density view for this evaluator mode. */
  densityDefaultSuggestion: boolean;
  /** Priority weights used (for AEC/consumers). */
  priorityWeights: SurfacePriorityWeights;
}

export interface OrchestratorInput {
  evaluatorMode: EvaluatorMode;
  /** Optional signal vectors for entity emphasis. */
  signalVectors?: SignalVectorInput[];
  /** Optional entropy metrics for diversity-aware ordering. */
  entropyMetrics?: EntropyMetricsInput;
  /** Optional section ids present on the current screen (subset of SectionId). */
  sectionIds?: SectionId[];
}

/**
 * Compute entity emphasis score from priority weight, amplification, signal score, and entropy.
 * Higher = surface earlier. Non-destructive: only influences order, not presence.
 */
function entityEmphasisScore(
  entityKind: SurfaceEntityKind,
  priorityWeights: SurfacePriorityWeights,
  amplification: Record<SurfaceEntityKind, number>,
  signalScore: number,
  entropyContribution: number,
): number {
  const priority = priorityWeights[entityKind] ?? 0.5;
  const amp = amplification[entityKind] ?? 1;
  const base = priority * amp * (signalScore + 0.01);
  const entropyBonus = Math.min(0.3, entropyContribution * 0.1);
  return base + entropyBonus;
}

/**
 * Default section order (canonical). Hints only reorder within this set.
 */
const DEFAULT_SECTION_ORDER: SectionId[] = [
  'hero',
  'identityScope',
  'readPath',
  'verificationGuidance',
  'aec',
  'claims',
  'selectedOutcomes',
  'quantifiedOutcomes',
  'caseStudies',
  'publicRecordHighlights',
  'artifacts',
  'evidenceGraph',
  'doctrine',
  'contactPathway',
];

const HOME_SECTION_ORDER: SectionId[] = [
  'hero',
  'startHere',
  'claims',
  'doctrine',
  'routes',
];

/**
 * Produce orchestration hints from evaluator mode, signal vectors, and entropy.
 * Section ordering: use priority weights to sort entity-type sections (e.g. claims before caseStudies if claims weight > caseStudies).
 * Entity emphasis: combine priority, amplification, signal score, entropy.
 */
export function computeOrchestrationHints(
  input: OrchestratorInput,
): OrchestrationHints {
  const { evaluatorMode, signalVectors = [], sectionIds } = input;

  const priorityWeights = surfacePriorityMatrix[evaluatorMode];
  const amplification = signalAmplificationMatrix[evaluatorMode];
  const densityDefaultSuggestion = densityDefaultMatrix[evaluatorMode];

  const entityEmphasisScores: Record<string, number> = {};
  for (const v of signalVectors) {
    const score = entityEmphasisScore(
      v.entityKind,
      priorityWeights,
      amplification,
      v.signalScore ?? 0.5,
      v.entropyContribution ?? 0,
    );
    entityEmphasisScores[v.entityId] = score;
  }

  const candidateOrder = sectionIds ?? DEFAULT_SECTION_ORDER;
  const sectionOrderingHint = [...candidateOrder].sort((a, b) => {
    const weightA = sectionPriorityWeight(a, priorityWeights);
    const weightB = sectionPriorityWeight(b, priorityWeights);
    return weightB - weightA;
  });

  return {
    sectionOrderingHint,
    entityEmphasisScores,
    densityDefaultSuggestion,
    priorityWeights,
  };
}

function sectionPriorityWeight(
  sectionId: SectionId,
  priorityWeights: SurfacePriorityWeights,
): number {
  switch (sectionId) {
    case 'claims':
      return priorityWeights.claims;
    case 'doctrine':
      return priorityWeights.frameworks;
    case 'caseStudies':
      return priorityWeights.caseStudies;
    case 'publicRecordHighlights':
      return priorityWeights.records;
    default:
      return 0.5;
  }
}

/**
 * Get section ordering for Home screen (hero, startHere, claims, doctrine, routes).
 */
export function getHomeSectionOrder(evaluatorMode: EvaluatorMode): SectionId[] {
  const priorityWeights = surfacePriorityMatrix[evaluatorMode];
  return [...HOME_SECTION_ORDER].sort((a, b) => {
    const wA = sectionPriorityWeight(a, priorityWeights);
    const wB = sectionPriorityWeight(b, priorityWeights);
    return wB - wA;
  });
}

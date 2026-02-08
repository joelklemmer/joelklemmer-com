/**
 * Adaptive Authority Orchestration Engine (AAOE): model definitions.
 * Maps evaluator mode to surface priority, signal amplification, and density defaults.
 * Perception sequencing only; no route or visible UI changes.
 */

import type { EvaluatorMode } from '@joelklemmer/evaluator-mode';
import { EVALUATOR_MODES } from '@joelklemmer/evaluator-mode';

/** Entity surface types for priority weighting. */
export const SURFACE_ENTITY_KINDS = [
  'frameworks',
  'claims',
  'caseStudies',
  'records',
  'books',
] as const;

export type SurfaceEntityKind = (typeof SURFACE_ENTITY_KINDS)[number];

/** Priority weight 0–1 per entity kind. Higher = more emphasis in ordering/surfacing. */
export type SurfacePriorityWeights = Record<SurfaceEntityKind, number>;

/** Amplification factor per entity kind (>= 0). Applied to signal scores. */
export type SignalAmplificationWeights = Record<SurfaceEntityKind, number>;

/**
 * Surface priority matrix: evaluator mode → priority weights per entity kind.
 * Ensures every mode has a defined, non-empty priority set.
 */
export const surfacePriorityMatrix: Record<
  EvaluatorMode,
  SurfacePriorityWeights
> = {
  executive: {
    frameworks: 0.95,
    claims: 0.9,
    caseStudies: 0.7,
    records: 0.85,
    books: 0.5,
  },
  board: {
    frameworks: 0.9,
    claims: 0.85,
    caseStudies: 0.75,
    records: 0.8,
    books: 0.55,
  },
  public_service: {
    frameworks: 0.75,
    claims: 0.85,
    caseStudies: 0.8,
    records: 0.9,
    books: 0.5,
  },
  investor: {
    frameworks: 0.85,
    claims: 0.9,
    caseStudies: 0.8,
    records: 0.85,
    books: 0.6,
  },
  media: {
    frameworks: 0.7,
    claims: 0.8,
    caseStudies: 0.9,
    records: 0.75,
    books: 0.65,
  },
  default: {
    frameworks: 0.8,
    claims: 0.8,
    caseStudies: 0.8,
    records: 0.8,
    books: 0.8,
  },
};

/**
 * Signal amplification matrix: evaluator mode → amplification per entity kind.
 * Used to modulate entity emphasis scores; 1.0 = no change.
 */
export const signalAmplificationMatrix: Record<
  EvaluatorMode,
  SignalAmplificationWeights
> = {
  executive: {
    frameworks: 1.2,
    claims: 1.15,
    caseStudies: 1.0,
    records: 1.1,
    books: 0.9,
  },
  board: {
    frameworks: 1.15,
    claims: 1.1,
    caseStudies: 1.05,
    records: 1.05,
    books: 1.0,
  },
  public_service: {
    frameworks: 1.0,
    claims: 1.1,
    caseStudies: 1.15,
    records: 1.2,
    books: 0.9,
  },
  investor: {
    frameworks: 1.1,
    claims: 1.15,
    caseStudies: 1.05,
    records: 1.1,
    books: 1.05,
  },
  media: {
    frameworks: 1.0,
    claims: 1.05,
    caseStudies: 1.2,
    records: 1.0,
    books: 1.1,
  },
  default: {
    frameworks: 1.0,
    claims: 1.0,
    caseStudies: 1.0,
    records: 1.0,
    books: 1.0,
  },
};

/**
 * Density default matrix: evaluator mode → suggested initial density view (compressed scanning).
 * When true, orchestration suggests starting with density-on for that mode.
 */
export const densityDefaultMatrix: Record<EvaluatorMode, boolean> = {
  executive: true,
  board: true,
  public_service: false,
  investor: true,
  media: false,
  default: false,
};

/** All evaluator modes that must have entries in every matrix. */
export const EVALUATOR_MODES_LIST: readonly EvaluatorMode[] = EVALUATOR_MODES;

/**
 * Entity graph types for the Interactive Intelligence Layer.
 * Typed graph entities and edges power navigation, claim discovery,
 * evidence aggregation, and future graph visualization.
 */

import type { SignalWeightVector } from '@joelklemmer/authority-signals';

/** Node type discriminator for graph entities. */
export type GraphNodeKind =
  | 'claim'
  | 'record'
  | 'caseStudy'
  | 'book'
  | 'framework';

/** Edge relationship type. */
export type GraphEdgeKind =
  | 'supports' // Claim → Record
  | 'verifies' // Record verifies Claim (inverse of supports in verification sense)
  | 'references' // CaseStudy/Book → Record or CaseStudy → Claim; Framework → Claim/CaseStudy/Record
  | 'derivesFrom'; // Optional derivation lineage

/** Claim entity node. */
export interface ClaimNode {
  kind: 'claim';
  id: string;
  labelKey: string;
  summaryKey: string;
  category: string;
  recordIds: string[];
  /** Authority signal weights for ranking/traversal (UASIL). */
  signalVector?: SignalWeightVector;
  /** ASTD: entropy contribution for ranking/clustering (optional). */
  signalEntropyContribution?: number;
}

/** Public record (proof) entity node. */
export interface RecordNode {
  kind: 'record';
  id: string;
  title: string;
  slug: string;
  artifactType: string;
  date: string;
  /** Authority signal weights for ranking/traversal (UASIL). */
  signalVector?: SignalWeightVector;
  /** ASTD: entropy contribution for ranking/clustering (optional). */
  signalEntropyContribution?: number;
}

/** Case study entity node. */
export interface CaseStudyNode {
  kind: 'caseStudy';
  id: string;
  title: string;
  slug: string;
  summary: string;
  date: string;
  proofRefs: string[];
  claimRefs: string[];
  /** Authority signal weights for ranking/traversal (UASIL). */
  signalVector?: SignalWeightVector;
  /** ASTD: entropy contribution for ranking/clustering (optional). */
  signalEntropyContribution?: number;
}

/** Book entity node. */
export interface BookNode {
  kind: 'book';
  id: string;
  title: string;
  slug: string;
  summary: string;
  publicationDate: string;
  proofRefs: string[];
  /** Authority signal weights for ranking/traversal (UASIL). */
  signalVector?: SignalWeightVector;
  /** ASTD: entropy contribution for ranking/clustering (optional). */
  signalEntropyContribution?: number;
}

/** Framework/doctrine entity node. */
export interface FrameworkNode {
  kind: 'framework';
  id: string;
  titleKey: string;
  summaryKey: string;
  intent10Key: string;
  intent60Key: string;
  domains: string[];
  relatedClaims: string[];
  relatedCaseStudies: string[];
  relatedRecords: string[];
  /** Authority signal weights for ranking/traversal (UASIL). */
  signalVector?: SignalWeightVector;
  /** ASTD: entropy contribution for ranking/clustering (optional). */
  signalEntropyContribution?: number;
}

/** Union of all entity node types. */
export type GraphNode =
  | ClaimNode
  | RecordNode
  | CaseStudyNode
  | BookNode
  | FrameworkNode;

/** Directed edge between two graph nodes. */
export interface GraphEdge {
  fromId: string;
  toId: string;
  kind: GraphEdgeKind;
  /** ASTD: optional weight from signal variance (diversity); higher = more orthogonal endpoints. */
  weight?: number;
}

/** Normalized entity graph: nodes and edges. No UI; pure data. */
export interface EntityGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

/** Semantic index entry type discriminator. */
export type SemanticEntryType =
  | 'claim'
  | 'record'
  | 'caseStudy'
  | 'book'
  | 'framework';

/** Single entry in the searchable text corpus. */
export interface SemanticIndexEntry {
  id: string;
  type: SemanticEntryType;
  text: string;
  url: string;
  /** Authority signal weights for search ranking / AI context (UASIL). */
  signalVector?: SignalWeightVector;
  /** ASTD: entropy contribution for semantic index ranking (optional). */
  signalEntropyContribution?: number;
}

/** Resolver for attaching authority signal vectors to graph/index entities (UASIL). */
export type SignalVectorResolver = (
  kind: GraphNodeKind,
  id: string,
) => SignalWeightVector | undefined;

/** ASTD: optional resolver for variance/entropy (informs ranking and clustering). */
export type SignalVarianceResolver = (
  kind: GraphNodeKind,
  id: string,
) => number | undefined;

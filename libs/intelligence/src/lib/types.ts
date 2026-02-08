/**
 * Entity graph types for the Interactive Intelligence Layer.
 * Typed graph entities and edges power navigation, claim discovery,
 * evidence aggregation, and future graph visualization.
 */

/** Node type discriminator for graph entities. */
export type GraphNodeKind = 'claim' | 'record' | 'caseStudy' | 'book';

/** Edge relationship type. */
export type GraphEdgeKind =
  | 'supports' // Claim → Record
  | 'verifies' // Record verifies Claim (inverse of supports in verification sense)
  | 'references' // CaseStudy/Book → Record or CaseStudy → Claim
  | 'derivesFrom'; // Optional derivation lineage

/** Claim entity node. */
export interface ClaimNode {
  kind: 'claim';
  id: string;
  labelKey: string;
  summaryKey: string;
  category: string;
  recordIds: string[];
}

/** Public record (proof) entity node. */
export interface RecordNode {
  kind: 'record';
  id: string;
  title: string;
  slug: string;
  artifactType: string;
  date: string;
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
}

/** Union of all entity node types. */
export type GraphNode = ClaimNode | RecordNode | CaseStudyNode | BookNode;

/** Directed edge between two graph nodes. */
export interface GraphEdge {
  fromId: string;
  toId: string;
  kind: GraphEdgeKind;
}

/** Normalized entity graph: nodes and edges. No UI; pure data. */
export interface EntityGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

/** Semantic index entry type discriminator. */
export type SemanticEntryType = 'claim' | 'record' | 'caseStudy' | 'book';

/** Single entry in the searchable text corpus. */
export interface SemanticIndexEntry {
  id: string;
  type: SemanticEntryType;
  text: string;
  url: string;
}

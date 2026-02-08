/**
 * Builds the normalized entity graph from content loaders.
 * Pure data; no UI. Used for intelligent navigation, claim discovery,
 * evidence aggregation, and future graph visualization.
 */
import {
  getAllClaims,
  getBookEntries,
  getCaseStudyEntries,
  getPublicRecordEntries,
  getBookId,
  getCaseStudyId,
  getPublicRecordId,
} from '@joelklemmer/content';
import { getEffectiveWeights } from '@joelklemmer/authority-signals';
import type {
  EntityGraph,
  GraphEdge,
  GraphNode,
  SignalVectorResolver,
  SignalVarianceResolver,
} from './types';

export interface BuildEntityGraphOptions {
  /** If provided, attach authority signal vectors to each node (UASIL). */
  getSignalVector?: SignalVectorResolver;
  /** ASTD: if provided, attach entropy contribution for ranking/clustering. */
  getSignalVariance?: SignalVarianceResolver;
}

/**
 * Constructs the normalized entity graph from content loaders.
 * Edges: Claim → Record, Claim → Case Study, Record → Case Study, Book → Record.
 */
export async function buildEntityGraph(
  options?: BuildEntityGraphOptions,
): Promise<EntityGraph> {
  const [claims, records, caseStudies, books] = await Promise.all([
    Promise.resolve(getAllClaims()),
    getPublicRecordEntries(),
    getCaseStudyEntries(),
    getBookEntries(),
  ]);

  const getVector = options?.getSignalVector;
  const getVariance = options?.getSignalVariance;
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];

  // Claim nodes and Claim → Record (supports)
  for (const c of claims) {
    const node: GraphNode = {
      kind: 'claim',
      id: c.id,
      labelKey: c.labelKey,
      summaryKey: c.summaryKey,
      category: c.category,
      recordIds: [...c.recordIds],
    };
    const vec = getVector?.('claim', c.id);
    if (vec) node.signalVector = vec;
    const contrib = getVariance?.('claim', c.id);
    if (contrib !== undefined) node.signalEntropyContribution = contrib;
    nodes.push(node);
    for (const recordId of c.recordIds) {
      edges.push({ fromId: c.id, toId: recordId, kind: 'supports' });
    }
  }

  // Record nodes
  for (const r of records) {
    const id = getPublicRecordId(r.frontmatter);
    const node: GraphNode = {
      kind: 'record',
      id,
      title: r.frontmatter.title,
      slug: r.frontmatter.slug,
      artifactType: r.frontmatter.artifactType,
      date: r.frontmatter.date,
    };
    const vec = getVector?.('record', id);
    if (vec) node.signalVector = vec;
    const contrib = getVariance?.('record', id);
    if (contrib !== undefined) node.signalEntropyContribution = contrib;
    nodes.push(node);
  }

  // Case study nodes; Record → Case Study (references) and Claim → Case Study (references via claimRefs)
  for (const cs of caseStudies) {
    const id = getCaseStudyId(cs.frontmatter);
    const node: GraphNode = {
      kind: 'caseStudy',
      id,
      title: cs.frontmatter.title,
      slug: cs.frontmatter.slug,
      summary: cs.frontmatter.summary,
      date: cs.frontmatter.date,
      proofRefs: [...(cs.frontmatter.proofRefs ?? [])],
      claimRefs: [...(cs.frontmatter.claimRefs ?? [])],
    };
    const vec = getVector?.('caseStudy', id);
    if (vec) node.signalVector = vec;
    const contrib = getVariance?.('caseStudy', id);
    if (contrib !== undefined) node.signalEntropyContribution = contrib;
    nodes.push(node);
    for (const recordId of cs.frontmatter.proofRefs ?? []) {
      edges.push({ fromId: recordId, toId: id, kind: 'references' });
    }
    for (const claimId of cs.frontmatter.claimRefs ?? []) {
      edges.push({ fromId: claimId, toId: id, kind: 'references' });
    }
  }

  // Book nodes; Book → Record (references)
  for (const b of books) {
    const id = getBookId(b.frontmatter);
    const node: GraphNode = {
      kind: 'book',
      id,
      title: b.frontmatter.title,
      slug: b.frontmatter.slug,
      summary: b.frontmatter.summary,
      publicationDate: b.frontmatter.publicationDate,
      proofRefs: [...b.frontmatter.proofRefs],
    };
    const vec = getVector?.('book', id);
    if (vec) node.signalVector = vec;
    const contrib = getVariance?.('book', id);
    if (contrib !== undefined) node.signalEntropyContribution = contrib;
    nodes.push(node);
    for (const recordId of b.frontmatter.proofRefs) {
      edges.push({ fromId: id, toId: recordId, kind: 'references' });
    }
  }

  const nodeById = new Map(nodes.map((n) => [n.id, n]));
  const edgesWithWeight = edges.map((e) => {
    const fromNode = nodeById.get(e.fromId);
    const toNode = nodeById.get(e.toId);
    const fromVec = fromNode?.signalVector
      ? getEffectiveWeights(fromNode.signalVector)
      : {};
    const toVec = toNode?.signalVector
      ? getEffectiveWeights(toNode.signalVector)
      : {};
    const weight = edgeWeightFromVectors(fromVec, toVec);
    return weight !== undefined ? { ...e, weight } : e;
  });

  return {
    nodes: sortNodes(nodes),
    edges: sortEdges(edgesWithWeight),
  };
}

function edgeWeightFromVectors(
  a: Record<string, number>,
  b: Record<string, number>,
): number | undefined {
  const ids = [...new Set([...Object.keys(a), ...Object.keys(b)])];
  if (ids.length === 0) return undefined;
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (const id of ids) {
    const va = a[id] ?? 0;
    const vb = b[id] ?? 0;
    dot += va * vb;
    na += va * va;
    nb += vb * vb;
  }
  if (na === 0 || nb === 0) return undefined;
  const cos = dot / (Math.sqrt(na) * Math.sqrt(nb));
  return 1 - cos;
}

function sortNodes(nodes: GraphNode[]): GraphNode[] {
  return [...nodes].sort((a, b) => {
    const kindOrder = { claim: 0, record: 1, caseStudy: 2, book: 3 };
    const ka = kindOrder[a.kind];
    const kb = kindOrder[b.kind];
    if (ka !== kb) return ka - kb;
    return a.id.localeCompare(b.id);
  });
}

function sortEdges(edges: GraphEdge[]): GraphEdge[] {
  return [...edges].sort((a, b) => {
    if (a.fromId !== b.fromId) return a.fromId.localeCompare(b.fromId);
    if (a.toId !== b.toId) return a.toId.localeCompare(b.toId);
    return a.kind.localeCompare(b.kind);
  });
}

export const _recordIdSetForTests = (g: EntityGraph) =>
  new Set(g.nodes.filter((n) => n.kind === 'record').map((n) => n.id));
export const _caseStudyIdSetForTests = (g: EntityGraph) =>
  new Set(g.nodes.filter((n) => n.kind === 'caseStudy').map((n) => n.id));
export const _bookIdSetForTests = (g: EntityGraph) =>
  new Set(g.nodes.filter((n) => n.kind === 'book').map((n) => n.id));

/**
 * Validation-only entry point. Use from tools/validate-intelligence.ts so the
 * script never imports @joelklemmer/content (main), avoiding next-mdx-remote and ESM deps under tsx.
 */
import {
  getBookId,
  getCaseStudyId,
  getPublicRecordId,
  type BookFrontmatter,
  type CaseStudyFrontmatter,
  type ClaimRegistryEntry,
  type PublicRecordFrontmatter,
} from '@joelklemmer/content/validate';
import type {
  EntityGraph,
  GraphEdge,
  GraphNode,
  SemanticIndexEntry,
  SemanticEntryType,
} from './lib/types';

type RecordEntry = { frontmatter: PublicRecordFrontmatter };
type CaseStudyEntry = { frontmatter: CaseStudyFrontmatter };
type BookEntry = { frontmatter: BookFrontmatter };

/**
 * Builds the entity graph from pre-loaded content (e.g. loaded via content/validate + sync file reads).
 * Same structure as buildEntityGraph() but does not depend on content.ts.
 */
export function buildEntityGraphFromData(
  claims: ClaimRegistryEntry[],
  records: RecordEntry[],
  caseStudies: CaseStudyEntry[],
  books: BookEntry[],
): EntityGraph {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];

  for (const c of claims) {
    nodes.push({
      kind: 'claim',
      id: c.id,
      labelKey: c.labelKey,
      summaryKey: c.summaryKey,
      category: c.category,
      recordIds: [...c.recordIds],
    });
    for (const recordId of c.recordIds) {
      edges.push({ fromId: c.id, toId: recordId, kind: 'supports' });
    }
  }

  for (const r of records) {
    const id = getPublicRecordId(r.frontmatter);
    nodes.push({
      kind: 'record',
      id,
      title: r.frontmatter.title,
      slug: r.frontmatter.slug,
      artifactType: r.frontmatter.artifactType,
      date: r.frontmatter.date,
    });
  }

  for (const cs of caseStudies) {
    const id = getCaseStudyId(cs.frontmatter);
    nodes.push({
      kind: 'caseStudy',
      id,
      title: cs.frontmatter.title,
      slug: cs.frontmatter.slug,
      summary: cs.frontmatter.summary,
      date: cs.frontmatter.date,
      proofRefs: [...(cs.frontmatter.proofRefs ?? [])],
      claimRefs: [...(cs.frontmatter.claimRefs ?? [])],
    });
    for (const recordId of cs.frontmatter.proofRefs ?? []) {
      edges.push({ fromId: recordId, toId: id, kind: 'references' });
    }
    for (const claimId of cs.frontmatter.claimRefs ?? []) {
      edges.push({ fromId: claimId, toId: id, kind: 'references' });
    }
  }

  for (const b of books) {
    const id = getBookId(b.frontmatter);
    nodes.push({
      kind: 'book',
      id,
      title: b.frontmatter.title,
      slug: b.frontmatter.slug,
      summary: b.frontmatter.summary,
      publicationDate: b.frontmatter.publicationDate,
      proofRefs: [...b.frontmatter.proofRefs],
    });
    for (const recordId of b.frontmatter.proofRefs) {
      edges.push({ fromId: id, toId: recordId, kind: 'references' });
    }
  }

  return {
    nodes: sortNodes(nodes),
    edges: sortEdges(edges),
  };
}

function sortNodes(nodes: GraphNode[]): GraphNode[] {
  return [...nodes].sort((a, b) => {
    const kindOrder: Record<GraphNode['kind'], number> = {
      claim: 0,
      record: 1,
      caseStudy: 2,
      book: 3,
    };
    if (kindOrder[a.kind] !== kindOrder[b.kind])
      return kindOrder[a.kind] - kindOrder[b.kind];
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

/**
 * Validates the graph: no orphan nodes, no missing references. Returns array of error messages.
 */
export function validateEntityGraph(graph: EntityGraph): string[] {
  const errors: string[] = [];
  const nodeIds = new Set(graph.nodes.map((n) => n.id));
  const endpointIds = new Set<string>();
  for (const e of graph.edges) {
    endpointIds.add(e.fromId);
    endpointIds.add(e.toId);
  }
  for (const n of graph.nodes) {
    if (!endpointIds.has(n.id)) {
      errors.push(`Orphan node: ${n.kind} id="${n.id}" (appears in no edge).`);
    }
  }
  for (const e of graph.edges) {
    if (!nodeIds.has(e.fromId)) {
      errors.push(
        `Missing reference: edge fromId "${e.fromId}" (kind=${e.kind}) has no matching node.`,
      );
    }
    if (!nodeIds.has(e.toId)) {
      errors.push(
        `Missing reference: edge toId "${e.toId}" (kind=${e.kind}) has no matching node.`,
      );
    }
  }
  return errors;
}

const DEFAULT_LOCALE = 'en';

/**
 * Builds the semantic index from pre-loaded content. Same structure as buildSemanticIndex().
 */
export function buildSemanticIndexFromData(
  claims: ClaimRegistryEntry[],
  records: RecordEntry[],
  caseStudies: CaseStudyEntry[],
  books: BookEntry[],
  locale: string = DEFAULT_LOCALE,
): SemanticIndexEntry[] {
  const entries: SemanticIndexEntry[] = [];
  for (const c of claims) {
    entries.push({
      id: c.id,
      type: 'claim' as SemanticEntryType,
      text: [c.labelKey, c.summaryKey].filter(Boolean).join(' '),
      url: `/${locale}/brief`,
    });
  }
  for (const r of records) {
    const id = getPublicRecordId(r.frontmatter);
    entries.push({
      id,
      type: 'record',
      text: r.frontmatter.title,
      url: `/${locale}/proof/${r.frontmatter.slug}`,
    });
  }
  for (const cs of caseStudies) {
    const id = getCaseStudyId(cs.frontmatter);
    entries.push({
      id,
      type: 'caseStudy',
      text: [cs.frontmatter.title, cs.frontmatter.summary]
        .filter(Boolean)
        .join(' '),
      url: `/${locale}/casestudies/${cs.frontmatter.slug}`,
    });
  }
  for (const b of books) {
    const id = getBookId(b.frontmatter);
    entries.push({
      id,
      type: 'book',
      text: [b.frontmatter.title, b.frontmatter.summary]
        .filter(Boolean)
        .join(' '),
      url: `/${locale}/books/${b.frontmatter.slug}`,
    });
  }
  return entries.sort((a, b) => {
    const typeOrder: Record<SemanticEntryType, number> = {
      claim: 0,
      record: 1,
      caseStudy: 2,
      book: 3,
    };
    if (typeOrder[a.type] !== typeOrder[b.type])
      return typeOrder[a.type] - typeOrder[b.type];
    return a.id.localeCompare(b.id);
  });
}

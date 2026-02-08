/**
 * AEC retrieval engine: graph + semantic index only. No generative model or external API.
 * Returns structured result objects referencing frameworks, claims, records, books, case studies.
 */

import type { EntityGraph, GraphNode } from '@joelklemmer/intelligence';
import type { SemanticIndexEntry } from '@joelklemmer/intelligence';
import { getEffectiveWeights } from '@joelklemmer/authority-signals';
import type { AECQueryIntent } from './queryTypes';

export interface AECRetrievalResult {
  frameworks: Array<{ id: string; node: GraphNode }>;
  claims: Array<{ id: string; node: GraphNode }>;
  records: Array<{ id: string; node: GraphNode }>;
  books: Array<{ id: string; node: GraphNode }>;
  caseStudies: Array<{ id: string; node: GraphNode }>;
}

export interface RetrievalEngineOptions {
  /** Evaluator mode for signal weighting. */
  evaluatorMode?: string;
  /** Max items per entity type in result. */
  maxPerType?: number;
}

const DEFAULT_MAX_PER_TYPE = 10;

function signalScore(node: GraphNode): number {
  if (!node.signalVector) return 0;
  const w = getEffectiveWeights(node.signalVector);
  return Object.values(w).reduce((s, v) => s + v, 0);
}

function bySignalAndEntropy(nodes: GraphNode[]): GraphNode[] {
  return [...nodes].sort((a, b) => {
    const aEnt = a.signalEntropyContribution ?? 0;
    const bEnt = b.signalEntropyContribution ?? 0;
    if (bEnt !== aEnt) return bEnt - aEnt;
    const aSig = signalScore(a);
    const bSig = signalScore(b);
    if (bSig !== aSig) return bSig - aSig;
    return a.id.localeCompare(b.id);
  });
}

function getNodeById(graph: EntityGraph, id: string): GraphNode | undefined {
  return graph.nodes.find((n) => n.id === id);
}

function getOutboundNeighborIds(graph: EntityGraph, fromId: string): string[] {
  return graph.edges.filter((e) => e.fromId === fromId).map((e) => e.toId);
}

function getInboundNeighborIds(graph: EntityGraph, toId: string): string[] {
  return graph.edges.filter((e) => e.toId === toId).map((e) => e.fromId);
}

/**
 * Rank semantic index entries by relevance to query text and signal weight.
 * Simple text overlap + signal; no embeddings.
 */
function semanticEntryScore(entry: SemanticIndexEntry): number {
  if (!entry.signalVector) return 0;
  const w = getEffectiveWeights(entry.signalVector);
  return Object.values(w).reduce((s, v) => s + v, 0);
}

function rankSemanticEntries(
  entries: SemanticIndexEntry[],
  queryText: string,
): SemanticIndexEntry[] {
  const q = queryText.toLowerCase().trim();
  if (!q) return entries;
  return [...entries].sort((a, b) => {
    const aText = a.text.toLowerCase();
    const bText = b.text.toLowerCase();
    const aMatch = aText.includes(q) ? 1 : 0;
    const bMatch = bText.includes(q) ? 1 : 0;
    if (bMatch !== aMatch) return bMatch - aMatch;
    const aSig = semanticEntryScore(a);
    const bSig = semanticEntryScore(b);
    if (bSig !== aSig) return bSig - aSig;
    return (
      (b.signalEntropyContribution ?? 0) - (a.signalEntropyContribution ?? 0)
    );
  });
}

function emptyResult(): AECRetrievalResult {
  return {
    frameworks: [],
    claims: [],
    records: [],
    books: [],
    caseStudies: [],
  };
}

function collectResult(
  graph: EntityGraph,
  maxPerType: number,
): AECRetrievalResult {
  const result = emptyResult();
  const add = <K extends keyof AECRetrievalResult>(
    key: K,
    id: string,
  ): void => {
    const node = getNodeById(graph, id);
    if (!node) return;
    const arr = result[key] as Array<{ id: string; node: GraphNode }>;
    if (arr.length >= maxPerType) return;
    if (arr.some((x) => x.id === id)) return;
    arr.push({ id, node });
  };
  for (const n of graph.nodes) {
    if (n.kind === 'framework') add('frameworks', n.id);
    else if (n.kind === 'claim') add('claims', n.id);
    else if (n.kind === 'record') add('records', n.id);
    else if (n.kind === 'book') add('books', n.id);
    else if (n.kind === 'caseStudy') add('caseStudies', n.id);
  }
  return result;
}

/**
 * Deterministic retrieval by intent. Uses only graph and semantic index.
 */
export function query(
  entityGraph: EntityGraph,
  semanticIndex: SemanticIndexEntry[],
  intent: AECQueryIntent,
  options?: RetrievalEngineOptions,
): AECRetrievalResult {
  const maxPerType = options?.maxPerType ?? DEFAULT_MAX_PER_TYPE;
  const result = emptyResult();

  const addFramework = (id: string) => {
    const node = getNodeById(entityGraph, id);
    if (
      node &&
      node.kind === 'framework' &&
      result.frameworks.length < maxPerType
    )
      result.frameworks.push({ id, node });
  };
  const addClaim = (id: string) => {
    const node = getNodeById(entityGraph, id);
    if (node && node.kind === 'claim' && result.claims.length < maxPerType)
      result.claims.push({ id, node });
  };
  const addRecord = (id: string) => {
    const node = getNodeById(entityGraph, id);
    if (node && node.kind === 'record' && result.records.length < maxPerType)
      result.records.push({ id, node });
  };
  const addCaseStudy = (id: string) => {
    const node = getNodeById(entityGraph, id);
    if (
      node &&
      node.kind === 'caseStudy' &&
      result.caseStudies.length < maxPerType
    )
      result.caseStudies.push({ id, node });
  };
  const addBook = (id: string) => {
    const node = getNodeById(entityGraph, id);
    if (node && node.kind === 'book' && result.books.length < maxPerType)
      result.books.push({ id, node });
  };

  switch (intent) {
    case 'summarize_framework': {
      const frameworks = entityGraph.nodes.filter(
        (n) => n.kind === 'framework',
      );
      const sorted = bySignalAndEntropy(frameworks);
      for (const n of sorted.slice(0, maxPerType))
        result.frameworks.push({ id: n.id, node: n });
      for (const { id, node } of result.frameworks) {
        if (node.kind === 'framework') {
          for (const claimId of node.relatedClaims ?? []) addClaim(claimId);
          for (const recId of node.relatedRecords ?? []) addRecord(recId);
          for (const csId of node.relatedCaseStudies ?? []) addCaseStudy(csId);
        }
      }
      break;
    }
    case 'trace_evidence_chain': {
      const claims = entityGraph.nodes.filter((n) => n.kind === 'claim');
      const sorted = bySignalAndEntropy(claims);
      for (const n of sorted.slice(0, maxPerType)) {
        result.claims.push({ id: n.id, node: n });
        if (n.kind === 'claim')
          for (const recordId of n.recordIds) addRecord(recordId);
      }
      for (const r of result.records) {
        const out = getOutboundNeighborIds(entityGraph, r.id);
        for (const id of out) addCaseStudy(id);
      }
      break;
    }
    case 'compare_claims': {
      const claims = entityGraph.nodes.filter((n) => n.kind === 'claim');
      const sorted = bySignalAndEntropy(claims);
      for (const n of sorted.slice(0, maxPerType)) {
        result.claims.push({ id: n.id, node: n });
        if (n.kind === 'claim')
          for (const recordId of n.recordIds) addRecord(recordId);
      }
      break;
    }
    case 'explore_domain': {
      const ranked = rankSemanticEntries(semanticIndex, '').slice(
        0,
        maxPerType * 2,
      );
      for (const entry of ranked) {
        if (entry.type === 'framework') addFramework(entry.id);
        else if (entry.type === 'claim') addClaim(entry.id);
        else if (entry.type === 'record') addRecord(entry.id);
        else if (entry.type === 'caseStudy') addCaseStudy(entry.id);
        else if (entry.type === 'book') addBook(entry.id);
      }
      break;
    }
    case 'extract_decision_model': {
      const frameworks = entityGraph.nodes.filter(
        (n) => n.kind === 'framework',
      );
      const sorted = bySignalAndEntropy(frameworks);
      for (const n of sorted.slice(0, maxPerType))
        result.frameworks.push({ id: n.id, node: n });
      for (const { node } of result.frameworks) {
        if (node.kind === 'framework') {
          for (const claimId of node.relatedClaims ?? []) addClaim(claimId);
          for (const recId of node.relatedRecords ?? []) addRecord(recId);
        }
      }
      break;
    }
    default: {
      return collectResult(entityGraph, maxPerType);
    }
  }

  return result;
}

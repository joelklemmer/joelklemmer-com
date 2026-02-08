/**
 * Transforms AEC retrieval results into short briefings, bullet summaries, and entity link lists.
 * Enforces PGF tone: evidence-forward, no marketing, no exclamation.
 * When priorityWeights is provided, entity link order reflects evaluator context (orchestration).
 */

import type { GraphNode } from '@joelklemmer/intelligence';
import type { AECRetrievalResult } from './retrievalEngine';
import type { SurfacePriorityWeights } from '@joelklemmer/authority-orchestration';

export interface EntityLink {
  id: string;
  label: string;
  href: string;
  kind: string;
}

export interface AECFormattedResult {
  summary: string;
  bullets: string[];
  entityLinks: EntityLink[];
}

export type LabelResolver = (node: GraphNode) => string;

export interface ResponseFormatterOptions {
  /** Resolver for display labels (e.g. from i18n). Falls back to id when absent. */
  labelResolver?: LabelResolver;
  /** Base path for hrefs (e.g. /en). Caller must pass locale-prefixed base. */
  basePath?: string;
  /** When set, entity links are ordered by these weights (orchestration). */
  priorityWeights?: SurfacePriorityWeights;
}

function defaultLabel(node: GraphNode): string {
  if (node.kind === 'claim') return node.labelKey || node.id;
  if (node.kind === 'framework') return node.titleKey || node.id;
  if ('title' in node && typeof (node as { title: string }).title === 'string')
    return (node as { title: string }).title;
  return node.id;
}

function buildHref(node: GraphNode, basePath: string): string {
  const base = basePath.replace(/\/$/, '');
  if (node.kind === 'record' && 'slug' in node)
    return `${base}/publicrecord/${(node as { slug: string }).slug}`;
  if (node.kind === 'caseStudy' && 'slug' in node)
    return `${base}/casestudies/${(node as { slug: string }).slug}`;
  if (node.kind === 'book' && 'slug' in node)
    return `${base}/books/${(node as { slug: string }).slug}`;
  if (node.kind === 'framework') return `${base}/brief#doctrine`;
  if (node.kind === 'claim') return `${base}/brief#claim-${node.id}`;
  return `${base}/brief`;
}

/**
 * Format retrieval result into PGF-compliant briefing text and entity links.
 * No hallucinated or marketing language; evidence-forward only.
 * When priorityWeights is provided, entityLinks order reflects orchestration weighting.
 */
export function format(
  result: AECRetrievalResult,
  options?: ResponseFormatterOptions,
): AECFormattedResult {
  const labelResolver = options?.labelResolver ?? defaultLabel;
  const basePath = options?.basePath ?? '';
  const priorityWeights = options?.priorityWeights;

  const bullets: string[] = [];
  const entityLinks: EntityLink[] = [];

  const addLink = (node: GraphNode) => {
    entityLinks.push({
      id: node.id,
      kind: node.kind,
      label: labelResolver(node),
      href: buildHref(node, basePath),
    });
  };

  type Group = { weight: number; add: () => void };
  const groups: Group[] = [];

  if (result.frameworks.length > 0) {
    bullets.push(`Frameworks: ${result.frameworks.length} in scope.`);
    const w = priorityWeights?.frameworks ?? 0.5;
    groups.push({
      weight: w,
      add: () => {
        for (const { node } of result.frameworks) addLink(node);
      },
    });
  }
  if (result.claims.length > 0) {
    bullets.push(`Claims: ${result.claims.length} indexed.`);
    const w = priorityWeights?.claims ?? 0.5;
    groups.push({
      weight: w,
      add: () => {
        for (const { node } of result.claims) addLink(node);
      },
    });
  }
  if (result.records.length > 0) {
    bullets.push(`Public record: ${result.records.length} artifact(s).`);
    const w = priorityWeights?.records ?? 0.5;
    groups.push({
      weight: w,
      add: () => {
        for (const { node } of result.records) addLink(node);
      },
    });
  }
  if (result.caseStudies.length > 0) {
    bullets.push(`Case studies: ${result.caseStudies.length} referenced.`);
    const w = priorityWeights?.caseStudies ?? 0.5;
    groups.push({
      weight: w,
      add: () => {
        for (const { node } of result.caseStudies) addLink(node);
      },
    });
  }
  if (result.books.length > 0) {
    bullets.push(`Books: ${result.books.length} referenced.`);
    const w = priorityWeights?.books ?? 0.5;
    groups.push({
      weight: w,
      add: () => {
        for (const { node } of result.books) addLink(node);
      },
    });
  }

  if (priorityWeights) {
    groups.sort((a, b) => b.weight - a.weight);
  }
  for (const g of groups) g.add();

  const total =
    result.frameworks.length +
    result.claims.length +
    result.records.length +
    result.caseStudies.length +
    result.books.length;
  const summary =
    total === 0
      ? 'No matching entities in the authority corpus.'
      : `Retrieval returned ${total} entity reference(s). Evidence-linked.`;

  return {
    summary,
    bullets,
    entityLinks,
  };
}

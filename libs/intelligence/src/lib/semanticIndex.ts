/**
 * Semantic index: searchable text corpus for claims, case studies, records, and books.
 * No search integration yet; produces the index structure only.
 * Prepared for future vector indexing and AI assistant context.
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
import type {
  SemanticIndexEntry,
  SemanticEntryType,
  SignalVectorResolver,
  SignalVarianceResolver,
} from './types';

export type { SemanticIndexEntry, SemanticEntryType };

/** Default locale for URL paths in the index. */
const DEFAULT_LOCALE = 'en';

export interface BuildSemanticIndexOptions {
  /** If provided, attach authority signal vectors to each entry (UASIL). */
  getSignalVector?: SignalVectorResolver;
  /** ASTD: if provided, attach entropy contribution for semantic index ranking. */
  getSignalVariance?: SignalVarianceResolver;
}

/**
 * Generates the searchable text corpus: claim summaries, case study summaries,
 * record titles, and book summaries. Output is deterministic and SSR safe.
 * Does not integrate with search; just produces the index.
 */
export async function buildSemanticIndex(
  locale: string = DEFAULT_LOCALE,
  options?: BuildSemanticIndexOptions,
): Promise<SemanticIndexEntry[]> {
  const [claims, records, caseStudies, books] = await Promise.all([
    Promise.resolve(getAllClaims()),
    getPublicRecordEntries(),
    getCaseStudyEntries(),
    getBookEntries(),
  ]);

  const getVector = options?.getSignalVector;
  const getVariance = options?.getSignalVariance;
  const entries: SemanticIndexEntry[] = [];

  for (const c of claims) {
    const entry: SemanticIndexEntry = {
      id: c.id,
      type: 'claim',
      text: [c.labelKey, c.summaryKey].filter(Boolean).join(' '),
      url: `/${locale}/brief`,
    };
    const vec = getVector?.('claim', c.id);
    if (vec) entry.signalVector = vec;
    const contrib = getVariance?.('claim', c.id);
    if (contrib !== undefined) entry.signalEntropyContribution = contrib;
    entries.push(entry);
  }

  for (const r of records) {
    const id = getPublicRecordId(r.frontmatter);
    const entry: SemanticIndexEntry = {
      id,
      type: 'record',
      text: r.frontmatter.title,
      url: `/${locale}/proof/${r.frontmatter.slug}`,
    };
    const vec = getVector?.('record', id);
    if (vec) entry.signalVector = vec;
    const contrib = getVariance?.('record', id);
    if (contrib !== undefined) entry.signalEntropyContribution = contrib;
    entries.push(entry);
  }

  for (const cs of caseStudies) {
    const id = getCaseStudyId(cs.frontmatter);
    const entry: SemanticIndexEntry = {
      id,
      type: 'caseStudy',
      text: [cs.frontmatter.title, cs.frontmatter.summary]
        .filter(Boolean)
        .join(' '),
      url: `/${locale}/casestudies/${cs.frontmatter.slug}`,
    };
    const vec = getVector?.('caseStudy', id);
    if (vec) entry.signalVector = vec;
    const contrib = getVariance?.('caseStudy', id);
    if (contrib !== undefined) entry.signalEntropyContribution = contrib;
    entries.push(entry);
  }

  for (const b of books) {
    const id = getBookId(b.frontmatter);
    const entry: SemanticIndexEntry = {
      id,
      type: 'book',
      text: [b.frontmatter.title, b.frontmatter.summary]
        .filter(Boolean)
        .join(' '),
      url: `/${locale}/books/${b.frontmatter.slug}`,
    };
    const vec = getVector?.('book', id);
    if (vec) entry.signalVector = vec;
    const contrib = getVariance?.('book', id);
    if (contrib !== undefined) entry.signalEntropyContribution = contrib;
    entries.push(entry);
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

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
import type { SemanticIndexEntry, SemanticEntryType } from './types';

export type { SemanticIndexEntry, SemanticEntryType };

/** Default locale for URL paths in the index. */
const DEFAULT_LOCALE = 'en';

/**
 * Generates the searchable text corpus: claim summaries, case study summaries,
 * record titles, and book summaries. Output is deterministic and SSR safe.
 * Does not integrate with search; just produces the index.
 */
export async function buildSemanticIndex(
  locale: string = DEFAULT_LOCALE,
): Promise<SemanticIndexEntry[]> {
  const [claims, records, caseStudies, books] = await Promise.all([
    Promise.resolve(getAllClaims()),
    getPublicRecordEntries(),
    getCaseStudyEntries(),
    getBookEntries(),
  ]);

  const entries: SemanticIndexEntry[] = [];

  for (const c of claims) {
    entries.push({
      id: c.id,
      type: 'claim',
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

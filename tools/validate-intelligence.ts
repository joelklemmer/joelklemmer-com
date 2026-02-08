/**
 * Intelligence layer validation: graph builds, no orphan nodes, no missing references,
 * semantic index generation succeeds. Uses content/validate and intelligence/validate only
 * so next-mdx-remote is never loaded under tsx.
 */
import path from 'node:path';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import matter from 'gray-matter';
import { z } from 'zod';
import {
  bookFrontmatterSchema,
  caseStudyFrontmatterSchema,
  getAllClaims,
  getBookId,
  getCaseStudyId,
  getPublicRecordId,
  publicRecordFrontmatterSchema,
} from '@joelklemmer/content/validate';
import {
  buildEntityGraphFromData,
  buildSemanticIndexFromData,
  validateEntityGraph,
} from '@joelklemmer/intelligence/validate';

const contentRootCandidates = [
  path.join(process.cwd(), 'content'),
  path.join(process.cwd(), '..', '..', 'content'),
];
const contentRoot =
  contentRootCandidates.find((candidate) => existsSync(candidate)) ??
  contentRootCandidates[0];

function getMdxFiles(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((entry) => entry.endsWith('.mdx'))
    .map((entry) => path.join(dir, entry));
}

function validateFrontmatter<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  _filePath: string,
): { ok: true; data: T } | { ok: false; error: string } {
  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    const details = parsed.error.issues
      .map((i) => `${i.path.join('.')}: ${i.message}`)
      .join('; ');
    return { ok: false, error: details };
  }
  return { ok: true, data: parsed.data };
}

function readMdx(filePath: string) {
  const raw = readFileSync(filePath, 'utf-8');
  const { data } = matter(raw);
  return { data };
}

const errors: string[] = [];

// Load case studies
const caseStudyDir = path.join(contentRoot, 'case-studies');
const caseStudyEntries = getMdxFiles(caseStudyDir).map((filePath) => {
  const { data } = readMdx(filePath);
  const parsed = validateFrontmatter(
    caseStudyFrontmatterSchema,
    data,
    filePath,
  );
  if (!parsed.ok) {
    errors.push(`${filePath}: ${parsed.error}`);
    return null;
  }
  return { frontmatter: parsed.data };
});
const caseStudies = caseStudyEntries.filter(
  (e): e is NonNullable<typeof e> => e != null,
);

// Load public records
const publicRecordDir = existsSync(path.join(contentRoot, 'public-record'))
  ? path.join(contentRoot, 'public-record')
  : path.join(contentRoot, 'proof');
const recordEntries = getMdxFiles(publicRecordDir).map((filePath) => {
  const { data } = readMdx(filePath);
  const parsed = validateFrontmatter(
    publicRecordFrontmatterSchema,
    data,
    filePath,
  );
  if (!parsed.ok) {
    errors.push(`${filePath}: ${parsed.error}`);
    return null;
  }
  return { frontmatter: parsed.data };
});
const records = recordEntries.filter(
  (e): e is NonNullable<typeof e> => e != null,
);

// Load books
const booksDir = path.join(contentRoot, 'books');
const bookEntries = existsSync(booksDir)
  ? getMdxFiles(booksDir).map((filePath) => {
      const { data } = readMdx(filePath);
      const parsed = validateFrontmatter(bookFrontmatterSchema, data, filePath);
      if (!parsed.ok) {
        errors.push(`${filePath}: ${parsed.error}`);
        return null;
      }
      return { frontmatter: parsed.data };
    })
  : [];
const books = bookEntries.filter((e): e is NonNullable<typeof e> => e != null);

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}

const claims = getAllClaims();
const graph = buildEntityGraphFromData(claims, records, caseStudies, books);
const graphErrors = validateEntityGraph(graph);
if (graphErrors.length) {
  console.error(graphErrors.join('\n'));
  process.exit(1);
}

buildSemanticIndexFromData(claims, records, caseStudies, books);

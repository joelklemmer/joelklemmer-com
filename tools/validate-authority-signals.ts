/**
 * Authority signals validation: every major subsystem entity is mapped to
 * authority signals; no signal starvation; no overconcentration; multilingual
 * keys intact (delegated to i18n-validate); no PGF violations (delegated to pgf-validate).
 * Integrated into verify pipeline without reordering existing stages.
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
  getMappingDiagnostics,
  getStructuredMapping,
  computeSignalEntropyScore,
  computeTopologyDimensionalityIndex,
  getVarianceDistributionReport,
  isSevereCollapse,
  type EntityIdSet,
} from '@joelklemmer/authority-mapping';

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

const loadErrors: string[] = [];

const caseStudyDir = path.join(contentRoot, 'case-studies');
const caseStudyEntries = getMdxFiles(caseStudyDir).map((filePath) => {
  const { data } = readMdx(filePath);
  const parsed = validateFrontmatter(
    caseStudyFrontmatterSchema,
    data,
    filePath,
  );
  if (!parsed.ok) {
    loadErrors.push(`${filePath}: ${parsed.error}`);
    return null;
  }
  return { frontmatter: parsed.data };
});
const caseStudies = caseStudyEntries.filter(
  (e): e is NonNullable<typeof e> => e != null,
);

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
    loadErrors.push(`${filePath}: ${parsed.error}`);
    return null;
  }
  return { frontmatter: parsed.data };
});
const records = recordEntries.filter(
  (e): e is NonNullable<typeof e> => e != null,
);

const booksDir = path.join(contentRoot, 'books');
const bookEntries = existsSync(booksDir)
  ? getMdxFiles(booksDir).map((filePath) => {
      const { data } = readMdx(filePath);
      const parsed = validateFrontmatter(bookFrontmatterSchema, data, filePath);
      if (!parsed.ok) {
        loadErrors.push(`${filePath}: ${parsed.error}`);
        return null;
      }
      return { frontmatter: parsed.data };
    })
  : [];
const books = bookEntries.filter((e): e is NonNullable<typeof e> => e != null);

if (loadErrors.length) {
  console.error(loadErrors.join('\n'));
  process.exit(1);
}

const claims = getAllClaims();
const entityIds: EntityIdSet = {
  claimIds: new Set(claims.map((c) => c.id)),
  recordIds: new Set(records.map((r) => getPublicRecordId(r.frontmatter))),
  caseStudyIds: new Set(
    caseStudies.map((cs) => getCaseStudyId(cs.frontmatter)),
  ),
  bookIds: new Set(books.map((b) => getBookId(b.frontmatter))),
};

const { errors, warnings, info } = getMappingDiagnostics(entityIds);

const mapping = getStructuredMapping();
const bindingsForEntropy = mapping.entries.map((e) => ({
  entityKind: e.entityKind,
  entityId: e.entityId,
  signalVector: e.signalVector,
}));

const signalEntropyScore = computeSignalEntropyScore(bindingsForEntropy);
const topologyDimensionalityIndex =
  computeTopologyDimensionalityIndex(bindingsForEntropy);
const varianceReport = getVarianceDistributionReport(bindingsForEntropy);

console.info(
  '[authority-signals] signal entropy score:',
  signalEntropyScore.toFixed(4),
);
console.info(
  '[authority-signals] topology dimensionality index:',
  topologyDimensionalityIndex.toFixed(4),
);
console.info(
  '[authority-signals] variance distribution:',
  varianceReport.uniqueSignatures,
  'unique signatures across',
  varianceReport.totalEntities,
  'entities; overall variance',
  varianceReport.overallVariance.toFixed(4),
);

const collapse = isSevereCollapse(bindingsForEntropy);
if (collapse.severe) {
  console.error(
    '[authority-signals] severe topology collapse:',
    collapse.reason,
  );
  process.exit(1);
}

if (warnings.length) {
  warnings.forEach((w) => console.warn('[authority-signals]', w));
}
if (info.length) {
  info.forEach((i) => console.info('[authority-signals]', i));
}

if (errors.length) {
  console.error(
    'Authority signals validation failed:\n' +
      errors.map((e) => `  ${e}`).join('\n'),
  );
  process.exit(1);
}

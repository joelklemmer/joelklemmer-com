/**
 * Experience Intelligence Layer (EIL) validation.
 * - Evaluator mode defaults safe
 * - Density view toggles do not introduce hardcoded user-facing strings
 * - Evidence graph uses existing content ids only (no orphan refs)
 * Additive verify stage after authority-signals-validate; do not reorder existing stages.
 * Uses content/validate + intelligence/validate only (no next-mdx-remote under tsx).
 */

import path from 'node:path';
import fs from 'node:fs';
import matter from 'gray-matter';
import { z } from 'zod';
import {
  DEFAULT_EVALUATOR_MODE,
  EVALUATOR_MODES,
  resolveEvaluatorMode,
} from '@joelklemmer/evaluator-mode';
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
  validateEntityGraph,
} from '@joelklemmer/intelligence/validate';

const errors: string[] = [];

// 1) Evaluator mode defaults safe
if (DEFAULT_EVALUATOR_MODE !== 'default') {
  errors.push(
    `Evaluator mode default must be "default"; got ${DEFAULT_EVALUATOR_MODE}`,
  );
}
const resolved = resolveEvaluatorMode({});
if (resolved !== 'default') {
  errors.push(
    `resolveEvaluatorMode({}) must return "default"; got ${resolved}`,
  );
}
const validModes = new Set(EVALUATOR_MODES);
if (!validModes.has('default') || !validModes.has('executive')) {
  errors.push('Evaluator modes must include default and executive');
}

// 2) Density view: no hardcoded user-facing strings in density lib
const densityLib = path.join(process.cwd(), 'libs', 'authority-density', 'src');
const densityFiles = ['DensityAwarePage.tsx', 'DensityViewContext.tsx'];
for (const file of densityFiles) {
  const filePath = path.join(densityLib, 'lib', file);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const suspicious = content.match(
      /["'](?:Density view|Vista de densidad|Режим щільності|תצוגת צפיפות)["']/,
    );
    if (suspicious) {
      errors.push(
        `authority-density: hardcoded user-facing string in ${file}: ${suspicious[0]}`,
      );
    }
  }
}
const messagesPath = path.join(
  process.cwd(),
  'libs',
  'i18n',
  'src',
  'messages',
);
const locales = ['en', 'uk', 'es', 'he'];
for (const locale of locales) {
  const commonPath = path.join(messagesPath, locale, 'common.json');
  if (fs.existsSync(commonPath)) {
    const common = JSON.parse(fs.readFileSync(commonPath, 'utf-8'));
    if (!common?.density?.toggleLabel) {
      errors.push(
        `i18n: locale "${locale}" common.json must define density.toggleLabel`,
      );
    }
  }
}

// 3) Evidence graph: build from content/validate data; no orphan refs
const contentRootCandidates = [
  path.join(process.cwd(), 'content'),
  path.join(process.cwd(), '..', '..', 'content'),
];
const contentRoot =
  contentRootCandidates.find((c) => fs.existsSync(c)) ??
  contentRootCandidates[0];

function getMdxFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((entry) => entry.endsWith('.mdx'))
    .map((entry) => path.join(dir, entry));
}
function validateFrontmatter<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
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
  const raw = fs.readFileSync(filePath, 'utf-8');
  const { data } = matter(raw);
  return { data };
}

const caseStudyDir = path.join(contentRoot, 'case-studies');
const caseStudyEntries = getMdxFiles(caseStudyDir).map((filePath) => {
  const { data } = readMdx(filePath);
  const parsed = validateFrontmatter(caseStudyFrontmatterSchema, data);
  return parsed.ok ? { frontmatter: parsed.data } : null;
});
const caseStudies = caseStudyEntries.filter(
  (e): e is NonNullable<typeof e> => e != null,
);
const publicRecordDir = fs.existsSync(path.join(contentRoot, 'public-record'))
  ? path.join(contentRoot, 'public-record')
  : path.join(contentRoot, 'proof');
const recordEntries = getMdxFiles(publicRecordDir).map((filePath) => {
  const { data } = readMdx(filePath);
  const parsed = validateFrontmatter(publicRecordFrontmatterSchema, data);
  return parsed.ok ? { frontmatter: parsed.data } : null;
});
const records = recordEntries.filter(
  (e): e is NonNullable<typeof e> => e != null,
);
const booksDir = path.join(contentRoot, 'books');
const bookEntries = fs.existsSync(booksDir)
  ? getMdxFiles(booksDir).map((filePath) => {
      const { data } = readMdx(filePath);
      const parsed = validateFrontmatter(bookFrontmatterSchema, data);
      return parsed.ok ? { frontmatter: parsed.data } : null;
    })
  : [];
const books = bookEntries.filter((e): e is NonNullable<typeof e> => e != null);

const claims = getAllClaims();
const graph = buildEntityGraphFromData(claims, records, caseStudies, books);
const graphErrors = validateEntityGraph(graph);
for (const msg of graphErrors) {
  errors.push(`Evidence graph: ${msg}`);
}

if (errors.length > 0) {
  console.error(
    'Experience intelligence validation failed:\n' +
      errors.map((e) => `  ${e}`).join('\n'),
  );
  process.exit(1);
}
console.info(
  '[experience-intelligence] Evaluator default safe; density i18n ok; graph no orphans.',
);

/**
 * Frameworks (Doctrine) validation: schema, unique ids, i18n keys in all locales,
 * orphan refs (relatedClaims, relatedCaseStudies, relatedRecords).
 * Additive verify stage: run after experience-intelligence-validate, before content-os-validate.
 */

import path from 'node:path';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import matter from 'gray-matter';
import {
  frameworkFrontmatterSchema,
  getFrameworkId,
} from '@joelklemmer/content/validate';
import { getAllClaims } from '@joelklemmer/content/validate';
import { locales } from '@joelklemmer/i18n';

const contentRootCandidates = [
  path.join(process.cwd(), 'content'),
  path.join(process.cwd(), '..', '..', 'content'),
];
const contentRoot =
  contentRootCandidates.find((c) => existsSync(c)) ?? contentRootCandidates[0];

const messagesRoot = path.join(
  process.cwd(),
  'libs',
  'i18n',
  'src',
  'messages',
);

function getByPath(obj: unknown, keyPath: string): unknown {
  const parts = keyPath.split('.');
  let current: unknown = obj;
  for (const part of parts) {
    if (current == null || typeof current !== 'object') return undefined;
    current = (current as Record<string, unknown>)[part];
  }
  return current;
}

function getMdxFiles(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((entry) => entry.endsWith('.mdx'))
    .map((entry) => path.join(dir, entry));
}

function readMdx(filePath: string) {
  const raw = readFileSync(filePath, 'utf-8');
  const { data } = matter(raw);
  return { data };
}

const errors: string[] = [];
const frameworksDir = path.join(contentRoot, 'frameworks');

if (!existsSync(frameworksDir)) {
  console.info(
    '[frameworks] No content/frameworks directory; skipping framework validation.',
  );
  process.exit(0);
}

const frameworkFiles = getMdxFiles(frameworksDir);
const entries: Array<{
  filePath: string;
  frontmatter: ReturnType<typeof frameworkFrontmatterSchema.parse>;
}> = [];
const idSet = new Set<string>();

for (const filePath of frameworkFiles) {
  const { data } = readMdx(filePath);
  const parsed = frameworkFrontmatterSchema.safeParse(data);
  if (!parsed.success) {
    const details = parsed.error.issues
      .map((i) => `${i.path.join('.')}: ${i.message}`)
      .join('; ');
    errors.push(`${filePath}: ${details}`);
    continue;
  }
  const id = getFrameworkId(parsed.data);
  if (idSet.has(id)) {
    errors.push(`Duplicate framework id: ${id} (${filePath})`);
  }
  idSet.add(id);
  entries.push({ filePath, frontmatter: parsed.data });
}

// Required i18n keys in all locales
const requiredKeyPaths = [
  'titleKey',
  'summaryKey',
  'intent10Key',
  'intent60Key',
] as const;
for (const locale of locales) {
  const frameworkPath = path.join(messagesRoot, locale, 'frameworks.json');
  if (!existsSync(frameworkPath)) {
    errors.push(`Missing i18n: ${locale}/frameworks.json`);
    continue;
  }
  const fileContent = JSON.parse(readFileSync(frameworkPath, 'utf-8'));
  for (const { frontmatter } of entries) {
    for (const key of requiredKeyPaths) {
      const keyPath = (frontmatter as Record<string, string>)[key];
      if (!keyPath || typeof keyPath !== 'string') continue;
      const value = getByPath(fileContent, keyPath);
      if (
        value === undefined ||
        value === null ||
        (typeof value === 'string' && value.trim() === '')
      ) {
        errors.push(
          `Framework ${frontmatter.id}: locale "${locale}" missing or empty key "${keyPath}" (${key})`,
        );
      }
    }
  }
}

// Orphan refs: relatedClaims, relatedCaseStudies, relatedRecords
const claims = getAllClaims();
const claimIds = new Set(claims.map((c) => c.id));

const publicRecordDir = existsSync(path.join(contentRoot, 'public-record'))
  ? path.join(contentRoot, 'public-record')
  : path.join(contentRoot, 'proof');
const recordFiles = getMdxFiles(publicRecordDir);
const recordEntries = recordFiles.map((fp) => {
  const { data } = readMdx(fp);
  return data as { id?: string; slug: string };
});
const recordIds = new Set(
  recordEntries.map((r) => (r.id != null ? r.id : r.slug)),
);

const caseStudyDir = path.join(contentRoot, 'case-studies');
const caseStudyFiles = getMdxFiles(caseStudyDir);
const caseStudyEntries = caseStudyFiles.map((fp) => {
  const { data } = readMdx(fp);
  return data as { id?: string; slug: string };
});
const caseStudyIds = new Set(
  caseStudyEntries.map((cs) => (cs as { id?: string }).id ?? cs.slug),
);

for (const { frontmatter } of entries) {
  for (const ref of frontmatter.relatedClaims ?? []) {
    if (!claimIds.has(ref)) {
      errors.push(
        `Framework ${frontmatter.id}: relatedClaims references missing claim id: ${ref}`,
      );
    }
  }
  for (const ref of frontmatter.relatedCaseStudies ?? []) {
    if (!caseStudyIds.has(ref)) {
      errors.push(
        `Framework ${frontmatter.id}: relatedCaseStudies references missing case study id: ${ref}`,
      );
    }
  }
  for (const ref of frontmatter.relatedRecords ?? []) {
    if (!recordIds.has(ref)) {
      errors.push(
        `Framework ${frontmatter.id}: relatedRecords references missing record id: ${ref}`,
      );
    }
  }
}

if (errors.length > 0) {
  console.error(
    'Frameworks validation failed:\n' + errors.map((e) => `  ${e}`).join('\n'),
  );
  process.exit(1);
}

console.info(
  `[frameworks] ${entries.length} framework(s) validated; schema, i18n, and refs ok.`,
);

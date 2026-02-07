import path from 'node:path';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import matter from 'gray-matter';
import { z } from 'zod';
import {
  caseStudyFrontmatterSchema,
  claimRegistry,
  getArtifactsManifest,
  getMediaManifest,
  institutionalFrontmatterSchema,
  publicRecordFrontmatterSchema,
  validateClaimRegistry,
} from '@joelklemmer/content/validate';

const contentRootCandidates = [
  path.join(process.cwd(), 'content'),
  path.join(process.cwd(), '..', '..', 'content'),
];
const contentRoot =
  contentRootCandidates.find((candidate) => existsSync(candidate)) ??
  contentRootCandidates[0];

function getMdxFiles(dir: string) {
  if (!existsSync(dir)) {
    return [];
  }
  return readdirSync(dir)
    .filter((entry) => entry.endsWith('.mdx'))
    .map((entry) => path.join(dir, entry));
}

function validateFrontmatter<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  filePath: string,
) {
  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    const details = parsed.error.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join('; ');
    return { ok: false as const, error: `${filePath}: ${details}` };
  }
  return { ok: true as const, data: parsed.data };
}

function readMdx(filePath: string) {
  const raw = readFileSync(filePath, 'utf-8');
  const { content, data } = matter(raw);
  return { content, data };
}

const errors: string[] = [];

const caseStudyDir = path.join(contentRoot, 'case-studies');
const caseStudyEntries = getMdxFiles(caseStudyDir).map((filePath) => {
  const { content, data } = readMdx(filePath);
  const parsed = validateFrontmatter(caseStudyFrontmatterSchema, data, filePath);
  if (!parsed.ok) {
    errors.push(parsed.error);
    return null;
  }
  if (!content.trim()) {
    errors.push(`${filePath}: body content is required`);
  }
  return { frontmatter: parsed.data, content };
});

const publicRecordDir = existsSync(path.join(contentRoot, 'public-record'))
  ? path.join(contentRoot, 'public-record')
  : path.join(contentRoot, 'proof');
const publicRecordEntries = getMdxFiles(publicRecordDir).map((filePath) => {
  const { content, data } = readMdx(filePath);
  const parsed = validateFrontmatter(
    publicRecordFrontmatterSchema,
    data,
    filePath,
  );
  if (!parsed.ok) {
    errors.push(parsed.error);
    return null;
  }
  return { frontmatter: parsed.data, content };
});

const institutionalDir = path.join(contentRoot, 'institutional');
getMdxFiles(institutionalDir).forEach((filePath) => {
  const { data } = readMdx(filePath);
  const parsed = validateFrontmatter(
    institutionalFrontmatterSchema,
    data,
    filePath,
  );
  if (!parsed.ok) {
    errors.push(parsed.error);
  }
});

const publicRecordIds = new Set(
  publicRecordEntries
    .filter(Boolean)
    .flatMap((entry) => [
      entry?.frontmatter.slug,
      entry?.frontmatter.id,
    ])
    .filter(Boolean) as string[],
);

caseStudyEntries.filter(Boolean).forEach((entry) => {
  entry?.frontmatter.proofRefs.forEach((ref) => {
    if (!publicRecordIds.has(ref)) {
      errors.push(
        `Case study ${entry.frontmatter.slug} references missing public record id: ${ref}`,
      );
    }
  });
});

try {
  validateClaimRegistry(publicRecordIds);
} catch (error) {
  errors.push((error as Error).message);
}

try {
  getArtifactsManifest();
} catch (error) {
  errors.push((error as Error).message);
}

try {
  getMediaManifest();
} catch (error) {
  errors.push((error as Error).message);
}

if (errors.length) {
  throw new Error(`Content validation failed:\n- ${errors.join('\n- ')}`);
}

console.log('Content validation passed.');

import path from 'node:path';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import matter from 'gray-matter';
import { z } from 'zod';
import {
  bookFrontmatterSchema,
  caseStudyFrontmatterSchema,
  claimRegistry,
  contactPathways,
  CONTACT_PATHWAY_IDS,
  getArtifactsManifest,
  getBookId,
  getCaseStudyId,
  getMediaManifest,
  getPublicRecordId,
  institutionalPageFrontmatterSchema,
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
  const parsed = validateFrontmatter(
    caseStudyFrontmatterSchema,
    data,
    filePath,
  );
  if (!parsed.ok) {
    errors.push(parsed.error);
    return null;
  }
  return { frontmatter: parsed.data, content };
});

const caseStudyValidEntries = caseStudyEntries.filter(
  (e): e is NonNullable<typeof e> => e != null,
);
const caseStudyIds = caseStudyValidEntries.map((e) =>
  getCaseStudyId(e.frontmatter),
);
const caseStudyIdCounts = new Map<string, number>();
for (const id of caseStudyIds) {
  caseStudyIdCounts.set(id, (caseStudyIdCounts.get(id) ?? 0) + 1);
}
for (const [id, count] of caseStudyIdCounts) {
  if (count > 1) {
    errors.push(`Duplicate case study id: ${id} (used ${count} times)`);
  }
}

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

const GOVERNED_INSTITUTIONAL_IDS = [
  'privacy',
  'terms',
  'accessibility',
  'security',
];
const institutionalDir = path.join(contentRoot, 'institutional');
for (const id of GOVERNED_INSTITUTIONAL_IDS) {
  const filePath = path.join(institutionalDir, `${id}.mdx`);
  if (!existsSync(filePath)) {
    errors.push(`Missing governed institutional page: ${filePath}`);
    continue;
  }
  const { content, data } = readMdx(filePath);
  const parsed = validateFrontmatter(
    institutionalPageFrontmatterSchema,
    data,
    filePath,
  );
  if (!parsed.ok) {
    errors.push(parsed.error);
  } else {
    if (parsed.data.id !== id) {
      errors.push(
        `${filePath}: frontmatter id "${parsed.data.id}" must match filename "${id}"`,
      );
    }
    if (!content.trim()) {
      errors.push(`${filePath}: body content is required`);
    }
  }
}
const releaseReady = process.env.RELEASE_READY === '1';
if (releaseReady) {
  const now = new Date();
  for (const id of GOVERNED_INSTITUTIONAL_IDS) {
    const filePath = path.join(institutionalDir, `${id}.mdx`);
    if (!existsSync(filePath)) continue;
    const { data } = readMdx(filePath);
    const parsed = institutionalPageFrontmatterSchema.safeParse(data);
    if (parsed.success && new Date(parsed.data.nextReviewDate) < now) {
      errors.push(
        `${filePath}: nextReviewDate ${parsed.data.nextReviewDate} is in the past (RELEASE_READY=1)`,
      );
    }
  }
}

const publicRecordValidEntries = publicRecordEntries.filter(
  (e): e is NonNullable<typeof e> => e != null,
);
const recordIds = publicRecordValidEntries.map((e) =>
  getPublicRecordId(e.frontmatter),
);
const recordIdCounts = new Map<string, number>();
for (const id of recordIds) {
  recordIdCounts.set(id, (recordIdCounts.get(id) ?? 0) + 1);
}
for (const [id, count] of recordIdCounts) {
  if (count > 1) {
    errors.push(`Duplicate public record id: ${id} (used ${count} times)`);
  }
}
const publicRecordIds = new Set(recordIds);

const claimIds = new Set(claimRegistry.map((c) => c.id));
caseStudyValidEntries.forEach((entry) => {
  for (const ref of entry.frontmatter.proofRefs) {
    if (!publicRecordIds.has(ref)) {
      errors.push(
        `Case study ${entry.frontmatter.slug} proofRef references missing public record id: ${ref}`,
      );
    }
  }
  for (const ref of entry.frontmatter.claimRefs ?? []) {
    if (!claimIds.has(ref)) {
      errors.push(
        `Case study ${entry.frontmatter.slug} claimRef references missing claim id: ${ref}`,
      );
    }
  }
});

// Books: schema, unique bookId, proofRefs → Public Record
const booksDir = path.join(contentRoot, 'books');
const bookEntries = existsSync(booksDir)
  ? getMdxFiles(booksDir).map((filePath) => {
      const { content, data } = readMdx(filePath);
      const parsed = validateFrontmatter(bookFrontmatterSchema, data, filePath);
      if (!parsed.ok) {
        errors.push(parsed.error);
        return null;
      }
      return { frontmatter: parsed.data, content };
    })
  : [];
const bookValidEntries = bookEntries.filter(
  (e): e is NonNullable<typeof e> => e != null,
);
const bookIds = bookValidEntries.map((e) => getBookId(e.frontmatter));
const bookIdCounts = new Map<string, number>();
for (const id of bookIds) {
  bookIdCounts.set(id, (bookIdCounts.get(id) ?? 0) + 1);
}
for (const [id, count] of bookIdCounts) {
  if (count > 1) {
    errors.push(`Duplicate book id: ${id} (used ${count} times)`);
  }
}
bookValidEntries.forEach((entry) => {
  entry.frontmatter.proofRefs.forEach((ref) => {
    if (!publicRecordIds.has(ref)) {
      errors.push(
        `Book ${entry.frontmatter.slug} proofRef references missing public record id: ${ref}`,
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

// Contact pathways: exact ids, unique, sorted by priorityOrder (i18n keys validated in i18n-validate)
const pathwayIds = contactPathways.map((p) => p.id);
const expectedIds = [...CONTACT_PATHWAY_IDS].sort();
if (pathwayIds.length !== expectedIds.length) {
  errors.push(
    `Contact pathways: expected ${expectedIds.length} entries, got ${pathwayIds.length}`,
  );
}
const uniqueIds = new Set(pathwayIds);
if (uniqueIds.size !== pathwayIds.length) {
  errors.push('Contact pathways: duplicate ids');
}
for (const id of expectedIds) {
  if (!pathwayIds.includes(id)) {
    errors.push(`Contact pathways: missing required id: ${id}`);
  }
}
const sortedByIds = [...contactPathways]
  .sort((a, b) => a.priorityOrder - b.priorityOrder)
  .map((p) => p.id);
const expectedOrder = [...CONTACT_PATHWAY_IDS];
if (
  sortedByIds.length !== expectedOrder.length ||
  sortedByIds.some((id, i) => id !== expectedOrder[i])
) {
  errors.push(
    'Contact pathways: registry must be sorted by priorityOrder and match CONTACT_PATHWAY_IDS order',
  );
}

if (errors.length) {
  throw new Error(`Content validation failed:\n- ${errors.join('\n- ')}`);
}

console.log('Content validation passed.');

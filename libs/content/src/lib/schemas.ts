import { z } from 'zod';
import { locales } from '@joelklemmer/i18n';

const localeSchema = z.enum(locales);

const nonEmptyString = z.string().min(1);
const nonEmptyStringArray = z.array(nonEmptyString).min(1);
const dateStringSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'YYYY-MM-DD');

/** Case study frontmatter: institutional evidence with proofRefs and optional claimRefs. */
export const caseStudyFrontmatterSchema = z.object({
  id: nonEmptyString.optional(),
  title: nonEmptyString,
  date: dateStringSchema,
  locale: localeSchema.default('en'),
  slug: nonEmptyString,
  summary: nonEmptyString,
  context: nonEmptyString,
  constraints: nonEmptyStringArray,
  actions: nonEmptyStringArray,
  outcomes: nonEmptyStringArray,
  proofRefs: nonEmptyStringArray,
  claimRefs: z.array(nonEmptyString).optional(),
  tags: z.array(nonEmptyString).max(6).optional(),
  featured: z.boolean().optional(),
  order: z.number().optional(),
  canonical: nonEmptyString.optional(),
});

/** Stable case study ID: frontmatter.id if set, else slug. Must be unique across collection. */
export function getCaseStudyId(frontmatter: {
  id?: string;
  slug: string;
}): string {
  return frontmatter.id ?? frontmatter.slug;
}

const artifactTypeLike = z.string().min(1); // enum-like: Recovery plan summary, Report, etc.
export const publicRecordFrontmatterSchema = z.object({
  id: nonEmptyString.optional(),
  title: nonEmptyString,
  artifactType: artifactTypeLike,
  source: nonEmptyString,
  date: nonEmptyString,
  verificationNotes: nonEmptyString,
  claimSupported: nonEmptyString, // human-readable pointer label; linkage is via claim registry
  locale: localeSchema,
  slug: nonEmptyString,
  canonical: nonEmptyString.optional(),
});

/** Stable record ID: frontmatter.id if set, else slug. Must be unique across collection. */
export function getPublicRecordId(frontmatter: {
  id?: string;
  slug: string;
}): string {
  return frontmatter.id ?? frontmatter.slug;
}

/** Governed institutional page frontmatter (privacy, terms, accessibility, security). */
export const institutionalPageFrontmatterSchema = z
  .object({
    id: nonEmptyString,
    titleKey: nonEmptyString,
    descriptionKey: nonEmptyString,
    version: nonEmptyString,
    effectiveDate: dateStringSchema,
    lastReviewedDate: dateStringSchema,
    nextReviewDate: dateStringSchema,
    owner: nonEmptyString,
    jurisdiction: nonEmptyString,
    scope: nonEmptyString,
    contactEmail: nonEmptyString.optional(),
    accessibilityContactEmail: nonEmptyString.optional(),
    securityContactEmail: nonEmptyString.optional(),
    vulnerabilityDisclosureUrl: nonEmptyString.optional(),
    changelog: z.array(nonEmptyString).optional(),
  })
  .refine((d) => new Date(d.nextReviewDate) >= new Date(d.lastReviewedDate), {
    message: 'nextReviewDate must be >= lastReviewedDate',
    path: ['nextReviewDate'],
  })
  .refine((d) => new Date(d.effectiveDate) <= new Date(d.lastReviewedDate), {
    message: 'effectiveDate must be <= lastReviewedDate',
    path: ['effectiveDate'],
  });

export type InstitutionalPageFrontmatter = z.infer<
  typeof institutionalPageFrontmatterSchema
>;

/** @deprecated Use institutionalPageFrontmatterSchema for governed institutional pages. */
export const institutionalFrontmatterSchema = z.object({
  title: nonEmptyString,
  lastReviewedDate: nonEmptyString,
  locale: localeSchema,
  slug: nonEmptyString.optional(),
  canonical: nonEmptyString.optional(),
});

/** Book frontmatter: authority-verification only. proofRefs must reference Public Record IDs. */
const bookFormatEnum = z.enum([
  'Hardcover',
  'Paperback',
  'Kindle',
  'Audiobook',
  'eBook',
  'PDF',
]);
export const bookFrontmatterSchema = z.object({
  id: nonEmptyString.optional(),
  title: nonEmptyString,
  subtitle: nonEmptyString.optional(),
  author: nonEmptyString.optional(),
  publicationDate: nonEmptyString.regex(/^\d{4}-\d{2}-\d{2}$/, 'YYYY-MM-DD'),
  publisher: nonEmptyString.optional(),
  isbn10: nonEmptyString.optional(),
  isbn13: nonEmptyString.optional(),
  formats: z.array(bookFormatEnum).min(1),
  language: nonEmptyString,
  summary: nonEmptyString,
  proofRefs: nonEmptyStringArray,
  canonical: nonEmptyString.optional(),
  locale: localeSchema,
  slug: nonEmptyString,
  excerptRefs: z.array(nonEmptyString).optional(),
});

/** Stable book ID: frontmatter.id if set, else slug. Must be unique across collection. */
export function getBookId(frontmatter: { id?: string; slug: string }): string {
  return frontmatter.id ?? frontmatter.slug;
}

export type CaseStudyFrontmatter = z.infer<typeof caseStudyFrontmatterSchema>;
export type PublicRecordFrontmatter = z.infer<
  typeof publicRecordFrontmatterSchema
>;
export type InstitutionalFrontmatter = z.infer<
  typeof institutionalFrontmatterSchema
>;
export type BookFrontmatter = z.infer<typeof bookFrontmatterSchema>;

import { z } from 'zod';
import { locales } from '@joelklemmer/i18n';

const localeSchema = z.enum(locales);

const nonEmptyString = z.string().min(1);
const nonEmptyStringArray = z.array(nonEmptyString).min(1);

export const caseStudyFrontmatterSchema = z.object({
  title: nonEmptyString,
  context: nonEmptyStringArray,
  constraints: nonEmptyStringArray,
  actions: nonEmptyStringArray,
  outcomes: nonEmptyStringArray,
  proofRefs: nonEmptyStringArray,
  date: nonEmptyString.optional(),
  locale: localeSchema,
  slug: nonEmptyString,
  summary: nonEmptyString.optional(),
  canonical: nonEmptyString.optional(),
});

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
export function getPublicRecordId(frontmatter: { id?: string; slug: string }): string {
  return frontmatter.id ?? frontmatter.slug;
}

export const institutionalFrontmatterSchema = z.object({
  title: nonEmptyString,
  lastReviewedDate: nonEmptyString,
  locale: localeSchema,
  slug: nonEmptyString.optional(),
  canonical: nonEmptyString.optional(),
});

export type CaseStudyFrontmatter = z.infer<typeof caseStudyFrontmatterSchema>;
export type PublicRecordFrontmatter = z.infer<typeof publicRecordFrontmatterSchema>;
export type InstitutionalFrontmatter = z.infer<typeof institutionalFrontmatterSchema>;

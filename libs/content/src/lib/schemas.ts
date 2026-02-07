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

export const publicRecordFrontmatterSchema = z.object({
  title: nonEmptyString,
  claimSupported: nonEmptyString,
  artifactType: nonEmptyString,
  source: nonEmptyString,
  date: nonEmptyString,
  verificationNotes: nonEmptyString,
  locale: localeSchema,
  slug: nonEmptyString,
  id: nonEmptyString.optional(),
  canonical: nonEmptyString.optional(),
});

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

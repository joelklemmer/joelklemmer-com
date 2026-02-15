import path from 'node:path';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import matter from 'gray-matter';
import { z } from 'zod';
import { locales } from '@joelklemmer/i18n';
import { claimRegistry, contactPathways } from '@joelklemmer/content/validate';

const pageSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
});

const commonSchema = z
  .object({
    wordmark: z.string().min(1),
    tagline: z.string().min(1),
    languages: z.object({
      en: z.string().min(1),
      uk: z.string().min(1),
      es: z.string().min(1),
      he: z.string().min(1),
    }),
    a11y: z.object({
      skipToContent: z.string().min(1),
      headerLabel: z.string().min(1),
      navLabel: z.string().min(1),
      footerLabel: z.string().min(1),
      languageSwitcherLabel: z.string().min(1),
      languageSwitcherAction: z.string().min(1),
    }),
    fallbackNotice: z.object({
      title: z.string().min(1),
      body: z.string().min(1),
      linkLabel: z.string().min(1),
    }),
  })
  .passthrough();

const navSchema = z
  .object({
    home: z.string().min(1),
    brief: z.string().min(1),
    work: z.string().min(1),
    writing: z.string().min(1),
    proof: z.string().min(1),
    contact: z.string().min(1),
  })
  .passthrough();

const footerSchema = z
  .object({
    label: z.string().min(1),
    groups: z
      .object({
        institutional: z.string().min(1),
        context: z.string().min(1),
        legal: z.string().min(1),
      })
      .optional(),
    copyright: z.string().min(1).optional(),
    wcagStatement: z.string().min(1).optional(),
    links: z.object({
      media: z.string().min(1),
      'media-kit': z.string().min(1),
      press: z.string().min(1),
      bio: z.string().min(1),
      faq: z.string().min(1),
      now: z.string().min(1),
      privacy: z.string().min(1),
      terms: z.string().min(1),
      accessibility: z.string().min(1),
      security: z.string().min(1),
      cookies: z.string().min(1),
      preferences: z.string().min(1),
    }),
  })
  .passthrough();

const metaSchema = z
  .object({
    siteName: z.string().min(1),
    defaultTitle: z.string().min(1),
    defaultDescription: z.string().min(1),
    home: pageSchema,
    brief: pageSchema,
    work: pageSchema,
    operatingSystem: pageSchema,
    writing: pageSchema,
    books: pageSchema,
    contact: pageSchema,
    press: pageSchema,
    proof: pageSchema,
    bio: pageSchema,
    faq: pageSchema,
    now: pageSchema,
    mediaKit: pageSchema,
    privacy: pageSchema,
    terms: pageSchema,
    accessibility: pageSchema,
    security: pageSchema,
    cookies: pageSchema,
  })
  .passthrough();

const briefSchema = z
  .object({
    hero: z.object({ title: z.string().min(1), lede: z.string().min(1) }),
    identityScope: z.string().min(1),
    readPath: z.object({
      title: z.string().min(1),
      routes: z.array(
        z.object({ label: z.string().min(1), path: z.string().min(1) }),
      ),
    }),
    navigator: z.object({
      viewGrid: z.string().min(1),
      viewGraph: z.string().min(1),
      viewModeLabel: z.string().min(1),
      filterCategoryLegend: z.string().min(1),
      filterStrengthLegend: z.string().min(1),
      categoryAll: z.string().min(1),
      strengthAll: z.string().min(1),
      strengthMin: z.string().min(1),
      closePanel: z.string().min(1),
      viewInBrief: z.string().min(1),
      recordCount: z.string().min(1),
      caseStudyCount: z.string().min(1),
    }),
    claims: z.object({ title: z.string().min(1), lede: z.string().min(1) }),
    selectedOutcomes: z.object({
      title: z.string().min(1),
      items: z.array(z.string().min(1)),
    }),
    caseStudies: z.object({
      title: z.string().min(1),
      lede: z.string().min(1),
    }),
    publicRecordHighlights: z.object({
      title: z.string().min(1),
      lede: z.string().min(1),
    }),
    artifacts: z.object({
      title: z.string().min(1),
      lede: z.string().min(1),
      notPublished: z.string().min(1),
    }),
    contactPathway: z.object({
      title: z.string().min(1),
      linkLabel: z.string().min(1),
    }),
    aec: z.object({
      title: z.string().min(1),
      placeholder: z.string().min(1),
      intents: z.object({
        summarize_framework: z.string().min(1),
        trace_evidence_chain: z.string().min(1),
        compare_claims: z.string().min(1),
        explore_domain: z.string().min(1),
        extract_decision_model: z.string().min(1),
      }),
      submitLabel: z.string().min(1),
      collapseLabel: z.string().min(1),
      expandLabel: z.string().min(1),
      loadingLabel: z.string().min(1),
      linksLabel: z.string().min(1),
    }),
  })
  .passthrough();

const booksSchema = z
  .object({
    index: z.object({
      title: z.string().min(1),
      subtitle: z.string().min(1),
      listTitle: z.string().min(1),
      empty: z.string().min(1),
    }),
    entry: z.object({
      sections: z.object({
        metadata: z.string().min(1),
        verifiedReferences: z.string().min(1),
        availability: z.string().min(1),
        excerpts: z.string().min(1),
      }),
      labels: z.object({
        publicationDate: z.string().min(1),
        publisher: z.string().min(1),
        author: z.string().min(1),
        isbn10: z.string().min(1),
        isbn13: z.string().min(1),
        formats: z.string().min(1),
        language: z.string().min(1),
      }),
      verifiedReferencesEmpty: z.string().min(1),
    }),
  })
  .passthrough();

const publicRecordSchema = z
  .object({
    supportsClaims: z.object({
      heading: z.string().min(1),
      empty: z.string().min(1),
    }),
    referencedByCaseStudies: z.object({
      heading: z.string().min(1),
      empty: z.string().min(1),
    }),
    referencedByBooks: z.object({
      heading: z.string().min(1),
      empty: z.string().min(1),
    }),
    metadata: z.object({
      title: z.string().min(1),
      labels: z.object({
        type: z.string().min(1),
        date: z.string().min(1),
        source: z.string().min(1),
        verification: z.string().min(1),
        claimSupported: z.string().min(1),
        claimLink: z.string().min(1),
      }),
      claimLinkAction: z.string().min(1),
    }),
    index: z.object({
      type: z.string().min(1),
      date: z.string().min(1),
      source: z.string().min(1),
      verification: z.string().min(1),
      meta: z.string().min(1),
    }),
    verification: z
      .object({
        heading: z.string().min(1),
        method: z.string().min(1),
        confidence: z.string().min(1),
        verifiedDate: z.string().min(1),
      })
      .passthrough(),
    source: z
      .object({
        heading: z.string().min(1),
        type: z.string().min(1),
        name: z.string().min(1),
        url: z.string().min(1),
      })
      .passthrough(),
    attachments: z.object({
      heading: z.string().min(1),
      missing: z.string().min(1),
      copyHash: z.string().min(1),
      labels: z.object({}).passthrough(),
    }),
  })
  .passthrough();

const institutionalSchema = z
  .object({
    privacy: z.object({
      title: z.string().min(1),
      lede: z.string().min(1),
    }),
    terms: z.object({
      title: z.string().min(1),
      lede: z.string().min(1),
    }),
    accessibility: z.object({
      title: z.string().min(1),
      lede: z.string().min(1),
    }),
    security: z.object({
      title: z.string().min(1),
      lede: z.string().min(1),
    }),
    governance: z.object({
      heading: z.string().min(1),
      version: z.string().min(1),
      effectiveDate: z.string().min(1),
      lastReviewedDate: z.string().min(1),
      nextReviewDate: z.string().min(1),
      owner: z.string().min(1),
      jurisdiction: z.string().min(1),
      scope: z.string().min(1),
    }),
  })
  .passthrough();

const pathwayKeysSchema = z.object({
  label: z.string().min(1),
  description: z.string().min(1),
  subjectTemplate: z.string().min(1),
  cta: z.string().min(1),
});

const contentOSSchema = z
  .object({
    intents: z.object({
      home: z.object({
        tenSecond: z.string().min(1),
        sixtySecond: z.string().min(1),
      }),
      brief: z.object({
        tenSecond: z.string().min(1),
        sixtySecond: z.string().min(1),
      }),
      casestudies: z.object({
        tenSecond: z.string().min(1),
        sixtySecond: z.string().min(1),
      }),
      books: z.object({
        tenSecond: z.string().min(1),
        sixtySecond: z.string().min(1),
      }),
      publicrecord: z.object({
        tenSecond: z.string().min(1),
        sixtySecond: z.string().min(1),
      }),
      contact: z.object({
        tenSecond: z.string().min(1),
        sixtySecond: z.string().min(1),
      }),
    }),
  })
  .passthrough();

const contactSchema = z
  .object({
    title: z.string().min(1),
    lede: z.string().min(1),
    pathwaySelectorLabel: z.string().min(1),
    pathways: z.object({
      recruiting: pathwayKeysSchema,
      board: pathwayKeysSchema,
      media: pathwayKeysSchema,
      publicRecord: pathwayKeysSchema,
      general: pathwayKeysSchema,
    }),
    guidance: z.object({
      heading: z.string().min(1),
      bullets: z.array(z.string().min(1)),
    }),
    mailto: z.object({
      heading: z.string().min(1),
      buttonLabel: z.string().min(1),
      bodyTemplateLabel: z.string().min(1),
    }),
    requiredInfo: z.object({
      name: z.string().min(1),
      organization: z.string().min(1),
      role: z.string().min(1),
      reason: z.string().min(1),
      links: z.string().min(1),
      outlet: z.string().min(1),
      topic: z.string().min(1),
      deadline: z.string().min(1),
      recordUrl: z.string().min(1),
      proposedCorrection: z.string().min(1),
      evidence: z.string().min(1),
      message: z.string().min(1),
    }),
  })
  .passthrough();

const errors: string[] = [];
const messagesRoot = path.join(
  process.cwd(),
  'libs',
  'i18n',
  'src',
  'messages',
);

function readJson(filePath: string) {
  const raw = readFileSync(filePath, 'utf-8');
  return JSON.parse(raw) as unknown;
}

function getByPath(obj: unknown, pathStr: string): unknown {
  let current: unknown = obj;
  for (const part of pathStr.split('.')) {
    if (current == null || typeof current !== 'object') return undefined;
    current = (current as Record<string, unknown>)[part];
  }
  return current;
}

function validateNamespace(
  locale: string,
  namespace: string,
  schema: z.ZodSchema,
) {
  const filePath = path.join(messagesRoot, locale, `${namespace}.json`);
  const parsed = schema.safeParse(readJson(filePath));
  if (!parsed.success) {
    const details = parsed.error.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join('; ');
    errors.push(`${filePath}: ${details}`);
  }
}

function validateBriefClaimKeys() {
  for (const locale of locales) {
    const filePath = path.join(messagesRoot, locale, 'brief.json');
    const brief = readJson(filePath) as Record<string, unknown>;
    for (const claim of claimRegistry) {
      const label = getByPath(brief, claim.labelKey);
      const summary = getByPath(brief, claim.summaryKey);
      const categoryLabel = getByPath(
        brief,
        `claims.categories.${claim.category}`,
      );
      if (typeof label !== 'string' || !label.trim()) {
        errors.push(
          `${filePath}: missing or empty brief.${claim.labelKey} for claim ${claim.id}`,
        );
      }
      if (typeof summary !== 'string' || !summary.trim()) {
        errors.push(
          `${filePath}: missing or empty brief.${claim.summaryKey} for claim ${claim.id}`,
        );
      }
      if (typeof categoryLabel !== 'string' || !categoryLabel.trim()) {
        errors.push(
          `${filePath}: missing or empty brief.claims.categories.${claim.category} for claim ${claim.id}`,
        );
      }
    }
  }
}

function validateContactPathwayKeys() {
  for (const locale of locales) {
    const filePath = path.join(messagesRoot, locale, 'contact.json');
    const contact = readJson(filePath) as Record<string, unknown>;
    for (const pathway of contactPathways) {
      for (const key of [
        pathway.labelKey,
        pathway.descriptionKey,
        pathway.subjectTemplateKey,
        pathway.ctaKey,
      ]) {
        const value = getByPath(contact, key);
        if (typeof value !== 'string' || !value.trim()) {
          errors.push(
            `${filePath}: missing or empty contact.${key} for pathway ${pathway.id}`,
          );
        }
      }
    }
  }
}

function getPublicRecordAttachmentLabelKeys(): Set<string> {
  const contentRootCandidates = [
    path.join(process.cwd(), 'content'),
    path.join(process.cwd(), '..', '..', 'content'),
  ];
  const contentRoot =
    contentRootCandidates.find((c) => existsSync(c)) ??
    contentRootCandidates[0];
  const publicRecordDir = existsSync(path.join(contentRoot, 'public-record'))
    ? path.join(contentRoot, 'public-record')
    : path.join(contentRoot, 'proof');
  if (!existsSync(publicRecordDir)) return new Set();
  const files = readdirSync(publicRecordDir)
    .filter((e) => e.endsWith('.mdx'))
    .map((e) => path.join(publicRecordDir, e));
  const labelKeys = new Set<string>();
  for (const filePath of files) {
    const raw = readFileSync(filePath, 'utf-8');
    const { data } = matter(raw);
    const attachments = (data as { attachments?: Array<{ labelKey?: string }> })
      .attachments;
    if (Array.isArray(attachments)) {
      for (const att of attachments) {
        if (typeof att?.labelKey === 'string' && att.labelKey.trim()) {
          labelKeys.add(att.labelKey.trim());
        }
      }
    }
  }
  return labelKeys;
}

function validatePublicRecordAttachmentLabelKeys() {
  const labelKeys = getPublicRecordAttachmentLabelKeys();
  if (labelKeys.size === 0) return;
  for (const locale of locales) {
    const filePath = path.join(messagesRoot, locale, 'publicRecord.json');
    const publicRecord = readJson(filePath) as Record<string, unknown>;
    const labels = getByPath(publicRecord, 'attachments.labels');
    const labelsObj =
      labels != null && typeof labels === 'object' && !Array.isArray(labels)
        ? (labels as Record<string, unknown>)
        : {};
    for (const key of labelKeys) {
      const value = labelsObj[key];
      if (typeof value !== 'string' || !value.trim()) {
        errors.push(
          `${filePath}: missing or empty publicRecord.attachments.labels.${key} (used by a public record entry)`,
        );
      }
    }
  }
}

locales.forEach((locale) => {
  validateNamespace(locale, 'common', commonSchema);
  validateNamespace(locale, 'nav', navSchema);
  validateNamespace(locale, 'footer', footerSchema);
  validateNamespace(locale, 'meta', metaSchema);
  validateNamespace(locale, 'brief', briefSchema);
  validateNamespace(locale, 'books', booksSchema);
  validateNamespace(locale, 'publicRecord', publicRecordSchema);
  validateNamespace(locale, 'institutional', institutionalSchema);
  validateNamespace(locale, 'contact', contactSchema);
  validateNamespace(locale, 'contentOS', contentOSSchema);
});
validateBriefClaimKeys();
validateContactPathwayKeys();
validatePublicRecordAttachmentLabelKeys();

if (errors.length) {
  throw new Error(`i18n validation failed:\n- ${errors.join('\n- ')}`);
}

console.log('i18n validation passed.');

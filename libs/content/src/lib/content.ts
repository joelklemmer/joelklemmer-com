import path from 'node:path';
import { existsSync } from 'node:fs';
import { readdir, readFile } from 'node:fs/promises';
import matter from 'gray-matter';
import { compileMDX } from 'next-mdx-remote/rsc';
import { z } from 'zod';
import { defaultLocale, type AppLocale } from '@joelklemmer/i18n';
import {
  bookFrontmatterSchema,
  briefFrontmatterSchema,
  caseStudyFrontmatterSchema,
  frameworkFrontmatterSchema,
  getBookId,
  getCaseStudyId,
  getFrameworkId,
  getPublicRecordId,
  institutionalPageFrontmatterSchema,
  publicRecordFrontmatterSchema,
  type BookFrontmatter,
  type BriefFrontmatter,
  type CaseStudyFrontmatter,
  type FrameworkFrontmatter,
  type InstitutionalPageFrontmatter,
  type PublicRecordFrontmatter,
} from './schemas';

const contentRootCandidates = [
  path.join(process.cwd(), 'content'),
  path.join(process.cwd(), '..', '..', 'content'),
];
const contentRoot =
  contentRootCandidates.find((candidate) => existsSync(candidate)) ??
  contentRootCandidates[0];

export interface WritingFrontmatter {
  title: string;
  date: string;
  summary: string;
  locale: AppLocale;
  slug: string;
  draft: boolean;
  tags?: string[];
  canonical?: string;
  featured?: boolean;
  publicationContext?: string;
  isbn?: string;
  publisher?: string;
  distribution?: Array<{ label: string; url: string }>;
  excerpt?: string;
}

export interface ProofFrontmatter extends PublicRecordFrontmatter {
  summary?: string;
}

export interface PressFrontmatter {
  title: string;
  date: string;
  summary: string;
  locale: AppLocale;
  slug: string;
}

export interface StaticPageFrontmatter {
  title: string;
  date: string;
  summary: string;
  locale: AppLocale;
  slug: string;
}

export interface OperatingSystemFrontmatter {
  title: string;
  date: string;
  summary: string;
  locale: AppLocale;
  slug: string;
}

export interface ContentEntry<T> {
  frontmatter: T;
  content: string;
}

export interface LocalizedContentEntry<T> extends ContentEntry<T> {
  isFallback: boolean;
}

async function getMdxFiles(dir: string) {
  const entries = await readdir(dir, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith('.mdx'))
    .map((entry) => path.join(dir, entry.name));
}

async function readMdxFile<T>(filePath: string) {
  const raw = await readFile(filePath, 'utf-8');
  const { content, data } = matter(raw);
  return {
    content,
    data: data as T,
  };
}

function resolveLocalizedEntry<T extends { locale: AppLocale }>(
  entry: ContentEntry<T>,
  locale: AppLocale,
) {
  if (
    entry.frontmatter.locale !== locale &&
    entry.frontmatter.locale !== defaultLocale
  ) {
    return null;
  }

  return {
    ...entry,
    isFallback: entry.frontmatter.locale !== locale,
  } satisfies LocalizedContentEntry<T>;
}

function filterByLocale<T extends { locale: AppLocale }>(
  entries: ContentEntry<T>[],
  locale: AppLocale,
) {
  const localized = entries.filter(
    (entry) => entry.frontmatter.locale === locale,
  );
  return localized.length
    ? localized
    : entries.filter((entry) => entry.frontmatter.locale === defaultLocale);
}

function sortByDateDesc<T extends { date?: string }>(
  entries: ContentEntry<T>[],
) {
  return [...entries].sort(
    (a, b) =>
      new Date(b.frontmatter.date ?? 0).getTime() -
      new Date(a.frontmatter.date ?? 0).getTime(),
  );
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
    throw new Error(`Invalid frontmatter in ${filePath}: ${details}`);
  }
  return parsed.data;
}

function resolvePublicRecordDir() {
  const preferred = path.join(contentRoot, 'public-record');
  if (existsSync(preferred)) {
    return preferred;
  }
  return path.join(contentRoot, 'proof');
}

export async function getWritingEntries() {
  const dir = path.join(contentRoot, 'writing');
  const files = await getMdxFiles(dir);
  const entries = await Promise.all(
    files.map(async (filePath) => {
      const { content, data } = await readMdxFile<WritingFrontmatter>(filePath);
      return { frontmatter: data, content };
    }),
  );

  return entries.filter((entry) => !entry.frontmatter.draft);
}

export async function getWritingPosts(locale: AppLocale) {
  const entries = await getWritingEntries();
  return sortByDateDesc(filterByLocale(entries, locale));
}

export async function getWritingPost(locale: AppLocale, slug: string) {
  const entries = await getWritingEntries();
  const localized = filterByLocale(entries, locale);
  return localized.find((entry) => entry.frontmatter.slug === slug) ?? null;
}

export async function getWritingSlugs() {
  const entries = await getWritingEntries();
  return Array.from(new Set(entries.map((entry) => entry.frontmatter.slug)));
}

export async function getPublicRecordEntries() {
  const dir = resolvePublicRecordDir();
  const files = await getMdxFiles(dir);
  return Promise.all(
    files.map(async (filePath) => {
      const { content, data } =
        await readMdxFile<PublicRecordFrontmatter>(filePath);
      const frontmatter = validateFrontmatter(
        publicRecordFrontmatterSchema,
        data,
        filePath,
      );
      return { frontmatter, content };
    }),
  );
}

export async function getPublicRecordList(locale: AppLocale) {
  const entries = await getPublicRecordEntries();
  return sortByDateDesc(filterByLocale(entries, locale));
}

export async function getPublicRecordEntry(locale: AppLocale, slug: string) {
  const entries = await getPublicRecordEntries();
  const localized = filterByLocale(entries, locale);
  return localized.find((entry) => entry.frontmatter.slug === slug) ?? null;
}

/** Get entry by stable recordId or slug. */
export async function getPublicRecordByIdOrSlug(
  locale: AppLocale,
  idOrSlug: string,
) {
  const entries = await getPublicRecordEntries();
  const localized = filterByLocale(entries, locale);
  return (
    localized.find(
      (entry) =>
        entry.frontmatter.slug === idOrSlug ||
        getPublicRecordId(entry.frontmatter) === idOrSlug,
    ) ?? null
  );
}

export async function getPublicRecordSlugs() {
  const entries = await getPublicRecordEntries();
  return Array.from(new Set(entries.map((entry) => entry.frontmatter.slug)));
}

/** All stable record IDs (id ?? slug) across the collection, for integrity checks. */
export async function getAllPublicRecordIds(): Promise<string[]> {
  const entries = await getPublicRecordEntries();
  return entries.map((e) => getPublicRecordId(e.frontmatter));
}

export async function getPressKit(locale: AppLocale) {
  const filePath = path.join(contentRoot, 'press', 'press-kit.mdx');
  const { content, data } = await readMdxFile<PressFrontmatter>(filePath);
  return resolveLocalizedEntry({ frontmatter: data, content }, locale);
}

export async function getMediaKit(locale: AppLocale) {
  const filePath = path.join(contentRoot, 'press', 'media-kit.mdx');
  try {
    const { content, data } =
      await readMdxFile<StaticPageFrontmatter>(filePath);
    return resolveLocalizedEntry({ frontmatter: data, content }, locale);
  } catch {
    return null;
  }
}

const INSTITUTIONAL_IDS = [
  'privacy',
  'terms',
  'accessibility',
  'security',
] as const;

export function getInstitutionalPageIds(): readonly string[] {
  return INSTITUTIONAL_IDS;
}

export async function getInstitutionalPages(locale: AppLocale) {
  const entries = await Promise.all(
    INSTITUTIONAL_IDS.map((id) => getInstitutionalPage(locale, id)),
  );
  return entries.filter((e): e is NonNullable<typeof e> => e != null);
}

export async function getInstitutionalPage(
  locale: AppLocale,
  id: string,
): Promise<LocalizedContentEntry<InstitutionalPageFrontmatter> | null> {
  const filePath = path.join(contentRoot, 'institutional', `${id}.mdx`);
  try {
    const { content, data } =
      await readMdxFile<InstitutionalPageFrontmatter>(filePath);
    const frontmatter = validateFrontmatter(
      institutionalPageFrontmatterSchema,
      data,
      filePath,
    );
    const isFallback = locale !== defaultLocale;
    return { frontmatter, content, isFallback };
  } catch {
    return null;
  }
}

export async function getOperatingSystem(locale: AppLocale) {
  const filePath = path.join(
    contentRoot,
    'operating-system',
    'operating-system.mdx',
  );
  try {
    const { content, data } =
      await readMdxFile<OperatingSystemFrontmatter>(filePath);
    if (data.locale !== locale && data.locale !== defaultLocale) {
      return null;
    }
    return { frontmatter: data, content, isFallback: data.locale !== locale };
  } catch {
    return null;
  }
}

/** Brief page content: optional quantified outcomes. Returns null if no content/brief or no matching locale. */
export async function getBriefContent(locale: AppLocale): Promise<{
  quantifiedOutcomes: BriefFrontmatter['quantifiedOutcomes'];
} | null> {
  const dir = path.join(contentRoot, 'brief');
  if (!existsSync(dir)) return null;
  const files = await getMdxFiles(dir);
  if (files.length === 0) return null;
  const filePath = files[0];
  const { data } = await readMdxFile<BriefFrontmatter>(filePath);
  const frontmatter = validateFrontmatter(
    briefFrontmatterSchema,
    data,
    filePath,
  );
  if (frontmatter.locale != null && frontmatter.locale !== locale) {
    return null;
  }
  return {
    quantifiedOutcomes: frontmatter.quantifiedOutcomes ?? undefined,
  };
}

export async function getCaseStudyEntries() {
  const dir = path.join(contentRoot, 'case-studies');
  const files = await getMdxFiles(dir);
  const entries = await Promise.all(
    files.map(async (filePath) => {
      const { content, data } =
        await readMdxFile<CaseStudyFrontmatter>(filePath);
      const frontmatter = validateFrontmatter(
        caseStudyFrontmatterSchema,
        data,
        filePath,
      );
      return { frontmatter, content };
    }),
  );

  return entries;
}

export async function getCaseStudyList(locale: AppLocale) {
  const entries = await getCaseStudyEntries();
  return sortByDateDesc(filterByLocale(entries, locale));
}

/** @deprecated Use getCaseStudyList. */
export async function getCaseStudies(locale: AppLocale) {
  return getCaseStudyList(locale);
}

export async function getCaseStudyEntry(locale: AppLocale, slug: string) {
  const entries = await getCaseStudyEntries();
  const localized = filterByLocale(entries, locale);
  return localized.find((entry) => entry.frontmatter.slug === slug) ?? null;
}

/** @deprecated Use getCaseStudyEntry. */
export async function getCaseStudy(locale: AppLocale, slug: string) {
  return getCaseStudyEntry(locale, slug);
}

export async function getCaseStudyByIdOrSlug(
  locale: AppLocale,
  idOrSlug: string,
) {
  const entries = await getCaseStudyEntries();
  const localized = filterByLocale(entries, locale);
  return (
    localized.find(
      (entry) =>
        entry.frontmatter.slug === idOrSlug ||
        getCaseStudyId(entry.frontmatter) === idOrSlug,
    ) ?? null
  );
}

export async function getCaseStudySlugs() {
  const entries = await getCaseStudyEntries();
  return Array.from(new Set(entries.map((entry) => entry.frontmatter.slug)));
}

/** All stable case study IDs (id ?? slug) across the collection, for integrity checks. */
export async function getAllCaseStudyIds(): Promise<string[]> {
  const entries = await getCaseStudyEntries();
  return entries.map((e) => getCaseStudyId(e.frontmatter));
}

/** Case studies that reference this public record (proofRefs). Returns up to 6 for display. */
export async function getCaseStudiesByRecordId(
  recordId: string,
  limit = 6,
): Promise<Array<{ slug: string; title: string }>> {
  const entries = await getCaseStudyEntries();
  const referring = entries.filter((e) =>
    e.frontmatter.proofRefs.includes(recordId),
  );
  return referring.slice(0, limit).map((e) => ({
    slug: e.frontmatter.slug,
    title: e.frontmatter.title,
  }));
}

/** Case studies that reference this claim (claimRefs). Returns up to 6 for display. */
export async function getCaseStudiesByClaimId(
  claimId: string,
  limit = 6,
): Promise<Array<{ slug: string; title: string }>> {
  const entries = await getCaseStudyEntries();
  const referring = entries.filter((e) =>
    e.frontmatter.claimRefs?.includes(claimId),
  );
  return referring.slice(0, limit).map((e) => ({
    slug: e.frontmatter.slug,
    title: e.frontmatter.title,
  }));
}

/** Map of claimId -> case studies referencing that claim. Single pass over case studies. */
export async function getCaseStudiesByClaimIdMap(
  claimIds: string[],
  limitPerClaim = 6,
): Promise<Map<string, Array<{ slug: string; title: string }>>> {
  const entries = await getCaseStudyEntries();
  const map = new Map<string, Array<{ slug: string; title: string }>>();
  for (const claimId of claimIds) {
    map.set(claimId, []);
  }
  for (const e of entries) {
    const refs = e.frontmatter.claimRefs ?? [];
    const item = {
      slug: e.frontmatter.slug,
      title: e.frontmatter.title,
    };
    for (const claimId of refs) {
      if (!map.has(claimId)) continue;
      const list = map.get(claimId)!;
      if (list.length < limitPerClaim) list.push(item);
    }
  }
  return map;
}

// ——— Books ———

export async function getBookEntries() {
  const dir = path.join(contentRoot, 'books');
  if (!existsSync(dir)) {
    return [];
  }
  const files = await getMdxFiles(dir);
  const entries = await Promise.all(
    files.map(async (filePath) => {
      const { content, data } = await readMdxFile<BookFrontmatter>(filePath);
      const frontmatter = validateFrontmatter(
        bookFrontmatterSchema,
        data,
        filePath,
      );
      return { frontmatter, content };
    }),
  );
  return entries;
}

export async function getBookList(locale: AppLocale) {
  const entries = await getBookEntries();
  const localized = filterByLocale(entries, locale);
  return [...localized].sort(
    (a, b) =>
      new Date(b.frontmatter.publicationDate).getTime() -
      new Date(a.frontmatter.publicationDate).getTime(),
  );
}

export async function getBookEntry(locale: AppLocale, slug: string) {
  const entries = await getBookEntries();
  const localized = filterByLocale(entries, locale);
  return localized.find((entry) => entry.frontmatter.slug === slug) ?? null;
}

/** Get book by stable bookId or slug. */
export async function getBookByIdOrSlug(locale: AppLocale, idOrSlug: string) {
  const entries = await getBookEntries();
  const localized = filterByLocale(entries, locale);
  return (
    localized.find(
      (entry) =>
        entry.frontmatter.slug === idOrSlug ||
        getBookId(entry.frontmatter) === idOrSlug,
    ) ?? null
  );
}

export async function getBookSlugs() {
  const entries = await getBookEntries();
  return Array.from(new Set(entries.map((entry) => entry.frontmatter.slug)));
}

/** All stable book IDs (id ?? slug) across the collection. */
export async function getAllBookIds(): Promise<string[]> {
  const entries = await getBookEntries();
  return entries.map((e) => getBookId(e.frontmatter));
}

// ——— Frameworks (Doctrine) ———

export async function getFrameworkEntries() {
  const dir = path.join(contentRoot, 'frameworks');
  if (!existsSync(dir)) {
    return [];
  }
  const files = await getMdxFiles(dir);
  const entries = await Promise.all(
    files.map(async (filePath) => {
      const { content, data } =
        await readMdxFile<FrameworkFrontmatter>(filePath);
      const frontmatter = validateFrontmatter(
        frameworkFrontmatterSchema,
        data,
        filePath,
      );
      return { frontmatter, content };
    }),
  );
  return entries.filter((e) => e.frontmatter.status === 'active');
}

export async function getFrameworkList(_locale?: AppLocale) {
  const entries = await getFrameworkEntries();
  return [...entries].sort(
    (a, b) =>
      new Date(b.frontmatter.updatedDate).getTime() -
      new Date(a.frontmatter.updatedDate).getTime(),
  );
}

export async function getFrameworkById(id: string) {
  const entries = await getFrameworkEntries();
  return entries.find((e) => getFrameworkId(e.frontmatter) === id) ?? null;
}

/** All stable framework IDs across the collection. */
export async function getAllFrameworkIds(): Promise<string[]> {
  const entries = await getFrameworkEntries();
  return entries.map((e) => getFrameworkId(e.frontmatter));
}

/** Books that reference this public record (proofRefs). Returns up to 6 for display. */
export async function getBooksByRecordId(
  recordId: string,
  limit = 6,
): Promise<Array<{ slug: string; title: string }>> {
  const entries = await getBookEntries();
  const referring = entries.filter((e) =>
    e.frontmatter.proofRefs.includes(recordId),
  );
  return referring.slice(0, limit).map((e) => ({
    slug: e.frontmatter.slug,
    title: e.frontmatter.title,
  }));
}

export async function renderMdx(source: string) {
  const compiled = await compileMDX({
    source,
    options: {
      parseFrontmatter: false,
    },
  });

  return compiled.content;
}

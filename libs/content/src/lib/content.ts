import path from 'node:path';
import { existsSync } from 'node:fs';
import { readdir, readFile } from 'node:fs/promises';
import matter from 'gray-matter';
import { compileMDX } from 'next-mdx-remote/rsc';
import { z } from 'zod';
import { defaultLocale, type AppLocale } from '@joelklemmer/i18n';
import {
  bookFrontmatterSchema,
  caseStudyFrontmatterSchema,
  getBookId,
  getPublicRecordId,
  institutionalPageFrontmatterSchema,
  publicRecordFrontmatterSchema,
  type BookFrontmatter,
  type CaseStudyFrontmatter,
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

export async function getCaseStudies(locale: AppLocale) {
  const entries = await getCaseStudyEntries();
  return sortByDateDesc(filterByLocale(entries, locale));
}

export async function getCaseStudy(locale: AppLocale, slug: string) {
  const entries = await getCaseStudyEntries();
  const localized = filterByLocale(entries, locale);
  return localized.find((entry) => entry.frontmatter.slug === slug) ?? null;
}

export async function getCaseStudySlugs() {
  const entries = await getCaseStudyEntries();
  return Array.from(new Set(entries.map((entry) => entry.frontmatter.slug)));
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

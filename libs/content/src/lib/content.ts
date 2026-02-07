import path from 'node:path';
import { existsSync } from 'node:fs';
import { readdir, readFile } from 'node:fs/promises';
import matter from 'gray-matter';
import { compileMDX } from 'next-mdx-remote/rsc';
import { defaultLocale, type AppLocale } from '@joelklemmer/i18n';

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
}

export interface ProofFrontmatter {
  claim: string;
  evidenceType: string;
  date: string;
  locale: AppLocale;
  slug: string;
  summary: string;
  sourceLabel?: string;
  sourceUrl?: string;
  artifactRef?: string;
  jurisdiction?: string;
  verificationNotes?: string;
}

export interface PressFrontmatter {
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

function sortByDateDesc<T extends { date: string }>(
  entries: ContentEntry<T>[],
) {
  return [...entries].sort(
    (a, b) =>
      new Date(b.frontmatter.date).getTime() -
      new Date(a.frontmatter.date).getTime(),
  );
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

export async function getProofEntries() {
  const dir = path.join(contentRoot, 'proof');
  const files = await getMdxFiles(dir);
  return Promise.all(
    files.map(async (filePath) => {
      const { content, data } = await readMdxFile<ProofFrontmatter>(filePath);
      return { frontmatter: data, content };
    }),
  );
}

export async function getProofList(locale: AppLocale) {
  const entries = await getProofEntries();
  return sortByDateDesc(filterByLocale(entries, locale));
}

export async function getProofEntry(locale: AppLocale, slug: string) {
  const entries = await getProofEntries();
  const localized = filterByLocale(entries, locale);
  return localized.find((entry) => entry.frontmatter.slug === slug) ?? null;
}

export async function getProofSlugs() {
  const entries = await getProofEntries();
  return Array.from(new Set(entries.map((entry) => entry.frontmatter.slug)));
}

export async function getPressKit(locale: AppLocale) {
  const filePath = path.join(contentRoot, 'press', 'press-kit.mdx');
  const { content, data } = await readMdxFile<PressFrontmatter>(filePath);
  if (data.locale !== locale && data.locale !== defaultLocale) {
    return null;
  }

  return { frontmatter: data, content };
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
    return { frontmatter: data, content };
  } catch {
    return null;
  }
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

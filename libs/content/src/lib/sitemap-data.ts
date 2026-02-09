/**
 * Sync, lightweight slug getters for sitemap building and validation.
 * Uses only fs + gray-matter; does not import content.ts (no MDX compile).
 */
import path from 'node:path';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import matter from 'gray-matter';

const contentRootCandidates = [
  path.join(process.cwd(), 'content'),
  path.join(process.cwd(), '..', '..', 'content'),
];
const contentRoot =
  contentRootCandidates.find((c) => existsSync(c)) ?? contentRootCandidates[0];

function getMdxFiles(dir: string): string[] {
  if (!existsSync(dir)) {
    return [];
  }
  return readdirSync(dir)
    .filter((name) => name.endsWith('.mdx'))
    .map((name) => path.join(dir, name));
}

function getSlugsFromDir(dir: string): string[] {
  const files = getMdxFiles(dir);
  const slugs: string[] = [];
  for (const filePath of files) {
    try {
      const raw = readFileSync(filePath, 'utf-8');
      const { data } = matter(raw);
      const slug = data?.slug;
      if (typeof slug === 'string' && slug.trim()) {
        slugs.push(slug.trim());
      }
    } catch {
      // skip invalid files
    }
  }
  return slugs;
}

function resolvePublicRecordDir(): string {
  const preferred = path.join(contentRoot, 'public-record');
  if (existsSync(preferred)) {
    return preferred;
  }
  return path.join(contentRoot, 'proof');
}

/** Sync: slugs of public record entries (from public-record or proof dir). */
export function getPublicRecordSlugsSync(): string[] {
  const dir = resolvePublicRecordDir();
  return Array.from(new Set(getSlugsFromDir(dir)));
}

/** Sync: slugs of case study entries. */
export function getCaseStudySlugsSync(): string[] {
  const dir = path.join(contentRoot, 'case-studies');
  return Array.from(new Set(getSlugsFromDir(dir)));
}

/** Sync: slugs of book entries. */
export function getBookSlugsSync(): string[] {
  const dir = path.join(contentRoot, 'books');
  if (!existsSync(dir)) {
    return [];
  }
  return Array.from(new Set(getSlugsFromDir(dir)));
}

/** Sync: slugs of writing posts (excludes draft). */
export function getWritingSlugsSync(): string[] {
  const dir = path.join(contentRoot, 'writing');
  const files = getMdxFiles(dir);
  const slugs: string[] = [];
  for (const filePath of files) {
    try {
      const raw = readFileSync(filePath, 'utf-8');
      const { data } = matter(raw);
      if (data?.draft === true) continue;
      const slug = data?.slug;
      if (typeof slug === 'string' && slug.trim()) {
        slugs.push(slug.trim());
      }
    } catch {
      // skip invalid files
    }
  }
  return Array.from(new Set(slugs));
}

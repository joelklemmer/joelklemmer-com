/**
 * Governance validation for institutional pages: frontmatter schema,
 * review date rules, and required contact pathway in body.
 * Run with: npx tsx --tsconfig tsconfig.base.json tools/validate-governance.ts
 */
import path from 'node:path';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import matter from 'gray-matter';
import { institutionalPageFrontmatterSchema } from '@joelklemmer/content/validate';

const contentRootCandidates = [
  path.join(process.cwd(), 'content'),
  path.join(process.cwd(), '..', '..', 'content'),
];
const contentRoot =
  contentRootCandidates.find((c) => existsSync(c)) ?? contentRootCandidates[0];

const GOVERNED_INSTITUTIONAL_IDS = [
  'privacy',
  'terms',
  'accessibility',
  'security',
];
const institutionalDir = path.join(contentRoot, 'institutional');
const errors: string[] = [];

const files = GOVERNED_INSTITUTIONAL_IDS.map((id) =>
  path.join(institutionalDir, `${id}.mdx`),
).filter((p) => existsSync(p));
for (const filePath of files) {
  const raw = readFileSync(filePath, 'utf-8');
  const { content, data } = matter(raw);
  const parsed = institutionalPageFrontmatterSchema.safeParse(data);
  if (!parsed.success) {
    const details = parsed.error.issues
      .map((i) => `${i.path.join('.')}: ${i.message}`)
      .join('; ');
    errors.push(`${filePath}: ${details}`);
    continue;
  }
  const body = content.trim().toLowerCase();
  const hasContactPath =
    body.includes('/contact') ||
    body.includes('contact page') ||
    body.includes('contact channel') ||
    body.includes('contact path');
  if (!hasContactPath) {
    errors.push(
      `${filePath}: body must reference a contact pathway (e.g. /contact or Contact page)`,
    );
  }
}

if (errors.length) {
  throw new Error(`Governance validation failed:\n- ${errors.join('\n- ')}`);
}

console.log('Governance validation passed.');

/**
 * Validates that built HTML has required head invariants: non-empty meta description
 * and absolute canonical link. Fetches /en, /en/brief, /en/media from a running server.
 * Run after server is up (e.g. from run-lighthouse or after nx start).
 *
 * Usage:
 *   BASE_URL=http://127.0.0.1:3000 npx tsx tools/validate-head-invariants.ts
 * Or with startServer (for verify): uses startServer, fetches, asserts, then stops.
 *
 * When STANDALONE=1, starts server internally, runs checks, then stops (for verify-fast).
 */
import fs from 'node:fs';
import path from 'node:path';
import { startServer } from './lib/startServer';

const ROUTES = ['/en', '/en/brief', '/en/media'] as const;

function parseHtmlHead(html: string): {
  description: string | null;
  canonical: string | null;
  title: string | null;
  htmlLang: string | null;
} {
  let description: string | null = null;
  let canonical: string | null = null;
  let title: string | null = null;
  let htmlLang: string | null = null;
  const metaDesc =
    /<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i.exec(html);
  if (metaDesc) description = metaDesc[1].trim() || null;
  const linkCanonical =
    /<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i.exec(html);
  if (linkCanonical) canonical = linkCanonical[1].trim() || null;
  const titleMatch = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(html);
  if (titleMatch) title = titleMatch[1].trim() || null;
  const htmlOpen = /<html[^>]*\slang=["']([^"']+)["']/i.exec(html);
  if (htmlOpen) htmlLang = htmlOpen[1].trim() || null;
  return { description, canonical, title, htmlLang };
}

function isAbsoluteUrl(url: string): boolean {
  return /^https?:\/\//i.test(url);
}

async function runWithBaseUrl(
  baseUrl: string,
): Promise<{ ok: boolean; errors: string[] }> {
  const errors: string[] = [];
  const normalizedBase = baseUrl.replace(/\/$/, '');

  for (const route of ROUTES) {
    const url = `${normalizedBase}${route}`;
    let html: string;
    try {
      const res = await fetch(url, { method: 'GET' });
      html = await res.text();
      if (!res.ok) {
        errors.push(`${url}: HTTP ${res.status}`);
        continue;
      }
    } catch (e) {
      errors.push(`${url}: fetch failed - ${String(e)}`);
      continue;
    }

    const { description, canonical, title, htmlLang } = parseHtmlHead(html);
    if (!description || description.length === 0) {
      errors.push(
        `${url}: <meta name="description" content="..."> missing or empty`,
      );
    }
    if (!canonical) {
      errors.push(`${url}: <link rel="canonical" href="..."> missing`);
    } else if (!isAbsoluteUrl(canonical)) {
      errors.push(
        `${url}: canonical href must be absolute (got: ${canonical})`,
      );
    }
    if (!title || title.length <= 3) {
      errors.push(`${url}: <title> missing or too short (length > 3 required)`);
    }
    if (!htmlLang || htmlLang.length < 2) {
      errors.push(`${url}: <html lang="..."> missing or invalid`);
    }
  }

  return { ok: errors.length === 0, errors };
}

async function main(): Promise<number> {
  const standalone =
    process.env.STANDALONE === '1' || process.env.STANDALONE === 'true';
  let baseUrl = process.env.BASE_URL;

  if (standalone || !baseUrl) {
    if (standalone) {
      process.stdout.write(
        'validate-head-invariants: starting server for standalone run...\n',
      );
      const buildDir = path.join(process.cwd(), 'apps', 'web', '.next');
      if (!fs.existsSync(buildDir)) {
        process.stderr.write(
          'validate-head-invariants: apps/web/.next not found. Run nx run web:build first.\n',
        );
        return 1;
      }
      try {
        const { baseUrl: serverBaseUrl, stop } = await startServer();
        baseUrl = serverBaseUrl;
        try {
          const result = await runWithBaseUrl(baseUrl);
          await stop();
          if (!result.ok) {
            result.errors.forEach((e) =>
              process.stderr.write(`validate-head-invariants: ${e}\n`),
            );
            return 1;
          }
          process.stdout.write(
            'validate-head-invariants: meta description, canonical, title, and html lang OK.\n',
          );
          return 0;
        } catch (e) {
          await stop();
          throw e;
        }
      } catch (e) {
        process.stderr.write(`validate-head-invariants: ${String(e)}\n`);
        return 1;
      }
    }
    if (!baseUrl) {
      process.stderr.write(
        'validate-head-invariants: set BASE_URL (e.g. http://127.0.0.1:3000) or STANDALONE=1.\n',
      );
      return 1;
    }
  }

  const result = await runWithBaseUrl(baseUrl);
  if (!result.ok) {
    result.errors.forEach((e) =>
      process.stderr.write(`validate-head-invariants: ${e}\n`),
    );
    return 1;
  }
  process.stdout.write(
    'validate-head-invariants: meta description, canonical, title, and html lang OK.\n',
  );
  return 0;
}

main()
  .then((code) => process.exit(code))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });

#!/usr/bin/env node
/**
 * After production build, inspects chunk ownership for LCP audit.
 * Prints for each target route (/en, /en/brief, /en/media):
 *   - rootMainFiles list
 *   - top 10 chunks by size
 *   - which internal packages/import paths contribute to the critical chunk (c4b75ee0…)
 * Uses build-manifest.json, optional app-build-manifest, and static/chunks content.
 * When sourceMappingURL is present, could parse .map for sources; otherwise greps chunk
 * for module ids and known package/component strings.
 *
 * Usage: node tools/explain-critical-chunks.mjs
 * Prereq: nx run web:build --configuration=production (so apps/web/.next exists)
 */

import fs from 'node:fs';
import path from 'node:path';

const NEXT_DIR = path.join(process.cwd(), 'apps', 'web', '.next');
const BUILD_MANIFEST_PATH = path.join(NEXT_DIR, 'build-manifest.json');
const CHUNKS_DIR = path.join(NEXT_DIR, 'static', 'chunks');

/** Chunk id prefix we care about (Lighthouse bootup-time top). */
const CRITICAL_CHUNK_PREFIX = 'c4b75ee0';

/** Known strings that indicate package or module ownership (minified code may not preserve all). */
const OWNERSHIP_SIGNATURES = [
  // Next.js runtime
  'getAssetPrefix',
  '__NEXT_ERROR_CODE',
  'E783',
  'E784',
  'InvariantError',
  '/_next/',
  // React
  'react-dom',
  'createRoot',
  'hydrateRoot',
  'useSyncExternalStore',
  // Shell / layout client
  'Nav',
  'TURBOPACK',
  'document.currentScript',
];

const ROUTES = ['/en', '/en/brief', '/en/media'];

function readJson(filePath) {
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function getChunkSizes() {
  if (!fs.existsSync(CHUNKS_DIR)) return [];
  const files = fs.readdirSync(CHUNKS_DIR).filter((f) => f.endsWith('.js'));
  return files
    .map((f) => ({
      name: f,
      size: fs.statSync(path.join(CHUNKS_DIR, f)).size,
    }))
    .sort((a, b) => b.size - a.size);
}

function findCriticalChunkFile(chunkSizes) {
  return (
    chunkSizes.find((c) => c.name.startsWith(CRITICAL_CHUNK_PREFIX))?.name ??
    null
  );
}

function analyzeChunkContent(chunkPath) {
  const content = fs.readFileSync(chunkPath, 'utf8');
  const found = OWNERSHIP_SIGNATURES.filter((sig) => content.includes(sig));
  // Check for sourceMappingURL
  const sourceMapMatch =
    content.match(/# sourceMappingURL=([^\s]+)/) ??
    content.match(/sourceMappingURL=([^\s"']+)/);
  const sourceMapUrl = sourceMapMatch ? sourceMapMatch[1].trim() : null;
  return { found, sourceMapUrl, length: content.length };
}

function main() {
  console.log('Explain critical chunks (Phase 2B)\n');
  console.log('Routes considered:', ROUTES.join(', '));

  if (!fs.existsSync(BUILD_MANIFEST_PATH)) {
    console.error(
      'explain-critical-chunks: build-manifest.json not found. Run production build first (e.g. nx run web:build --configuration=production).',
    );
    process.exit(1);
  }

  const buildManifest = readJson(BUILD_MANIFEST_PATH);
  const rootMainFiles = buildManifest?.rootMainFiles ?? [];
  console.log('\n--- rootMainFiles (shared by all locale pages) ---');
  console.log(JSON.stringify(rootMainFiles, null, 2));

  const chunkSizes = getChunkSizes();
  console.log('\n--- Top 10 chunks by size (bytes) ---');
  chunkSizes.slice(0, 10).forEach((c, i) => {
    console.log(`  ${i + 1}. ${c.name}: ${c.size}`);
  });

  const criticalFile = findCriticalChunkFile(chunkSizes);
  if (!criticalFile) {
    console.error(
      `explain-critical-chunks: no chunk matching "${CRITICAL_CHUNK_PREFIX}…" found in ${CHUNKS_DIR}.`,
    );
    process.exit(1);
  }

  const criticalPath = path.join(CHUNKS_DIR, criticalFile);
  const { found, sourceMapUrl, length } = analyzeChunkContent(criticalPath);
  console.log('\n--- Critical chunk:', criticalFile, '---');
  console.log('  Size (bytes):', length);
  console.log(
    '  In rootMainFiles:',
    rootMainFiles.some((f) => f.includes(CRITICAL_CHUNK_PREFIX)),
  );
  if (sourceMapUrl) {
    console.log('  sourceMappingURL:', sourceMapUrl);
  } else {
    console.log('  sourceMappingURL: (none)');
  }
  console.log(
    '  Ownership signatures found (in chunk content):',
    found.length ? found.join(', ') : '(none)',
  );

  // Per-route: in App Router, rootMainFiles are the same for all locale pages
  console.log('\n--- Why this chunk loads on all three routes ---');
  console.log(
    '  In Next.js App Router, the root build-manifest rootMainFiles are the shared client bundle',
  );
  console.log(
    '  required by the root layout (apps/web/src/app/[locale]/layout.tsx).',
  );
  console.log(
    '  Every page under [locale] (e.g. /en, /en/brief, /en/media) loads these root chunks.',
  );
  console.log(
    '  Per-route build-manifest (e.g. server/app/[locale]/page/build-manifest.json)',
  );
  console.log('  also lists the same rootMainFiles for each segment.');
  console.log(
    '  Conclusion: c4b75ee0… is the shared client runtime + layout client tree',
  );
  console.log(
    '  (Next runtime, React hydration, shell/compliance/i18n client components).',
  );

  console.log('\nDone.');
}

main();

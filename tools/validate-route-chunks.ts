#!/usr/bin/env node
/**
 * Bundle guard: after production build, ensure the brief route's critical path
 * does not include zod in initial chunks. Scans rootMainFiles from build-manifest
 * for "node_modules/zod" (bounded read per file).
 * Run: npx tsx tools/validate-route-chunks.ts
 * Exit: 0 if no zod in root chunks; 1 otherwise.
 */
import * as fs from 'node:fs';
import * as path from 'node:path';

const NEXT_DIR = path.join(process.cwd(), 'apps', 'web', '.next');
const BUILD_MANIFEST_PATH = path.join(NEXT_DIR, 'build-manifest.json');
const MAX_BYTES_PER_FILE = 200_000;
const ZOD_HINT = 'node_modules/zod';

function main(): number {
  if (!fs.existsSync(BUILD_MANIFEST_PATH)) {
    console.error(
      'validate-route-chunks: build-manifest.json not found. Run production build first.',
    );
    return 1;
  }

  const manifest = JSON.parse(
    fs.readFileSync(BUILD_MANIFEST_PATH, 'utf-8'),
  ) as { rootMainFiles?: string[]; pages?: Record<string, string[]> };

  const rootMainFiles: string[] = manifest.rootMainFiles ?? [];
  if (rootMainFiles.length === 0) {
    console.error(
      'validate-route-chunks: rootMainFiles missing or empty in build-manifest.json',
    );
    return 1;
  }

  const chunksDir = path.join(NEXT_DIR, 'static', 'chunks');
  const offending: string[] = [];

  for (const relPath of rootMainFiles) {
    const fullPath = path.join(NEXT_DIR, relPath);
    if (!fs.existsSync(fullPath)) continue;

    const buf = Buffer.allocUnsafe(
      Math.min(MAX_BYTES_PER_FILE, fs.statSync(fullPath).size),
    );
    const fd = fs.openSync(fullPath, 'r');
    const bytesRead = fs.readSync(fd, buf, 0, buf.length, 0);
    fs.closeSync(fd);
    const slice = buf.subarray(0, bytesRead).toString('utf-8');
    if (slice.includes(ZOD_HINT)) {
      offending.push(relPath);
    }
  }

  if (offending.length > 0) {
    console.error(
      'validate-route-chunks: initial chunks must not include zod. Found in:',
      offending.join(', '),
    );
    return 1;
  }

  return 0;
}

process.exit(main());

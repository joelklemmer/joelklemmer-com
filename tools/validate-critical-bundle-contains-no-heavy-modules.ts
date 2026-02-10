#!/usr/bin/env node
/**
 * Critical bundle guard: rootMainFiles chunks must not contain banned string
 * signatures (heavy modules that should be lazy-loaded). Scans each root chunk
 * for banned substrings. Run after production build.
 *
 * Run: npx tsx tools/validate-critical-bundle-contains-no-heavy-modules.ts
 * Exit: 0 if no root chunk contains a banned signature; 1 otherwise.
 */
import * as fs from 'node:fs';
import * as path from 'node:path';

const NEXT_DIR = path.join(process.cwd(), 'apps', 'web', '.next');
const BUILD_MANIFEST_PATH = path.join(NEXT_DIR, 'build-manifest.json');
const MAX_BYTES_PER_CHUNK = 500_000;

/**
 * Banned substrings: if any rootMainFiles chunk contains one of these, fail.
 * Root chunks must not contain app-level providers, client shells, or heavy
 * modal/dialog modules; Next/React runtime strings may still exist.
 */
const BANNED_SIGNATURES = [
  'ConsentPreferencesForm',
  'ThemeProvider',
  'ContrastProvider',
  'DensityViewProvider',
  'EvaluatorModeProvider',
  'ConsentProviderV2',
  'NextIntlClientProvider',
  'ClientShellCritical',
  'ClientShellDeferred',
  'CookiePreferencesModal',
  'AccessibilityPanel',
];

function main(): number {
  if (!fs.existsSync(BUILD_MANIFEST_PATH)) {
    console.error(
      'validate-critical-bundle-contains-no-heavy-modules: build-manifest.json not found. Run production build first.',
    );
    return 1;
  }

  const manifest = JSON.parse(
    fs.readFileSync(BUILD_MANIFEST_PATH, 'utf-8'),
  ) as { rootMainFiles?: string[] };

  const rootMainFiles: string[] = manifest.rootMainFiles ?? [];
  if (rootMainFiles.length === 0) {
    console.error(
      'validate-critical-bundle-contains-no-heavy-modules: rootMainFiles missing or empty.',
    );
    return 1;
  }

  const offending: { chunk: string; signature: string }[] = [];

  for (const relPath of rootMainFiles) {
    if (!relPath.endsWith('.js')) continue;
    const fullPath = path.join(NEXT_DIR, relPath);
    if (!fs.existsSync(fullPath)) continue;

    const size = fs.statSync(fullPath).size;
    const toRead = Math.min(MAX_BYTES_PER_CHUNK, size);
    const buf = Buffer.allocUnsafe(toRead);
    const fd = fs.openSync(fullPath, 'r');
    fs.readSync(fd, buf, 0, toRead, 0);
    fs.closeSync(fd);
    const slice = buf.subarray(0, toRead).toString('utf-8');

    for (const sig of BANNED_SIGNATURES) {
      if (slice.includes(sig)) {
        offending.push({ chunk: relPath, signature: sig });
      }
    }
  }

  if (offending.length > 0) {
    console.error(
      'validate-critical-bundle-contains-no-heavy-modules: root chunks must not contain heavy lazy-only modules.',
    );
    offending.forEach(({ chunk, signature }) =>
      console.error(`  - ${chunk} contains "${signature}"`),
    );
    return 1;
  }

  return 0;
}

process.exit(main());

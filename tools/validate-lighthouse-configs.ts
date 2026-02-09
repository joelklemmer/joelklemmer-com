/**
 * Prevents lighthouse config drift: asserts that ci.assert.assertions in
 * lighthouserc.serverless.cjs match lighthouserc.cjs (canonical). Allowed
 * differences elsewhere: baseUrl, startServerCommand, url array.
 * Run from repo root: npx tsx --tsconfig tsconfig.base.json tools/validate-lighthouse-configs.ts
 */
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const repoRoot = process.cwd();

const canonicalPath = path.join(repoRoot, 'lighthouserc.cjs');
const serverlessPath = path.join(repoRoot, 'lighthouserc.serverless.cjs');

function main(): number {
  let canonical: { ci?: { assert?: { assertions?: unknown } } };
  let serverless: { ci?: { assert?: { assertions?: unknown } } };

  try {
    canonical = require(canonicalPath);
  } catch (e) {
    console.error(
      'validate-lighthouse-configs: failed to load lighthouserc.cjs:',
      e,
    );
    return 1;
  }
  try {
    serverless = require(serverlessPath);
  } catch (e) {
    console.error(
      'validate-lighthouse-configs: failed to load lighthouserc.serverless.cjs:',
      e,
    );
    return 1;
  }

  const canonAssertions = canonical?.ci?.assert?.assertions;
  const serverAssertions = serverless?.ci?.assert?.assertions;

  if (!canonAssertions || typeof canonAssertions !== 'object') {
    console.error(
      'validate-lighthouse-configs: lighthouserc.cjs ci.assert.assertions missing or not an object',
    );
    return 1;
  }
  if (!serverAssertions || typeof serverAssertions !== 'object') {
    console.error(
      'validate-lighthouse-configs: lighthouserc.serverless.cjs ci.assert.assertions missing or not an object',
    );
    return 1;
  }

  const toSortedJson = (o: Record<string, unknown>): string => {
    const sorted: Record<string, unknown> = {};
    for (const k of Object.keys(o).sort()) {
      sorted[k] = o[k];
    }
    return JSON.stringify(sorted);
  };
  const canonJson = toSortedJson(canonAssertions as Record<string, unknown>);
  const serverJson = toSortedJson(serverAssertions as Record<string, unknown>);

  if (canonJson !== serverJson) {
    console.error(
      'validate-lighthouse-configs: ci.assert.assertions differ between lighthouserc.cjs and lighthouserc.serverless.cjs.',
    );
    console.error('Canonical (lighthouserc.cjs):', canonJson);
    console.error('Serverless (lighthouserc.serverless.cjs):', serverJson);
    return 1;
  }

  console.log('Lighthouse config assertions match (no drift).');
  return 0;
}

process.exit(main());

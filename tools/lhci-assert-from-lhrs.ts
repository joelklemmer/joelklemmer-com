/**
 * Runs LHCI-style assertions against LHR JSON files in a directory (e.g. tmp/lighthouse/custom).
 * Loads assertions from lighthouserc.serverless.cjs so the gate is identical to LHCI assert.
 * Writes .lighthouseci/assertion-results.json and exits non-zero on any failure.
 *
 * Usage: npx tsx tools/lhci-assert-from-lhrs.ts [--lhr-dir=tmp/lighthouse/custom]
 */
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const REPO_ROOT = process.cwd();
const DEFAULT_LHR_DIR = path.join(REPO_ROOT, 'tmp', 'lighthouse', 'custom');
const LHCI_DIR = path.join(REPO_ROOT, '.lighthouseci');

interface AssertionSpec {
  level: 'error' | 'warn';
  minScore?: number;
  maxNumericValue?: number;
}

interface LHR {
  requestedUrl?: string;
  finalUrl?: string;
  categories?: Record<string, { score: number | null }>;
  audits?: Record<string, { score?: number | null; numericValue?: number }>;
}

function loadAssertions(): Record<string, [string, Record<string, number>]> {
  const configPath = path.join(REPO_ROOT, 'lighthouserc.serverless.cjs');
  const config = require(configPath) as { ci?: { assert?: { assertions?: Record<string, [string, Record<string, number>]> } } };
  const assertions = config?.ci?.assert?.assertions;
  if (!assertions || typeof assertions !== 'object') {
    throw new Error('lhci-assert-from-lhrs: no ci.assert.assertions in lighthouserc.serverless.cjs');
  }
  return assertions;
}

function parseAssertion(entry: [string, Record<string, number>]): AssertionSpec {
  const [level, opts] = entry;
  const spec: AssertionSpec = { level: level === 'warn' ? 'warn' : 'error' };
  if (opts?.minScore !== undefined) spec.minScore = opts.minScore;
  if (opts?.maxNumericValue !== undefined) spec.maxNumericValue = opts.maxNumericValue;
  return spec;
}

function assertLhr(
  lhr: LHR,
  assertions: Record<string, [string, Record<string, number>]>,
): { passed: boolean; failures: string[] } {
  const failures: string[] = [];
  const categories = lhr.categories ?? {};
  const audits = lhr.audits ?? {};
  const url = lhr.finalUrl ?? lhr.requestedUrl ?? 'unknown';

  for (const [key, entry] of Object.entries(assertions)) {
    const spec = parseAssertion(entry);
    if (key.startsWith('categories:')) {
      const categoryId = key.slice('categories:'.length);
      const cat = categories[categoryId];
      const score = cat?.score ?? null;
      if (spec.minScore !== undefined) {
        if (score === null || score === undefined) {
          failures.push(`${url} ${key}: category score missing`);
        } else if (score < spec.minScore) {
          failures.push(`${url} ${key}: score ${score} < minScore ${spec.minScore}`);
        }
      }
    } else {
      const audit = audits[key];
      if (spec.maxNumericValue !== undefined) {
        if (audit === undefined || audit === null) {
          failures.push(`${url} ${key}: audit missing (required for maxNumericValue ${spec.maxNumericValue})`);
        } else {
          const val = audit.numericValue;
          if (typeof val !== 'number') {
            failures.push(`${url} ${key}: numericValue missing`);
          } else if (val > spec.maxNumericValue) {
            failures.push(`${url} ${key}: numericValue ${val} > max ${spec.maxNumericValue}`);
          }
        }
      }
      if (spec.minScore !== undefined && audit != null) {
        const s = audit.score;
        if (s !== null && s !== undefined && s < spec.minScore) {
          failures.push(`${url} ${key}: score ${s} < minScore ${spec.minScore}`);
        }
      }
    }
  }

  return { passed: failures.length === 0, failures };
}

function main(): number {
  const args = process.argv.slice(2);
  let lhrDir = DEFAULT_LHR_DIR;
  for (const arg of args) {
    if (arg.startsWith('--lhr-dir=')) {
      lhrDir = path.resolve(REPO_ROOT, arg.slice('--lhr-dir='.length));
      break;
    }
  }

  if (!fs.existsSync(lhrDir) || !fs.statSync(lhrDir).isDirectory()) {
    console.error(`lhci-assert-from-lhrs: LHR dir not found or not a directory: ${lhrDir}`);
    return 1;
  }

  const assertions = loadAssertions();
  const files = fs.readdirSync(lhrDir).filter((f) => f.endsWith('.report.json'));
  if (files.length === 0) {
    console.error(`lhci-assert-from-lhrs: no *.report.json in ${lhrDir}`);
    return 1;
  }

  const allFailures: string[] = [];
  const results: { url: string; passed: boolean; failures: string[] }[] = [];

  for (const file of files) {
    const filePath = path.join(lhrDir, file);
    const raw = fs.readFileSync(filePath, 'utf8');
    let lhr: LHR;
    try {
      lhr = JSON.parse(raw) as LHR;
    } catch (e) {
      console.error(`lhci-assert-from-lhrs: failed to parse ${file}: ${String(e)}`);
      return 1;
    }
    const { passed, failures } = assertLhr(lhr, assertions);
    const url = lhr.finalUrl ?? lhr.requestedUrl ?? file;
    results.push({ url, passed, failures });
    if (!passed) allFailures.push(...failures);
  }

  if (!fs.existsSync(LHCI_DIR)) {
    fs.mkdirSync(LHCI_DIR, { recursive: true });
  }
  const assertionResultsPath = path.join(LHCI_DIR, 'assertion-results.json');
  fs.writeFileSync(
    assertionResultsPath,
    JSON.stringify({ results, summary: { passed: allFailures.length === 0, failureCount: allFailures.length } }, null, 2),
    'utf8',
  );

  if (allFailures.length > 0) {
    allFailures.forEach((f) => console.error('lhci-assert-from-lhrs:', f));
    console.error(`lhci-assert-from-lhrs: ${allFailures.length} assertion(s) failed.`);
    return 1;
  }
  console.log(`lhci-assert-from-lhrs: all assertions passed (${files.length} LHRs).`);
  return 0;
}

process.exit(main());

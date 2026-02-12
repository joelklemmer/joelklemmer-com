/**
 * Lighthouse harness determinism: asserts pinned toolchain and fixed collection profile.
 * - package.json: lighthouse, chrome-launcher, puppeteer must be exact versions (no caret).
 * - Chrome must be available; prints version.
 * - Lighthouse version in node_modules must match package.json.
 * - Effective config (from dump) must use: desktop, provided throttling, onlyCategories, disableStorageReset false.
 *
 * Run from repo root. In CI run before web:lighthouse-timespan. In verify run after build, before head-invariants.
 * Usage: npx tsx tools/validate-lighthouse-harness.ts [--instrument-path=tmp/lighthouse/instrument.json]
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const REPO_ROOT = process.cwd();

const REQUIRED_CATEGORIES = [
  'performance',
  'accessibility',
  'seo',
  'best-practices',
];
const DEFAULT_INSTRUMENT_PATH = path.join(
  REPO_ROOT,
  'tmp',
  'lighthouse',
  'instrument.json',
);

function loadPackageJson(): Record<string, unknown> {
  const p = path.join(REPO_ROOT, 'package.json');
  if (!fs.existsSync(p)) throw new Error(`package.json not found: ${p}`);
  const raw = fs.readFileSync(p, 'utf8');
  return JSON.parse(raw) as Record<string, unknown>;
}

function getDevDep(
  pkg: Record<string, unknown>,
  name: string,
): string | undefined {
  const dev = pkg.devDependencies as Record<string, string> | undefined;
  if (!dev || typeof dev[name] !== 'string') return undefined;
  return dev[name].trim();
}

function assertExactVersions(pkg: Record<string, unknown>): string[] {
  const errors: string[] = [];
  const names = ['lighthouse', 'chrome-launcher', 'puppeteer'] as const;
  for (const name of names) {
    const v = getDevDep(pkg, name);
    if (v === undefined) {
      errors.push(`devDependencies.${name} missing in package.json`);
      continue;
    }
    if (v.startsWith('^') || v.startsWith('~')) {
      errors.push(
        `devDependencies.${name} must be exact version (no ^ or ~). Current: ${v}. Pin to exact (e.g. without caret).`,
      );
    }
  }
  return errors;
}

function getChromeVersion(): string | null {
  try {
    const chromeLauncher = require('chrome-launcher');
    const chromePath =
      process.env.LH_CHROME_PATH?.trim() || chromeLauncher.getChromePath?.();
    if (!chromePath) return null;
    const out = spawnSync(chromePath, ['--version'], {
      encoding: 'utf8',
      timeout: 5000,
    });
    return (out.stdout || out.stderr || '').trim() || null;
  } catch {
    return null;
  }
}

function getLighthouseVersionFromNodeModules(): string | null {
  try {
    const pkg = require('lighthouse/package.json') as { version?: string };
    return pkg?.version ?? null;
  } catch {
    return null;
  }
}

interface InstrumentPayload {
  settings?: {
    formFactor?: string;
    throttlingMethod?: string;
    disableStorageReset?: boolean;
    onlyCategories?: string[] | null;
  };
  summary?: Record<string, unknown>;
}

function runDumpInstrument(): number {
  const result = spawnSync(
    process.execPath,
    ['tools/dump-lighthouse-instrument.mjs'],
    {
      cwd: REPO_ROOT,
      encoding: 'utf8',
      timeout: 10000,
    },
  );
  return result.status ?? (result.signal ? 1 : 0);
}

function assertInstrumentProfile(instrumentPath: string): string[] {
  const errors: string[] = [];
  if (!fs.existsSync(instrumentPath)) {
    errors.push(
      `Instrument file not found: ${instrumentPath}. Run tools/dump-lighthouse-instrument.mjs (harness runs it automatically).`,
    );
    return errors;
  }
  let data: InstrumentPayload;
  try {
    const raw = fs.readFileSync(instrumentPath, 'utf8');
    data = JSON.parse(raw) as InstrumentPayload;
  } catch (e) {
    errors.push(
      `Instrument file invalid JSON: ${instrumentPath}. ${e instanceof Error ? e.message : String(e)}`,
    );
    return errors;
  }
  const settings = data?.settings ?? {};
  if (settings.formFactor !== 'desktop') {
    errors.push(
      `Harness requires formFactor "desktop". Got: ${String(settings.formFactor)}. Update tools/lighthouse-instrument-config.mjs.`,
    );
  }
  if (settings.throttlingMethod !== 'provided') {
    errors.push(
      `Harness requires throttlingMethod "provided". Got: ${String(settings.throttlingMethod)}. Update tools/lighthouse-instrument-config.mjs.`,
    );
  }
  if (settings.disableStorageReset !== false) {
    errors.push(
      `Harness requires disableStorageReset false. Got: ${String(settings.disableStorageReset)}.`,
    );
  }
  const onlyCategories = settings.onlyCategories;
  if (!Array.isArray(onlyCategories) || onlyCategories.length === 0) {
    errors.push(
      `Harness requires onlyCategories to be a non-empty array. Got: ${JSON.stringify(onlyCategories)}.`,
    );
  } else {
    const sortedRequired = [...REQUIRED_CATEGORIES].sort();
    const sortedActual = [...onlyCategories].sort();
    if (
      sortedRequired.length !== sortedActual.length ||
      sortedRequired.some((c, i) => c !== sortedActual[i])
    ) {
      errors.push(
        `Harness requires onlyCategories ${JSON.stringify(REQUIRED_CATEGORIES)}. Got: ${JSON.stringify(onlyCategories)}.`,
      );
    }
  }
  return errors;
}

function main(): number {
  const args = process.argv.slice(2);
  let instrumentPath = DEFAULT_INSTRUMENT_PATH;
  for (const arg of args) {
    if (arg.startsWith('--instrument-path=')) {
      instrumentPath = path.resolve(
        REPO_ROOT,
        arg.slice('--instrument-path='.length),
      );
      break;
    }
  }

  const errors: string[] = [];

  let pkg: Record<string, unknown>;
  try {
    pkg = loadPackageJson();
  } catch (e) {
    console.error(
      'validate-lighthouse-harness:',
      e instanceof Error ? e.message : String(e),
    );
    return 1;
  }

  errors.push(...assertExactVersions(pkg));
  const chromeVersion = getChromeVersion();
  if (!chromeVersion) {
    errors.push(
      'Chrome not available. Install Chrome or ensure chrome-launcher can find it.',
    );
  } else {
    console.log('Chrome version:', chromeVersion);
  }

  const pinnedLh = getDevDep(pkg, 'lighthouse');
  const lhFromNodeModules = getLighthouseVersionFromNodeModules();
  if (!pinnedLh) {
    errors.push('package.json devDependencies.lighthouse missing.');
  } else if (!lhFromNodeModules) {
    errors.push(
      'Could not read Lighthouse version from node_modules/lighthouse/package.json.',
    );
  } else if (lhFromNodeModules !== pinnedLh) {
    errors.push(
      `Lighthouse version mismatch: package.json has ${pinnedLh}, node_modules has ${lhFromNodeModules}. Run pnpm install.`,
    );
  } else {
    console.log('Lighthouse version:', lhFromNodeModules);
  }

  const dumpExit = runDumpInstrument();
  if (dumpExit !== 0) {
    errors.push(
      'dump-lighthouse-instrument.mjs failed. Fix instrument config and try again.',
    );
  } else {
    errors.push(...assertInstrumentProfile(instrumentPath));
  }

  if (errors.length > 0) {
    errors.forEach((e) => console.error('validate-lighthouse-harness:', e));
    console.error(
      'validate-lighthouse-harness: fix the above (pin versions, set desktop/provided/onlyCategories in tools/lighthouse-instrument-config.mjs).',
    );
    return 1;
  }

  console.log('validate-lighthouse-harness: harness determinism passed.');
  return 0;
}

process.exit(main());

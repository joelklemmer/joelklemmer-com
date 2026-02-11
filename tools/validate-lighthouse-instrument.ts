/**
 * Instrument guard: fails if the Lighthouse collection apparatus has changed from
 * the expected pinned values. Reads package.json lighthouse version, runtime Chrome
 * version (chrome --version), and tmp/lighthouse/instrument.json (effective config).
 * Fails if LH_CHROME_MAJOR is set and Chrome major differs; or if LH_FORM_FACTOR,
 * LH_THROTTLING_METHOD, LH_CPU_SLOWDOWN_MULTIPLIER are set and instrument.json
 * summary differs.
 *
 * Run before collect (e.g. from run-lighthouse-timespan). CI must set env vars.
 * Usage: npx tsx tools/validate-lighthouse-instrument.ts [--instrument-path=tmp/lighthouse/instrument.json]
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const REPO_ROOT = process.cwd();

const DEFAULT_INSTRUMENT_PATH = path.join(
  REPO_ROOT,
  'tmp',
  'lighthouse',
  'instrument.json',
);

function getLighthouseVersion(): string | null {
  try {
    const pkg = require('lighthouse/package.json') as { version?: string };
    return pkg?.version ?? null;
  } catch {
    return null;
  }
}

function getChromeVersion(): string | null {
  try {
    const chromeLauncher = require('chrome-launcher');
    const chromePath = chromeLauncher.getChromePath?.();
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

function parseChromeMajor(versionStr: string): number | null {
  const m = versionStr.match(/Chrome\s+(\d+)/i) ?? versionStr.match(/(\d+)\./);
  if (!m) return null;
  const n = parseInt(m[1], 10);
  return Number.isNaN(n) ? null : n;
}

interface InstrumentSummary {
  formFactor?: string;
  throttlingMethod?: string;
  cpuSlowdownMultiplier?: number;
}

function readInstrumentSummary(
  instrumentPath: string,
): InstrumentSummary | null {
  if (!fs.existsSync(instrumentPath)) return null;
  try {
    const raw = fs.readFileSync(instrumentPath, 'utf8');
    const data = JSON.parse(raw) as { summary?: InstrumentSummary };
    return data?.summary ?? null;
  } catch {
    return null;
  }
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

  const lhVersion = getLighthouseVersion();
  if (!lhVersion) {
    errors.push('Could not resolve Lighthouse version (package.json)');
  } else {
    console.log(`Lighthouse version: ${lhVersion}`);
  }

  const chromeVersion = getChromeVersion();
  if (!chromeVersion) {
    errors.push('Could not get Chrome version (chrome --version)');
  } else {
    console.log(`Chrome version: ${chromeVersion}`);
  }

  const expectedChromeMajor = process.env.LH_CHROME_MAJOR;
  if (expectedChromeMajor !== undefined && expectedChromeMajor !== '') {
    const expected = parseInt(expectedChromeMajor, 10);
    if (Number.isNaN(expected)) {
      errors.push(
        `LH_CHROME_MAJOR must be a number, got: ${expectedChromeMajor}`,
      );
    } else if (chromeVersion) {
      const actual = parseChromeMajor(chromeVersion);
      if (actual === null) {
        errors.push(`Could not parse Chrome major from: ${chromeVersion}`);
      } else if (actual !== expected) {
        errors.push(
          `Chrome major mismatch: expected ${expected} (LH_CHROME_MAJOR), got ${actual}`,
        );
      }
    }
  }

  const summary = readInstrumentSummary(instrumentPath);
  if (!summary) {
    errors.push(
      `Instrument file missing or invalid: ${instrumentPath}. Run tools/dump-lighthouse-instrument.mjs first.`,
    );
  } else {
    console.log(
      'Effective instrument settings:',
      JSON.stringify(summary, null, 2),
    );

    const expectedFormFactor = process.env.LH_FORM_FACTOR;
    if (expectedFormFactor !== undefined && expectedFormFactor !== '') {
      const actual = summary.formFactor ?? '';
      if (actual !== expectedFormFactor) {
        errors.push(
          `formFactor mismatch: expected ${expectedFormFactor}, got ${actual}`,
        );
      }
    }

    const expectedThrottlingMethod = process.env.LH_THROTTLING_METHOD;
    if (
      expectedThrottlingMethod !== undefined &&
      expectedThrottlingMethod !== ''
    ) {
      const actual = summary.throttlingMethod ?? '';
      if (actual !== expectedThrottlingMethod) {
        errors.push(
          `throttlingMethod mismatch: expected ${expectedThrottlingMethod}, got ${actual}`,
        );
      }
    }

    const expectedCpu = process.env.LH_CPU_SLOWDOWN_MULTIPLIER;
    if (expectedCpu !== undefined && expectedCpu !== '') {
      const expected = parseFloat(expectedCpu);
      const actual = summary.cpuSlowdownMultiplier;
      if (Number.isNaN(expected)) {
        errors.push(
          `LH_CPU_SLOWDOWN_MULTIPLIER must be a number, got: ${expectedCpu}`,
        );
      } else if (actual !== undefined && actual !== expected) {
        errors.push(
          `cpuSlowdownMultiplier mismatch: expected ${expected}, got ${actual}`,
        );
      }
    }
  }

  if (errors.length > 0) {
    errors.forEach((e) => console.error('validate-lighthouse-instrument:', e));
    process.exit(1);
  }

  console.log('validate-lighthouse-instrument: instrument guard passed.');
  return 0;
}

process.exit(main());

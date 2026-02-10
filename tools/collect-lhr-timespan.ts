/**
 * Collects Lighthouse LHRs using timespan mode so INP is populated.
 * Starts the production server via tools/lib/startServer.ts (when BASE_URL unset), then for each URL
 * spawns Node running tools/collect-lhr-single.mjs (ESM) so Lighthouse loads correctly.
 * Writes to tmp/lighthouse/custom/<slug>.report.json.
 *
 * When BASE_URL or LHCI_BASE_URL is set, skips starting the server (caller started it).
 * Requires: puppeteer (devDependency). Run from repo root.
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { startServer } from './lib/startServer';

const REPO_ROOT = process.cwd();
const CUSTOM_DIR = path.join(REPO_ROOT, 'tmp', 'lighthouse', 'custom');
const INP_AUDIT_ID = 'interaction-to-next-paint';

const URL_SLUGS: { path: string; slug: string }[] = [
  { path: '/en', slug: 'en' },
  { path: '/en/brief', slug: 'en-brief' },
  { path: '/en/media', slug: 'en-media' },
];

function ensureCustomDir(): void {
  if (!fs.existsSync(path.dirname(CUSTOM_DIR))) {
    fs.mkdirSync(path.dirname(CUSTOM_DIR), { recursive: true });
  }
  if (!fs.existsSync(CUSTOM_DIR)) {
    fs.mkdirSync(CUSTOM_DIR, { recursive: true });
  }
}

function runFlowForUrl(
  baseUrl: string,
  pathSegment: string,
  slug: string,
): Promise<number> {
  const outFile = path.join(CUSTOM_DIR, `${slug}.report.json`);
  return new Promise((resolve) => {
    const scriptPath = path.join(REPO_ROOT, 'tools', 'collect-lhr-single.mjs');
    const child = spawn(process.execPath, [scriptPath], {
      cwd: REPO_ROOT,
      stdio: 'inherit',
      env: {
        ...process.env,
        BASE_URL: baseUrl,
        LHCI_BASE_URL: baseUrl,
        URL_PATH: pathSegment,
        SLUG: slug,
        OUT_FILE: outFile,
      },
    });
    child.on('exit', (code, signal) => {
      resolve(code ?? (signal ? 1 : 0));
    });
  });
}

async function main(): Promise<number> {
  let baseUrl = process.env.BASE_URL ?? process.env.LHCI_BASE_URL;
  let stopServer: (() => Promise<void>) | undefined;

  if (!baseUrl) {
    process.stdout.write('collect-lhr-timespan: starting server...\n');
    const result = await startServer(undefined);
    baseUrl = result.baseUrl;
    stopServer = result.stop;
    process.stdout.write(`collect-lhr-timespan: server at ${baseUrl}\n`);
  }

  process.on('SIGINT', () => {
    void stopServer?.();
  });
  process.on('SIGTERM', () => {
    void stopServer?.();
  });

  ensureCustomDir();

  for (const { path: pathSegment, slug } of URL_SLUGS) {
    process.stdout.write(`collect-lhr-timespan: ${pathSegment}...`);
    try {
      const code = await runFlowForUrl(baseUrl, pathSegment, slug);
      if (code !== 0) {
        process.stderr.write(` exit ${code}\n`);
        return 1;
      }
      const outPath = path.join(CUSTOM_DIR, `${slug}.report.json`);
      let inp: number | undefined;
      if (fs.existsSync(outPath)) {
        const raw = fs.readFileSync(outPath, 'utf8');
        const lhr = JSON.parse(raw) as {
          audits?: Record<string, { numericValue?: number }>;
        };
        inp = lhr?.audits?.[INP_AUDIT_ID]?.numericValue;
      }
      process.stdout.write(` INP=${inp ?? 'n/a'} ms, wrote ${outPath}\n`);
    } catch (e) {
      const err = e as Error;
      process.stderr.write(` error: ${err?.message ?? String(e)}\n`);
      if (err?.stack) process.stderr.write(err.stack + '\n');
      return 1;
    }
  }

  if (stopServer) {
    await stopServer();
  }
  process.stdout.write('collect-lhr-timespan: done.\n');
  return 0;
}

main()
  .then((code) => process.exit(code))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });

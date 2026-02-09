/**
 * Collects Lighthouse LHRs using timespan mode so INP is populated.
 * Starts the production server via tools/lib/startServer.ts, then for each URL:
 * navigate, timespan with deterministic keyboard/click interactions; merges INP
 * from the timespan step into the navigation LHR and writes to
 * tmp/lighthouse/custom/<slug>.report.json.
 *
 * When BASE_URL or LHCI_BASE_URL is set, skips starting the server (caller started it).
 * Requires: puppeteer (devDependency). Run from repo root.
 */
import fs from 'node:fs';
import path from 'node:path';
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

function mergeInpIntoNav(
  navLhr: Record<string, unknown>,
  timespanLhr: Record<string, unknown>,
): Record<string, unknown> {
  const audits = (navLhr.audits ?? {}) as Record<string, unknown>;
  const tsAudits = (timespanLhr.audits ?? {}) as Record<string, { numericValue?: number }>;
  const inp = tsAudits[INP_AUDIT_ID];
  if (inp != null && typeof inp.numericValue === 'number') {
    const score = inp.numericValue <= 200 ? 1 : 0;
    audits[INP_AUDIT_ID] = {
      id: INP_AUDIT_ID,
      title: 'Interaction to Next Paint',
      description: 'INP from timespan (deterministic interactions).',
      numericValue: inp.numericValue,
      numericUnit: 'millisecond',
      score,
      scoreDisplayMode: 'numeric',
      displayValue: `${inp.numericValue} ms`,
    };
    navLhr.audits = audits;
  }
  return navLhr;
}

async function runFlowForUrl(
  baseUrl: string,
  pathSegment: string,
  slug: string,
): Promise<{ navLhr: Record<string, unknown>; timespanLhr: Record<string, unknown> } | null> {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const puppeteer = require('puppeteer');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const lighthouse = require('lighthouse');

  const url = baseUrl.replace(/\/?$/, '') + pathSegment;
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });

  try {
    const page = await browser.newPage();
    const flow = await (lighthouse.startFlow as (page: unknown, opts?: { name: string }) => Promise<{
      navigate: (u: string) => Promise<unknown>;
      startTimespan: (opts?: { stepName: string }) => Promise<{ lhr: Record<string, unknown> }>;
      endTimespan: () => Promise<{ lhr: Record<string, unknown> }>;
      getFlowResult: () => Promise<{ steps: Array<{ lhr: Record<string, unknown> }> }>;
    }>(page, { name: `timespan-${slug}` }));

    await flow.navigate(url);

    await flow.startTimespan({ stepName: 'Interact' });

    // Deterministic interactions to generate INP (keyboard + click)
    // 1) Tab through top nav; 2) open/close nav menu; 3) focus and activate one CTA; 4) on media, filter
    await page.keyboard.down('Tab');
    await new Promise((r) => setTimeout(r, 80));
    await page.keyboard.up('Tab');
    await new Promise((r) => setTimeout(r, 80));

    const trigger = await page.$('#primary-nav-trigger');
    if (trigger) {
      await trigger.click();
      await new Promise((r) => setTimeout(r, 120));
      await page.keyboard.press('Escape');
      await new Promise((r) => setTimeout(r, 80));
    }

    const cta = await page.$('a[href="/en/brief"], a[href*="/brief"], .masthead-nav-primary a');
    if (cta) {
      await cta.click();
      await new Promise((r) => setTimeout(r, 100));
      await page.goBack().catch(() => {});
      await new Promise((r) => setTimeout(r, 100));
    }

    if (pathSegment === '/en/media') {
      const filterBtn = await page.$('section[aria-labelledby="media-filter-heading"] button');
      if (filterBtn) {
        await filterBtn.click();
        await new Promise((r) => setTimeout(r, 80));
      }
    }

    await flow.endTimespan();
    const flowResult = await flow.getFlowResult();
    const steps = flowResult?.steps ?? [];
    // Step 0 = navigation, step 1 = timespan (Interact)
    const navLhr = steps[0]?.lhr as Record<string, unknown> | undefined;
    const timespanLhr = steps[1]?.lhr as Record<string, unknown> | undefined;

    if (!navLhr) {
      process.stderr.write(`collect-lhr-timespan: no navigation LHR for ${url}\n`);
      return null;
    }

    return {
      navLhr,
      timespanLhr: timespanLhr ?? {},
    };
  } finally {
    await browser.close();
  }
}

async function main(): Promise<number> {
  try {
    require.resolve('puppeteer');
  } catch {
    process.stderr.write('collect-lhr-timespan: puppeteer not installed. pnpm add -D puppeteer\n');
    return 1;
  }

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
      const result = await runFlowForUrl(baseUrl, pathSegment, slug);
      if (!result) {
        process.stdout.write(' no LHR\n');
        continue;
      }
      const { navLhr, timespanLhr } = result;
      const merged = mergeInpIntoNav(
        JSON.parse(JSON.stringify(navLhr)) as Record<string, unknown>,
        timespanLhr,
      );
      const outPath = path.join(CUSTOM_DIR, `${slug}.report.json`);
      fs.writeFileSync(outPath, JSON.stringify(merged), 'utf8');
      const inp = (merged.audits as Record<string, { numericValue?: number }>)?.[INP_AUDIT_ID]?.numericValue;
      process.stdout.write(` INP=${inp ?? 'n/a'} ms, wrote ${outPath}\n`);
    } catch (e) {
      process.stderr.write(` error: ${String(e)}\n`);
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

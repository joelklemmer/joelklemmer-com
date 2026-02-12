/**
 * Single-URL Lighthouse timespan flow. Run with Node (ESM) so Lighthouse loads correctly.
 * Uses pinned instrument config (formFactor, throttling, screenEmulation) for deterministic LCP.
 * Env: BASE_URL, URL_PATH (e.g. /en), SLUG (e.g. en), OUT_FILE (path to write .report.json).
 * Chrome: ephemeral user-data-dir and no-first-run flags to avoid profile picker in all paths.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import * as chromeLauncher from 'chrome-launcher';
import puppeteer from 'puppeteer';
import { startFlow } from 'lighthouse/core/index.js';
import {
  flowConfig,
  getInstrumentSummary,
} from './lighthouse-instrument-config.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');
const INSTRUMENT_OUT = path.join(
  REPO_ROOT,
  'tmp',
  'lighthouse',
  'instrument.json',
);
const INP_AUDIT_ID = 'interaction-to-next-paint';

function mergeInpIntoNav(navLhr, timespanLhr) {
  const audits = { ...(navLhr.audits || {}) };
  const inp = timespanLhr?.audits?.[INP_AUDIT_ID];
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

function getChromeVersion() {
  try {
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

function getLighthouseVersion() {
  try {
    const pkgPath = path.join(
      REPO_ROOT,
      'node_modules',
      'lighthouse',
      'package.json',
    );
    const raw = fs.readFileSync(pkgPath, 'utf8');
    const pkg = JSON.parse(raw);
    return pkg?.version ?? null;
  } catch {
    return null;
  }
}

function writeInstrumentJson() {
  const summary = getInstrumentSummary();
  const payload = {
    settings: flowConfig.settings,
    summary,
    dumpedAt: new Date().toISOString(),
  };
  fs.mkdirSync(path.dirname(INSTRUMENT_OUT), { recursive: true });
  fs.writeFileSync(INSTRUMENT_OUT, JSON.stringify(payload, null, 2), 'utf8');
}

async function main() {
  const baseUrl = process.env.BASE_URL || process.env.LHCI_BASE_URL;
  const urlPath = process.env.URL_PATH || '/en';
  const slug = process.env.SLUG || 'en';
  const outFile = process.env.OUT_FILE;

  if (!baseUrl || !outFile) {
    console.error('collect-lhr-single.mjs: set BASE_URL and OUT_FILE');
    process.exit(1);
  }

  const url = baseUrl.replace(/\/?$/, '') + urlPath;
  const isFirstUrl = slug === 'en';

  if (isFirstUrl) {
    const explicitPath = process.env.LH_CHROME_PATH?.trim();
    const chromeVer = getChromeVersion();
    const lhVer = getLighthouseVersion();
    writeInstrumentJson();
    if (explicitPath) {
      console.error('Lighthouse instrument: chromePath:', explicitPath);
    }
    console.error('Lighthouse instrument: Chrome:', chromeVer ?? 'unknown');
    console.error('Lighthouse instrument: Lighthouse:', lhVer ?? 'unknown');
    console.error(
      'Lighthouse instrument: effective settings',
      JSON.stringify(getInstrumentSummary(), null, 2),
    );
  }

  // Use chrome-launcher (same as LHCI) so Chrome is found in CI; ephemeral profile to avoid picker.
  // When LH_CHROME_PATH is set (e.g. CI), use that binary explicitly for deterministic runs.
  const userDataDir = path.join(os.tmpdir(), `lhci-profile-${process.pid}`);
  const chromePath = process.env.LH_CHROME_PATH?.trim() || undefined;
  let chrome;
  let browser;
  try {
    const launchOpts = {
      ...(chromePath && { chromePath }),
      chromeFlags: [
        '--headless=new',
        '--no-first-run',
        '--no-default-browser-check',
        '--disable-extensions',
        '--disable-component-update',
        '--disable-background-networking',
        '--disable-sync',
        '--metrics-recording-only',
        '--disable-features=ChromeWhatsNewUI,PrivacySandboxSettings4',
        '--no-sandbox',
        '--disable-dev-shm-usage',
        `--user-data-dir=${userDataDir}`,
      ],
    };
    chrome = await chromeLauncher.launch(launchOpts);
    browser = await puppeteer.connect({
      browserURL: `http://127.0.0.1:${chrome.port}`,
    });
  } catch (err) {
    console.error(
      'collect-lhr-single.mjs: failed to launch Chrome:',
      err.message,
    );
    process.exit(1);
  }

  try {
    const page = await browser.newPage();
    // Fixed viewport for deterministic desktop measurement (matches harness: desktop, no device emulation)
    const VIEWPORT_WIDTH = 1365;
    const VIEWPORT_HEIGHT = 768;
    await page.setViewport({
      width: VIEWPORT_WIDTH,
      height: VIEWPORT_HEIGHT,
      deviceScaleFactor: 1,
    });
    const flow = await startFlow(page, {
      name: `timespan-${slug}`,
      config: flowConfig,
    });
    await flow.navigate(url);
    await flow.startTimespan({ stepName: 'Interact' });

    // Deterministic interaction so INP audit runs (auditRan >= 1): focus + activate a control
    const skipLink = await page.$('[data-skip-link], a[href="#main-content"]');
    if (skipLink) {
      await skipLink.focus();
      await new Promise((r) => setTimeout(r, 50));
      await page.keyboard.press('Enter');
      await new Promise((r) => setTimeout(r, 80));
    }
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

    const cta = await page.$(
      'a[href="/en/brief"], a[href*="/brief"], .masthead-nav-primary a',
    );
    if (cta) {
      await cta.click();
      await new Promise((r) => setTimeout(r, 100));
      await page.goBack().catch(() => {});
      await new Promise((r) => setTimeout(r, 100));
    }

    if (urlPath === '/en/media') {
      const filterBtn = await page.$(
        'section[aria-labelledby="media-filter-heading"] button',
      );
      if (filterBtn) {
        await filterBtn.click();
        await new Promise((r) => setTimeout(r, 80));
      }
    }

    await flow.endTimespan();
    const flowResult = await flow.createFlowResult();
    const steps = flowResult?.steps ?? [];
    const navLhr = steps[0]?.lhr;
    const timespanLhr = steps[1]?.lhr;
    if (!navLhr) {
      console.error('collect-lhr-single.mjs: no navigation LHR');
      process.exit(1);
    }
    const merged = mergeInpIntoNav(
      JSON.parse(JSON.stringify(navLhr)),
      timespanLhr || {},
    );
    fs.mkdirSync(path.dirname(outFile), { recursive: true });
    fs.writeFileSync(outFile, JSON.stringify(merged), 'utf8');
  } finally {
    if (browser) await browser.disconnect();
    if (chrome) chrome.kill();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

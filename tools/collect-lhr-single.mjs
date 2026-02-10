/**
 * Single-URL Lighthouse timespan flow. Run with Node (ESM) so Lighthouse loads correctly.
 * Env: BASE_URL, URL_PATH (e.g. /en), SLUG (e.g. en), OUT_FILE (path to write .report.json).
 */
import fs from 'node:fs';
import path from 'node:path';
import * as chromeLauncher from 'chrome-launcher';
import puppeteer from 'puppeteer';
import { startFlow } from 'lighthouse/core/index.js';

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
  // Use chrome-launcher (same as LHCI) so Chrome is found in CI; then connect Puppeteer
  let chrome;
  let browser;
  try {
    chrome = await chromeLauncher.launch({
      chromeFlags: [
        '--headless=new',
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
      ],
    });
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
    const flow = await startFlow(page, { name: `timespan-${slug}` });
    await flow.navigate(url);
    await flow.startTimespan({ stepName: 'Interact' });

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

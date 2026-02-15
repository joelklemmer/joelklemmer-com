/**
 * Single-URL Lighthouse timespan flow. Run with Node (ESM) so Lighthouse loads correctly.
 * Uses pinned instrument config (formFactor, throttling, screenEmulation) for deterministic LCP.
 * Env: BASE_URL, URL_PATH (e.g. /en), SLUG (e.g. en), OUT_FILE (path to write .report.json).
 * Chrome: ephemeral user-data-dir and no-first-run flags to avoid profile picker in all paths.
 *
 * WHY THIS IS NOW DETERMINISTIC (enforced invariants):
 * - viewport: 1280x800, deviceScaleFactor 1
 * - colorScheme: light; reducedMotion: reduce
 * - consent: cookie set BEFORE navigation (v2 format) so banner never shows
 * - Chrome: isolated userDataDir under tmp/chrome-profile/<timestamp>; --headless=new; no profile
 * - preflight: wait main/masthead visible, close consent/dialogs/details[open], assert center not blocked
 * - safeClick: waits visible, scrolls into view, verifies elementFromPoint, retries once if blocked
 */
import fs from 'node:fs';
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
const SCREENSHOT_DIR = path.join(REPO_ROOT, 'tmp', 'lighthouse');
const INSTRUMENT_OUT = path.join(
  REPO_ROOT,
  'tmp',
  'lighthouse',
  'instrument.json',
);
const INP_AUDIT_ID = 'interaction-to-next-paint';

const VIEWPORT_WIDTH = 1280;
const VIEWPORT_HEIGHT = 800;

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

/**
 * Shared preflight: wait for main or masthead visible, close overlays,
 * assert viewport center not blocked. Cookies set before navigate in main().
 */
async function runPreflight(page) {
  await page.waitForSelector(
    'main#main-content, [data-testid="main-content"], [data-testid="masthead"], header[aria-label="Site header"]',
    { state: 'visible', timeout: 20000 },
  );
  await assertNoBlockingOverlays(page);
}

/**
 * Dismiss consent banner (role or data-consent-action), close dialogs,
 * close mobile nav. Assert viewport center is not covered by overlay.
 */
async function assertNoBlockingOverlays(page) {
  const acceptRegex = /accept|agree|allow|save/i;

  // Consent banner: role-based first, then data-consent-action
  const banner = await page.$('#consent-banner');
  if (banner) {
    const visible = await banner
      .evaluate((el) => {
        const s = getComputedStyle(el);
        return s.display !== 'none' && s.visibility !== 'hidden';
      })
      .catch(() => false);
    if (visible) {
      const roleBtn = await page
        .evaluateHandle((re) => {
          const btns = document.querySelectorAll('#consent-banner button');
          for (const b of btns) {
            if (re.test(b.textContent || '')) return b;
          }
          return null;
        }, acceptRegex)
        .catch(() => null);
      if (roleBtn) {
        const h = await roleBtn.asElement();
        if (h) {
          await h.click().catch(() => {});
          await page
            .waitForSelector('#consent-banner', {
              state: 'hidden',
              timeout: 2000,
            })
            .catch(() => {});
        }
        await roleBtn.dispose();
      } else {
        const dataAccept = await page.$('[data-consent-action="accept"]');
        if (dataAccept) {
          await dataAccept.click().catch(() => {});
          await page
            .waitForSelector('#consent-banner', {
              state: 'hidden',
              timeout: 2000,
            })
            .catch(() => {});
        }
      }
    }
  }

  // Dialogs: close via Escape or role-based close
  let dialogCount = 1;
  for (let i = 0; i < 5 && dialogCount > 0; i++) {
    const dialogs = await page.$$('[role="dialog"]');
    dialogCount = 0;
    for (const d of dialogs) {
      const isVisible = await d
        .evaluate((el) => {
          const s = getComputedStyle(el);
          return s.display !== 'none' && s.visibility !== 'hidden';
        })
        .catch(() => false);
      if (isVisible) {
        dialogCount++;
        const closeBtn = await d.$(
          '[data-testid="dialog-close"], button[aria-label*="lose"], button[aria-label*="ismiss"]',
        );
        if (closeBtn) await closeBtn.click().catch(() => {});
        else await page.keyboard.press('Escape');
      }
    }
    if (dialogCount > 0) await new Promise((r) => setTimeout(r, 80));
  }

  // Mobile nav: close details[open]
  await page.evaluate(() => {
    document
      .querySelectorAll(
        '[data-testid="masthead"] details[open], header details[open]',
      )
      .forEach((el) => el.removeAttribute('open'));
  });

  // Radix-style popovers
  await page.keyboard.press('Escape').catch(() => {});
  await page
    .evaluate(() => {
      document
        .querySelectorAll('[data-state="open"]')
        .forEach((el) => el.removeAttribute('data-state'));
    })
    .catch(() => {});

  // Assert viewport center is not banner/dialog and no blocking overlay
  const ok = await page.evaluate(
    ({ w, h }) => {
      const cx = w / 2;
      const cy = h / 2;
      const el = document.elementFromPoint(cx, cy);
      if (!el) return false;
      const inBanner = el.closest('#consent-banner');
      const inDialog = el.closest('[role="dialog"]');
      if (inBanner || inDialog) return false;
      let n = el;
      while (n && n !== document.body) {
        const s = getComputedStyle(n);
        if (
          s.pointerEvents === 'none' &&
          (s.position === 'fixed' || s.position === 'absolute')
        ) {
          const r = n.getBoundingClientRect();
          if (r.left <= cx && cx <= r.right && r.top <= cy && cy <= r.bottom)
            return false;
        }
        n = n.parentElement;
      }
      return true;
    },
    { w: VIEWPORT_WIDTH, h: VIEWPORT_HEIGHT },
  );
  if (!ok) {
    throw new Error(
      'assertNoBlockingOverlays: viewport center still blocked by overlay',
    );
  }
}

/**
 * Wait visible, scroll into view, assertNoBlockingOverlays, click. Retry once after clearing overlays.
 */
async function safeClick(page, selector) {
  const el = await page.waitForSelector(selector, {
    state: 'visible',
    timeout: 5000,
  });
  if (!el) {
    const screenshotPath = path.join(
      SCREENSHOT_DIR,
      `safeClick-fail-${Date.now()}.png`,
    );
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
    await page.screenshot({ path: screenshotPath }).catch(() => {});
    throw new Error(
      `safeClick: selector "${selector}" not found or not visible. Screenshot: ${screenshotPath}`,
    );
  }
  await el.evaluate((e) =>
    e.scrollIntoView({
      block: 'nearest',
      inline: 'nearest',
      behavior: 'instant',
    }),
  );
  await assertNoBlockingOverlays(page);

  /** Verify click target is not obscured: elementAtPoint at center should be target or descendant. */
  const blocked = await page
    .evaluate((sel) => {
      const target = document.querySelector(sel);
      if (!target) return { blocked: true, reason: 'target-not-found' };
      const r = target.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const atPoint = document.elementFromPoint(cx, cy);
      if (!atPoint) return { blocked: true, reason: 'no-element-at-point' };
      const isTargetOrChild =
        target.contains(atPoint) || atPoint.contains(target);
      if (!isTargetOrChild) {
        const s = getComputedStyle(atPoint);
        const sel = atPoint.id
          ? `#${atPoint.id}`
          : `${atPoint.tagName}${atPoint.className && typeof atPoint.className === 'string' ? '.' + atPoint.className.trim().split(/\s+/).join('.') : ''}`;
        return {
          blocked: true,
          blockingSelector: sel,
          pointerEvents: s.pointerEvents,
          zIndex: s.zIndex,
        };
      }
      return { blocked: false };
    }, selector)
    .catch(() => ({ blocked: true, reason: 'eval-error' }));

  if (blocked.blocked) {
    console.error('safeClick: target blocked', JSON.stringify(blocked));
    await assertNoBlockingOverlays(page);
  }

  try {
    await el.click();
    return true;
  } catch (err) {
    await assertNoBlockingOverlays(page);
    try {
      await el.click();
      return true;
    } catch (err2) {
      const screenshotPath = path.join(
        SCREENSHOT_DIR,
        `safeClick-click-fail-${Date.now()}.png`,
      );
      fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
      await page.screenshot({ path: screenshotPath }).catch(() => {});

      const diagnostic = await page
        .evaluate((sel) => {
          const target = document.querySelector(sel);
          if (!target) return { clickTarget: null, elementAtPoint: null };
          const r = target.getBoundingClientRect();
          const cx = r.left + r.width / 2;
          const cy = r.top + r.height / 2;
          const atPoint = document.elementFromPoint(cx, cy);
          const selectorPath = (e) => {
            if (!e) return null;
            const parts = [];
            let n = e;
            while (n && n !== document.body) {
              let sel = n.tagName.toLowerCase();
              if (n.id) sel += `#${n.id}`;
              else if (n.className && typeof n.className === 'string')
                sel += '.' + n.className.trim().split(/\s+/).join('.');
              parts.unshift(sel);
              n = n.parentElement;
            }
            return parts.join(' > ');
          };
          const dump = (e) => {
            if (!e) return null;
            const s = getComputedStyle(e);
            return {
              tagName: e.tagName,
              id: e.id || null,
              className: e.className || null,
              pointerEvents: s.pointerEvents,
              zIndex: s.zIndex,
              selectorPath: selectorPath(e),
            };
          };
          return {
            clickTarget: dump(target),
            elementAtPoint: dump(atPoint),
            clickCenter: { x: cx, y: cy },
          };
        }, selector)
        .catch(() => ({}));

      const diagStr = JSON.stringify(diagnostic, null, 2);
      console.error('safeClick diagnostics:', diagStr);
      throw new Error(
        `safeClick: click failed for "${selector}" - ${err2?.message || err2}. ` +
          `Screenshot: ${screenshotPath}. elementAtPoint: ${diagStr}`,
      );
    }
  }
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

  /** Isolated profile; never use user's real Chrome profile. */
  const userDataDir = path.join(
    REPO_ROOT,
    'tmp',
    'chrome-profile',
    `lh-${Date.now()}`,
  );
  fs.mkdirSync(path.dirname(userDataDir), { recursive: true });
  const chromePath =
    (process.env.LH_CHROME_PATH || process.env.CHROME_PATH || '').trim() ||
    undefined;
  let chrome;
  let browser;
  try {
    const chromeFlags = [
      '--headless=new',
      '--no-first-run',
      '--no-default-browser-check',
      '--disable-sync',
      '--disable-extensions',
      '--disable-features=Translate,OptimizationHints,MediaRouter',
      '--disable-gpu',
      '--password-store=basic',
      '--use-mock-keychain',
      '--disable-background-networking',
      '--disable-background-timer-throttling',
      '--disable-renderer-backgrounding',
      '--disable-dev-shm-usage',
      '--window-size=1280,800',
      `--user-data-dir=${userDataDir}`,
    ];
    if (process.env.CI === 'true' || process.env.CI === '1') {
      chromeFlags.push('--no-sandbox');
    }
    const launchOpts = {
      ...(chromePath && { chromePath }),
      chromeFlags,
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

    await page.setViewport({
      width: VIEWPORT_WIDTH,
      height: VIEWPORT_HEIGHT,
      deviceScaleFactor: 1,
    });
    if (typeof page.emulateMedia === 'function') {
      await page.emulateMedia({
        colorScheme: 'light',
        reducedMotion: 'reduce',
      });
    } else if (typeof page.evaluateOnNewDocument === 'function') {
      await page.evaluateOnNewDocument(() => {
        document.documentElement.setAttribute('data-theme', 'light');
        document.documentElement.style.colorScheme = 'light';
      });
    }

    const flow = await startFlow(page, {
      name: `timespan-${slug}`,
      config: flowConfig,
    });

    const consentPayload = {
      v: 2,
      t: Date.now(),
      c: true,
      cat: {
        essential: true,
        functional: true,
        analytics: true,
        experience: true,
        marketing: true,
      },
      pur: {
        measurement: true,
        experimentation: true,
        personalization: true,
        security: true,
        fraud: true,
        recommendation: true,
        profiling: true,
      },
      model: false,
    };
    const consentValue = Buffer.from(
      JSON.stringify(consentPayload),
      'utf8',
    ).toString('base64');
    await page.setCookie({
      name: 'joelklemmer-consent',
      value: consentValue,
      url,
    });

    await flow.navigate(url);
    await flow.startTimespan({ stepName: 'Interact' });

    await runPreflight(page);

    // Stabilize: fonts + 2 rAF
    await page.waitForFunction(() => document.readyState === 'complete', {
      timeout: 5000,
    });
    await page.evaluate(async () => {
      await document.fonts.ready;
      await new Promise((r) =>
        requestAnimationFrame(() => requestAnimationFrame(() => r())),
      );
    });

    await assertNoBlockingOverlays(page);

    // Deterministic interactions for INP audit
    const skipLink = await page.$('[data-skip-link], a[href="#main-content"]');
    if (skipLink) {
      const vis = await skipLink
        .evaluate((e) => {
          const r = e.getBoundingClientRect();
          return r.width > 0 && r.height > 0;
        })
        .catch(() => false);
      if (vis) {
        await skipLink.evaluate((e) =>
          e.scrollIntoView({ block: 'nearest', inline: 'nearest' }),
        );
        await assertNoBlockingOverlays(page);
        await skipLink.focus().catch(() => {});
        await page.keyboard.press('Enter').catch(() => {});
      }
    }
    await page.keyboard.down('Tab').catch(() => {});
    await page.keyboard.up('Tab').catch(() => {});

    // Mobile nav trigger only visible at <768px; at 1280x800 it is hidden (md:hidden)
    const trigger = await page.$('#primary-nav-trigger');
    if (trigger) {
      const vis = await trigger
        .evaluate((e) => {
          const s = getComputedStyle(e);
          if (s.display === 'none' || s.visibility === 'hidden') return false;
          const r = e.getBoundingClientRect();
          return r.width > 0 && r.height > 0 && r.top >= 0 && r.left >= 0;
        })
        .catch(() => false);
      if (vis) {
        await safeClick(page, '#primary-nav-trigger');
        await page.keyboard.press('Escape').catch(() => {});
      }
    }

    const briefSelector =
      'a[href="/en/brief"], a[href*="/brief"], .nav-primary-link[href*="brief"]';
    const briefLink = await page.$(briefSelector);
    if (briefLink) {
      await safeClick(page, briefSelector);
      await page.goBack().catch(() => {});
    }

    if (urlPath === '/en/media') {
      const mediaBtn = await page.$(
        'section[aria-labelledby="media-filter-heading"] button',
      );
      if (mediaBtn) {
        await safeClick(
          page,
          'section[aria-labelledby="media-filter-heading"] button',
        );
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

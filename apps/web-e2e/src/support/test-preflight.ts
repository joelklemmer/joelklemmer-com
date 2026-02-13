/**
 * Deterministic test preflight contract shared by Playwright and Lighthouse.
 * Ensures server readiness, stable client state, closed overlays, and stable viewport.
 *
 * WHY THIS IS NOW DETERMINISTIC (enforced invariants):
 * - viewport: 1280×800, deviceScaleFactor 1 (set by playwright config)
 * - colorScheme: light; reducedMotion: reduce
 * - consent: accepted via cookie (consent-store-v2 format) so banner never shows
 * - theme: data-theme=light, style.colorScheme=light
 * - overlays: consent banner, dialogs, details[open] in masthead/header closed before screenshot
 * - readiness: main#main-content OR [data-testid="main-content"] OR masthead/header visible before proceed
 * - fonts: document.fonts.ready + 2 RAF ticks; e2e font override (system-ui) when PLAYWRIGHT_TEST
 */
import fs from 'node:fs';
import path from 'node:path';
import type { Page } from '@playwright/test';

const MAIN_MARKER = 'main#main-content';
const ROOT_SELECTOR =
  'main#main-content, [data-testid="main-content"], [data-testid="masthead"], header[aria-label="Site header"]';
const MASTHEAD_SELECTOR =
  '[data-testid="masthead"], header[aria-label="Site header"]';
const BANNER_ID = 'consent-banner';
const SERVER_READY_TIMEOUT_MS = 20000;
const DIAGNOSTICS_DIR = path.join(
  process.cwd(),
  'dist',
  '.playwright',
  'diagnostics',
);

/** Contract viewport: single deterministic size for visual/RTL/Lighthouse. */
export const CONTRACT_VIEWPORT = { width: 1280, height: 800 } as const;

/** Encode v2 consent state to cookie value (matches consent-store-v2 format). */
function encodeConsentAccepted(): string {
  const state = {
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
  return btoa(unescape(encodeURIComponent(JSON.stringify(state))));
}

async function captureServerReadyDiagnostics(page: Page): Promise<string> {
  const ts = Date.now();
  const screenshotPath = path.join(DIAGNOSTICS_DIR, `server-ready-${ts}.png`);
  try {
    await fs.promises.mkdir(DIAGNOSTICS_DIR, { recursive: true });
    await page.screenshot({ path: screenshotPath }).catch(() => {});
  } catch {
    /* no-op */
  }
  const dump = await page
    .evaluate(() => {
      const consent = document.querySelector(
        '#consent-banner, [data-consent], [data-consent-banner]',
      );
      const detailsOpen = document.querySelectorAll(
        'header details[open], [data-testid="masthead"] details[open]',
      );
      return {
        location: window.location.href,
        pathname: window.location.pathname,
        readyState: document.readyState,
        bodyPreview: document.body?.innerText?.slice(0, 400) ?? '(no body)',
        consentExists: !!consent,
        consentVisible: consent
          ? getComputedStyle(consent as Element).display !== 'none'
          : false,
        detailsOpenCount: detailsOpen.length,
      };
    })
    .catch(() => ({}));
  return `Server ready timeout. Screenshot: ${screenshotPath}. Dump: ${JSON.stringify(dump, null, 2)}`;
}

export interface GotoAndEnsureReadyOptions {
  baseOrigin: string;
  timeoutMs?: number;
}

/**
 * Deterministic navigation + readiness. Single source of truth for all specs.
 * 1. goto with domcontentloaded
 * 2. wait for main/masthead visible (20s)
 * 3. 2 RAF ticks
 * 4. pathname check
 * On timeout: screenshot + diagnostics.
 */
export async function gotoAndEnsureReady(
  page: Page,
  pathname: string,
  {
    baseOrigin,
    timeoutMs = SERVER_READY_TIMEOUT_MS,
  }: GotoAndEnsureReadyOptions,
): Promise<void> {
  const origin = baseOrigin.replace(/\/+$/, '');
  const base = origin.startsWith('http') ? origin : `http://${origin}`;
  const url = pathname.startsWith('/')
    ? `${base}${pathname}`
    : `${base}/${pathname}`;

  await page.goto(url, {
    waitUntil: 'domcontentloaded',
    timeout: timeoutMs + 5000,
  });

  try {
    await page.waitForSelector(ROOT_SELECTOR, {
      state: 'visible',
      timeout: timeoutMs,
    });
  } catch (err) {
    const msg = await captureServerReadyDiagnostics(page);
    throw new Error(`${msg}. Original: ${(err as Error)?.message ?? err}`);
  }

  await page.evaluate(() => {
    return new Promise<void>((r) =>
      requestAnimationFrame(() => requestAnimationFrame(() => r())),
    );
  });

  const actualPath = await page.evaluate(() => window.location.pathname);
  const normalized = pathname.startsWith('/') ? pathname : `/${pathname}`;
  const pathOk =
    actualPath === normalized ||
    actualPath === `${normalized}/` ||
    actualPath.startsWith(`${normalized}/`);
  if (!pathOk) {
    throw new Error(
      `gotoAndEnsureReady: pathname "${actualPath}" does not match "${normalized}"`,
    );
  }
}

/**
 * When page is already navigated, wait for marker + path check.
 * Use gotoAndEnsureReady for navigation; this for re-check after client transitions.
 */
export async function ensureServerReady(
  page: Page,
  expectedPath: string,
  timeoutMs = 15000,
): Promise<void> {
  const marker = page.locator(ROOT_SELECTOR).first();
  await marker.waitFor({ state: 'visible', timeout: timeoutMs });
  const pathname = await page.evaluate(() => window.location.pathname);
  const normalized = expectedPath.startsWith('/')
    ? expectedPath
    : `/${expectedPath}`;
  const pathOk =
    pathname === normalized ||
    pathname === `${normalized}/` ||
    pathname.startsWith(`${normalized}/`);
  if (!pathOk) {
    throw new Error(
      `ensureServerReady: pathname "${pathname}" does not match "${normalized}"`,
    );
  }
}

export interface SetDeterministicClientStateOptions {
  locale?: string;
  baseOrigin: string;
}

/**
 * Establishes the deterministic test runtime contract. Includes test-only font
 * override (system-ui) when __E2E__ or PLAYWRIGHT_TEST so visuals do not depend
 * on downloadable font timing.
 */
export async function setDeterministicClientState(
  page: Page,
  { locale = 'en', baseOrigin }: SetDeterministicClientStateOptions,
): Promise<void> {
  const context = page.context();
  await context.clearCookies();

  /** Determinism: fixed viewport; deviceScaleFactor set by playwright.visual.config */
  await page.setViewportSize(CONTRACT_VIEWPORT);
  await page.emulateMedia({
    colorScheme: 'light',
    reducedMotion: 'reduce',
  });

  const origin = baseOrigin.replace(/\/+$/, '');
  const url = origin.startsWith('http') ? origin : `http://${origin}`;

  const isE2E =
    process.env['PLAYWRIGHT_TEST'] === 'true' ||
    process.env['__E2E__'] === 'true';
  await page.addInitScript((applyFontOverride: boolean) => {
    (window as unknown as { __E2E__?: boolean }).__E2E__ = applyFontOverride;
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {
      /* no-op */
    }
    document.documentElement.setAttribute('data-theme', 'light');
    if (document.documentElement.style) {
      document.documentElement.style.colorScheme = 'light';
    }
    if (applyFontOverride) {
      const style = document.createElement('style');
      style.id = 'e2e-font-override';
      style.textContent =
        'html, body { font-family: system-ui, sans-serif !important; }';
      if (!document.getElementById('e2e-font-override')) {
        document.documentElement.appendChild(style);
      }
    }
  }, isE2E);

  /** Determinism: consent cookie (v2 format) so app never shows banner; theme cookie for light mode. */
  const consentValue = encodeConsentAccepted();
  try {
    await context.addCookies([
      { name: 'consent', value: consentValue, url, path: '/' },
      { name: 'joelklemmer-theme', value: 'light', url, path: '/' },
    ]);
  } catch {
    /* optional */
  }
}

/**
 * Verifies consent banner is absent. If present, clicks accept and waits for removal.
 */
export async function ensureConsentDismissed(page: Page): Promise<void> {
  const banner = page.locator(
    `#${BANNER_ID}, [data-consent-banner], [data-consent]`,
  );
  if ((await banner.count()) === 0) return;
  const acceptBtn = page.locator('[data-consent-action="accept"]');
  if (await acceptBtn.isVisible().catch(() => false)) {
    await acceptBtn.click();
    await page
      .locator(`#${BANNER_ID}`)
      .first()
      .waitFor({ state: 'hidden', timeout: 5000 })
      .catch(() => {});
  }
}

/**
 * Comprehensive overlay closure: details[open], dialogs, consent, preferences.
 * Always run after ensureServerReady and again before screenshot/assert.
 */
export async function closeAnyOverlays(page: Page): Promise<void> {
  const dialogClose = page.locator('[data-testid="dialog-close"]');
  if (await dialogClose.isVisible().catch(() => false)) {
    await dialogClose.click().catch(() => {});
  }

  const dialogs = page.locator('[role="dialog"], dialog[open]');
  for (let i = 0; i < (await dialogs.count()); i++) {
    const d = dialogs.nth(i);
    if (await d.isVisible().catch(() => false)) {
      const closeBtn = d.locator(
        '[data-testid="dialog-close"], button[aria-label*="lose"], button[aria-label*="ismiss"]',
      );
      if (await closeBtn.isVisible().catch(() => false)) {
        await closeBtn
          .first()
          .click()
          .catch(() => {});
      } else {
        await page.keyboard.press('Escape').catch(() => {});
      }
    }
  }

  const mastheadDetails = page.locator(
    '[data-testid="masthead"] details[open], header details[open]',
  );
  for (let i = 0; i < (await mastheadDetails.count()); i++) {
    await mastheadDetails
      .nth(i)
      .evaluate((el) => el.removeAttribute('open'))
      .catch(() => {});
  }

  /** Close any Radix-style popovers or open menus (language, theme, etc). */
  await page.keyboard.press('Escape').catch(() => {});
  await page
    .evaluate(() => {
      document
        .querySelectorAll('[data-state="open"]')
        .forEach((el) => el.removeAttribute('data-state'));
    })
    .catch(() => {});

  await ensureConsentDismissed(page);
}

/**
 * Throws if blocking overlays remain. Use after closeAnyOverlays.
 */
export async function assertNoBlockingOverlays(page: Page): Promise<void> {
  const blockers = await page.evaluate(() => {
    const selectors = [
      '[data-consent]',
      '[data-consent-banner]',
      '#consent-banner',
      'dialog[open]',
      'header details[open]',
      '[data-testid="masthead"] details[open]',
    ];
    const results: Array<{
      selector: string;
      tagName: string;
      id: string | null;
      className: string | null;
      rect: { width: number; height: number; top: number; left: number };
      zIndex: string;
      position: string;
    }> = [];
    for (const sel of selectors) {
      const els = document.querySelectorAll(sel);
      for (const el of els) {
        const style = getComputedStyle(el);
        if (style.display === 'none' && style.visibility === 'hidden') continue;
        const rect = (el as Element).getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          results.push({
            selector: sel,
            tagName: el.tagName,
            id: el.id || null,
            className: (el as Element).className || null,
            rect: {
              width: rect.width,
              height: rect.height,
              top: rect.top,
              left: rect.left,
            },
            zIndex: style.zIndex,
            position: style.position,
          });
        }
      }
    }
    const fixedOverlays = document.querySelectorAll(
      '[style*="position: fixed"], [style*="position:fixed"]',
    );
    for (const el of fixedOverlays) {
      const style = getComputedStyle(el);
      const rect = (el as Element).getBoundingClientRect();
      if (
        parseInt(style.zIndex || '0', 10) > 100 &&
        rect.width >= window.innerWidth * 0.5
      ) {
        results.push({
          selector: 'fixed-overlay',
          tagName: el.tagName,
          id: el.id || null,
          className: (el as Element).className || null,
          rect: {
            width: rect.width,
            height: rect.height,
            top: rect.top,
            left: rect.left,
          },
          zIndex: style.zIndex,
          position: style.position,
        });
      }
    }
    return results;
  });

  if (blockers.length > 0) {
    const ts = Date.now();
    const screenshotPath = path.join(
      DIAGNOSTICS_DIR,
      `blocking-overlays-${ts}.png`,
    );
    try {
      await fs.promises.mkdir(DIAGNOSTICS_DIR, { recursive: true });
      await page.screenshot({ path: screenshotPath }).catch(() => {});
    } catch {
      /* no-op */
    }
    throw new Error(
      `assertNoBlockingOverlays: blocking elements found: ${JSON.stringify(blockers, null, 2)}. Screenshot: ${screenshotPath}`,
    );
  }
}

/**
 * Font strategy: document.fonts.ready + 2 RAF only. No fallback wait; test font
 * override ensures system-ui in e2e context.
 */
export async function stabilizeViewport(page: Page): Promise<void> {
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
  await page.evaluate(() => {
    return new Promise<void>((r) =>
      requestAnimationFrame(() => requestAnimationFrame(() => r())),
    );
  });
}

export async function expectMastheadVisible(page: Page) {
  const header = page.locator(MASTHEAD_SELECTOR).first();
  await header.waitFor({ state: 'visible', timeout: 10000 });
  return header;
}

/**
 * Positions utilities scroller for RTL: scrollLeft to max if rtl, else 0.
 */
export async function positionUtilitiesScrollerForRtl(
  page: Page,
): Promise<void> {
  const dir = await page.evaluate(
    () => getComputedStyle(document.documentElement).direction,
  );
  const scroller = page.locator(
    '[data-masthead-utilities], .masthead-utilities-wrap',
  );
  if ((await scroller.count()) === 0) return;
  await scroller.first().evaluate((el, rtl) => {
    const scroll = el as HTMLElement;
    const maxScroll = Math.max(0, scroll.scrollWidth - scroll.clientWidth);
    scroll.scrollLeft = rtl ? maxScroll : 0;
  }, dir === 'rtl');
}

export async function scrollElementIntoView(locator: {
  evaluate: (fn: (el: HTMLElement) => void) => Promise<void>;
}): Promise<void> {
  await locator.evaluate((el) => {
    el.scrollIntoView({
      block: 'nearest',
      inline: 'nearest',
      behavior: 'instant',
    });
  });
}

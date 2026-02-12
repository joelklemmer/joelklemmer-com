/**
 * Visual/presentation-integrity fixtures: deterministic app-ready, isolation, and navigation.
 * Import this file first in each spec so beforeEach runs before @playwright/test.
 */
import { test as base, expect, type Page } from '@playwright/test';

const baseURL = process.env['BASE_URL'] ?? 'http://127.0.0.1:3000';

/** Clear cookies and storage before each test to avoid cross-test leakage. */
base.beforeEach(async ({ context, page }) => {
  await context.clearCookies();
  const base = (process.env['BASE_URL'] ?? 'http://127.0.0.1:3000').replace(
    /\/+$/,
    '',
  );
  const origin = base.startsWith('http') ? base : `http://${base}`;
  try {
    await context.addCookies([
      {
        name: 'joelklemmer-theme',
        value: 'light',
        url: origin,
      },
    ]);
  } catch {
    /* Cookie setup optional; clearCookies and addInitScript still run */
  }
  await page.addInitScript(() => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {
      /* no-op if storage unavailable */
    }
  });
});

/** Wait for app shell to be ready: masthead + main landmark visible, fonts loaded, layout settled. */
export async function waitForAppReady(page: Page): Promise<void> {
  await expect(
    page.locator('[data-testid="masthead"], header[aria-label]'),
  ).toBeVisible({ timeout: 15000 });
  await expect(
    page.locator('[data-testid="main-content"], main#main-content'),
  ).toBeVisible({ timeout: 15000 });
  await page.evaluate(async () => {
    await document.fonts.ready;
    await new Promise<void>((r) =>
      requestAnimationFrame(() => requestAnimationFrame(() => r())),
    );
  });
}

/** Navigate to path and wait for app ready. Use for consistent readiness. */
export async function gotoWithReady(
  page: Page,
  path: string,
  options?: {
    waitUntil?: 'load' | 'domcontentloaded' | 'networkidle';
    timeout?: number;
  },
): Promise<void> {
  const { waitUntil = 'networkidle', timeout = 30000 } = options ?? {};
  await page.goto(path, { waitUntil, timeout });
  await waitForAppReady(page);
}

export const test = base;
export { expect };

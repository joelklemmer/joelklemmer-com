/**
 * Theme pre-paint: data-theme set before first paint, no flash.
 * Background must not transition light→dark or dark→light after first paint.
 * Respects prefers-color-scheme for system default.
 */
import './visual-fixtures';
import { test, expect } from '@playwright/test';

const ROUTE = '/en';
const STABILITY_WINDOW_MS = 800;

test.describe('theme pre-paint', () => {
  test('data-theme is set before first paint (light)', async ({ browser }) => {
    const context = await browser.newContext({ colorScheme: 'light' });
    const page = await context.newPage();
    await page.goto(ROUTE, { waitUntil: 'domcontentloaded' });
    const themeImmediate = await page.getAttribute('html', 'data-theme');
    const bgImmediate = await page.evaluate(
      () => getComputedStyle(document.body).backgroundColor,
    );
    expect(themeImmediate).toBeTruthy();
    expect(themeImmediate).toMatch(/^light|dark$/);
    await page.waitForTimeout(STABILITY_WINDOW_MS);
    const themeAfter = await page.getAttribute('html', 'data-theme');
    const bgAfter = await page.evaluate(
      () => getComputedStyle(document.body).backgroundColor,
    );
    expect(themeAfter).toBe(themeImmediate);
    expect(bgAfter).toBe(bgImmediate);
    await context.close();
  });

  test('data-theme is set before first paint (dark)', async ({ browser }) => {
    const context = await browser.newContext({ colorScheme: 'dark' });
    const page = await context.newPage();
    await page.goto(ROUTE, { waitUntil: 'domcontentloaded' });
    const themeImmediate = await page.getAttribute('html', 'data-theme');
    const bgImmediate = await page.evaluate(
      () => getComputedStyle(document.body).backgroundColor,
    );
    expect(themeImmediate).toBeTruthy();
    expect(themeImmediate).toMatch(/^light|dark$/);
    await page.waitForTimeout(STABILITY_WINDOW_MS);
    const themeAfter = await page.getAttribute('html', 'data-theme');
    const bgAfter = await page.evaluate(
      () => getComputedStyle(document.body).backgroundColor,
    );
    expect(themeAfter).toBe(themeImmediate);
    expect(bgAfter).toBe(bgImmediate);
    await context.close();
  });

  test('background does not flip theme after hydration', async ({
    browser,
  }) => {
    const context = await browser.newContext({ colorScheme: 'light' });
    const page = await context.newPage();
    await page.goto(ROUTE, { waitUntil: 'networkidle' });
    const theme = await page.getAttribute('html', 'data-theme');
    const bg = await page.evaluate(
      () => getComputedStyle(document.body).backgroundColor,
    );
    expect(theme).toMatch(/^light|dark$/);
    expect(bg).toBeTruthy();
    await page.waitForTimeout(500);
    const bg2 = await page.evaluate(
      () => getComputedStyle(document.body).backgroundColor,
    );
    expect(bg2).toBe(bg);
    await context.close();
  });
});

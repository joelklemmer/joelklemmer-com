/**
 * Minimal high-signal visual regression: home viewport, masthead, brief viewport,
 * RTL home. Deterministic fonts (Inter Variable), reduced motion. Snapshots in __screenshots__.
 */
import { test, expect } from '@playwright/test';

test.describe('visual regression', () => {
  test.use({
    reducedMotion: 'reduce',
  });

  /** Determinism: fonts loaded, layout settled (double rAF), reduced motion via test.use. */
  async function waitForStableViewport(page: {
    evaluate: (fn: () => Promise<void>) => Promise<void>;
  }) {
    await page.evaluate(async () => {
      await document.fonts.ready;
      await new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      );
    });
  }

  test('home top viewport', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/en', { waitUntil: 'networkidle' });
    await waitForStableViewport(page);
    await expect(page).toHaveScreenshot('home-viewport.png', {
      clip: { x: 0, y: 0, width: 1280, height: 800 },
      maxDiffPixels: 500,
    });
  });

  test('masthead region', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/en', { waitUntil: 'networkidle' });
    await waitForStableViewport(page);
    const header = page.locator('header[aria-label]').first();
    await expect(header).toHaveScreenshot('masthead.png', {
      maxDiffPixels: 300,
    });
  });

  test('brief top viewport', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/en/brief', { waitUntil: 'networkidle' });
    await waitForStableViewport(page);
    await expect(page).toHaveScreenshot('brief-viewport.png', {
      clip: { x: 0, y: 0, width: 1280, height: 800 },
      maxDiffPixels: 500,
    });
  });

  test('RTL home top viewport', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/he', { waitUntil: 'networkidle' });
    await waitForStableViewport(page);
    await expect(page).toHaveScreenshot('rtl-home-viewport.png', {
      clip: { x: 0, y: 0, width: 1280, height: 800 },
      maxDiffPixels: 500,
    });
  });

  test('media library filter row', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/en/media', { waitUntil: 'networkidle' });
    await waitForStableViewport(page);
    const filterSection = page
      .locator('section[aria-labelledby="media-filter-heading"]')
      .first();
    await expect(filterSection).toBeVisible();
    await expect(filterSection).toHaveScreenshot('media-filter-row.png', {
      maxDiffPixels: 500,
    });
  });
});

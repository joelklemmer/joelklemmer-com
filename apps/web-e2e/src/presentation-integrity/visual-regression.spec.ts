/**
 * Minimal high-signal visual regression: home viewport, masthead, brief viewport,
 * RTL home. Deterministic fonts (Inter Variable), reduced motion. Snapshots in __screenshots__.
 */
import path from 'node:path';
import fs from 'node:fs';
import { test, expect } from './visual-fixtures';
import {
  setDeterministicClientState,
  gotoAndEnsureReady,
  closeAnyOverlays,
  stabilizeViewport,
  assertNoBlockingOverlays,
  expectMastheadVisible,
} from '../support/test-preflight';

const BASE = (process.env['BASE_URL'] ?? 'http://127.0.0.1:3000').replace(
  /\/+$/,
  '',
);
const BASE_ORIGIN = BASE.startsWith('http') ? BASE : `http://${BASE}`;

test.describe('visual regression', () => {
  test.use({
    reducedMotion: 'reduce',
  });

  test.beforeEach(async ({ page }) => {
    await setDeterministicClientState(page, {
      locale: 'en',
      baseOrigin: BASE_ORIGIN,
    });
  });

  test('home top viewport', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await gotoAndEnsureReady(page, '/en', { baseOrigin: BASE_ORIGIN });
    await closeAnyOverlays(page);
    await assertNoBlockingOverlays(page);
    await stabilizeViewport(page);
    await expect(page).toHaveScreenshot('home-viewport.png', {
      clip: { x: 0, y: 0, width: 1280, height: 800 },
      maxDiffPixels: 500,
    });
  });

  test('masthead region', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await gotoAndEnsureReady(page, '/en', { baseOrigin: BASE_ORIGIN });
    await closeAnyOverlays(page);
    await assertNoBlockingOverlays(page);
    await stabilizeViewport(page);

    await expectMastheadVisible(page);
    await closeAnyOverlays(page);
    await assertNoBlockingOverlays(page);
    await stabilizeViewport(page);

    // Determinism: screenshot only the top bar (0,0,1280,80) to avoid any dropdown/popover.
    // At 1280px md:hidden hides mobile nav; clip ensures we never capture expanded overlays.
    await expect(page).toHaveScreenshot('masthead.png', {
      clip: { x: 0, y: 0, width: 1280, height: 80 },
      maxDiffPixels: 300,
      timeout: 10000,
    });
  });

  test('brief top viewport', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await gotoAndEnsureReady(page, '/en/brief', { baseOrigin: BASE_ORIGIN });
    await closeAnyOverlays(page);
    await assertNoBlockingOverlays(page);
    await stabilizeViewport(page);
    await expect(page).toHaveScreenshot('brief-viewport.png', {
      clip: { x: 0, y: 0, width: 1280, height: 800 },
      maxDiffPixels: 500,
    });
  });

  test('RTL home top viewport', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await gotoAndEnsureReady(page, '/he', { baseOrigin: BASE_ORIGIN });
    await closeAnyOverlays(page);
    await assertNoBlockingOverlays(page);
    await stabilizeViewport(page);
    await expect(page).toHaveScreenshot('rtl-home-viewport.png', {
      clip: { x: 0, y: 0, width: 1280, height: 800 },
      maxDiffPixels: 500,
    });
  });

  test('media library filter row', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await gotoAndEnsureReady(page, '/en/media', { baseOrigin: BASE_ORIGIN });
    await closeAnyOverlays(page);
    await assertNoBlockingOverlays(page);
    await stabilizeViewport(page);
    const filterRow = page.locator('[data-testid="media-filter-row"]').first();
    await expect(filterRow).toBeVisible({ timeout: 15000 });
    const box = await filterRow.boundingBox();
    if (box && box.width < 1000) {
      const pathname = await page.evaluate(() => window.location.pathname);
      const wrapperClasses = await page
        .locator('[data-testid="media-filter-row"]')
        .first()
        .evaluate(
          (el) => (el.parentElement as Element)?.getAttribute?.('class') ?? '',
        );
      const diagnosticsDir = path.join(
        process.cwd(),
        'dist',
        '.playwright',
        'diagnostics',
      );
      await fs.promises.mkdir(diagnosticsDir, { recursive: true });
      const screenshotPath = path.join(
        diagnosticsDir,
        `media-filter-row-width-${Date.now()}.png`,
      );
      await page.screenshot({ path: screenshotPath }).catch(() => {});
      throw new Error(
        `media filter row: width ${box.width}px at 1280 viewport expected >=1000. ` +
          `pathname=${pathname} wrapperClasses=${wrapperClasses}. ` +
          `Screenshot: ${screenshotPath}. Check layout: filter row must use full-bleed wrapper (no max-w-*).`,
      );
    }
    await expect(filterRow).toHaveScreenshot('media-filter-row.png', {
      maxDiffPixels: 500,
    });
  });
});

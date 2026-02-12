/**
 * Minimal high-signal visual regression: home viewport, masthead, brief viewport,
 * RTL home. Deterministic fonts (Inter Variable), reduced motion. Snapshots in __screenshots__.
 */
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

    const header = await expectMastheadVisible(page);
    // Forcibly close any mobile nav details and cookie banner remnants before screenshot
    await closeAnyOverlays(page);
    await header.evaluate((el) => {
      const details = el.querySelectorAll('details[open]');
      details.forEach((d) => d.removeAttribute('open'));
    });

    const headerHeight = await header
      .boundingBox()
      .then((b) => (b ? b.height : 0));
    if (headerHeight > 140) {
      throw new Error(
        `masthead region: header height ${headerHeight}px exceeds expected range (<=140). ` +
          `Mobile nav or overlay likely expanded. Run closeAnyOverlays before screenshot.`,
      );
    }
    await expect(header).toHaveScreenshot('masthead.png', {
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
    if (box && Math.abs(box.width - 1280) > 100) {
      await page.setViewportSize({ width: 1280, height: 800 });
      await page.evaluate(
        () =>
          new Promise<void>((r) =>
            requestAnimationFrame(() => requestAnimationFrame(() => r())),
          ),
      );
    }
    const boxAfter = await filterRow.boundingBox();
    if (boxAfter && boxAfter.width < 600) {
      throw new Error(
        `media filter row: width ${boxAfter.width}px expected ~1280. Layout context may be wrong.`,
      );
    }
    await expect(filterRow).toHaveScreenshot('media-filter-row.png', {
      maxDiffPixels: 500,
    });
  });
});

/**
 * Minimal high-signal visual regression: home viewport, masthead, brief viewport,
 * RTL home. Deterministic fonts (Inter Variable), reduced motion. Snapshots in __screenshots__.
 */
import { test, expect } from './visual-fixtures';

/** V2 consent (accepted all) for deterministic screenshots: no banner. */
const CONSENT_ACCEPTED =
  'eyJ2IjoyLCJ0IjoxNzAwMDAwMDAwMDAwLCJjIjp0cnVlLCJjYXQiOnsiZXNzZW50aWFsIjp0cnVlLCJmdW5jdGlvbmFsIjp0cnVlLCJhbmFseXRpY3MiOnRydWUsImV4cGVyaWVuY2UiOnRydWUsIm1hcmtldGluZyI6dHJ1ZX0sInB1ciI6eyJtZWFzdXJlbWVudCI6dHJ1ZSwiZXhwZXJpbWVudGF0aW9uIjp0cnVlLCJwZXJzb25hbGl6YXRpb24iOnRydWUsInNlY3VyaXR5Ijp0cnVlLCJmcmF1ZCI6dHJ1ZSwicmVjb21tZW5kYXRpb24iOnRydWUsInByb2ZpbGluZyI6dHJ1ZX0sIm1vZGVsIjpmYWxzZX0=';

test.describe('visual regression', () => {
  test.use({
    reducedMotion: 'reduce',
  });

  test.beforeEach(async ({ context }) => {
    const base = (process.env['BASE_URL'] ?? 'http://127.0.0.1:3000').replace(
      /\/+$/,
      '',
    );
    const origin = base.startsWith('http') ? base : `http://${base}`;
    try {
      await context.addCookies([
        {
          name: 'consent',
          value: CONSENT_ACCEPTED,
          url: origin,
        },
      ]);
    } catch {
      /* optional */
    }
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
    await page.goto('/en', { waitUntil: 'networkidle', timeout: 30000 });
    await waitForStableViewport(page);
    // Ensure mobile nav is closed so header height is deterministic
    await page
      .locator('[data-testid="masthead-mobile-nav"]')
      .evaluate((el) => el.removeAttribute('open'))
      .catch(() => {});
    const header = page
      .locator('[data-testid="masthead"], header[aria-label]')
      .first();
    await expect(header).toBeVisible({ timeout: 10000 });
    await expect(header).toHaveScreenshot('masthead.png', {
      maxDiffPixels: 300,
      timeout: 10000,
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
    await page.goto('/en/media', { waitUntil: 'networkidle', timeout: 30000 });
    await waitForStableViewport(page);
    const filterRow = page.locator('[data-testid="media-filter-row"]').first();
    await expect(filterRow).toBeVisible({ timeout: 15000 });
    await expect(filterRow).toHaveScreenshot('media-filter-row.png', {
      maxDiffPixels: 500,
    });
  });
});

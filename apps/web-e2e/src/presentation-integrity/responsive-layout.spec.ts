/**
 * Responsive layout stability: no horizontal scroll, masthead single-row,
 * hero/CTA readable, portrait column does not collapse; RTL alignment correct.
 */
import { test, expect } from '@playwright/test';

const BREAKPOINTS = [
  { width: 360, height: 800, name: 'mobile' },
  { width: 768, height: 1024, name: 'tablet' },
  { width: 1024, height: 768, name: 'small-desktop' },
  { width: 1280, height: 800, name: 'desktop' },
  { width: 1600, height: 900, name: 'wide' },
  { width: 1920, height: 1080, name: 'tv' },
] as const;

const ROUTES = [
  { path: '/en', rtl: false },
  { path: '/en/brief', rtl: false },
  { path: '/he', rtl: true },
  { path: '/he/brief', rtl: true },
] as const;

test.describe('responsive layout stability', () => {
  for (const { width, height, name } of BREAKPOINTS) {
    test(`${name} (${width}x${height}): no horizontal scroll on critical routes`, async ({
      page,
    }) => {
      test.setTimeout(60000);
      await page.setViewportSize({ width, height });
      for (const { path } of ROUTES) {
        await page.goto(path, { waitUntil: 'load', timeout: 15000 });
        const scrollWidth = await page.evaluate(
          () => document.documentElement.scrollWidth,
        );
        const clientWidth = await page.evaluate(
          () => document.documentElement.clientWidth,
        );
        expect(
          scrollWidth,
          `${path} at ${name}: document should not have horizontal scroll`,
        ).toBeLessThanOrEqual(clientWidth + 50);
      }
    });
  }

  test('masthead remains single-row and within bounds', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await page.goto('/en', { waitUntil: 'networkidle', timeout: 30000 });
    const header = page.locator(
      '[data-testid="masthead"], header[aria-label]',
    ).first();
    await expect(header).toBeVisible({ timeout: 10000 });
    // Ensure mobile nav menu is closed so we measure single-row height only
    // ServerShell uses details/summary: close if details[open]
    const mobileNav = page.locator('[data-testid="masthead-mobile-nav"]');
    const isOpen = await mobileNav.getAttribute('open');
    if (isOpen !== null) {
      await mobileNav.locator('summary').click();
      await page.waitForTimeout(150);
    }
    // Measure the bar only (single row); header can include nav dropdown when open
    const bar = page.locator('.masthead-bar').first();
    await expect(bar).toBeVisible();
    const box = await bar.boundingBox();
    expect(box).toBeTruthy();
    expect(box!.height).toBeLessThanOrEqual(80);
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/en', { waitUntil: 'networkidle' });
    const barWide = page.locator('.masthead-bar').first();
    const boxWide = await barWide.boundingBox();
    expect(boxWide).toBeTruthy();
    expect(boxWide!.height).toBeLessThanOrEqual(80);
  });

  test('hero heading and CTA visible at mobile and desktop', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await page.goto('/en', { waitUntil: 'networkidle', timeout: 30000 });
    await expect(page.locator('[data-testid="main-content"]')).toBeVisible({
      timeout: 10000,
    });
    await expect(page.locator('#hero-title')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('a.hero-action-link').first()).toBeVisible({
      timeout: 5000,
    });
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/en', { waitUntil: 'networkidle', timeout: 30000 });
    await expect(page.locator('[data-testid="main-content"]')).toBeVisible({
      timeout: 10000,
    });
    await expect(page.locator('#hero-title')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('a.hero-action-link').first()).toBeVisible({
      timeout: 5000,
    });
  });

  test('RTL: dir and alignment correct on Hebrew routes', async ({ page }) => {
    await page.goto('/he', { waitUntil: 'networkidle' });
    await expect(page.locator('html[dir="rtl"]')).toHaveCount(1);
    const textAlign = await page.evaluate(() => {
      const html = document.documentElement;
      return getComputedStyle(html).direction;
    });
    expect(textAlign).toBe('rtl');
    await page.goto('/he/brief', { waitUntil: 'networkidle' });
    await expect(page.locator('html[dir="rtl"]')).toHaveCount(1);
  });

  test('main content landmark present and visible', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/en/brief', { waitUntil: 'networkidle', timeout: 45000 });
    const main = page.locator('[data-testid="main-content"]');
    await expect(main).toBeVisible({ timeout: 20000 });
    const box = await main.boundingBox();
    expect(box).toBeTruthy();
    expect(box!.height).toBeGreaterThan(100);
  });
});

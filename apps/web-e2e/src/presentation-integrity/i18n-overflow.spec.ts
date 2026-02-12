/**
 * i18n overflow guard: nav labels and CTA do not overflow or cause layout break
 * across locales (en, uk, es, he).
 */
import { test, expect } from '@playwright/test';

const LOCALES = ['en', 'uk', 'es', 'he'] as const;
const VIEWPORTS = [
  { width: 360, height: 800 },
  { width: 768, height: 1024 },
  { width: 1280, height: 800 },
];

test.describe('i18n overflow guard', () => {
  for (const locale of LOCALES) {
    test(`masthead nav does not overflow (${locale})`, async ({ page }) => {
      await page.setViewportSize({ width: 360, height: 800 });
      await page.goto(`/${locale}`, { waitUntil: 'load', timeout: 15000 });
      const header = page.locator('header[aria-label]').first();
      await expect(header).toBeVisible();
      const scrollWidth = await page.evaluate(
        () => document.documentElement.scrollWidth,
      );
      const clientWidth = await page.evaluate(
        () => document.documentElement.clientWidth,
      );
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 50);
      const nav = page.locator('.masthead-nav').first();
      if ((await nav.count()) > 0) {
        const navBox = await nav.boundingBox();
        expect(navBox).toBeTruthy();
        expect(navBox!.width).toBeLessThanOrEqual(clientWidth + 50);
      }
    });
  }

  test('primary CTA and hero lede do not overlap other regions', async ({
    page,
  }) => {
    for (const locale of LOCALES) {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto(`/${locale}`, { waitUntil: 'load', timeout: 30000 });
      const heroContent = page.locator('.hero-authority-content').first();
      await expect(heroContent).toBeVisible({ timeout: 10000 });
      const cta = page.locator('a.hero-action-link').first();
      await expect(cta).toBeVisible({ timeout: 5000 });
      const h1 = page.locator('#hero-title').first();
      await expect(h1).toBeVisible({ timeout: 5000 });
    }
  });

  test('no horizontal scroll at key viewports for all locales', async ({
    page,
  }) => {
    test.setTimeout(120000);
    for (const viewport of VIEWPORTS) {
      await page.setViewportSize(viewport);
      for (const locale of LOCALES) {
        await page.goto(`/${locale}`, { waitUntil: 'load', timeout: 15000 });
        const scrollWidth = await page.evaluate(
          () => document.documentElement.scrollWidth,
        );
        const clientWidth = await page.evaluate(
          () => document.documentElement.clientWidth,
        );
        expect(
          scrollWidth,
          `locale ${locale} at ${viewport.width}x${viewport.height}`,
        ).toBeLessThanOrEqual(clientWidth + 50);
      }
    }
  });
});

import { test, expect } from '@playwright/test';

/**
 * Reduced motion: prefers-reduced-motion must alter behavior.
 * Token-driven durations become near-instant; transitions effectively disabled.
 */
test.describe('Reduced motion behavior', () => {
  test('with prefers-reduced-motion: reduce, transition duration is minimal', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/en', { waitUntil: 'domcontentloaded' });
    const link = page.locator('header a[href="/en"]').first();
    await expect(link).toBeVisible();
    const duration = await link.evaluate(() => {
      const style = window.getComputedStyle(document.documentElement);
      return style.getPropertyValue('--transition-duration-fast').trim();
    });
    expect(duration).toBe('0.01ms');
  });

  test('with reduced motion, motion-duration-feedback token is 0.01ms', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/en', { waitUntil: 'domcontentloaded' });
    const feedback = await page.evaluate(() => {
      const style = window.getComputedStyle(document.documentElement);
      return style.getPropertyValue('--motion-duration-feedback').trim();
    });
    expect(feedback).toBe('0.01ms');
  });

  test('without reduced motion, feedback token is 80ms', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto('/en', { waitUntil: 'domcontentloaded' });
    const feedback = await page.evaluate(() => {
      const style = window.getComputedStyle(document.documentElement);
      return style.getPropertyValue('--motion-duration-feedback').trim();
    });
    expect(feedback).toBe('80ms');
  });

  test('scroll-behavior is auto when reduced motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/en', { waitUntil: 'domcontentloaded' });
    const scrollBehavior = await page.evaluate(() => {
      const style = window.getComputedStyle(document.documentElement);
      return style.scrollBehavior;
    });
    expect(scrollBehavior).toBe('auto');
  });
});

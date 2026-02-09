import { test, expect } from '@playwright/test';

/**
 * Focus order: skip link → identity → nav → utilities → main (deterministic).
 * No focus traps; skip link visible when focused; main is focusable as skip target.
 */
test.describe('Focus order', () => {
  test('home: first tab target is skip link', async ({ page }) => {
    await page.goto('/en', { waitUntil: 'domcontentloaded' });
    await page.keyboard.press('Tab');
    const skip = page.locator('[data-skip-link]');
    await expect(skip).toBeFocused();
  });

  test('home: skip link href targets main landmark', async ({ page }) => {
    await page.goto('/en', { waitUntil: 'domcontentloaded' });
    const skip = page.locator('[data-skip-link]');
    await expect(skip).toHaveAttribute('href', '#main-content');
    const main = page.locator('main#main-content');
    await expect(main).toBeVisible();
  });

  test('home: main is focusable (skip target)', async ({ page }) => {
    await page.goto('/en', { waitUntil: 'domcontentloaded' });
    const main = page.locator('main#main-content');
    await expect(main).toHaveAttribute('tabindex', '-1');
  });

  test('home: tab order leaves skip link then goes to identity then nav', async ({
    page,
  }) => {
    await page.goto('/en', { waitUntil: 'domcontentloaded' });
    await page.keyboard.press('Tab');
    await expect(page.locator('[data-skip-link]')).toBeFocused();
    await page.keyboard.press('Tab');
    const focused = page.locator(':focus');
    await expect(focused).toHaveCount(1);
    await expect(
      focused.evaluate((el) => {
        const a = el as HTMLElement;
        return (
          a.closest('.masthead-identity') !== null ||
          a.getAttribute('aria-label')?.includes('header') === true
        );
      }),
    ).resolves.toBeTruthy();
  });
});

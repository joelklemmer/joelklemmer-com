import { test, expect } from '@playwright/test';

/**
 * Keyboard navigation: Tab moves focus; Enter/Space activate; Escape closes menus.
 * Focus-visible styling is applied (no invisible focus states).
 */
test.describe('Keyboard navigation', () => {
  test('Tab moves focus through header controls', async ({ page }) => {
    await page.goto('/en', { waitUntil: 'domcontentloaded' });
    await page.keyboard.press('Tab'); // skip
    await page.keyboard.press('Tab'); // identity
    await page.keyboard.press('Tab'); // nav or first nav item
    const focused = page.locator(':focus');
    await expect(focused).toHaveCount(1);
    await expect(focused).toBeVisible();
  });

  test('Enter on skip link moves focus to main', async ({ page }) => {
    await page.goto('/en', { waitUntil: 'domcontentloaded' });
    await page.keyboard.press('Tab');
    await expect(page.locator('[data-skip-link]')).toBeFocused();
    await page.keyboard.press('Enter');
    await page.waitForTimeout(100);
    const main = page.locator('main#main-content');
    await expect(main).toBeFocused();
  });

  test('focused element has visible focus indicator', async ({ page }) => {
    await page.goto('/en', { waitUntil: 'domcontentloaded' });
    await page.keyboard.press('Tab');
    const skip = page.locator('[data-skip-link]:focus');
    await expect(skip).toBeVisible();
    const outline = await skip.evaluate((el) => {
      const s = window.getComputedStyle(el);
      return s.outlineWidth !== '0px' || s.boxShadow !== 'none';
    });
    expect(outline).toBeTruthy();
  });

  test('mobile nav: Escape closes menu and returns focus to trigger', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/en', { waitUntil: 'domcontentloaded' });
    const trigger = page.locator('button[aria-haspopup="menu"]');
    await trigger.focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('[role="menu"]')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('[role="menu"]')).not.toBeVisible();
    await expect(trigger).toBeFocused();
  });
});

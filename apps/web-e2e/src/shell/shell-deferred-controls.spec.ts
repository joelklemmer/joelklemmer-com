/**
 * Shell deferred controls: reserved slot present, deferred controls mount within 2s, no CLS.
 */
import { test, expect } from '@playwright/test';

const EN_HOME = '/en';

test.describe('Shell deferred controls', () => {
  test('header renders with reserved deferred slot present', async ({
    page,
  }) => {
    await page.goto(EN_HOME, { waitUntil: 'load', timeout: 45000 });
    const deferredSlot = page.locator('.masthead-deferred-slot');
    await expect(deferredSlot).toBeVisible();
    const box = await deferredSlot.boundingBox();
    expect(box).toBeTruthy();
    expect(box!.width).toBeGreaterThanOrEqual(0);
    expect(box!.height).toBeGreaterThanOrEqual(0);
  });

  test('deferred controls (theme or cookie trigger) appear within 2s', async ({
    page,
  }) => {
    await page.goto(EN_HOME, { waitUntil: 'load', timeout: 45000 });
    const deferredSlot = page.locator('.masthead-deferred-slot');
    await expect(deferredSlot).toBeVisible();
    const themeOrCookieButton = deferredSlot.locator(
      'button[aria-label*="theme" i], button[aria-label*="cookie" i], button[aria-label*="preferences" i]',
    );
    await expect(themeOrCookieButton.first()).toBeVisible({ timeout: 2500 });
  });

  test('no significant CLS from mounting deferred controls', async ({
    page,
  }) => {
    await page.goto(EN_HOME, { waitUntil: 'load', timeout: 45000 });
    const masthead = page.locator('.masthead-bar').first();
    await expect(masthead).toBeVisible();
    const boxBefore = await masthead.boundingBox();
    expect(boxBefore).toBeTruthy();
    const topBefore = boxBefore!.y;
    await page.waitForTimeout(2500);
    const boxAfter = await masthead.boundingBox();
    expect(boxAfter).toBeTruthy();
    const topAfter = boxAfter!.y;
    const deltaPx = Math.abs(topAfter - topBefore);
    expect(
      deltaPx,
      'masthead bar top should not jump when deferred controls mount',
    ).toBeLessThanOrEqual(5);
  });
});

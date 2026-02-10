/**
 * Consent footprint guard: deterministic checks for banner visibility, size, and Details modal.
 * No flaky perf thresholds; asserts layout and disclosure content.
 */
import { test, expect } from '@playwright/test';

const EN_BRIEF = '/en/brief';
const EN_MEDIA = '/en/media';

/** Clear consent cookie so banner is shown. */
async function clearConsent(page: {
  context: () => { clearCookies: () => Promise<void> };
}) {
  await page.context().clearCookies();
}

test.describe('Consent footprint (no consent cookie)', () => {
  test.beforeEach(async ({ page }) => {
    await clearConsent(page);
  });

  test('/en/brief: banner visible, buttons keyboard reachable', async ({
    page,
  }) => {
    await page.goto(EN_BRIEF, { waitUntil: 'load', timeout: 45000 });
    const banner = page.getByRole('dialog', { name: /consent and data use/i });
    await expect(banner).toBeVisible();
    const acceptButton = page
      .getByRole('button', { name: /accept all/i })
      .first();
    await acceptButton.focus();
    await expect(acceptButton).toBeFocused();
  });

  test('/en/media: banner visible, buttons keyboard reachable', async ({
    page,
  }) => {
    await page.goto(EN_MEDIA, { waitUntil: 'load', timeout: 45000 });
    const banner = page.getByRole('dialog', { name: /consent and data use/i });
    await expect(banner).toBeVisible();
    const acceptButton = page
      .getByRole('button', { name: /accept all/i })
      .first();
    await acceptButton.focus();
    await expect(acceptButton).toBeFocused();
  });

  test('banner description (#consent-surface-desc) height within footprint', async ({
    page,
  }) => {
    await page.goto(EN_BRIEF, { waitUntil: 'load', timeout: 45000 });
    const desc = page.locator('#consent-surface-desc');
    await expect(desc).toBeVisible();
    const box = await desc.boundingBox();
    expect(box).toBeTruthy();
    // Mobile viewport (default): allow up to 120px; desktop would be smaller
    const isMobile = page.viewportSize()!.width < 768;
    const maxHeight = isMobile ? 120 : 90;
    expect(box!.height).toBeLessThanOrEqual(maxHeight);
  });

  test('Details opens modal with full disclosure and can be closed', async ({
    page,
  }) => {
    await page.goto(EN_BRIEF, { waitUntil: 'load', timeout: 45000 });
    const detailsButton = page
      .getByRole('button', { name: /details/i })
      .first();
    await detailsButton.click();
    const modal = page.getByRole('dialog', { name: /cookie preferences/i });
    await expect(modal).toBeVisible();
    // Full disclosure: consent.banner.description contains "cookies and similar technologies"
    await expect(modal.locator('#cookie-preferences-desc')).toContainText(
      /cookies and similar technologies/i,
    );
    await page.keyboard.press('Escape');
    await expect(modal).not.toBeVisible();
  });
});

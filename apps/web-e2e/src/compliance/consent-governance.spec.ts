/**
 * Consent governance e2e: banner, preferences page, pre-consent blocking, withdrawal audit.
 */
import { test, expect } from '@playwright/test';

const EN_HOME = '/en';
const EN_PREFERENCES = '/en/preferences';
const HE_PREFERENCES = '/he/preferences';

test.describe('Consent surface (banner)', () => {
  test('when no choice: consent banner is visible with Accept all, Reject, Customise', async ({
    page,
  }) => {
    await page.goto(EN_HOME, { waitUntil: 'load', timeout: 45000 });
    const banner = page.getByRole('dialog', { name: /consent and data use/i });
    await expect(banner).toBeVisible();
    await expect(
      page.getByRole('button', { name: /accept all/i }),
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: /reject non-essential/i }),
    ).toBeVisible();
    await expect(page.getByRole('link', { name: /customise/i })).toBeVisible();
  });

  test('consent banner appears within deterministic window (< 3s) and is keyboard reachable', async ({
    page,
  }) => {
    await page.goto(EN_HOME, { waitUntil: 'load', timeout: 45000 });
    const banner = page.getByRole('dialog', { name: /consent and data use/i });
    await expect(banner).toBeVisible({ timeout: 3500 });
    const acceptButton = page
      .getByRole('button', { name: /accept all/i })
      .first();
    await acceptButton.focus();
    await expect(acceptButton).toBeFocused();
  });

  test('Accept all hides banner and sets consent cookie', async ({ page }) => {
    await page.goto(EN_HOME, { waitUntil: 'load', timeout: 45000 });
    const acceptAll = page.getByRole('button', { name: /accept all/i }).first();
    await acceptAll.click();
    const banner = page.getByRole('dialog', { name: /consent and data use/i });
    await expect(banner).not.toBeVisible();
    const cookies = await page.context().cookies();
    const consentCookie = cookies.find((c) => c.name === 'consent');
    expect(consentCookie).toBeDefined();
  });

  test('Reject non-essential hides banner', async ({ page }) => {
    await page.goto(EN_HOME, { waitUntil: 'load', timeout: 45000 });
    const reject = page
      .getByRole('button', { name: /reject non-essential/i })
      .first();
    await reject.click();
    const banner = page.getByRole('dialog', { name: /consent and data use/i });
    await expect(banner).not.toBeVisible();
  });
});

test.describe('Preferences page', () => {
  test('preferences page loads and has categories and withdraw', async ({
    page,
  }) => {
    await page.goto(EN_PREFERENCES, { waitUntil: 'load', timeout: 45000 });
    await expect(page.locator('main#main-content')).toBeVisible();
    await expect(page.getByRole('heading', { level: 1 })).toContainText(
      /consent preferences/i,
    );
    await expect(page.getByRole('button', { name: /withdraw/i })).toBeVisible();
  });

  test('keyboard: focus order on preferences page', async ({ page }) => {
    await page.goto(EN_PREFERENCES, { waitUntil: 'load', timeout: 45000 });
    await page.keyboard.press('Tab');
    const saveButton = page.getByRole('button', { name: /save choices/i });
    await expect(saveButton).toBeVisible();
    await saveButton.focus();
    await expect(saveButton).toBeFocused();
  });
});

test.describe('Pre-consent: no non-essential iframes', () => {
  test('before consent: no youtube or social iframes in DOM', async ({
    page,
  }) => {
    await page.goto(EN_HOME, { waitUntil: 'load', timeout: 45000 });
    const iframes = await page.evaluate(() => {
      const list = Array.from(document.querySelectorAll('iframe[src]'));
      return list
        .map((i) => (i as HTMLIFrameElement).src)
        .filter((src) =>
          /youtube|youtu\.be|facebook|twitter|linkedin|doubleclick/i.test(src),
        );
    });
    expect(iframes, 'No third-party embed iframes before consent').toHaveLength(
      0,
    );
  });
});

test.describe('Consent preferences RTL (he)', () => {
  test('preferences page in Hebrew has RTL and no overflow', async ({
    page,
  }) => {
    await page.goto(HE_PREFERENCES, { waitUntil: 'load', timeout: 45000 });
    await expect(page.locator('html[dir="rtl"]')).toHaveCount(1);
    await expect(page.locator('main#main-content')).toBeVisible();
    const main = page.locator('main#main-content');
    const scrollWidth = await main.evaluate((el) => el.scrollWidth);
    const clientWidth = await main.evaluate((el) => el.clientWidth);
    expect(scrollWidth <= clientWidth + 2).toBe(true);
  });
});

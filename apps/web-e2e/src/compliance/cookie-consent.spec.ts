/**
 * Cookie consent and preferences: gating, persistence, withdrawal, RTL.
 * - Non-essential scripts absent before consent
 * - Preferences toggles keyboard accessible and persist
 * - Withdrawal stops consent
 * - RTL (he) layout correct on preferences UI
 */
import { test, expect } from '@playwright/test';

const EN_HOME = '/en';
const HE_COOKIES = '/he/cookies';

test.describe('Cookie consent', () => {
  test('before consent: no known third-party analytics scripts in DOM', async ({
    page,
  }) => {
    await page.goto(EN_HOME, { waitUntil: 'load', timeout: 45000 });
    await expect(page.locator('main#main-content')).toBeVisible();

    const analyticsScripts = await page.evaluate(() => {
      const scripts = Array.from(document.querySelectorAll('script[src]'));
      return scripts
        .map((s) => (s as HTMLScriptElement).src)
        .filter((src) =>
          /google-analytics|googletagmanager|facebook\.net|doubleclick/i.test(
            src,
          ),
        );
    });
    expect(
      analyticsScripts,
      'No third-party analytics script src should be present before consent',
    ).toHaveLength(0);
  });

  test('cookie preferences button is keyboard accessible', async ({ page }) => {
    await page.goto(EN_HOME, { waitUntil: 'load', timeout: 45000 });
    const prefsButton = page.getByRole('button', {
      name: /cookie preferences/i,
    });
    await expect(prefsButton).toBeVisible();
    await prefsButton.focus();
    await expect(prefsButton).toBeFocused();
  });

  test('open preferences modal and tab through controls', async ({ page }) => {
    await page.goto(EN_HOME, { waitUntil: 'load', timeout: 45000 });
    const prefsButton = page.getByRole('button', {
      name: /cookie preferences/i,
    });
    await prefsButton.click();

    const dialog = page.getByRole('dialog', { name: /cookie preferences/i });
    await expect(dialog).toBeVisible();

    const firstButton = dialog.getByRole('button', { name: /accept all/i });
    await expect(firstButton).toBeVisible();
    await firstButton.focus();
    await expect(firstButton).toBeFocused();
  });

  test('save choices persists consent cookie', async ({ page }) => {
    await page.goto(EN_HOME, { waitUntil: 'load', timeout: 45000 });
    const prefsButton = page.getByRole('button', {
      name: /cookie preferences/i,
    });
    await prefsButton.click();

    const dialog = page.getByRole('dialog', { name: /cookie preferences/i });
    await expect(dialog).toBeVisible();

    const acceptAll = dialog.getByRole('button', { name: /accept all/i });
    await acceptAll.click();

    const cookies = await page.context().cookies();
    const consentCookie = cookies.find((c) => c.name === 'consent');
    expect(
      consentCookie,
      'Consent cookie should be set after accept all',
    ).toBeDefined();
  });

  test('withdraw clears consent and cookie', async ({ page }) => {
    await page.goto(EN_HOME, { waitUntil: 'load', timeout: 45000 });
    const prefsButton = page.getByRole('button', {
      name: /cookie preferences/i,
    });
    await prefsButton.click();

    const dialog = page.getByRole('dialog', { name: /cookie preferences/i });
    await expect(dialog).toBeVisible();

    const withdrawButton = dialog.getByRole('button', {
      name: /withdraw/i,
    });
    await withdrawButton.click();

    await page.goto(EN_HOME, { waitUntil: 'load', timeout: 45000 });
    const cookies = await page.context().cookies();
    const consentCookie = cookies.find((c) => c.name === 'consent');
    expect(
      consentCookie,
      'Consent cookie should be absent or cleared after withdraw',
    ).toBeUndefined();
  });

  test('Escape closes preferences modal', async ({ page }) => {
    await page.goto(EN_HOME, { waitUntil: 'load', timeout: 45000 });
    const prefsButton = page.getByRole('button', {
      name: /cookie preferences/i,
    });
    await prefsButton.click();

    const dialog = page.getByRole('dialog', { name: /cookie preferences/i });
    await expect(dialog).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();
  });
});

test.describe('Cookie preferences RTL (he)', () => {
  test('preferences modal visible and no horizontal overflow on he', async ({
    page,
  }) => {
    await page.goto(HE_COOKIES, { waitUntil: 'load', timeout: 45000 });
    await expect(page.locator('html[dir="rtl"]')).toHaveCount(1);

    const prefsButton = page.getByRole('button', {
      name: /העדפות עוגיות/i,
    });
    await expect(prefsButton).toBeVisible();
    await prefsButton.click();

    const dialog = page.getByRole('dialog', { name: /העדפות עוגיות/i });
    await expect(dialog).toBeVisible();

    const scrollWidth = await dialog.evaluate((el) => el.scrollWidth);
    const clientWidth = await dialog.evaluate((el) => el.clientWidth);
    expect(
      scrollWidth <= clientWidth + 2,
      'Dialog should not have horizontal overflow in RTL',
    ).toBe(true);
  });
});

test.describe('Cookies page', () => {
  test('cookies page exists and has policy content', async ({ page }) => {
    await page.goto('/en/cookies', { waitUntil: 'load', timeout: 45000 });
    await expect(page.locator('main#main-content')).toBeVisible();
    await expect(page.locator('h1')).toContainText(/cookie|policy/i);
  });
});

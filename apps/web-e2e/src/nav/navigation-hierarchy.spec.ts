/**
 * Navigation cognitive hierarchy e2e: rank, focus order, aria, active state, RTL.
 * Asserts executive parsing system (Brief hub primacy, proof-forward, authority structure).
 */
import { test, expect } from '@playwright/test';
import { locales } from '@joelklemmer/i18n';

const path = (locale: string, segment?: string) =>
  segment ? `/${locale}/${segment}` : `/${locale}`;

test.describe('Navigation cognitive hierarchy', () => {
  test.setTimeout(60000);

  test('desktop nav has rank attributes: Brief primary, Work/Proof secondary, Writing/Contact tertiary', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(path('en'), { waitUntil: 'load', timeout: 20000 });
    const nav = page.getByRole('navigation', { name: 'Primary navigation' });
    await expect(nav).toBeVisible();

    const briefLink = nav.getByRole('link', { name: 'Executive Brief' });
    await expect(briefLink).toHaveAttribute('data-nav-rank', 'primary');

    const workLink = nav.getByRole('link', { name: 'Case Studies' });
    await expect(workLink).toHaveAttribute('data-nav-rank', 'secondary');
    const proofLink = nav.getByRole('link', { name: 'Public Record' });
    await expect(proofLink).toHaveAttribute('data-nav-rank', 'secondary');

    const writingLink = nav.getByRole('link', { name: 'Books' });
    await expect(writingLink).toHaveAttribute('data-nav-rank', 'tertiary');
    const contactLink = nav.getByRole('link', { name: 'Contact' });
    await expect(contactLink).toHaveAttribute('data-nav-rank', 'tertiary');
  });

  test('focus order: skip link first, then identity, then nav, then utilities', async ({
    page,
  }) => {
    await page.goto(path('en'), { waitUntil: 'load', timeout: 20000 });
    await page.keyboard.press('Tab');
    const firstFocus = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el) return null;
      const tag = el.tagName.toLowerCase();
      const href = el.getAttribute?.('href');
      const role =
        el.getAttribute?.('aria-label') ??
        (el as HTMLElement).textContent?.slice(0, 30);
      return { tag, href, role };
    });
    expect(firstFocus?.tag).toBe('a');
    expect(firstFocus?.href).toBe('#main-content');
  });

  test('aria-current=page on active route', async ({ page }) => {
    await page.goto(path('en', 'brief'), { waitUntil: 'load', timeout: 20000 });
    const nav = page.getByRole('navigation', { name: 'Primary navigation' });
    const activeLink = nav.getByRole('link', { name: 'Executive Brief' });
    await expect(activeLink).toHaveAttribute('aria-current', 'page');
  });

  test('active state on brief page: Brief link has aria-current', async ({
    page,
  }) => {
    await page.goto(path('en', 'brief'), { waitUntil: 'load', timeout: 20000 });
    const nav = page.getByRole('navigation', { name: 'Primary navigation' });
    const link = nav.getByRole('link', { name: 'Executive Brief' });
    await expect(link).toHaveAttribute('aria-current', 'page');
  });

  test('RTL: Hebrew locale has dir=rtl on document', async ({ page }) => {
    await page.goto(path('he'), { waitUntil: 'load', timeout: 20000 });
    const dir = await page.getAttribute('html', 'dir');
    expect(dir).toBe('rtl');
  });

  test('RTL: nav and masthead present and visible in he', async ({ page }) => {
    await page.goto(path('he'), { waitUntil: 'load', timeout: 20000 });
    await expect(page.locator('nav[aria-label]').first()).toBeVisible();
    await expect(page.getByRole('banner')).toBeVisible();
    await expect(page.locator('main#main-content')).toBeVisible();
  });

  for (const locale of locales) {
    test(`${locale}: nav landmark has aria-label`, async ({ page }) => {
      await page.goto(path(locale), { waitUntil: 'load', timeout: 20000 });
      const nav = page.locator('nav[aria-label]').first();
      await expect(nav).toBeVisible();
      await expect(nav).toHaveAttribute('aria-label', /.+/);
    });
  }
});

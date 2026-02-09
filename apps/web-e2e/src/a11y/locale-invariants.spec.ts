import { test } from '@playwright/test';
import { locales } from '@joelklemmer/i18n';

/**
 * Locale invariant tests: assert html[lang] matches route locale, document.title non-empty,
 * and metadata template applied across all supported locales.
 */
test.describe('locale invariants', () => {
  for (const locale of locales) {
    test(`${locale}: html[lang], title, and metadata on home`, async ({
      page,
      baseURL,
    }) => {
      const url = baseURL
        ? new URL(`/${locale}/`, baseURL).toString()
        : `http://127.0.0.1:4300/${locale}/`;
      await page.goto(url, { waitUntil: 'load', timeout: 20000 });

      const htmlLang = await page.locator('html').getAttribute('lang');
      test.expect(htmlLang).toBe(locale);

      const title = await page.title();
      test.expect(title.length).toBeGreaterThan(0);

      // Metadata template: ensure at least one meta or canonical is present
      const hasMeta = (await page.locator('head meta').count()) > 0;
      test.expect(hasMeta).toBe(true);
    });
  }
});

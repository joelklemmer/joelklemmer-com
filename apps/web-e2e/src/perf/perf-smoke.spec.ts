import { test, expect } from '@playwright/test';

/**
 * Confirms production perf marks exist when NEXT_PUBLIC_PERF_MARKS=1.
 * No timing targets; presence only. Run with playwright.perf.config.ts so the
 * app is built/started with NEXT_PUBLIC_PERF_MARKS=1.
 */
test('perf marks are present on /en when NEXT_PUBLIC_PERF_MARKS=1', async ({
  page,
}) => {
  await page.goto('/en', { waitUntil: 'domcontentloaded' });
  await expect(page).toHaveURL(/\/en\/?$/);

  await page.waitForFunction(
    () =>
      typeof (window as unknown as { __PERF_MARKS__?: unknown })
        .__PERF_MARKS__ !== 'undefined',
    { timeout: 5000 },
  );

  const marks = await page.evaluate(
    () =>
      (
        window as unknown as {
          __PERF_MARKS__?: {
            fcpMs: unknown;
            hydrationStartMs: unknown;
            hydrationEndMs: unknown;
            longTaskCountFirst2s: unknown;
          };
        }
      ).__PERF_MARKS__,
  );
  expect(marks).toBeDefined();
  expect(marks).toHaveProperty('fcpMs');
  expect(marks).toHaveProperty('hydrationStartMs');
  expect(marks).toHaveProperty('hydrationEndMs');
  expect(marks).toHaveProperty('longTaskCountFirst2s');
});

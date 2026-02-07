import { test, expect } from '@playwright/test';

test('home page renders core landmarks', async ({ page }) => {
  const response = await page.goto('/en');
  expect(response?.status()).toBe(200);
  await expect(page.locator('main#main-content')).toHaveCount(1);
  await expect(page.locator('h1')).toHaveCount(1);
});

test('hebrew locale renders RTL', async ({ page }) => {
  await page.goto('/he');
  await expect(page.locator('html[dir="rtl"]')).toHaveCount(1);
});

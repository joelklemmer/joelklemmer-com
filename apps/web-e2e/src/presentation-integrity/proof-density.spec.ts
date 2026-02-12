import './visual-fixtures';
import { test, expect } from '@playwright/test';
import { getPublicRecordEntries } from '@joelklemmer/content';
import { defaultLocale } from '@joelklemmer/i18n';
import {
  gotoAndEnsureReady,
  closeAnyOverlays,
  assertNoBlockingOverlays,
} from '../support/test-preflight';

const rawBase = (process.env['BASE_URL'] ?? 'http://127.0.0.1:3000').replace(
  /\/+$/,
  '',
);
const BASE = rawBase.startsWith('http') ? rawBase : `http://${rawBase}`;

/**
 * Proof density amplification: layering (scan → substantiation → artifact) and
 * doctrine clarity are runtime-visible. Attachment rows expose data-attachment-sha
 * and copy-hash button for verification.
 */
test.describe('Proof density layering and doctrine', () => {
  test('public record list shows scan layer and doctrine', async ({ page }) => {
    await gotoAndEnsureReady(page, `/${defaultLocale}/publicrecord`, {
      baseOrigin: BASE,
    });
    await closeAnyOverlays(page);
    await assertNoBlockingOverlays(page);
    await expect(page.locator('[data-layer="scan"]')).toBeVisible();
    await expect(
      page.locator('[data-doctrine="how-to-read-list"]'),
    ).toBeVisible();
  });

  test('public record entry shows three layers and how-to-read doctrine', async ({
    page,
  }) => {
    const entries = await getPublicRecordEntries();
    const slug = entries[0]?.frontmatter.slug;
    if (!slug) {
      test.skip();
      return;
    }
    await gotoAndEnsureReady(page, `/${defaultLocale}/publicrecord/${slug}`, {
      baseOrigin: BASE,
    });
    await closeAnyOverlays(page);
    await assertNoBlockingOverlays(page);
    const scan = page.locator('[data-layer="scan"]');
    const substantiation = page.locator('[data-layer="substantiation"]');
    const artifact = page.locator('[data-layer="artifact"]');
    const doctrine = page.locator('[data-doctrine="how-to-read"]');
    await expect(scan).toBeVisible();
    await expect(substantiation).toBeVisible();
    await expect(artifact).toBeVisible();
    await expect(doctrine).toBeVisible();
  });

  test('entry with attachments has attachment row and copy-hash button', async ({
    page,
  }) => {
    const entries = await getPublicRecordEntries();
    const entryWithAttachments = entries.find(
      (e) => (e.frontmatter.attachments?.length ?? 0) > 0,
    );
    if (!entryWithAttachments?.frontmatter.slug) {
      test.skip();
      return;
    }
    const slug = entryWithAttachments.frontmatter.slug;
    const firstAtt = entryWithAttachments.frontmatter.attachments?.[0];
    if (!firstAtt) {
      test.skip();
      return;
    }
    await gotoAndEnsureReady(page, `/${defaultLocale}/publicrecord/${slug}`, {
      baseOrigin: BASE,
    });
    await closeAnyOverlays(page);
    await assertNoBlockingOverlays(page);
    const row = page.locator(`[data-attachment-id="${firstAtt.id}"]`);
    await expect(row).toBeVisible();
    const sha = await Promise.resolve(
      row.getAttribute('data-attachment-sha'),
    ).then((v) => (typeof v === 'string' ? v : null));
    const expectedSha =
      typeof firstAtt.sha256 === 'string'
        ? firstAtt.sha256
        : String(firstAtt?.sha256 ?? '');
    expect(sha).toBe(expectedSha);
    const copyButton = row.getByRole('button', {
      name: /copy|hash|full hash/i,
    });
    await expect(copyButton).toBeVisible();
  });
});

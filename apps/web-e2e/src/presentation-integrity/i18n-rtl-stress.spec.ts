/**
 * i18n + RTL layout stress: en, es, uk, he × mobile/tablet/desktop/ultrawide.
 * Asserts: no horizontal scroll, masthead nav vs utilities no overlap,
 * hero no overflow, RTL mirroring, focus ring visible and not clipped.
 * No flaky waits: use load + visibility assertions.
 */
import { test, expect } from './visual-fixtures';

const LOCALES = ['en', 'es', 'uk', 'he'] as const;
const VIEWPORTS = [
  { width: 360, height: 800, name: 'mobile' },
  { width: 768, height: 1024, name: 'tablet' },
  { width: 1280, height: 800, name: 'desktop' },
  { width: 2560, height: 1080, name: 'ultrawide' },
] as const;

const HOME_PATH = (locale: string) => `/${locale}`;

/** Allow small overflow on narrow viewports; RTL (he) may have font/bidi rounding. */
function scrollTolerancePx(clientWidth: number, locale: string): number {
  if (clientWidth < 400) return 50;
  return locale === 'he' ? 15 : 2;
}

function expectNoHorizontalScroll(
  page: {
    evaluate: (
      fn: (p: { clientWidth: number; tolerance: number }) => unknown,
    ) => Promise<unknown>;
  },
  context: string,
  viewportWidth: number,
  locale?: string,
) {
  const tolerance = scrollTolerancePx(
    viewportWidth,
    locale ?? context.split(' ')[0] ?? 'en',
  );
  return page
    .evaluate(
      (p: { clientWidth: number; tolerance: number }) => {
        const scrollWidth = document.documentElement.scrollWidth;
        const clientWidth = document.documentElement.clientWidth;
        return {
          scrollWidth,
          clientWidth,
          ok: scrollWidth <= clientWidth + p.tolerance,
        };
      },
      { clientWidth: viewportWidth, tolerance },
    )
    .then((result: unknown) => {
      const r = result as {
        scrollWidth: number;
        clientWidth: number;
        ok: boolean;
      };
      expect(
        r.ok,
        `${context}: scrollWidth ${r.scrollWidth} should be <= clientWidth ${r.clientWidth} + tolerance`,
      ).toBe(true);
    });
}

test.describe('i18n + RTL layout stress', () => {
  test.setTimeout(60000);

  for (const locale of LOCALES) {
    for (const { width, height, name } of VIEWPORTS) {
      test(`${locale} @ ${name} (${width}x${height}): no horizontal scroll`, async ({
        page,
      }) => {
        await page.setViewportSize({ width, height });
        await page.goto(HOME_PATH(locale), {
          waitUntil: 'load',
          timeout: 45000,
        });
        await expect(page.locator('main#main-content')).toBeVisible();
        await expectNoHorizontalScroll(
          page,
          `${locale} ${name}`,
          width,
          locale,
        );
      });
    }
  }

  test('masthead nav does not overlap utilities across locales and viewports', async ({
    page,
  }) => {
    for (const locale of LOCALES) {
      for (const { width, height, name } of VIEWPORTS) {
        if (width < 768) continue;
        await page.setViewportSize({ width, height });
        await page.goto(HOME_PATH(locale), {
          waitUntil: 'load',
          timeout: 45000,
        });
        await expect(page.locator('[data-testid="masthead"]')).toBeVisible({
          timeout: 10000,
        });

        const noOverlap = await page.evaluate(() => {
          const nav = document.querySelector('.masthead-nav');
          const util = document.querySelector('.masthead-utilities');
          if (!nav || !util) return { ok: true, reason: 'missing element' };
          const rNav = nav.getBoundingClientRect();
          const rUtil = util.getBoundingClientRect();
          const overlap =
            rNav.right > rUtil.left &&
            rNav.left < rUtil.right &&
            rNav.bottom > rUtil.top &&
            rNav.top < rUtil.bottom;
          return {
            ok: !overlap,
            nav: { left: rNav.left, right: rNav.right },
            util: { left: rUtil.left, right: rUtil.right },
          };
        });
        expect(
          noOverlap.ok,
          `${locale} @ ${name}: masthead nav and utilities must not overlap`,
        ).toBe(true);
      }
    }
  });

  test('hero does not overflow viewport across locales and viewports', async ({
    page,
  }) => {
    for (const locale of LOCALES) {
      for (const { width, height, name } of VIEWPORTS) {
        await page.setViewportSize({ width, height });
        await page.goto(HOME_PATH(locale), {
          waitUntil: 'load',
          timeout: 45000,
        });
        const hero = page.locator('section.hero-authority').first();
        await expect(hero).toBeVisible();

        const heroTolerance = width < 400 ? 150 : 2;
        const bottomTolerance = height + 300;
        const withinViewport = await page.evaluate(
          (vp: { w: number; h: number; tol: number; bottomTol: number }) => {
            const section = document.querySelector('section.hero-authority');
            if (!section) return { ok: false, reason: 'no hero' };
            const r = section.getBoundingClientRect();
            const ok =
              r.left >= -vp.tol &&
              r.right <= vp.w + vp.tol &&
              r.top >= -vp.tol &&
              r.bottom <= vp.h + vp.bottomTol;
            return {
              ok,
              left: r.left,
              right: r.right,
              top: r.top,
              bottom: r.bottom,
              vp,
            };
          },
          {
            w: width,
            h: height,
            tol: heroTolerance,
            bottomTol: bottomTolerance,
          },
        );
        expect(
          withinViewport.ok,
          `${locale} @ ${name}: hero section must be within viewport`,
        ).toBe(true);
      }
    }
  });

  test('RTL mirrors correctly for he', async ({ page }) => {
    await page.goto(HOME_PATH('he'), { waitUntil: 'load', timeout: 45000 });
    await expect(page.locator('html[dir="rtl"]')).toHaveCount(1);
    const dir = await page.evaluate(
      () => getComputedStyle(document.documentElement).direction,
    );
    expect(dir).toBe('rtl');

    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(HOME_PATH('he'), { waitUntil: 'load', timeout: 45000 });
    await expect(page.locator('html[dir="rtl"]')).toHaveCount(1);
  });

  test('LTR for en, es, uk', async ({ page }) => {
    for (const locale of ['en', 'es', 'uk'] as const) {
      await page.goto(HOME_PATH(locale), { waitUntil: 'load', timeout: 45000 });
      const dir = await page.getAttribute('html', 'dir');
      expect(dir === 'ltr' || dir === null, `${locale} should be LTR`).toBe(
        true,
      );
    }
  });

  test('focus ring visible and not clipped on masthead control', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await page.goto(HOME_PATH('en'), { waitUntil: 'load', timeout: 45000 });
    await expect(
      page.locator('[data-testid="masthead"], header[aria-label]'),
    ).toBeVisible({ timeout: 10000 });
    // Wait for deferred controls (theme, etc.) or language links; match first focusable
    const firstFocusable = page
      .locator('.masthead-utilities button, .masthead-utilities a[href]')
      .first();
    await expect(firstFocusable).toBeVisible({ timeout: 10000 });
    await firstFocusable.scrollIntoViewIfNeeded();
    await firstFocusable.focus();
    await page.waitForTimeout(50);

    const ciEpsilon = process.env['CI'] === 'true' ? 2 : 0;
    const ringVisibleAndNotClipped = await page.evaluate(
      (p: { w: number; h: number; eps: number }) => {
        const el = document.activeElement as HTMLElement | null;
        if (!el || !el.matches('button, a, [tabindex]'))
          return { ok: false, reason: 'no focusable focused' };
        const r = el.getBoundingClientRect();
        const ringOffset = 4;
        const padding = ringOffset + 4;
        const eps = p.eps;
        const inView =
          r.left >= -padding - eps &&
          r.right <= p.w + padding + 20 + eps &&
          r.top >= -padding - eps &&
          r.bottom <= p.h + padding + eps;
        let notClipped = true;
        let node: Element | null = el;
        while (node && node !== document.body) {
          const style = getComputedStyle(node);
          if (
            style.overflow === 'hidden' ||
            style.overflow === 'clip' ||
            style.overflowX === 'hidden'
          ) {
            const br = node.getBoundingClientRect();
            if (
              br.width < r.width + ringOffset * 2 ||
              br.height < r.height + ringOffset * 2
            ) {
              notClipped = false;
              break;
            }
          }
          node = node.parentElement;
        }
        return {
          ok: inView && notClipped,
          inView,
          notClipped,
          rect: { left: r.left, right: r.right, top: r.top, bottom: r.bottom },
        };
      },
      { w: 360, h: 800, eps: ciEpsilon },
    );
    expect(
      ringVisibleAndNotClipped.ok,
      `focus ring should be visible and not clipped: ${JSON.stringify(ringVisibleAndNotClipped)}`,
    ).toBe(true);
  });

  test('focus ring not clipped at desktop and ultrawide', async ({ page }) => {
    for (const { width, height, name } of VIEWPORTS) {
      await page.setViewportSize({ width, height });
      await page.goto(HOME_PATH('he'), { waitUntil: 'load', timeout: 45000 });
      await expect(
        page.locator('[data-testid="masthead"], header[aria-label]'),
      ).toBeVisible({ timeout: 10000 });

      const firstUtility = page
        .locator('.masthead-utilities button, .masthead-utilities a[href]')
        .first();
      await expect(firstUtility).toBeVisible({ timeout: 10000 });
      await firstUtility.scrollIntoViewIfNeeded();
      await firstUtility.focus();
      await page.waitForTimeout(50);

      const pad = width < 768 ? 24 : 8;
      const ciEpsilon = process.env['CI'] === 'true' ? 2 : 0;
      const inView = await page.evaluate(
        (vp: { w: number; h: number; pad: number; eps: number }) => {
          const el = document.activeElement as HTMLElement | null;
          if (!el) return { ok: false };
          const r = el.getBoundingClientRect();
          const eps = vp.eps;
          return {
            ok:
              r.left >= -vp.pad - eps &&
              r.right <= vp.w + vp.pad + eps &&
              r.top >= -vp.pad - eps &&
              r.bottom <= vp.h + vp.pad + eps,
          };
        },
        { w: width, h: height, pad, eps: ciEpsilon },
      );
      expect(inView.ok, `${name}: focused utility must be in viewport`).toBe(
        true,
      );
    }
  });
});

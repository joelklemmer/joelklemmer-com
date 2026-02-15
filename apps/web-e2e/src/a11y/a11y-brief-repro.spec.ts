/**
 * Diagnostics only: 10 iterations per locale on /brief to reproduce intermittent
 * a11y failures (e.g. aria-required-children). Does not weaken the a11y gate.
 * Run via: nx run web:a11y-brief-repro (tools/run-a11y-brief-only.ts).
 */
import { test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import path from 'node:path';
import { mkdirSync, writeFileSync } from 'node:fs';

const BRIEF_LOCALES = ['en', 'uk', 'es', 'he'] as const;
const ITERATIONS = 10;

const DUMP_DIR = path.join(
  process.cwd(),
  'dist',
  '.playwright',
  'a11y-dumps',
  new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19),
);

interface FailureRecord {
  url: string;
  iteration: number;
  violationId: string;
  impact: string | null;
  description: string;
  selector: string;
  nodeSnippet: string;
  dumpPath: string;
}

test('a11y brief repro — 10 iterations per locale', async ({ page }) => {
  test.setTimeout(300000);

  const failures: FailureRecord[] = [];

  for (const locale of BRIEF_LOCALES) {
    const pathWithLocale = `/${locale}/brief`;

    for (let iter = 0; iter < ITERATIONS; iter++) {
      await page.goto(pathWithLocale, {
        waitUntil: 'load',
        timeout: 20000,
      });

      // Wait for document title (streaming metadata can arrive after load)
      await page.waitForFunction(
        () => document.title && document.title.trim().length > 0,
        { timeout: 5000 },
      );

      const results = await new AxeBuilder({ page })
        .withTags([
          'wcag2a',
          'wcag2aa',
          'wcag21a',
          'wcag21aa',
          'wcag22a',
          'wcag22aa',
        ])
        .analyze();

      const serious = results.violations.filter(
        (v) => v.impact === 'serious' || v.impact === 'critical',
      );

      if (serious.length > 0) {
        const dumpPath = path.join(DUMP_DIR, `${locale}-iter-${iter + 1}.html`);
        mkdirSync(path.dirname(dumpPath), { recursive: true });
        const html = await page.content();
        writeFileSync(dumpPath, html, 'utf-8');

        for (const v of serious) {
          for (const node of v.nodes) {
            const selector = node.target?.[0] ?? '';
            const snippet =
              typeof node.html === 'string' ? node.html.slice(0, 200) : '';
            failures.push({
              url: pathWithLocale,
              iteration: iter + 1,
              violationId: v.id,
              impact: v.impact ?? null,
              description: v.description,
              selector,
              nodeSnippet: snippet,
              dumpPath,
            });
          }
        }
      }
    }
  }

  if (failures.length > 0) {
    console.error(
      `\n[ a11y-brief-repro ] ${failures.length} failure(s) across 10 iterations × 4 locales. Dumps: ${DUMP_DIR}\n`,
    );
    failures.forEach((f, i) => {
      console.error(
        `  ${i + 1}. ${f.url} iter=${f.iteration} [${f.violationId}] ${f.description}\n     selector: ${f.selector}\n     snippet: ${f.nodeSnippet.slice(0, 80)}...\n     dump: ${f.dumpPath}`,
      );
    });
    throw new Error(
      `a11y-brief-repro: ${failures.length} serious violation(s); dumps in ${DUMP_DIR}`,
    );
  }
});

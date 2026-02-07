import { test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import path from 'node:path';
import { mkdirSync, writeFileSync } from 'node:fs';
import { locales } from '@joelklemmer/i18n';
import {
  getCaseStudyEntries,
  getPublicRecordEntries,
} from '@joelklemmer/content';

const reportPath = path.join(
  process.cwd(),
  'apps',
  'web-e2e',
  'reports',
  'a11y.json',
);

test('accessibility smoke', async ({ page }) => {
  test.setTimeout(180000); // Many routes × locales; allow 3 min
  const caseStudies = await getCaseStudyEntries();
  const publicRecords = await getPublicRecordEntries();
  const caseStudySlug = caseStudies[0]?.frontmatter.slug;
  const publicRecordSlug = publicRecords[0]?.frontmatter.slug;

  if (!caseStudySlug) {
    throw new Error('No case studies found for a11y scan.');
  }
  if (!publicRecordSlug) {
    throw new Error('No public record entries found for a11y scan.');
  }

  const routes = [
    '/',
    '/brief',
    '/casestudies',
    `/casestudies/${caseStudySlug}`,
    '/books',
    '/publicrecord',
    `/publicrecord/${publicRecordSlug}`,
    '/contact',
    '/privacy',
    '/terms',
    '/accessibility',
    '/security',
    '/media',
    '/press',
    '/bio',
  ];

  const violationsByRoute: Array<{
    locale: string;
    path: string;
    violations: unknown[];
  }> = [];
  const seriousFindings: Array<{
    locale: string;
    path: string;
    id: string;
    impact?: string | null;
    description: string;
    help: string;
    nodes: number;
  }> = [];

  for (const locale of locales) {
    for (const route of routes) {
      const pathWithLocale = `/${locale}${route}`;
      await page.goto(pathWithLocale, { waitUntil: 'domcontentloaded', timeout: 15000 });
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
        (violation) =>
          violation.impact === 'serious' || violation.impact === 'critical',
      );

      if (serious.length) {
        console.log(`A11y issues for ${pathWithLocale}:`);
        serious.forEach((violation) => {
          console.log(
            `- [${violation.impact}] ${violation.id}: ${violation.description} (${violation.nodes.length} nodes)`,
          );
        });
      } else {
        console.log(`A11y clean: ${pathWithLocale}`);
      }

      serious.forEach((violation) => {
        seriousFindings.push({
          locale,
          path: route,
          id: violation.id,
          impact: violation.impact,
          description: violation.description,
          help: violation.help,
          nodes: violation.nodes.length,
        });
      });

      violationsByRoute.push({
        locale,
        path: route,
        violations: results.violations,
      });
    }
  }

  mkdirSync(path.dirname(reportPath), { recursive: true });
  writeFileSync(
    reportPath,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        totalRoutes: violationsByRoute.length,
        seriousCount: seriousFindings.length,
        routes: violationsByRoute,
        seriousFindings,
      },
      null,
      2,
    ),
  );

  if (seriousFindings.length) {
    throw new Error(
      `Serious accessibility violations found: ${seriousFindings.length}`,
    );
  }
});

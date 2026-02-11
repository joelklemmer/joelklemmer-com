/**
 * Performance regression guard: after lighthouse-timespan has run, asserts LCP <= 1800 ms
 * and stable LCP elements per route. Run only as part of the lighthouse job (not verify).
 *
 * Usage: npx tsx tools/validate-lcp-budget.ts [--lhr-dir=tmp/lighthouse/custom]
 * Expects: en.report.json, en-brief.report.json, en-media.report.json in lhr-dir.
 */
import fs from 'node:fs';
import path from 'node:path';

const REPO_ROOT = process.cwd();
const DEFAULT_LHR_DIR = path.join(REPO_ROOT, 'tmp', 'lighthouse', 'custom');
const LCP_BUDGET_MS = 1800;

const ROUTE_EXPECTATIONS: Array<{
  slug: string;
  file: string;
  /** LCP element should match one of these (snippet/selector contains, or nodeLabel). */
  lcpElementHints: string[];
}> = [
  {
    slug: 'en',
    file: 'en.report.json',
    lcpElementHints: ['img', 'portrait', 'hero', 'joel-klemmer'],
  },
  {
    slug: 'en-brief',
    file: 'en-brief.report.json',
    lcpElementHints: ['h1', 'hero', 'brief'],
  },
  {
    slug: 'en-media',
    file: 'en-media.report.json',
    lcpElementHints: ['h1', 'hero', 'media'],
  },
];

interface LHR {
  requestedUrl?: string;
  finalUrl?: string;
  audits?: Record<
    string,
    {
      numericValue?: number;
      score?: number | null;
      details?: {
        items?: Array<
          | {
              type?: string;
              node?: {
                selector?: string;
                snippet?: string;
                nodeLabel?: string;
              };
            }
          | {
              type?: string;
              items?: Array<{
                node?: {
                  selector?: string;
                  snippet?: string;
                  nodeLabel?: string;
                };
              }>;
            }
        >;
      };
    }
  >;
}

function getLcpElementDescription(lhr: LHR): string {
  const audit = lhr.audits?.['largest-contentful-paint-element'];
  const details = audit?.details;
  const listItems = details?.items;
  const firstTable =
    Array.isArray(listItems) &&
    listItems[0] &&
    typeof listItems[0] === 'object' &&
    (listItems[0] as { type?: string }).type === 'table'
      ? (listItems[0] as {
          items?: Array<{
            node?: { selector?: string; snippet?: string; nodeLabel?: string };
          }>;
        })
      : null;
  const items =
    firstTable?.items ??
    (Array.isArray(listItems)
      ? (listItems as Array<{
          node?: { selector?: string; snippet?: string; nodeLabel?: string };
        }>)
      : []);
  const node = items[0]?.node;
  if (!node) return '';
  return (
    [node.selector, node.snippet?.slice(0, 120), node.nodeLabel]
      .filter(Boolean)
      .join(' ') ?? ''
  );
}

function main(): number {
  const args = process.argv.slice(2);
  let lhrDir = DEFAULT_LHR_DIR;
  for (const arg of args) {
    if (arg.startsWith('--lhr-dir=')) {
      lhrDir = path.resolve(REPO_ROOT, arg.slice('--lhr-dir='.length));
      break;
    }
  }

  if (!fs.existsSync(lhrDir) || !fs.statSync(lhrDir).isDirectory()) {
    process.stderr.write(
      `validate-lcp-budget: LHR dir not found or not a directory: ${lhrDir}\n`,
    );
    return 1;
  }

  const errors: string[] = [];

  for (const { slug, file, lcpElementHints } of ROUTE_EXPECTATIONS) {
    const filePath = path.join(lhrDir, file);
    if (!fs.existsSync(filePath)) {
      errors.push(`${slug}: missing ${file}`);
      continue;
    }

    let lhr: LHR;
    try {
      lhr = JSON.parse(fs.readFileSync(filePath, 'utf8')) as LHR;
    } catch (e) {
      errors.push(`${slug}: failed to parse ${file} - ${String(e)}`);
      continue;
    }

    const lcpAudit = lhr.audits?.['largest-contentful-paint'];
    const numericValue = lcpAudit?.numericValue;
    if (typeof numericValue !== 'number') {
      errors.push(`${slug}: LCP audit missing or numericValue missing`);
      continue;
    }
    if (numericValue > LCP_BUDGET_MS) {
      errors.push(
        `${slug}: LCP ${Math.round(numericValue)} ms > budget ${LCP_BUDGET_MS} ms`,
      );
    }

    const elementDesc = getLcpElementDescription(lhr);
    const matchesHint = lcpElementHints.some((hint) =>
      elementDesc.toLowerCase().includes(hint.toLowerCase()),
    );
    if (elementDesc && !matchesHint) {
      errors.push(
        `${slug}: LCP element may have regressed (expected one of: ${lcpElementHints.join(', ')}); got: ${elementDesc.slice(0, 80)}...`,
      );
    }
  }

  if (errors.length > 0) {
    errors.forEach((e) => process.stderr.write(`validate-lcp-budget: ${e}\n`));
    process.stderr.write(
      `validate-lcp-budget: ${errors.length} check(s) failed. LCP budget: ${LCP_BUDGET_MS} ms.\n`,
    );
    return 1;
  }

  process.stdout.write(
    `validate-lcp-budget: LCP <= ${LCP_BUDGET_MS} ms and stable elements OK for all routes.\n`,
  );
  return 0;
}

process.exit(main());

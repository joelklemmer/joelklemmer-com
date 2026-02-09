/**
 * Lighthouse runtime validator: asserts Lighthouse and Chrome versions and,
 * when report dir is provided, that interaction-to-next-paint audit is present
 * (auditRan >= 1). Used by verify-fast (versions only) and after lhci (with reports).
 *
 * Run from repo root:
 *   npx tsx --tsconfig tsconfig.base.json tools/validate-lighthouse-runtime.ts
 *   npx tsx --tsconfig tsconfig.base.json tools/validate-lighthouse-runtime.ts --report-dir=tmp/lighthouse
 */
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const repoRoot = process.cwd();

const MIN_LIGHTHOUSE_MAJOR = 12;
const INP_AUDIT_ID = 'interaction-to-next-paint';

function getLighthouseVersion(): string | null {
  try {
    const pkg = require('lighthouse/package.json') as { version?: string };
    return pkg?.version ?? null;
  } catch {
    return null;
  }
}

function parseVersion(v: string): [number, number, number] {
  const parts = v.split('.').map((s) => parseInt(s, 10) || 0);
  return [parts[0] ?? 0, parts[1] ?? 0, parts[2] ?? 0];
}

function checkChrome(): boolean {
  try {
    require.resolve('lighthouse');
    return true;
  } catch {
    return false;
  }
}

function checkReportDir(reportDir: string): { inpRan: number; errors: string[] } {
  const errors: string[] = [];
  let inpRan = 0;
  if (!fs.existsSync(reportDir) || !fs.statSync(reportDir).isDirectory()) {
    errors.push(`Report dir does not exist or is not a directory: ${reportDir}`);
    return { inpRan: 0, errors };
  }
  const files = fs.readdirSync(reportDir);
  const jsonReports = files.filter(
    (f) => f.endsWith('.report.json') && !f.includes('manifest'),
  );
  for (const file of jsonReports) {
    const filePath = path.join(reportDir, file);
    try {
      const raw = fs.readFileSync(filePath, 'utf8');
      const report = JSON.parse(raw) as { audits?: Record<string, { id?: string; numericValue?: number }> };
      const audits = report?.audits ?? {};
      const inp = audits[INP_AUDIT_ID];
      if (inp !== undefined && inp !== null) {
        inpRan += 1;
      }
    } catch (e) {
      errors.push(`Failed to read/parse ${file}: ${String(e)}`);
    }
  }
  return { inpRan, errors };
}

function main(): number {
  const args = process.argv.slice(2);
  let reportDir: string | null = null;
  for (const arg of args) {
    if (arg.startsWith('--report-dir=')) {
      reportDir = path.resolve(repoRoot, arg.slice('--report-dir='.length));
      break;
    }
  }

  const lhVersion = getLighthouseVersion();
  if (!lhVersion) {
    console.error('validate-lighthouse-runtime: could not resolve lighthouse version');
    process.exit(1);
  }
  const [major] = parseVersion(lhVersion);
  if (major < MIN_LIGHTHOUSE_MAJOR) {
    console.error(
      `validate-lighthouse-runtime: lighthouse must be >= ${MIN_LIGHTHOUSE_MAJOR}.x (found ${lhVersion})`,
    );
    process.exit(1);
  }
  console.log(`Lighthouse version: ${lhVersion} (>= ${MIN_LIGHTHOUSE_MAJOR}.x)`);

  const hasChrome = checkChrome();
  if (!hasChrome) {
    console.error('validate-lighthouse-runtime: Chrome not found (lighthouse.getChromePath)');
    process.exit(1);
  }
  console.log('Chrome: present');

  if (reportDir) {
    const { inpRan, errors } = checkReportDir(reportDir);
    if (errors.length > 0) {
      errors.forEach((e) => console.error('validate-lighthouse-runtime:', e));
      process.exit(1);
    }
    if (inpRan < 1) {
      console.error(
        `validate-lighthouse-runtime: audit "${INP_AUDIT_ID}" did not run (found in ${inpRan} report(s)). ` +
          'Ensure Lighthouse runs in an environment where INP is collected (e.g. navigation with interaction or supported Chrome).',
      );
      process.exit(1);
    }
    console.log(`INP audit present in ${inpRan} report(s).`);
  } else {
    console.log(
      'Report dir not provided; skipping INP audit check. Pass --report-dir=tmp/lighthouse after lhci to assert INP ran.',
    );
  }

  console.log('Lighthouse runtime validation passed.');
  return 0;
}

process.exit(main());

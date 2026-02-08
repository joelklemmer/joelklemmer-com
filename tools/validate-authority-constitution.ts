/**
 * Authority Design Constitution validator. Ensures the constitution docs exist
 * and retain required structure (H1, Version line, five authority signals in constitution).
 * Run: npx tsx --tsconfig tsconfig.base.json tools/validate-authority-constitution.ts
 * No network access. Exits with 1 on failure.
 */
import path from 'node:path';
import { existsSync, readFileSync } from 'node:fs';

const ROOT = path.resolve(__dirname, '..');
const AUTHORITY_DIR = path.join(ROOT, 'docs', 'authority');

const REQUIRED_FILES = [
  'design-constitution.md',
  'design-constitution-checklist.md',
  'known-warnings.md',
] as const;

const AUTHORITY_SIGNALS = [
  'Strategic Cognition',
  'Systems Construction',
  'Operational Transformation',
  'Institutional Leadership',
  'Public Service Statesmanship',
] as const;

function hasH1(content: string): boolean {
  const lines = content.split(/\r?\n/);
  for (const line of lines) {
    const t = line.trim();
    if (t === '') continue;
    return t.startsWith('# ');
  }
  return false;
}

function hasVersionLine(content: string): boolean {
  return (
    /^Version\s+\d+\.\d+/m.test(content) ||
    /^Version\s+\d+\.\d+/.test(content.trim())
  );
}

function main(): void {
  const errors: string[] = [];

  for (const file of REQUIRED_FILES) {
    const filePath = path.join(AUTHORITY_DIR, file);
    if (!existsSync(filePath)) {
      errors.push(`Missing required file: ${filePath}`);
      continue;
    }
    const content = readFileSync(filePath, 'utf-8');
    if (!hasH1(content)) {
      errors.push(
        `File must start with an H1 (first non-empty line "# ..."): ${filePath}`,
      );
    }
    if (!hasVersionLine(content)) {
      errors.push(
        `File must contain a Version line (e.g. "Version 1.0"): ${filePath}`,
      );
    }
    if (file === 'design-constitution.md') {
      for (const signal of AUTHORITY_SIGNALS) {
        if (!content.includes(signal)) {
          errors.push(
            `Constitution must contain the authority signal "${signal}". File: ${filePath}`,
          );
        }
      }
    }
  }

  if (errors.length > 0) {
    errors.forEach((e) => console.error(`[authority-constitution] ${e}`));
    process.exit(1);
  }

  console.log(
    'Authority constitution validation passed: design-constitution, checklist, and known-warnings present with required structure and signals.',
  );
}

main();

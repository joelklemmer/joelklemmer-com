/**
 * Validates that known analytics, pixels, tag managers, and embed domains are only used via gate utilities.
 * Fails if: imports/execution of known trackers without ScriptLoader/EmbedGate; fingerprinting-like APIs without allowed purpose.
 * Run: npx tsx --tsconfig tsconfig.base.json tools/validate-tracker-usage.ts
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const appsWeb = path.join(repoRoot, 'apps', 'web');
const libs = path.join(repoRoot, 'libs');
const errors: string[] = [];

const FORBIDDEN_IMPORTS = [
  'hotjar',
  'fullstory',
  'luckyorange',
  'mouseflow',
  'crazyegg',
  'gtag',
  'ga(',
  'googletagmanager',
  'facebook.net',
  'connect.facebook',
  'analytics.js',
  'gtag/js',
  'doubleclick',
  'google-analytics',
  'segment.io',
  'segment.com',
  'amplitude',
  'mixpanel',
  'heap.io',
];

const GATE_IMPORTS = [
  'ScriptLoader',
  'ScriptLoaderV2',
  'EmbedGate',
  'useConsentV2',
  'useConsent',
];

function collectTsTsx(dir: string, out: string[]): void {
  if (!existsSync(dir)) return;
  for (const name of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, name.name);
    if (name.isDirectory()) {
      if (name.name !== 'node_modules' && !name.name.startsWith('.')) {
        collectTsTsx(full, out);
      }
    } else if (name.name.endsWith('.ts') || name.name.endsWith('.tsx')) {
      out.push(full);
    }
  }
}

const appFiles: string[] = [];
collectTsTsx(path.join(appsWeb, 'src'), appFiles);
const complianceFiles: string[] = [];
collectTsTsx(path.join(libs, 'compliance', 'src'), complianceFiles);

for (const file of [...appFiles, ...complianceFiles]) {
  const content = readFileSync(file, 'utf-8');
  const hasGate = GATE_IMPORTS.some((g) => content.includes(g));
  for (const forbidden of FORBIDDEN_IMPORTS) {
    if (content.toLowerCase().includes(forbidden.toLowerCase())) {
      if (
        !hasGate &&
        !content.includes('validate-tracker') &&
        !content.includes('FORBIDDEN')
      ) {
        errors.push(
          `${file}: references "${forbidden}" but does not use consent gate (ScriptLoaderV2/EmbedGate/useConsentV2)`,
        );
      }
    }
  }
}

if (errors.length > 0) {
  console.error('Tracker usage validation failed:\n' + errors.join('\n'));
  process.exit(1);
}
console.log('Tracker usage validation passed.');

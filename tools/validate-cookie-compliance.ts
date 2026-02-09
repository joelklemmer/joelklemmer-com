/**
 * Validates cookie compliance: cookies page exists, manifest matches,
 * preferences UI has required a11y, and blocked scripts are gated.
 */
import path from 'node:path';
import { existsSync, readFileSync, readdirSync } from 'node:fs';

const ROOT = process.cwd();
const COOKIES_PAGE = path.join(
  ROOT,
  'apps',
  'web',
  'src',
  'app',
  '[locale]',
  'cookies',
  'page.tsx',
);
const MANIFEST_PATH = path.join(ROOT, 'docs', 'cookie-tracker-manifest.json');
const COMPLIANCE_MODAL = path.join(
  ROOT,
  'libs',
  'compliance',
  'src',
  'lib',
  'CookiePreferencesModal.tsx',
);

const GATE_MARKERS = ['ScriptLoader', 'useConsent', 'canLoadAnalytics'];
const BLOCKED_PATTERNS = [
  /google-analytics\.com/i,
  /googletagmanager\.com/i,
  /facebook\.net/i,
  /doubleclick\.net/i,
  /\bgtag\s*\(/,
  /\bga\s*\(/,
];

const A11Y_REQUIRED = ['role="dialog"', 'aria-modal="true"', 'aria-labelledby'];

function* walkTsx(dir: string): Generator<string> {
  if (!existsSync(dir)) return;
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === 'node_modules' || e.name === '.next') continue;
      yield* walkTsx(full);
    } else if (e.isFile() && /\.(tsx|ts|jsx|js)$/.test(e.name)) {
      yield full;
    }
  }
}

function main(): number {
  let failed = false;

  if (!existsSync(COOKIES_PAGE)) {
    console.error('cookie-compliance: Cookies page missing at', COOKIES_PAGE);
    failed = true;
  }

  if (!existsSync(MANIFEST_PATH)) {
    console.error(
      'cookie-compliance: Tracker manifest missing at',
      MANIFEST_PATH,
    );
    failed = true;
  } else {
    const manifest = JSON.parse(readFileSync(MANIFEST_PATH, 'utf-8'));
    if (manifest.policyUrlPath !== '/cookies') {
      console.error(
        'cookie-compliance: Manifest policyUrlPath must be "/cookies", got',
        manifest.policyUrlPath,
      );
      failed = true;
    }
  }

  if (!existsSync(COMPLIANCE_MODAL)) {
    console.error(
      'cookie-compliance: CookiePreferencesModal missing at',
      COMPLIANCE_MODAL,
    );
    failed = true;
  } else {
    const modalContent = readFileSync(COMPLIANCE_MODAL, 'utf-8');
    for (const required of A11Y_REQUIRED) {
      if (!modalContent.includes(required)) {
        console.error(
          'cookie-compliance: CookiePreferencesModal missing required a11y:',
          required,
        );
        failed = true;
      }
    }
  }

  const appRoot = path.join(ROOT, 'apps', 'web');
  const libRoot = path.join(ROOT, 'libs');
  for (const dir of [appRoot, libRoot]) {
    for (const file of walkTsx(dir)) {
      const content = readFileSync(file, 'utf-8');
      const hasBlocked = BLOCKED_PATTERNS.some((re) => re.test(content));
      if (hasBlocked) {
        const hasGate = GATE_MARKERS.some((m) => content.includes(m));
        if (!hasGate) {
          console.error(
            'cookie-compliance: File contains tracker-like code but no consent gating:',
            path.relative(ROOT, file),
          );
          failed = true;
        }
      }
    }
  }

  if (failed) {
    console.error('cookie-compliance: Validation failed.');
    return 1;
  }
  console.log(
    'cookie-compliance: Cookies page, manifest, preferences a11y, and script gating OK.',
  );
  return 0;
}

process.exit(main());

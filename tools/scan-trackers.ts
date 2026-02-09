/**
 * Scans the codebase for known analytics, pixels, and third-party embeds.
 * Reports any matches so they can be added to the manifest and gated.
 * Does not fail by default; use with validate-cookie-compliance for enforcement.
 */
import path from 'node:path';
import { existsSync, readFileSync, readdirSync } from 'node:fs';

const ROOT = process.cwd();
const APP_ROOT = path.join(ROOT, 'apps', 'web');
const LIB_ROOT = path.join(ROOT, 'libs');

const BLOCKED_PATTERNS = [
  /google-analytics\.com/i,
  /googletagmanager\.com/i,
  /facebook\.net/i,
  /doubleclick\.net/i,
  /analytics\.js/i,
  /\bgtag\s*\(/,
  /\bga\s*\(/,
  /plausible\.io/i,
  /segment\.com/i,
  /hotjar\.com/i,
];

function* walkDir(dir: string): Generator<string> {
  if (!existsSync(dir)) return;
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === 'node_modules' || e.name === '.next' || e.name === '.git')
        continue;
      yield* walkDir(full);
    } else if (e.isFile() && /\.(tsx?|jsx?|html)$/.test(e.name)) {
      yield full;
    }
  }
}

function scanFile(filePath: string): { pattern: string; line: number }[] {
  const content = readFileSync(filePath, 'utf-8');
  const lines = content.split(/\r?\n/);
  const hits: { pattern: string; line: number }[] = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    for (const re of BLOCKED_PATTERNS) {
      if (re.test(line)) {
        hits.push({ pattern: re.source, line: i + 1 });
      }
    }
  }
  return hits;
}

function main(): number {
  const reported = new Set<string>();
  let exitCode = 0;

  for (const dir of [APP_ROOT, LIB_ROOT]) {
    for (const file of walkDir(dir)) {
      const hits = scanFile(file);
      for (const { pattern, line } of hits) {
        const rel = path.relative(ROOT, file);
        const key = `${rel}:${line}:${pattern}`;
        if (!reported.has(key)) {
          reported.add(key);
          console.log(`${rel}:${line}: possible tracker pattern "${pattern}"`);
          exitCode = 0; // scan is informational; validator enforces gating
        }
      }
    }
  }

  if (reported.size === 0) {
    console.log('scan-trackers: no known tracker patterns found in app/libs.');
  }
  return exitCode;
}

process.exit(main());

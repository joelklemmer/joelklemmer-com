/**
 * Token drift: fails CI if components introduce literal colors or non-token
 * Tailwind outside approved token-mapped utilities, or new CSS variables outside
 * libs/tokens without governance approval.
 *
 * Allowed literal colors only inside libs/tokens/** and documented exceptions.
 * Precise file/line reporting on violations.
 *
 * Run: npx tsx --tsconfig tsconfig.base.json tools/validate-token-drift.ts
 */
import path from 'node:path';
import { readFileSync, readdirSync, statSync } from 'node:fs';

const ROOT = path.resolve(__dirname, '..');

/** Paths where literal hex/rgb/hsl are allowed (token source of truth). */
const TOKENS_DIR = path.join(ROOT, 'libs', 'tokens');
const TOKENS_DIR_REL = 'libs/tokens/';

/** CSS variables allowed outside libs/tokens (governance-approved: layout/typography overrides). */
const ALLOWED_NON_TOKEN_CSS_VARS = new Set([
  '--masthead-bar-height',
  '--masthead-touch-min',
  '--content-lane-max-width',
  '--readable-line-length-app',
  '--container-padding-x',
  '--container-padding-x-wide',
  '--body-analytical-size',
  '--display-heading-size',
  '--section-heading-size',
  '--text-base',
  '--text-sm',
  '--text-lg',
  '--bp-mobile',
  '--bp-tablet',
  '--bp-desktop',
  '--bp-wide',
  '--bp-ultrawide',
  '--lane-full',
  '--lane-wide',
  '--lane-readable',
  '--gutter-inline-start',
  '--gutter-inline-end',
  '--nav-primary-gap',
  '--nav-primary-padding-inline',
  '--nav-primary-padding-block',
  '--nav-primary-active-border-width',
  '--tap-target-spacing', // WCAG 2.2 2.5.8: ≥24px between adjacent tap targets (masthead)
]);

/** Tailwind palette names that are NOT token-mapped (would be drift). */
const NON_TOKEN_TAILWIND_PALETTES =
  '(?:slate|blue|gray|grey|red|green|yellow|amber|orange|zinc|stone|sky|indigo|violet|purple|pink|cyan|teal|lime|emerald|fuchsia|rose)';
/** Token-mapped utilities in tailwind.config: bg, surface, text, muted, border, accent, focus, neutral (50-500). */
const NON_TOKEN_TAILWIND_REGEX = new RegExp(
  `(?:text|bg|border|ring|from|to|via|divide|placeholder|caret|stroke|fill)-${NON_TOKEN_TAILWIND_PALETTES}(?:-\\d+)?\\b`,
  'g',
);

interface Violation {
  file: string;
  line: number;
  message: string;
  snippet: string;
}

const violations: Violation[] = [];

function isUnderTokens(filePath: string): boolean {
  const normalized = path.normalize(filePath);
  return (
    normalized.includes(TOKENS_DIR_REL) || normalized.startsWith(TOKENS_DIR)
  );
}

function* walkFiles(
  dir: string,
  ext: string[],
): Generator<{ full: string; rel: string }> {
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    const rel = path.relative(ROOT, full);
    if (e.isDirectory()) {
      if (
        e.name === 'node_modules' ||
        e.name === '.next' ||
        e.name === '.git' ||
        e.name === 'dev'
      )
        continue;
      yield* walkFiles(full, ext);
    } else if (e.isFile() && ext.some((x) => e.name.endsWith(x))) {
      yield { full, rel };
    }
  }
}

function checkLiteralColors(
  filePath: string,
  rel: string,
  content: string,
): void {
  if (isUnderTokens(filePath)) return;

  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;

    // Hex
    const hexMatch = line.match(/#[0-9a-fA-F]{3,8}\b/g);
    if (hexMatch) {
      for (const m of hexMatch) {
        violations.push({
          file: rel,
          line: lineNum,
          message: `Literal hex color not allowed outside libs/tokens: ${m}`,
          snippet: line.trim().slice(0, 100),
        });
      }
    }

    // rgb( / rgba(
    if (/\brgb\s*\(|\brgba\s*\(/.test(line)) {
      violations.push({
        file: rel,
        line: lineNum,
        message: 'Literal rgb/rgba not allowed outside libs/tokens',
        snippet: line.trim().slice(0, 100),
      });
    }

    // hsl( with raw number (not hsl(var(...)))
    if (
      /\bhsl\s*\(\s*[0-9]/.test(line) &&
      !/\bhsl\s*\(\s*var\s*\(/.test(line)
    ) {
      violations.push({
        file: rel,
        line: lineNum,
        message:
          'Literal hsl() not allowed outside libs/tokens; use hsl(var(--token))',
        snippet: line.trim().slice(0, 100),
      });
    }
  }
}

function checkNonTokenTailwind(
  filePath: string,
  rel: string,
  content: string,
): void {
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;
    let match: RegExpExecArray | null;
    NON_TOKEN_TAILWIND_REGEX.lastIndex = 0;
    while ((match = NON_TOKEN_TAILWIND_REGEX.exec(line)) !== null) {
      violations.push({
        file: rel,
        line: lineNum,
        message: `Non-token Tailwind color (use token-mapped utilities): ${match[0]}`,
        snippet: line.trim().slice(0, 100),
      });
    }
  }
}

function checkCssVarsOutsideTokens(
  filePath: string,
  rel: string,
  content: string,
): void {
  if (isUnderTokens(filePath)) return;
  if (!rel.endsWith('.css')) return;

  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;
    const varMatch = line.match(/\s*(--[a-zA-Z][a-zA-Z0-9-]*)\s*:/);
    if (varMatch) {
      const varName = varMatch[1];
      if (!ALLOWED_NON_TOKEN_CSS_VARS.has(varName)) {
        violations.push({
          file: rel,
          line: lineNum,
          message: `CSS variable outside libs/tokens without governance approval: ${varName}`,
          snippet: line.trim().slice(0, 100),
        });
      }
    }
  }
}

function scanFile(rel: string, full: string): void {
  let content: string;
  try {
    content = readFileSync(full, 'utf-8');
  } catch {
    return;
  }
  checkLiteralColors(full, rel, content);
  checkNonTokenTailwind(full, rel, content);
  checkCssVarsOutsideTokens(full, rel, content);
}

// Scan apps/web and libs (exclude node_modules, .next, dist)
const SCAN_DIRS = [path.join(ROOT, 'apps', 'web'), path.join(ROOT, 'libs')];
const EXTS = ['.tsx', '.ts', '.jsx', '.js', '.css'];

for (const dir of SCAN_DIRS) {
  try {
    for (const { full, rel } of walkFiles(dir, EXTS)) {
      scanFile(rel, full);
    }
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === 'ENOENT') continue;
    throw e;
  }
}

if (violations.length > 0) {
  const lines = violations.map(
    (v) => `${v.file}:${v.line}: ${v.message}\n  ${v.snippet}`,
  );
  throw new Error(
    `Token drift validation failed (${violations.length} violation(s)):\n${lines.join('\n')}`,
  );
}

console.log(
  'Token drift validation passed: no literal colors, non-token Tailwind, or unapproved CSS variables outside libs/tokens.',
);

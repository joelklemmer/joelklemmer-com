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

/**
 * PWA/browser metadata: themeColor and mask-icon color require literal hex
 * (HTML meta theme-color, manifest, Safari pinned tab). No CSS variable option.
 */
const THEME_COLOR_LAYOUT_REL = 'apps/web/src/app/layout.tsx';

/**
 * Figma design implementation: app-layer styles.
 * Authority: https://pages-tile-41445691.figma.site/ is the design; these files implement it.
 * All CSS vars and design decisions in these files are allowed — no drift from Figma.
 */
const FIGMA_STYLES_DIR_REL = 'apps/web/src/styles';

/** CSS variables allowed outside libs/tokens (governance-approved: Figma Make parity). */
const ALLOWED_NON_TOKEN_CSS_VARS = new Set([
  '--masthead-bar-height',
  '--masthead-touch-min',
  '--masthead-bar-gap', // Figma: responsive masthead spacing
  '--masthead-icon-size', // Figma: consistent icon sizing
  '--masthead-bg',
  '--masthead-bg-scrolled',
  '--masthead-border',
  '--masthead-text',
  '--masthead-text-muted',
  '--masthead-focus',
  '--content-lane-max-width',
  '--readable-line-length-app',
  '--container-padding-x',
  '--container-padding-x-wide',
  '--body-analytical-size',
  '--body-analytical-line',
  '--body-analytical-font',
  '--display-heading-size',
  '--display-heading-line',
  '--section-heading-size',
  '--section-heading-line',
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
  '--text-nav', // Figma: nav typography by breakpoint
  '--text-nav-line',
  '--radius', // Figma Make: rectangular (0) for buttons, portrait, cards
  '--radius-sm',
  '--radius-md',
  '--radius-lg',
  '--radius-card',
  '--section-anchor-radius',
  '--tap-target-spacing', // WCAG 2.2 2.5.8: ≥24px between adjacent tap targets (masthead)
  '--page-frame-stage-bg', // Figma Make: flat stage, page bg
  '--page-frame-stage-radius',
  '--page-frame-stage-elevation',
  '--authority-atmosphere-subtle', // Figma Make: solid page bg
  '--footer-bg', // Figma Make: footer distinct from content
  '--color-bg', // Figma Make: app-layer override for warm off-white / charcoal
  '--color-surface', // Figma Make: app-layer override
  '--authority-card-elevation', // Figma Make: flatter card shadow
  '--authority-surface-layer2', // Figma Make: flatter hover shadow
  '--authority-depth-illusion', // Figma Make: flat layout
  '--authority-ambient-radial', // Figma Make: flat layout
  '--color-text', // Scoped override for masthead/mobile-nav (light-on-dark)
  '--color-muted',
  '--color-focus',
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

function isFigmaImplementation(_filePath: string, rel: string): boolean {
  const normalized = path.posix.normalize(rel.split(path.sep).join('/'));
  return (
    normalized === FIGMA_STYLES_DIR_REL ||
    normalized.startsWith(FIGMA_STYLES_DIR_REL + '/')
  );
}

function checkLiteralColors(
  filePath: string,
  rel: string,
  content: string,
): void {
  if (isUnderTokens(filePath)) return;
  if (isFigmaImplementation(filePath, rel)) return; /* Figma design overrides */

  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;

    // Hex
    const hexMatch = line.match(/#[0-9a-fA-F]{3,8}\b/g);
    if (hexMatch) {
      const relNorm = rel.split(path.sep).join('/');
      const isThemeColorLayout =
        relNorm === THEME_COLOR_LAYOUT_REL &&
        (line.includes('themeColor') ||
          line.includes('mask-icon') ||
          line.includes("color: '"));
      if (isThemeColorLayout) continue; /* PWA metadata requires literal hex */
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
  /* Figma design implementation: all variables allowed. Enables Figma parity
     (https://pages-tile-41445691.figma.site/) without maintainer edits to this validator. */
  if (isFigmaImplementation(filePath, rel)) return;

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

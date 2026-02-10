#!/usr/bin/env node
/**
 * Server import graph guard: server entrypoints must not import known client-only
 * heavy modules so that the root client bundle does not pull them in.
 * For the locale layout: must not import any "use client" file (directly or via
 * resolved path). Other entrypoints: must not import banned names/paths.
 *
 * Run: npx tsx tools/validate-server-import-graph.ts
 * Exit: 0 if no server entrypoint imports a banned client module; 1 otherwise.
 */
import * as fs from 'node:fs';
import * as path from 'node:path';

const ROOT = process.cwd();

/** Server entrypoint files (no "use client"; these must not pull in heavy client modules). */
const SERVER_ENTRYPOINTS = [
  'libs/shell/src/lib/ServerShell.tsx',
  'apps/web/src/app/layout.tsx',
  'apps/web/src/app/[locale]/layout.tsx',
];

/** Entrypoints that must not import any file that contains "use client" (resolved direct imports). */
const NO_CLIENT_IMPORTS_ENTRYPOINTS = new Set([
  'apps/web/src/app/[locale]/layout.tsx',
]);

/** Exception: locale layout may import this single client bridge (dynamic loader only). */
const LOCALE_LAYOUT_ALLOWED_CLIENT_IMPORT = path
  .join(ROOT, 'apps/web/src/app/[locale]/ClientDeferredBridge.tsx')
  .replace(/\\/g, '/');

/** Banned identifiers: if a server entrypoint imports any of these names, fail. */
const BANNED_IMPORT_NAMES = new Set([
  'CookiePreferencesModal',
  'AccessibilityPanel',
  'ConsentPreferencesForm',
  'ThemeProvider',
  'ContrastProvider',
  'DensityViewProvider',
  'EvaluatorModeProvider',
  'ConsentProviderV2',
  'NextIntlClientProvider',
  'ClientShellCritical',
  'ClientShellDeferred',
  'ShellDeferredControls',
  'ConsentBannerSlot',
  'ConsentActionsIsland',
  'CookiePreferencesOpenProvider',
  'CookiePreferencesModal',
  'AccessibilityPanel',
]);

/** Banned path substrings: if an import from-path contains any of these, fail. */
const BANNED_PATH_SUBSTRINGS = [
  '/CookiePreferencesModal',
  '/AccessibilityPanel',
  'CookiePreferencesModal.tsx',
  'AccessibilityPanel.tsx',
  'ConsentPreferencesForm',
];

/** Path alias map from tsconfig.base.json (baseUrl = .). */
const PATH_ALIASES: [string, string][] = [
  ['@/*', 'apps/web'],
  ['@joelklemmer/ui', 'libs/ui/src/index.ts'],
  ['@joelklemmer/tokens', 'libs/tokens/src/index.ts'],
  ['@joelklemmer/i18n', 'libs/i18n/src/index.ts'],
  ['@joelklemmer/content', 'libs/content/src/index.ts'],
  ['@joelklemmer/seo', 'libs/seo/src/index.ts'],
  ['@joelklemmer/a11y', 'libs/a11y/src/index.ts'],
  ['@joelklemmer/screens', 'libs/screens/src/index.ts'],
  ['@joelklemmer/sections', 'libs/sections/src/index.ts'],
  ['@joelklemmer/intelligence', 'libs/intelligence/src/index.ts'],
  ['@joelklemmer/authority-signals', 'libs/authority-signals/src/index.ts'],
  ['@joelklemmer/authority-mapping', 'libs/authority-mapping/src/index.ts'],
  ['@joelklemmer/evaluator-mode', 'libs/evaluator-mode/src/index.ts'],
  ['@joelklemmer/authority-density', 'libs/authority-density/src/index.ts'],
  ['@joelklemmer/aec', 'libs/aec/src/index.ts'],
  [
    '@joelklemmer/authority-orchestration',
    'libs/authority-orchestration/src/index.ts',
  ],
  ['@joelklemmer/authority-telemetry', 'libs/authority-telemetry/src/index.ts'],
  ['@joelklemmer/compliance', 'libs/compliance/src/index.ts'],
  [
    '@joelklemmer/telemetry-governance',
    'libs/telemetry-governance/src/index.ts',
  ],
  ['@joelklemmer/perf', 'libs/perf/src/index.ts'],
  ['@joelklemmer/shell', 'libs/shell/src/index.ts'],
];

function hasUseClient(content: string): boolean {
  return /^['"]use client['"]\s*;?\s*$/m.test(content);
}

function extractImports(content: string): { names: string[]; path: string }[] {
  const results: { names: string[]; path: string }[] = [];
  const namedRe =
    /import\s+(?:type\s+)?(?:\{([^}]+)\}|(\w+))\s+from\s+['"]([^'"]+)['"]/g;
  let m: RegExpExecArray | null;
  while ((m = namedRe.exec(content)) !== null) {
    const names = m[1]
      ? m[1].split(',').map((s) =>
          s
            .trim()
            .split(/\s+as\s+/)[0]
            .trim(),
        )
      : m[2]
        ? [m[2]]
        : [];
    const fromPath = m[3];
    results.push({ names, path: fromPath });
  }
  return results;
}

function resolveImportPath(importPath: string, fromRel: string): string | null {
  if (importPath.startsWith('.')) {
    const fromDir = path.dirname(path.join(ROOT, fromRel));
    const resolved = path.normalize(path.join(fromDir, importPath));
    if (fs.existsSync(resolved)) return path.resolve(resolved);
    if (fs.existsSync(resolved + '.ts')) return path.resolve(resolved + '.ts');
    if (fs.existsSync(resolved + '.tsx'))
      return path.resolve(resolved + '.tsx');
    return path.resolve(resolved);
  }
  for (const [alias, target] of PATH_ALIASES) {
    if (importPath === alias || importPath.startsWith(alias + '/')) {
      const sub =
        importPath === alias
          ? target
          : path.join(target, importPath.slice(alias.length + 1));
      const full = path.join(ROOT, sub);
      if (fs.existsSync(full)) return full;
      if (fs.existsSync(full + '.ts')) return full + '.ts';
      if (fs.existsSync(full + '.tsx')) return full + '.tsx';
      return full;
    }
  }
  return null;
}

function main(): number {
  const violations: string[] = [];

  for (const rel of SERVER_ENTRYPOINTS) {
    const full = path.join(ROOT, rel);
    if (!fs.existsSync(full)) continue;

    const content = fs.readFileSync(full, 'utf-8');
    if (hasUseClient(content)) {
      violations.push(
        `${rel}: must be a server entrypoint but contains "use client"`,
      );
      continue;
    }

    const imports = extractImports(content);

    for (const { names, path: fromPath } of imports) {
      for (const name of names) {
        if (BANNED_IMPORT_NAMES.has(name)) {
          violations.push(
            `${rel}: imports banned name "${name}" from "${fromPath}"`,
          );
        }
      }
      for (const sub of BANNED_PATH_SUBSTRINGS) {
        if (fromPath.includes(sub)) {
          violations.push(
            `${rel}: import path contains banned "${sub}": "${fromPath}"`,
          );
        }
      }

      if (NO_CLIENT_IMPORTS_ENTRYPOINTS.has(rel)) {
        const resolved = resolveImportPath(fromPath, rel);
        if (resolved && fs.existsSync(resolved)) {
          const resolvedNormalized = path
            .resolve(ROOT, resolved)
            .replace(/\\/g, '/');
          const isAllowed =
            resolvedNormalized === LOCALE_LAYOUT_ALLOWED_CLIENT_IMPORT;
          if (!isAllowed) {
            const resolvedContent = fs.readFileSync(resolved, 'utf-8');
            if (hasUseClient(resolvedContent)) {
              violations.push(
                `${rel}: must not import "use client" files; "${fromPath}" resolves to ${resolved} which has "use client"`,
              );
            }
          }
        }
      }
    }
  }

  if (violations.length > 0) {
    console.error(
      'validate-server-import-graph: server entrypoints must not import client-only heavy modules; locale layout must not import any "use client" file.',
    );
    violations.forEach((v) => console.error('  -', v));
    return 1;
  }

  return 0;
}

process.exit(main());

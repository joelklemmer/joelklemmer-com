/**
 * Program gate: fails the build if subsystems are incomplete.
 * Reads docs/program/authority-platform-program.md and enforces:
 * - required subsystems (files/dirs) exist
 * - required Nx targets exist on web
 * - required validators run during web:verify
 * - required routes exist and are i18n-safe ([locale]/*)
 * - required SEO outputs exist (sitemap + image sitemap)
 * - required media governance policy exists
 *
 * Run: npx tsx --tsconfig tsconfig.base.json tools/validate-authority-program.ts
 */
import * as path from 'path';
import { existsSync, readFileSync } from 'node:fs';

const ROOT = path.resolve(__dirname, '..');
const PROGRAM_DOC = path.join(
  ROOT,
  'docs',
  'program',
  'authority-platform-program.md',
);
const WEB_PROJECT_JSON = path.join(ROOT, 'apps', 'web', 'project.json');
const LOCALE_APP_DIR = path.join(ROOT, 'apps', 'web', 'src', 'app', '[locale]');

interface ProgramContract {
  requiredNxTargets: string[];
  requiredVerifyIncludes: string[];
  requiredRoutes: string[];
  requiredSeoOutputs: string[];
  mediaGovernancePath: string;
  requiredSubsystemPaths: string[];
}

function extractContract(docPath: string): ProgramContract {
  if (!existsSync(docPath)) {
    throw new Error(`Program doc missing: ${docPath}`);
  }
  const content = readFileSync(docPath, 'utf-8');
  const blockStart = '```authority-program-required';
  const startIdx = content.indexOf(blockStart);
  if (startIdx === -1) {
    throw new Error(
      `Program doc must contain a fenced block with id authority-program-required: ${docPath}`,
    );
  }
  const afterStart = content.indexOf('\n', startIdx) + 1;
  const endIdx = content.indexOf('```', afterStart);
  if (endIdx === -1) {
    throw new Error(
      `Program doc: unclosed authority-program-required block: ${docPath}`,
    );
  }
  const jsonStr = content.slice(afterStart, endIdx).trim();
  let contract: ProgramContract;
  try {
    contract = JSON.parse(jsonStr) as ProgramContract;
  } catch (e) {
    throw new Error(
      `Program doc: invalid JSON in authority-program-required block: ${e instanceof Error ? e.message : String(e)}`,
    );
  }
  if (
    !Array.isArray(contract.requiredNxTargets) ||
    !Array.isArray(contract.requiredVerifyIncludes) ||
    !Array.isArray(contract.requiredRoutes) ||
    !Array.isArray(contract.requiredSeoOutputs) ||
    typeof contract.mediaGovernancePath !== 'string' ||
    !Array.isArray(contract.requiredSubsystemPaths)
  ) {
    throw new Error(
      'Program contract must include requiredNxTargets, requiredVerifyIncludes, requiredRoutes, requiredSeoOutputs, mediaGovernancePath, requiredSubsystemPaths',
    );
  }
  return contract;
}

function main(): void {
  const contract = extractContract(PROGRAM_DOC);
  const errors: string[] = [];

  // 1) Required subsystems (files/dirs) exist
  for (const rel of contract.requiredSubsystemPaths) {
    const abs = path.join(ROOT, rel);
    if (!existsSync(abs)) {
      errors.push(`Missing required subsystem path: ${rel}`);
    }
  }

  // 2) Required Nx targets exist on web (use Nx effective project so inferred targets like build count)
  const { execSync } = require('node:child_process');
  let effectiveTargets: Record<string, unknown> = {};
  try {
    const out = execSync('pnpm nx show project web --json', {
      cwd: ROOT,
      encoding: 'utf-8',
    });
    const project = JSON.parse(out) as { targets?: Record<string, unknown> };
    effectiveTargets = project.targets ?? {};
  } catch {
    const project = JSON.parse(readFileSync(WEB_PROJECT_JSON, 'utf-8')) as {
      targets?: Record<string, unknown>;
    };
    effectiveTargets = project.targets ?? {};
  }
  for (const name of contract.requiredNxTargets) {
    if (!(name in effectiveTargets)) {
      errors.push(`Missing Nx target on web: ${name}`);
    }
  }

  // 3) web:verify includes required validators (no bypass)
  if (existsSync(WEB_PROJECT_JSON)) {
    const project = JSON.parse(readFileSync(WEB_PROJECT_JSON, 'utf-8')) as {
      targets?: { verify?: { options?: { commands?: string[] } } };
    };
    const verifyCommands = project.targets?.verify?.options?.commands ?? [];
    for (const include of contract.requiredVerifyIncludes) {
      const expected = `nx run web:${include}`;
      if (
        !verifyCommands.some(
          (c: string) => c.includes(expected) || c === expected,
        )
      ) {
        errors.push(
          `web:verify must include ${include}; current commands do not.`,
        );
      }
    }
  }

  // 4) Required routes exist under [locale] (i18n-safe)
  if (!existsSync(LOCALE_APP_DIR)) {
    errors.push('Missing apps/web/src/app/[locale] (i18n route root).');
  } else {
    for (const route of contract.requiredRoutes) {
      const routeDir = path.join(LOCALE_APP_DIR, route);
      if (!existsSync(routeDir)) {
        errors.push(`Missing i18n route: [locale]/${route}`);
      }
    }
  }

  // 5) Required SEO outputs exist (sitemap + image sitemap)
  for (const rel of contract.requiredSeoOutputs) {
    const abs = path.join(ROOT, rel);
    if (!existsSync(abs)) {
      errors.push(`Missing required SEO output: ${rel}`);
    }
  }

  // 6) Media governance policy exists
  const governancePath = path.join(ROOT, contract.mediaGovernancePath);
  if (!existsSync(governancePath)) {
    errors.push(
      `Missing media governance policy: ${contract.mediaGovernancePath}`,
    );
  }

  if (errors.length) {
    throw new Error(
      `Authority program validation failed:\n- ${errors.join('\n- ')}`,
    );
  }

  console.log(
    'Authority program validation passed: subsystems, Nx targets, verify pipeline, routes, SEO outputs, and media governance policy present.',
  );
}

main();

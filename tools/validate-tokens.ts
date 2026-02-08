/**
 * Design system token completeness: ensures required token groups exist in
 * libs/tokens so authority calibration and layout remain consistent.
 * Run: npx tsx --tsconfig tsconfig.base.json tools/validate-tokens.ts
 */
import path from 'node:path';
import { readFileSync, existsSync } from 'node:fs';

const tokensPathCandidates = [
  path.join(process.cwd(), 'libs', 'tokens', 'src', 'lib', 'tokens.css'),
  path.join(process.cwd(), '..', 'libs', 'tokens', 'src', 'lib', 'tokens.css'),
];
const tokensPath =
  tokensPathCandidates.find((p) => existsSync(p)) ?? tokensPathCandidates[0];

const REQUIRED_TOKEN_GROUPS: { name: string; vars: string[] }[] = [
  {
    name: 'color foundations',
    vars: [
      '--color-bg',
      '--color-surface',
      '--color-text',
      '--color-muted',
      '--color-border',
      '--color-accent',
      '--color-focus',
    ],
  },
  {
    name: 'spacing',
    vars: [
      '--space-4',
      '--space-6',
      '--container-max-width',
      '--readable-max-width',
    ],
  },
  {
    name: 'typography',
    vars: [
      '--font-sans',
      '--display-heading-size',
      '--section-heading-size',
      '--body-analytical-size',
      '--text-base',
    ],
  },
  {
    name: 'authority signal',
    vars: [
      '--authority-spacing-density',
      '--authority-hierarchy-emphasis',
      '--authority-motion-restraint',
      '--ease-authority',
    ],
  },
  {
    name: 'motion',
    vars: ['--transition-duration-fast', '--transition-duration-normal'],
  },
  {
    name: 'media list thumb',
    vars: ['--media-thumb-size'],
  },
];

const errors: string[] = [];

if (!existsSync(tokensPath)) {
  throw new Error(`Tokens file not found: ${tokensPath}`);
}

const content = readFileSync(tokensPath, 'utf-8');

for (const group of REQUIRED_TOKEN_GROUPS) {
  for (const v of group.vars) {
    if (!content.includes(v)) {
      errors.push(`Missing token (${group.name}): ${v}`);
    }
  }
}

if (errors.length > 0) {
  throw new Error(
    `Token completeness validation failed:\n- ${errors.join('\n- ')}`,
  );
}

console.log(
  `Token completeness passed: ${REQUIRED_TOKEN_GROUPS.flatMap((g) => g.vars).length} required tokens present.`,
);

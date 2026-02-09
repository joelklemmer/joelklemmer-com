/**
 * Performance perception gate: runs Lighthouse CI with lighthouserc.cjs.
 * Enforces web-vitals and resource budgets; exits non-zero when exceeded.
 * Used by: CI lighthouse job, local checks (pnpm nx run web:perf-validate).
 * Reports written to tmp/lighthouse; capture before/after to docs/audit/perf/.
 */
import { execSync } from 'child_process';
import { resolve } from 'path';

const root = resolve(__dirname, '..');
execSync('pnpm exec lhci autorun --config=./lighthouserc.cjs', {
  cwd: root,
  stdio: 'inherit',
});

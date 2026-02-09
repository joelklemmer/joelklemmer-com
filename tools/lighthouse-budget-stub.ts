/**
 * Lighthouse CI budget gate. Runs @lhci/cli with lighthouserc.cjs.
 * - Key routes: /en, /en/brief, /en/media
 * - Assertions: performance (warn), accessibility (error), LCP, CLS
 * Run via: pnpm exec lhci autorun --config=./lighthouserc.cjs
 * CI runs this in the lighthouse job; this target invokes the same for local checks.
 */
import { execSync } from 'child_process';
import { resolve } from 'path';

const root = resolve(__dirname, '..');
execSync('pnpm exec lhci autorun --config=./lighthouserc.cjs', {
  cwd: root,
  stdio: 'inherit',
});

/**
 * Lighthouse timespan runner: build (optional), start server, run collect-lhr-timespan
 * to generate LHRs with INP, then run lhci-assert-from-lhrs. No LHCI collect;
 * assertions are unchanged (lighthouserc.serverless.cjs).
 *
 * Run from repo root. CI: RATE_LIMIT_MODE=off, SKIP_LH_BUILD=1 after build job.
 */
import { spawn } from 'node:child_process';
import { startServer } from './lib/startServer';

const workspaceRoot = process.cwd();

function ensureCiLikeEnv(): void {
  process.env.NEXT_PUBLIC_SITE_URL ??= 'https://example.invalid';
  process.env.NEXT_PUBLIC_IDENTITY_SAME_AS ??= 'https://example.invalid/ci';
}

async function main(): Promise<number> {
  ensureCiLikeEnv();
  const skipBuild =
    process.env.SKIP_LH_BUILD === '1' || process.env.SKIP_LH_BUILD === 'true';
  const envPort = process.env.PORT;
  const requestedPort =
    envPort !== undefined && envPort !== '' ? parseInt(envPort, 10) : undefined;
  if (
    requestedPort !== undefined &&
    (Number.isNaN(requestedPort) || requestedPort <= 0)
  ) {
    throw new Error(`lighthouse-timespan: invalid PORT=${envPort}`);
  }
  const env = { ...process.env };
  if (requestedPort !== undefined) env.PORT = String(requestedPort);

  if (!skipBuild) {
    const build = spawn('pnpm', ['nx', 'run', 'web:build', '--skip-nx-cache'], {
      cwd: workspaceRoot,
      stdio: 'inherit',
      env,
      shell: true,
    });
    const buildExit = await new Promise<number>((resolve) => {
      build.on('exit', (code, signal) => {
        resolve(code ?? (signal ? 1 : 0));
      });
    });
    if (buildExit !== 0) {
      throw new Error(
        `lighthouse-timespan: web:build exited with ${buildExit}`,
      );
    }
    await new Promise((r) => setTimeout(r, 1500));
  }

  const { baseUrl, stop } = await startServer(requestedPort);
  process.env.BASE_URL = baseUrl;
  process.env.LHCI_BASE_URL = baseUrl;

  process.on('SIGINT', () => void stop());
  process.on('SIGTERM', () => void stop());

  const collect = spawn(
    'npx',
    [
      'tsx',
      '--tsconfig',
      'tsconfig.base.json',
      'tools/collect-lhr-timespan.ts',
    ],
    {
      cwd: workspaceRoot,
      stdio: 'inherit',
      env: { ...process.env, BASE_URL: baseUrl, LHCI_BASE_URL: baseUrl },
      shell: true,
    },
  );
  const collectExit = await new Promise<number>((resolve) => {
    collect.on('exit', (code, signal) => resolve(code ?? (signal ? 1 : 0)));
  });
  if (collectExit !== 0) {
    await stop();
    return collectExit;
  }

  const assert = spawn(
    'npx',
    [
      'tsx',
      '--tsconfig',
      'tsconfig.base.json',
      'tools/lhci-assert-from-lhrs.ts',
      '--lhr-dir=tmp/lighthouse/custom',
    ],
    {
      cwd: workspaceRoot,
      stdio: 'inherit',
      env: process.env,
      shell: true,
    },
  );
  const assertExit = await new Promise<number>((resolve) => {
    assert.on('exit', (code, signal) => resolve(code ?? (signal ? 1 : 0)));
  });
  if (assertExit !== 0) {
    await stop();
    return assertExit;
  }

  const lcpBudget = spawn(
    'npx',
    [
      'tsx',
      '--tsconfig',
      'tsconfig.base.json',
      'tools/validate-lcp-budget.ts',
      '--lhr-dir=tmp/lighthouse/custom',
    ],
    {
      cwd: workspaceRoot,
      stdio: 'inherit',
      env: process.env,
      shell: true,
    },
  );
  const lcpBudgetExit = await new Promise<number>((resolve) => {
    lcpBudget.on('exit', (code, signal) => resolve(code ?? (signal ? 1 : 0)));
  });

  await stop();
  return lcpBudgetExit;
}

main()
  .then((code) => process.exit(code))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });

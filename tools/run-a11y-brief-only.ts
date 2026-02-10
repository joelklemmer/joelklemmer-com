/**
 * A11y diagnostics: runs 10 iterations per locale on /brief only to reproduce
 * intermittent aria-required-children (or other) failures. Does not weaken the a11y gate.
 *
 * - Starts server via shared startServer (same as run-a11y.ts).
 * - Runs Playwright test that: for each locale (en, uk, es, he), runs 10 iterations;
 *   on any serious violation records url, axe id, selector/node snippet and saves
 *   page.content() to dist/.playwright/a11y-dumps/<timestamp>/<locale>-iter<N>.html.
 * - Exit 1 if any iteration had a serious violation.
 *
 * Usage: npx tsx --tsconfig tsconfig.base.json tools/run-a11y-brief-only.ts
 * Nx target: web:a11y-brief-repro (not in verify).
 */
import { spawn } from 'node:child_process';
import getPort from 'get-port';
import { startServer } from './lib/startServer';

const workspaceRoot = process.cwd();

function applyA11yEnvDefaults(): void {
  process.env.NEXT_PUBLIC_SITE_URL ??= 'https://example.invalid';
  process.env.NEXT_PUBLIC_IDENTITY_SAME_AS ??= 'https://example.invalid/ci';
  process.env.RELEASE_READY ??= '0';
}

async function main(): Promise<number> {
  applyA11yEnvDefaults();

  const port = await getPort({ port: 4301 });

  const skipBuild =
    process.env.SKIP_A11Y_BUILD === '1' ||
    process.env.SKIP_A11Y_BUILD === 'true';
  const env = { ...process.env, PORT: String(port) };

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
      throw new Error(`a11y-brief-repro: web:build exited with ${buildExit}`);
    }
    await new Promise((r) => setTimeout(r, 1500));
  }

  const { baseUrl, stop } = await startServer(port);

  process.on('SIGINT', () => {
    void stop();
  });
  process.on('SIGTERM', () => {
    void stop();
  });

  const playwright = spawn(
    'npx',
    [
      'playwright',
      'test',
      '--config=apps/web-e2e/playwright.a11y.config.ts',
      'apps/web-e2e/src/a11y/a11y-brief-repro.spec.ts',
    ],
    {
      cwd: workspaceRoot,
      stdio: 'inherit',
      env: { ...process.env, BASE_URL: baseUrl, PORT: String(port) },
      shell: true,
    },
  );

  const playExit = await new Promise<number>((resolve) => {
    playwright.on('exit', (code, signal) => {
      resolve(code ?? (signal ? 1 : 0));
    });
  });

  await stop();
  return playExit;
}

main()
  .then((code) => process.exit(code))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });

/**
 * Visual/presentation-integrity runner: starts web via Nx (production), polls /en/ until 200,
 * runs Playwright visual suite with BASE_URL, then tears down. Same server boot as a11y/lighthouse.
 * Run from repo root. In CI set RATE_LIMIT_MODE=off, PORT=3000, SKIP_VISUAL_BUILD=1 (after build job).
 */
import { spawn } from 'node:child_process';
import { startServer } from './lib/startServer';

const workspaceRoot = process.cwd();

async function main(): Promise<number> {
  const port = Number(process.env.PORT) || 3000;

  const skipBuild =
    process.env.SKIP_VISUAL_BUILD === '1' ||
    process.env.SKIP_VISUAL_BUILD === 'true';
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
      throw new Error(`visual: web:build exited with ${buildExit}`);
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
    ['playwright', 'test', '--config=apps/web-e2e/playwright.visual.config.ts'],
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

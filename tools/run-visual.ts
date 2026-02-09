/**
 * Visual/presentation-integrity runner: starts web via Nx (production), polls /en/ until 200,
 * runs Playwright visual suite with BASE_URL, then tears down. Same server boot as a11y/lighthouse.
 * Run from repo root. In CI set RATE_LIMIT_MODE=off, PORT=3000 optional; dynamic port when unset.
 */
import { spawn } from 'node:child_process';
import { startServer } from './lib/startServer';

const workspaceRoot = process.cwd();

/** CI-like env so build produces valid app (NEXT_PUBLIC_* are baked at build time). */
function ensureCiLikeEnv(): void {
  process.env.NEXT_PUBLIC_SITE_URL ??= 'https://example.invalid';
  process.env.NEXT_PUBLIC_IDENTITY_SAME_AS ??= 'https://example.invalid/ci';
}

async function main(): Promise<number> {
  ensureCiLikeEnv();
  const envPort = process.env.PORT;
  const requestedPort =
    envPort !== undefined && envPort !== '' ? parseInt(envPort, 10) : undefined;
  if (
    requestedPort !== undefined &&
    (Number.isNaN(requestedPort) || requestedPort <= 0)
  ) {
    throw new Error(`visual: invalid PORT=${envPort}`);
  }

  const skipBuild =
    process.env.SKIP_VISUAL_BUILD === '1' ||
    process.env.SKIP_VISUAL_BUILD === 'true';
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
      throw new Error(`visual: web:build exited with ${buildExit}`);
    }
    await new Promise((r) => setTimeout(r, 1500));
  }

  const { baseUrl, port, stop } = await startServer(requestedPort);

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

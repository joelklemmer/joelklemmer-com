/**
 * Lighthouse CI runner: starts web via Nx (production), polls /en/ until 200,
 * runs lhci with serverless config (no built-in server start), then tears down.
 * Run from repo root. In CI set RATE_LIMIT_MODE=off, SKIP_LH_BUILD=1 after build job.
 * Port: use PORT env if set; otherwise dynamic free port (avoids EADDRINUSE).
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
  const skipBuild =
    process.env.SKIP_LH_BUILD === '1' || process.env.SKIP_LH_BUILD === 'true';
  const envPort = process.env.PORT;
  const requestedPort =
    envPort !== undefined && envPort !== '' ? parseInt(envPort, 10) : undefined;
  if (
    requestedPort !== undefined &&
    (Number.isNaN(requestedPort) || requestedPort <= 0)
  ) {
    throw new Error(`lighthouse: invalid PORT=${envPort}`);
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
      throw new Error(`lighthouse: web:build exited with ${buildExit}`);
    }
    await new Promise((r) => setTimeout(r, 1500));
  }

  const { baseUrl, stop } = await startServer(requestedPort);

  process.on('SIGINT', () => {
    void stop();
  });
  process.on('SIGTERM', () => {
    void stop();
  });

  const lhci = spawn(
    'pnpm',
    ['exec', 'lhci', 'autorun', '--config=./lighthouserc.serverless.cjs'],
    {
      cwd: workspaceRoot,
      stdio: 'inherit',
      env: { ...process.env, LHCI_BASE_URL: baseUrl },
      shell: true,
    },
  );

  const lhciExit = await new Promise<number>((resolve) => {
    lhci.on('exit', (code, signal) => {
      resolve(code ?? (signal ? 1 : 0));
    });
  });

  await stop();
  return lhciExit;
}

main()
  .then((code) => process.exit(code))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });

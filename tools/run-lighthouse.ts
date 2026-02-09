/**
 * Lighthouse CI runner: starts web via Nx (production), polls /en/ until 200,
 * runs lhci with serverless config (no built-in server start), then tears down.
 * Run from repo root. In CI set RATE_LIMIT_MODE=off, SKIP_LH_BUILD=1 after build job.
 */
import { spawn } from 'node:child_process';
import { startServer } from './lib/startServer';

const workspaceRoot = process.cwd();
const LIGHTHOUSE_PORT = 3000;

async function main(): Promise<number> {
  const skipBuild =
    process.env.SKIP_LH_BUILD === '1' || process.env.SKIP_LH_BUILD === 'true';
  const env = { ...process.env, PORT: String(LIGHTHOUSE_PORT) };

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

  const { baseUrl, stop } = await startServer(LIGHTHOUSE_PORT);

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

/**
 * Collision-proof a11y runner: picks a free port, starts the web server via Nx
 * (production parity), runs Playwright a11y tests with BASE_URL set, then cleans up.
 * Injects safe placeholder env vars only when missing so the gate is deterministic
 * without requiring local or CI env; production deploys still enforce real identity.
 * Run with: npx tsx --tsconfig tsconfig.base.json tools/run-a11y.ts
 *
 * Server boot: uses `pnpm nx start web --configuration=production` from repo root
 * so Nx controls cwd and output path. No direct `next start` or cwd hacks.
 * Ready check: polls GET <baseUrl>/en/ until 200 (locale route matches app/[locale]).
 */
import { spawn } from 'node:child_process';
import getPort from 'get-port';

const workspaceRoot = process.cwd();

/** Deterministic locale route for server-ready check; matches app/[locale]. */
const READY_PATH = '/en/';
const SERVER_READY_TIMEOUT_MS = 120_000;
const READY_POLL_MS = 500;

/** Safe defaults for a11y run only; applied only when env vars are not already set. */
function applyA11yEnvDefaults(): void {
  process.env.NEXT_PUBLIC_SITE_URL ??= 'https://example.invalid';
  process.env.NEXT_PUBLIC_IDENTITY_SAME_AS ??= 'https://example.invalid/ci';
  process.env.RELEASE_READY ??= '0';
}

async function waitForServer(
  baseUrl: string,
  timeoutMs: number,
): Promise<boolean> {
  const readyUrl = baseUrl.replace(/\/?$/, '') + READY_PATH;
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(readyUrl, { method: 'GET' });
      if (res.ok) return true;
    } catch {
      // not ready yet
    }
    await new Promise((r) => setTimeout(r, READY_POLL_MS));
  }
  return false;
}

async function main(): Promise<number> {
  applyA11yEnvDefaults();
  // Enable limiter so rate-limit.spec can assert 429 (uses TEST-NET IP 192.0.2.1 with low threshold).
  process.env.RATE_LIMIT_MODE ??= 'proxy';

  const port = await getPort({ port: 4300 });
  const baseURL = `http://127.0.0.1:${port}`;

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
      throw new Error(`a11y: web:build exited with ${buildExit}`);
    }
    await new Promise((r) => setTimeout(r, 1500));
  }

  // Start production server via Nx from repo root so cwd and output path are correct (Windows + Linux).
  // Use shell so pnpm is resolved on Windows when run via npx tsx.
  const server = spawn(
    'pnpm',
    ['nx', 'start', 'web', '--configuration=production'],
    {
      cwd: workspaceRoot,
      stdio: 'pipe',
      env,
      shell: true,
    },
  );

  let serverExited = false;
  let serverExitCode: number | null = null;
  server.on('exit', (code) => {
    serverExited = true;
    serverExitCode = code ?? null;
  });
  server.stderr?.on('data', (chunk: Buffer) => process.stderr.write(chunk));
  server.stdout?.on('data', (chunk: Buffer) => process.stdout.write(chunk));

  const cleanup = () => {
    if (!serverExited && server.kill) {
      server.kill('SIGTERM');
    }
  };
  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);

  const ready = await waitForServer(baseURL, SERVER_READY_TIMEOUT_MS);
  if (!ready) {
    cleanup();
    throw new Error(
      `Server at ${baseURL}${READY_PATH} did not return 200 within ${SERVER_READY_TIMEOUT_MS / 1000}s. ` +
        'Check that nx run web:build succeeded and nx start web uses the same output path.',
    );
  }

  const playwright = spawn(
    'npx',
    ['playwright', 'test', '--config=apps/web-e2e/playwright.a11y.config.ts'],
    {
      cwd: workspaceRoot,
      stdio: 'inherit',
      env: { ...process.env, BASE_URL: baseURL, PORT: String(port) },
      shell: true,
    },
  );

  const playExit = await new Promise<number>((resolve) => {
    playwright.on('exit', (code, signal) => {
      resolve(code ?? (signal ? 1 : 0));
    });
  });

  cleanup();
  await new Promise<void>((r) => {
    if (serverExited) return r();
    const t = setTimeout(() => {
      if (server.kill) server.kill('SIGKILL');
      r();
    }, 5000);
    server.on('exit', () => {
      clearTimeout(t);
      r();
    });
  });

  return playExit;
}

main()
  .then((code) => process.exit(code))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });

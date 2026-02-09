/**
 * Collision-proof a11y runner: picks a free port, starts the web server on it,
 * runs Playwright a11y tests with BASE_URL set, then cleans up.
 * Injects safe placeholder env vars only when missing so the gate is deterministic
 * without requiring local or CI env; production deploys still enforce real identity.
 * Run with: npx tsx --tsconfig tsconfig.base.json tools/run-a11y.ts
 */
import { spawn } from 'node:child_process';
import getPort from 'get-port';

const workspaceRoot = process.cwd();

/** Safe defaults for a11y run only; applied only when env vars are not already set. */
function applyA11yEnvDefaults(): void {
  process.env.NEXT_PUBLIC_SITE_URL ??= 'https://example.invalid';
  process.env.NEXT_PUBLIC_IDENTITY_SAME_AS ??= 'https://example.invalid/ci';
  process.env.RELEASE_READY ??= '0';
}

async function waitForServer(url: string, timeoutMs: number): Promise<boolean> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(url, { method: 'GET' });
      if (res.ok) return true;
    } catch {
      // not ready yet
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  return false;
}

async function main(): Promise<number> {
  applyA11yEnvDefaults();

  const port = await getPort({ port: 4300 });
  const baseURL = `http://127.0.0.1:${port}`;

  // Use production server: build + start when run standalone; start only when
  // SKIP_A11Y_BUILD=1 (e.g. verify already ran build). Avoids Next lock and output conflicts.
  const skipBuild =
    process.env.SKIP_A11Y_BUILD === '1' ||
    process.env.SKIP_A11Y_BUILD === 'true';
  const serverCommand = skipBuild
    ? `pnpm nx run web:start --port=${port}`
    : `pnpm nx run web:build --skip-nx-cache && pnpm nx run web:start --port=${port}`;

  const server = spawn(serverCommand, [], {
    cwd: workspaceRoot,
    stdio: 'pipe',
    env: { ...process.env, PORT: String(port) },
    shell: true,
  });

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

  const ready = await waitForServer(baseURL, 120_000);
  if (!ready) {
    cleanup();
    throw new Error(`Server at ${baseURL} did not become ready within 120s`);
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

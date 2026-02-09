/**
 * Shared server boot for CI test harnesses (a11y, visual, lighthouse).
 * Starts web via Nx from repo root, polls GET /en/ until 200, returns cleanup.
 * Run from repo root so Nx cwd and output path are correct.
 */
import { spawn, type ChildProcess } from 'node:child_process';
import path from 'node:path';

const workspaceRoot = path.resolve(__dirname, '../..');
const READY_PATH = '/en/';
const SERVER_READY_TIMEOUT_MS = 120_000;
const READY_POLL_MS = 500;

export interface StartServerResult {
  baseUrl: string;
  stop: () => Promise<void>;
}

async function waitForReady(
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

/**
 * Start production web server via Nx from repo root; poll GET /en/ until 200.
 * Returns baseUrl and stop(). Caller must call stop() to teardown.
 */
export async function startServer(port: number): Promise<StartServerResult> {
  const baseUrl = `http://127.0.0.1:${port}`;
  const env = { ...process.env, PORT: String(port) };

  const server: ChildProcess = spawn(
    'pnpm',
    ['nx', 'start', 'web', '--configuration=production'],
    {
      cwd: workspaceRoot,
      stdio: 'pipe',
      env,
      shell: true,
    },
  );

  server.stderr?.on('data', (chunk: Buffer) => process.stderr.write(chunk));
  server.stdout?.on('data', (chunk: Buffer) => process.stdout.write(chunk));

  const stop = (): Promise<void> =>
    new Promise((resolve) => {
      if (server.kill && !server.killed) {
        server.kill('SIGTERM');
      }
      const t = setTimeout(() => {
        if (server.kill) server.kill('SIGKILL');
        resolve();
      }, 5000);
      server.on('exit', () => {
        clearTimeout(t);
        resolve();
      });
    });

  const ready = await waitForReady(baseUrl, SERVER_READY_TIMEOUT_MS);
  if (!ready) {
    await stop();
    throw new Error(
      `Server at ${baseUrl}${READY_PATH} did not return 200 within ${SERVER_READY_TIMEOUT_MS / 1000}s. ` +
        'Check that nx run web:build succeeded and nx start web uses the same output path.',
    );
  }

  return { baseUrl, stop };
}

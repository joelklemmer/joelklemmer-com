/**
 * Shared server boot for CI test harnesses (a11y, visual, lighthouse).
 * Starts web via Nx from repo root, polls GET /en/ until 200 and body passes
 * readiness checks, returns cleanup. Run from repo root so Nx cwd and output path are correct.
 */
import { spawn, type ChildProcess } from 'node:child_process';
import path from 'node:path';
import getPort from 'get-port';

const workspaceRoot = path.resolve(__dirname, '../..');
const READY_PATH = '/en/';
const SERVER_READY_TIMEOUT_MS = 120_000;
const READY_POLL_MS = 500;
const SIGTERM_WAIT_MS = 8000;

export interface StartServerResult {
  baseUrl: string;
  port: number;
  stop: () => Promise<void>;
}

async function waitForReady(
  baseUrl: string,
  timeoutMs: number,
): Promise<{ ok: boolean; body?: string }> {
  const readyUrl = baseUrl.replace(/\/?$/, '') + READY_PATH;
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(readyUrl, { method: 'GET' });
      const body = await res.text();
      if (res.ok) return { ok: true, body };
    } catch {
      // not ready yet
    }
    await new Promise((r) => setTimeout(r, READY_POLL_MS));
  }
  return { ok: false };
}

function assertReadinessBody(path: string, body: string): void {
  const lower = body.toLowerCase();
  if (!lower.includes('<html') || !lower.includes('lang="en"')) {
    throw new Error(
      `Readiness check failed: response at ${path} must contain <html and lang="en".`,
    );
  }
  if (!body.includes('masthead-bar')) {
    throw new Error(
      `Readiness check failed: response at ${path} must contain masthead-bar (app shell).`,
    );
  }
}

/**
 * Resolve port: explicit number > env PORT (if valid) > free port from getPort.
 */
async function resolvePort(requested?: number): Promise<number> {
  if (requested !== undefined && Number.isInteger(requested) && requested > 0) {
    return requested;
  }
  const envPort = process.env.PORT;
  if (envPort !== undefined && envPort !== '') {
    const n = parseInt(envPort, 10);
    if (Number.isFinite(n) && n > 0) return n;
  }
  return getPort({ port: 3000 });
}

/**
 * Start production web server via Nx from repo root; poll GET /en/ until 200 and body
 * contains stable markers (html lang + masthead). Returns baseUrl, port, and stop().
 * stop() sends SIGTERM, waits up to SIGTERM_WAIT_MS, then SIGKILL. Caller must call stop() to teardown.
 * When port is not provided and PORT env is not set, uses a dynamic free port.
 */
export async function startServer(
  port?: number,
): Promise<StartServerResult> {
  const resolvedPort = await resolvePort(port);
  const baseUrl = `http://127.0.0.1:${resolvedPort}`;
  const env = { ...process.env, PORT: String(resolvedPort) };

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
      if (!server.kill || server.killed) {
        resolve();
        return;
      }
      server.kill('SIGTERM');
      const t = setTimeout(() => {
        try {
          server.kill('SIGKILL');
        } catch {
          // ignore
        }
        resolve();
      }, SIGTERM_WAIT_MS);
      server.once('exit', () => {
        clearTimeout(t);
        resolve();
      });
    });

  const { ok, body } = await waitForReady(baseUrl, SERVER_READY_TIMEOUT_MS);
  if (!ok) {
    await stop();
    throw new Error(
      `Server at ${baseUrl}${READY_PATH} did not return 200 within ${SERVER_READY_TIMEOUT_MS / 1000}s. ` +
        'Check that nx run web:build succeeded and nx start web uses the same output path.',
    );
  }
  if (body !== undefined) {
    try {
      assertReadinessBody(READY_PATH, body);
    } catch (e) {
      await stop();
      throw e;
    }
  }

  return { baseUrl, port: resolvedPort, stop };
}

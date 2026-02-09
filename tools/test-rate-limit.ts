/**
 * Deterministic rate-limit verification: runs with RATE_LIMIT_MODE=always and
 * RATE_LIMIT_MAX_PER_WINDOW=2 to prove 429 triggers, 429 HTML has title/lang, and
 * dir="rtl" for he routes. Uses shared startServer; requires built app (set
 * SKIP_RATE_LIMIT_BUILD=1 when build artifact is already present, e.g. CI).
 * Run from repo root: npx tsx --tsconfig tsconfig.base.json tools/test-rate-limit.ts
 */
import { spawn } from 'node:child_process';
import { startServer } from './lib/startServer';

const workspaceRoot = process.cwd();
const TEST_NET_IP = '192.0.2.1';

/** Safe defaults for rate-limit run only; applied only when env vars are not already set. */
function applyRateLimitEnvDefaults(): void {
  process.env.NEXT_PUBLIC_SITE_URL ??= 'https://example.invalid';
  process.env.NEXT_PUBLIC_IDENTITY_SAME_AS ??= 'https://example.invalid/ci';
  process.env.RELEASE_READY ??= '0';
}

function runBuild(): Promise<number> {
  return new Promise((resolve) => {
    const build = spawn(
      'pnpm',
      ['nx', 'run', 'web:build', '--skip-nx-cache'],
      {
        cwd: workspaceRoot,
        stdio: 'inherit',
        env: { ...process.env, PORT: '0' },
        shell: true,
      },
    );
    build.on('exit', (code, signal) => {
      resolve(code ?? (signal ? 1 : 0));
    });
  });
}

async function main(): Promise<number> {
  applyRateLimitEnvDefaults();

  const skipBuild =
    process.env.SKIP_RATE_LIMIT_BUILD === '1' ||
    process.env.SKIP_RATE_LIMIT_BUILD === 'true';

  if (!skipBuild) {
    const buildExit = await runBuild();
    if (buildExit !== 0) {
      console.error('rate-limit-verify: web:build failed');
      return 1;
    }
    await new Promise((r) => setTimeout(r, 1500));
  }

  const origMode = process.env.RATE_LIMIT_MODE;
  const origMax = process.env.RATE_LIMIT_MAX_PER_WINDOW;
  process.env.RATE_LIMIT_MODE = 'always';
  process.env.RATE_LIMIT_MAX_PER_WINDOW = '2';

  const { baseUrl, stop } = await startServer(undefined);

  process.on('SIGINT', () => void stop());
  process.on('SIGTERM', () => void stop());

  try {
    const headers = { 'X-Forwarded-For': TEST_NET_IP };

    // Exhaust limit for /en/ (2 allowed, 3rd = 429)
    await fetch(baseUrl + '/en/', { headers });
    await fetch(baseUrl + '/en/', { headers });
    const enRes = await fetch(baseUrl + '/en/', { headers });

    if (enRes.status !== 429) {
      console.error(
        `Expected 429 for /en/ third request, got ${enRes.status}`,
      );
      return 1;
    }
    const retryAfter = enRes.headers.get('retry-after');
    if (!retryAfter) {
      console.error('Expected Retry-After header on 429');
      return 1;
    }
    const enBody = await enRes.text();
    if (!enBody.includes('<!DOCTYPE html>')) {
      console.error('429 body must contain <!DOCTYPE html>');
      return 1;
    }
    if (!enBody.includes('lang="en"')) {
      console.error('429 body for /en/ must contain lang="en"');
      return 1;
    }
    if (!enBody.includes('<title>Too Many Requests</title>')) {
      console.error('429 body must contain title Too Many Requests');
      return 1;
    }
    if (!enBody.includes('dir="ltr"')) {
      console.error('429 body for /en/ must contain dir="ltr"');
      return 1;
    }
    if (!enBody.includes('<main') || !enBody.includes('role="main"')) {
      console.error('429 body must contain main with role="main"');
      return 1;
    }

    // Exhaust limit for /he/ and assert dir="rtl"
    await fetch(baseUrl + '/he/', { headers });
    await fetch(baseUrl + '/he/', { headers });
    const heRes = await fetch(baseUrl + '/he/', { headers });
    if (heRes.status !== 429) {
      console.error(
        `Expected 429 for /he/ third request, got ${heRes.status}`,
      );
      return 1;
    }
    const heBody = await heRes.text();
    if (!heBody.includes('lang="he"')) {
      console.error('429 body for /he/ must contain lang="he"');
      return 1;
    }
    if (!heBody.includes('dir="rtl"')) {
      console.error('429 body for /he/ must contain dir="rtl"');
      return 1;
    }

    console.log('Rate-limit verification passed: 429, HTML invariants, and RTL for /he/.');
    return 0;
  } finally {
    if (origMode !== undefined) process.env.RATE_LIMIT_MODE = origMode;
    else delete process.env.RATE_LIMIT_MODE;
    if (origMax !== undefined) process.env.RATE_LIMIT_MAX_PER_WINDOW = origMax;
    else delete process.env.RATE_LIMIT_MAX_PER_WINDOW;
    await stop();
  }
}

main()
  .then((code) => process.exit(code))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });

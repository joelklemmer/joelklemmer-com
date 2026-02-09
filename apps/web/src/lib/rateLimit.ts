/**
 * Rate limiting for Next.js middleware. In-memory fixed-window per IP.
 * Replace with a distributed store (e.g. Redis) when scaling beyond a single instance.
 *
 * Behavior is controlled by RATE_LIMIT_MODE (env):
 * - proxy (default): apply limiter only when request appears to come from behind a proxy (x-forwarded-for / x-real-ip).
 * - always: apply limiter to every request regardless of headers.
 * - off: do not rate limit; always allow (e.g. CI, local dev).
 *
 * Usage: call from middleware; return 429 when limit exceeded and set Retry-After header.
 */

import type { NextRequest } from 'next/server';

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  retryAfter?: number;
}

const WINDOW_MS = 60_000; // 1 minute
const DEFAULT_MAX_PER_WINDOW = 120; // per IP per minute

/** TEST-NET (RFC 5737): use low limit so a11y/CI can assert 429 without 120 requests. Real proxies do not use this. */
const VERIFY_MAX = 2;
const TEST_NET_PREFIX = '192.0.2.';

/** Optional env override (e.g. RATE_LIMIT_MAX_PER_WINDOW=2 for local/CI verification of 429 shell). */
function getMaxRequestsPerWindow(key: string): number {
  if (key.startsWith(TEST_NET_PREFIX) || key === '192.0.2.1') return VERIFY_MAX;
  const raw = process.env.RATE_LIMIT_MAX_PER_WINDOW;
  if (raw === undefined || raw === '') return DEFAULT_MAX_PER_WINDOW;
  const n = parseInt(raw, 10);
  if (!Number.isFinite(n) || n < 1) return DEFAULT_MAX_PER_WINDOW;
  return n;
}

const store = new Map<string, { count: number; windowStart: number }>();

type RateLimitMode = 'proxy' | 'always' | 'off';

function getRateLimitMode(): RateLimitMode {
  const raw = process.env.RATE_LIMIT_MODE?.toLowerCase().trim();
  if (raw === 'always' || raw === 'off' || raw === 'proxy') return raw;
  return 'proxy';
}

function getClientKey(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip =
    forwarded?.split(',')[0]?.trim() ?? request.headers.get('x-real-ip');
  if (ip) return ip;
  return 'unknown';
}

/** True when request appears to come from behind a proxy. */
function isBehindProxy(request: NextRequest): boolean {
  return (
    request.headers.has('x-forwarded-for') || request.headers.has('x-real-ip')
  );
}

/** True when we should apply the rate limiter for this request. */
function shouldApplyLimiter(request: NextRequest): boolean {
  const mode = getRateLimitMode();
  if (mode === 'off') return false;
  if (mode === 'always') return true;
  return isBehindProxy(request);
}

export function rateLimit(request: NextRequest): RateLimitResult {
  if (!shouldApplyLimiter(request)) {
    return { success: true, remaining: DEFAULT_MAX_PER_WINDOW };
  }

  const key = getClientKey(request);
  const maxRequests = getMaxRequestsPerWindow(key);
  const now = Date.now();

  let entry = store.get(key);
  if (!entry || now - entry.windowStart >= WINDOW_MS) {
    entry = { count: 0, windowStart: now };
    store.set(key, entry);
  }

  entry.count += 1;

  if (entry.count > maxRequests) {
    const retryAfter = Math.ceil((entry.windowStart + WINDOW_MS - now) / 1000);
    return {
      success: false,
      remaining: 0,
      retryAfter: Math.max(1, retryAfter),
    };
  }

  return {
    success: true,
    remaining: Math.max(0, maxRequests - entry.count),
  };
}

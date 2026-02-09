/**
 * Rate limiting for Next.js middleware. In-memory fixed-window per IP.
 * Replace with a distributed store (e.g. Redis) when scaling beyond a single instance.
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
const MAX_REQUESTS_PER_WINDOW = 120; // per IP per minute

const store = new Map<string, { count: number; windowStart: number }>();

function getClientKey(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip =
    forwarded?.split(',')[0]?.trim() ?? request.headers.get('x-real-ip');
  if (ip) return ip;
  return 'unknown';
}

/** Skip rate limiting when not behind a proxy (local, a11y, dev). */
function isBehindProxy(request: NextRequest): boolean {
  return (
    request.headers.has('x-forwarded-for') || request.headers.has('x-real-ip')
  );
}

export function rateLimit(request: NextRequest): RateLimitResult {
  if (!isBehindProxy(request)) {
    return { success: true, remaining: MAX_REQUESTS_PER_WINDOW };
  }
  const key = getClientKey(request);
  const now = Date.now();

  let entry = store.get(key);
  if (!entry || now - entry.windowStart >= WINDOW_MS) {
    entry = { count: 0, windowStart: now };
    store.set(key, entry);
  }

  entry.count += 1;

  if (entry.count > MAX_REQUESTS_PER_WINDOW) {
    const retryAfter = Math.ceil((entry.windowStart + WINDOW_MS - now) / 1000);
    return {
      success: false,
      remaining: 0,
      retryAfter: Math.max(1, retryAfter),
    };
  }

  return {
    success: true,
    remaining: Math.max(0, MAX_REQUESTS_PER_WINDOW - entry.count),
  };
}

/**
 * Rate limiting middleware stub.
 * Enterprise placeholder: wire to a store (e.g. in-memory, Redis) and apply limits per IP/path.
 *
 * Usage: call from Next.js middleware or API route handler; when implemented,
 * return 429 when limit exceeded and set Retry-After header.
 */

import type { NextRequest } from 'next/server';

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  retryAfter?: number;
}

/**
 * Stub: no rate limiting applied. Replace with actual limiter (e.g. sliding window per IP).
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- stub signature kept for API compatibility
export function rateLimit(_request: NextRequest): RateLimitResult {
  return { success: true, remaining: Number.POSITIVE_INFINITY };
}

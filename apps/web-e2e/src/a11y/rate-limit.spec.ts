import { test } from '@playwright/test';

const rateLimitEnabled =
  process.env['RATE_LIMIT_MODE'] !== 'off' &&
  process.env['RATE_LIMIT_MODE'] !== '';

/**
 * Verifies rate limiter behavior when limiter is enabled (not RATE_LIMIT_MODE=off).
 * With RATE_LIMIT_MODE=proxy or always, after exceeding the limit asserts 429,
 * Retry-After header, and accessible HTML shell (lang, title, main).
 * Skipped in CI where RATE_LIMIT_MODE=off for deterministic runs; 429 shell is still implemented and testable locally.
 */
test.skip(!rateLimitEnabled, 'Rate limiter disabled (RATE_LIMIT_MODE=off)');
test('rate limiter returns 429 with accessible shell when limit exceeded', async ({
  request,
  baseURL,
}) => {
  test.setTimeout(30000);
  const url = baseURL
    ? new URL('/en/', baseURL).toString()
    : 'http://127.0.0.1:4300/en/';
  // TEST-NET (RFC 5737): middleware uses low limit for this IP so we can assert 429 without 120 requests
  const headers = { 'x-forwarded-for': '192.0.2.1' };

  // Exhaust the limit (e.g. RATE_LIMIT_MAX_PER_WINDOW=2). Third request must return 429.
  await request.get(url, { headers });
  await request.get(url, { headers });
  const res = await request.get(url, { headers });

  test.expect(res.status()).toBe(429);
  test.expect(res.headers()['retry-after']).toBeDefined();

  const body = await res.text();
  test.expect(body).toContain('<!DOCTYPE html>');
  test.expect(body).toContain('lang="en"');
  test.expect(body).toContain('<title>Too Many Requests</title>');
  test.expect(body).toMatch(/<main[^>]*role="main"/);
  test.expect(body).toContain('Too Many Requests');
});

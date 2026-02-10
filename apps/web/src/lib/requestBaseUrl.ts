/**
 * Base URL for canonical and metadata. Prefer build-time env so pages can be
 * cacheable (bf-cache). Fallback to request origin when needed.
 */
import { headers } from 'next/headers';

/** Build-time base URL (CI sets NEXT_PUBLIC_SITE_URL). Use for static/cacheable metadata. */
export function getMetadataBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.trim?.() || process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'https://example.invalid'
  ).replace(/\/$/, '');
}

/** Request origin (dynamic). Use only when request-derived URL is required. */
export async function getRequestBaseUrl(): Promise<string | undefined> {
  const h = await headers();
  const host = h.get('host');
  if (!host) return undefined;
  const proto = h.get('x-forwarded-proto')?.split(',')[0]?.trim() ?? 'http';
  return `${proto}://${host}`;
}

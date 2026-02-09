import createMiddleware from 'next-intl/middleware';
import { NextResponse } from 'next/server';
import { rateLimit } from './lib/rateLimit';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

/**
 * Headers set for every forwarded request so root layout can derive locale
 * deterministically. PATHNAME_HEADER is the single source; LOCALE_HEADER is
 * the first path segment when it is a valid locale (for root layout fallback).
 */
export const PATHNAME_HEADER = 'x-next-pathname';
export const LOCALE_HEADER = 'x-next-intl-locale';

export default function middleware(request: import('next/server').NextRequest) {
  const limit = rateLimit(request);
  if (!limit.success) {
    return new NextResponse('Too Many Requests', {
      status: 429,
      headers: {
        'Retry-After': String(limit.retryAfter ?? 60),
      },
    });
  }
  const response = intlMiddleware(request);
  if (response && !response.headers.get('location')) {
    const requestHeaders = new Headers(request.headers);
    const pathname = request.nextUrl.pathname;
    requestHeaders.set(PATHNAME_HEADER, pathname);
    const segment = pathname.replace(/^\/+/, '').split('/')[0];
    if (
      segment &&
      routing.locales.includes(segment as (typeof routing.locales)[number])
    ) {
      requestHeaders.set(LOCALE_HEADER, segment);
    }
    const nextRes = NextResponse.next({
      request: { headers: requestHeaders },
    });
    response.headers.forEach((v, k) => nextRes.headers.set(k, v));
    return nextRes;
  }
  return response;
}

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};

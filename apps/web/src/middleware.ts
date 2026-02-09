import createMiddleware from 'next-intl/middleware';
import { NextResponse } from 'next/server';
import { rateLimit } from './lib/rateLimit';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

/** Header forwarded to root layout so html lang/dir and metadata use path-derived locale. */
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
  const segment = request.nextUrl.pathname.split('/')[1];
  const hasLocale =
    segment &&
    routing.locales.includes(segment as (typeof routing.locales)[number]);
  if (response && !response.headers.get('location') && hasLocale) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set(LOCALE_HEADER, segment);
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

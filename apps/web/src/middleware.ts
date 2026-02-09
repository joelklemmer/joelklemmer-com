import createMiddleware from 'next-intl/middleware';
import { NextResponse } from 'next/server';
import { rateLimit } from './lib/rateLimit';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

/** Derive locale from path first segment for 429 body lang; fallback to default. */
function localeFromPath(pathname: string): string {
  const segment = pathname.replace(/^\/+/, '').split('/')[0];
  if (
    segment &&
    routing.locales.includes(segment as (typeof routing.locales)[number])
  ) {
    return segment;
  }
  return routing.defaultLocale ?? 'en';
}

const RTL_LOCALES = ['he', 'ar'] as const;

/** Accessible 429 body: valid HTML document with lang, dir, and title (locale from path or default). */
function rateLimitResponseBody(pathname: string): string {
  const lang = localeFromPath(pathname);
  const dir = (RTL_LOCALES as readonly string[]).includes(lang) ? 'rtl' : 'ltr';
  return `<!DOCTYPE html>
<html lang="${lang}" dir="${dir}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Too Many Requests</title>
</head>
<body>
  <main id="rate-limit-message" role="main">
    <h1>Too Many Requests</h1>
    <p>You have sent too many requests. Please wait before trying again.</p>
  </main>
</body>
</html>`;
}

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
    return new NextResponse(rateLimitResponseBody(request.nextUrl.pathname), {
      status: 429,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
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

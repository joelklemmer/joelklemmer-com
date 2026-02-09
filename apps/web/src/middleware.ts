import createMiddleware from 'next-intl/middleware';
import { NextResponse } from 'next/server';
import { rateLimit } from './lib/rateLimit';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

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
  return intlMiddleware(request);
}

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};

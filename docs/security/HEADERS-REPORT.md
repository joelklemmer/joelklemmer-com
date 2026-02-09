# HTTP security headers report

**Date:** 2026-02-08  
**Source:** `apps/web/next.config.js` → `headers()`

All responses (except where overridden by more specific rules) receive the following headers.

## Global security headers

| Header                        | Value                                          | Purpose                                                                                   |
| ----------------------------- | ---------------------------------------------- | ----------------------------------------------------------------------------------------- |
| **Strict-Transport-Security** | `max-age=31536000; includeSubDomains; preload` | HSTS (production only). Enforce HTTPS for 1 year, include subdomains, allow preload list. |
| **X-Content-Type-Options**    | `nosniff`                                      | Disable MIME sniffing.                                                                    |
| **X-Frame-Options**           | `DENY`                                         | Disallow embedding in iframes (clickjacking).                                             |
| **X-XSS-Protection**          | `1; mode=block`                                | Legacy XSS filter; enable and block on detection.                                         |
| **Referrer-Policy**           | `strict-origin-when-cross-origin`              | Limit referrer to origin for cross-origin; full URL for same-origin HTTPS→HTTP.           |
| **Permissions-Policy**        | (restrictive)                                  | Disable accelerometer, camera, microphone, geolocation, etc.                              |
| **Content-Security-Policy**   | (see below)                                    | Restrict script, style, connect, frame, object sources.                                   |

## Content-Security-Policy (CSP)

- `default-src 'self'`
- `base-uri 'self'`
- `object-src 'none'`
- `form-action 'self'`
- `frame-ancestors 'none'` (no embedding)
- `frame-src 'none'`
- `img-src 'self' data: blob: https:`
- `font-src 'self' data:`
- `style-src 'self' 'unsafe-inline'`
- `script-src 'self' 'unsafe-inline' 'unsafe-eval'`
- `connect-src 'self' https: ws: wss:`
- `upgrade-insecure-requests` (upgrade HTTP to HTTPS in supported clients)

## Cache headers (specific routes)

- `/media/:path*` — `Cache-Control: public, max-age=31536000, immutable`
- `/sitemap.xml`, `/sitemap-images` — `Cache-Control: public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400`

## Verification

After deploy, confirm headers with:

```bash
curl -sI https://www.joelklemmer.com/ | grep -iE 'x-frame|x-content-type|strict-transport|content-security|referrer|x-xss'
```

Or use browser DevTools → Network → select a document request → Headers.

# Security hardening summary

**Date:** 2026-02-08  
**Objective:** Enterprise web security posture for JoelKlemmer.com.

---

## 1) HTTP security headers

**Implemented in:** `apps/web/next.config.js`

| Header                     | Value / behavior                                                                                                                                                             |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **CSP**                    | Strict: `default-src 'self'`, `object-src 'none'`, `frame-ancestors 'none'`, `frame-src 'none'`, `upgrade-insecure-requests`, plus script/style/img/connect/font directives. |
| **HSTS**                   | `max-age=31536000; includeSubDomains; preload` (production only).                                                                                                            |
| **X-Frame-Options**        | `DENY`.                                                                                                                                                                      |
| **X-XSS-Protection**       | `1; mode=block`.                                                                                                                                                             |
| **Referrer-Policy**        | `strict-origin-when-cross-origin`.                                                                                                                                           |
| **X-Content-Type-Options** | `nosniff`.                                                                                                                                                                   |
| **Permissions-Policy**     | Restrictive (camera, mic, geolocation, etc. disabled).                                                                                                                       |

**Headers report:** `docs/security/HEADERS-REPORT.md`

---

## 2) Cookie audit

**Audit doc:** `docs/security/COOKIE-AUDIT.md`

- **Finding:** No server-set cookies in codebase. Only reads (`evaluator_mode` for context).
- **Policy:** Any new cookie must use `secure`, `sameSite` (`lax`/`strict`), and `httpOnly` when not needed by script.
- **Reference:** `apps/web/src/lib/secureCookieOptions.ts` — `SECURE_HTTPONLY_COOKIE_OPTIONS`, `SECURE_COOKIE_OPTIONS`.

---

## 3) Dependency vulnerability scan

- **CI:** `.github/workflows/ci.yml` — step "Dependency audit (fail on critical only)" runs `pnpm audit --audit-level=critical`.
- **Verify:** `apps/web` verify target runs `pnpm audit --audit-level=critical` before validators.

**Audit output:** Run locally: `pnpm audit` (full) or `pnpm audit --audit-level=critical` (CI gate). In CI, see the "Dependency audit" step log.

---

## 4) Rate limiting middleware stub

- **Stub:** `apps/web/src/lib/rateLimit.ts` — `rateLimit(request)` returns `{ success: true, remaining: Infinity }`; replace with real store (e.g. Redis) and limits.
- **Wired:** `apps/web/src/middleware.ts` calls `rateLimit(request)`; when `success === false` returns `429 Too Many Requests` with `Retry-After` header. Stub always returns success; replace stub implementation to enforce limits.

---

## 5) Security.txt validation

- **File:** `apps/web/public/.well-known/security.txt` — Contact, Expires, Preferred-Languages, Canonical (RFC 9116).
- **Validator:** `tools/validate-security-txt.ts` — checks Contact and Expires present, Expires future.
- **Target:** `nx run web:security-validate` (included in verify and CI "Validators" step).

---

## Files modified / added

| Path                                          | Change                                                                            |
| --------------------------------------------- | --------------------------------------------------------------------------------- |
| `apps/web/next.config.js`                     | Stricter CSP, X-XSS-Protection, object-src, frame-src, upgrade-insecure-requests. |
| `apps/web/src/middleware.ts`                  | Call `rateLimit(request)`; return 429 + Retry-After when `!limit.success`.        |
| `apps/web/src/lib/rateLimit.ts`               | **New** — rate limit stub.                                                        |
| `apps/web/src/lib/secureCookieOptions.ts`     | **New** — secure cookie options for future use.                                   |
| `apps/web/public/.well-known/security.txt`    | **New** — security.txt.                                                           |
| `tools/validate-security-txt.ts`              | **New** — security.txt validator.                                                 |
| `apps/web/project.json`                       | `security-validate` target; verify commands: audit + security-validate.           |
| `.github/workflows/ci.yml`                    | Dependency audit step; security-validate in validators.                           |
| `docs/security/COOKIE-AUDIT.md`               | **New** — cookie audit.                                                           |
| `docs/security/HEADERS-REPORT.md`             | **New** — headers report.                                                         |
| `docs/security/SECURITY-HARDENING-SUMMARY.md` | **New** — this file.                                                              |

---

## Proof checklist

- **Headers report:** `docs/security/HEADERS-REPORT.md` (and/or `curl -sI <origin>/` after deploy).
- **Audit output:** `pnpm audit` locally; CI job "Dependency audit (fail on critical only)" and "Validators" (includes security-validate).
- **Files modified:** Listed above.
- **CI green:** Verify pipeline includes audit + security-validate. Any existing failures (e.g. missing `@/lib/telemetry`, telemetry exports) are unrelated to this hardening and must be fixed separately.

# Cookie security audit

**Date:** 2026-02-08  
**Scope:** All server- and client-set cookies; cookie read sites.

## Summary

- **Server-set cookies:** None. No `cookies().set()` or `Set-Cookie` response headers in the codebase.
- **Cookie reads:** `evaluator_mode` is read only (server: `next/headers` `cookies()`; client: `document.cookie`). Used for experience intelligence context; not used for auth or sensitive data.
- **Policy:** Any future cookie MUST use secure, sameSite, and httpOnly (when the cookie must not be readable by script).

## Required attributes (when adding cookies)

| Attribute    | Requirement                                                                   |
| ------------ | ----------------------------------------------------------------------------- |
| **secure**   | Always `true` in production (HTTPS only).                                     |
| **sameSite** | `lax` or `strict`; use `strict` for auth/session cookies.                     |
| **httpOnly** | `true` for session/auth or any cookie that must not be exposed to JavaScript. |

## Audit locations

- `apps/web/src/app/[locale]/layout.tsx` – reads `cookies()` for evaluator mode.
- `apps/web/src/app/[locale]/brief/actions.ts` – reads `cookies()` for evaluator mode.
- `libs/screens/src/lib/BriefScreen.tsx` – reads `cookies()` for evaluator mode.
- `libs/screens/src/lib/CaseStudiesScreen.tsx` – reads `cookies()` for evaluator mode.
- `libs/evaluator-mode` – parses `evaluator_mode` from cookie string / `document.cookie` (read-only).

## Implementation reference

Use `@joelklemmer/web/secureCookieOptions` (or the shared constants in `apps/web/src/lib/secureCookieOptions.ts`) when setting cookies so all new cookies meet the policy above.

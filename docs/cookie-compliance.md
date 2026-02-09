# Cookie and privacy controls

This document describes the cookie consent and privacy controls implementation. It is defensible under EU/UK consent rules and uses strict opt-in globally.

## Overview

- **Consent state:** Versioned, stored only after user action (no preference cookie before choice).
- **Gating:** Non-essential scripts (analytics, functional, marketing) do not load until consent is given.
- **UI:** Cookie preferences modal (header trigger) and `/cookies` policy page; both localized (en/uk/es/he, RTL for he).

## Implementation

### Library: `libs/compliance`

- **ConsentState** – Versioned state (analytics, functional, marketing, choiceMade).
- **ConsentStore** – Cookie read/write; `getConsentFromCookie()` for server, `readConsentFromDocument()` / `writeConsentToDocument()` for client. Cookie set only after user action.
- **Policy adapter** – `canLoadAnalytics`, `canLoadFunctional`, `canLoadMarketing`; default strict opt-in.
- **ScriptLoader** – Renders children only when consent for the given category is granted.
- **ConsentProvider** – React context; provides consent state and update/accept/reject/withdraw.
- **CookiePreferencesModal** – Accessible dialog (role="dialog", aria-modal, aria-labelledby); toggles and actions.
- **CookiePreferencesTrigger** – Button in header to open the modal.

### Pages and routes

- **`/cookies`** – Cookie policy page (localized), content from `content/institutional/cookies.mdx`. Footer link "Cookies" and sitemap entry.

### Integration

- **Layout** – `ConsentProvider(initialConsentState)` wraps shell; `TelemetryProvider(initialConsent)` receives analytics consent from cookie; `SyncConsentToTelemetry` keeps telemetry in sync with consent.
- **Telemetry** – Route view and other events are sent only when `canLoadAnalytics(consentState)` is true.

### Tracker manifest and validation

- **`docs/cookie-tracker-manifest.json`** – Lists categories and blocked patterns; `policyUrlPath`: `/cookies`.
- **`tools/scan-trackers.ts`** – Scans app/libs for known tracker patterns (informational).
- **`tools/validate-cookie-compliance.ts`** – Fails if: cookies page missing, manifest `policyUrlPath` ≠ `/cookies`, CookiePreferencesModal missing a11y (role="dialog", aria-modal, aria-labelledby), or any file containing blocked patterns without consent gating (ScriptLoader/useConsent/canLoadAnalytics).

### Verify and CI

- **`nx run web:cookie-compliance-validate`** – In verify chain (after security-validate) and in CI verify-fast job.

## E2E (Playwright)

- **`apps/web-e2e/src/compliance/cookie-consent.spec.ts`** – No third-party analytics scripts before consent; preferences button keyboard accessible; modal open/tab/Escape; save persists cookie; withdraw clears cookie; RTL (he) preferences modal no horizontal overflow; cookies page exists.

## Runtime proof (consent gating)

1. Open site in a clean profile (no consent cookie). Confirm no analytics script URLs in DevTools Network (e.g. no google-analytics, googletagmanager).
2. Click "Cookie preferences" → "Accept all" → Reload. Confirm `consent` cookie is present and telemetry (if any) can fire.
3. Open preferences → "Withdraw consent". Reload. Confirm consent cookie is gone and analytics scripts still not loaded.

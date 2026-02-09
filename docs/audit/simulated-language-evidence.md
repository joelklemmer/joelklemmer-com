# Simulated Language and Inert Wiring — Evidence

**Method:** codebase grep for mock, stub, placeholder, TODO, FIXME, simulated; runtime inspection via docs and code.

## 1. Stub / placeholder in request path (authority-critical)

### P0: Rate limiting (middleware)

- **File:** `apps/web/src/lib/rateLimit.ts`
- **Evidence (excerpt):**
  - Line 2: `* Rate limiting middleware stub.`
  - Line 3: `* Enterprise placeholder: wire to a store (e.g. in-memory, Redis) and apply limits per IP/path.`
  - Line 18–21: `/** Stub: no rate limiting applied. */` … `return { success: true, remaining: Number.POSITIVE_INFINITY };`
- **Wiring:** `apps/web/src/middleware.ts` imports `rateLimit`, calls it; returns 429 when `!limit.success`. Stub always returns success → 429 never returned.
- **Reference:** `docs/security/SECURITY-HARDENING-SUMMARY.md` documents this as stub and that middleware calls it.
- **Verdict:** **Stub in authority-critical subsystem (security/middleware).** Escalate P0.

## 2. Telemetry backend (inert send)

- **File:** `libs/authority-telemetry/src/lib/provider.ts`
- **Evidence:** `noOpProvider` — `track(_event)` is no-op; "events are dropped."
- **Wiring:** Layout uses `TelemetryProvider` from authority-telemetry; default backend is no-op. Events (e.g. case_study_engagement) are invoked but not sent anywhere.
- **Verdict:** **PARTIAL** — API and event flow REAL; backend INERT (no-op). Not a mock/stub of a third-party; designed pluggable backend.

## 3. Placeholder in copy / UX (non-inert)

- **Files:**
  - `libs/sections/src/lib/AECBriefingPanel.client.tsx` — `placeholder` prop / i18n key (brief.aec.placeholder) for select UX.
  - `libs/screens/src/lib/BriefScreen.tsx` — `placeholder={t('aec.placeholder')}`.
  - `libs/content/src/lib/artifacts.ts` — comment "Executive Brief PDF … null if not present (e.g. dev placeholder)."
  - `libs/screens/src/lib/MediaLibraryClient.tsx` — className `media-thumb-placeholder` (UI placeholder for thumb).
- **Verdict:** Real UX/display placeholders; not simulated language. Validators (e.g. validate-home.ts, validate-content-os.ts) explicitly **check for** blocklisted placeholder text (lorem, "placeholder", etc.) in copy.

## 4. Validators using “placeholder” for env or checks

- **tools/run-a11y.ts:** "Injects safe placeholder env vars only when missing" — deterministic gate.
- **tools/validate-seo.ts:** "Set placeholder env vars if missing" — same idea.
- **tools/validate-token-drift.ts:** regex includes Tailwind class `placeholder-*` (design token), not copy.
- **tools/validate-home.ts:** blocklist includes `'placeholder'` to detect placeholder copy in home.json.
- **tools/validate-i18n.ts:** schema key `placeholder` (form placeholder string).
- **tools/validate-content-os.ts:** "no placeholder language in default-locale copy" — check for placeholder text.
- **Verdict:** No simulated language; validators enforce absence of placeholder copy or use placeholder env for CI.

## 5. Lighthouse budget

- **File:** `tools/lighthouse-budget-stub.ts` — name contains "stub" but implementation runs real `lhci autorun` (lighthouserc.cjs). No stub behavior.
- **Verdict:** Naming only; runtime REAL.

## 6. Grep summary (evidence)

- **mock:** No matches in libs/apps/tools (authority paths).
- **stub:** `apps/web/src/lib/rateLimit.ts` (middleware path); `tools/lighthouse-budget-stub.ts` (filename only).
- **placeholder:** Multiple; only rateLimit is "Enterprise placeholder" in security path. Rest are UX, token names, or validator logic.
- **simulated:** No matches.

## Conclusion

- **P0:** Rate limiting in middleware is a stub in an authority-critical subsystem; must be escalated.
- **Inert but by design:** Telemetry default backend is no-op; not a hidden mock.
- **No evidence of simulated language** in user-facing copy beyond validators that reject it.

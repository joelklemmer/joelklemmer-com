# Authority Telemetry — Subsystem Doctrine

**Authority:** Privacy-first analytics scaffolding with pluggable providers and consent. No vendor lock-in. Event hooks for route views, brief opens, and case study engagement.

**Scope:** `@joelklemmer/authority-telemetry` library; layout and page integration (RouteViewTracker, BriefOpenTracker, CaseStudyEngagementTracker); debug dashboard hooks; provider interface.

---

## 1. Engineering goals

- **Privacy-first:** Events are sent to a provider only when consent is granted. Default `initialConsent` is false; set via `setConsent(true)` when user accepts (e.g. cookie banner).
- **Pluggable provider:** Backend is an implementation of `TelemetryProviderBackend`; app uses `noOpProvider` by default. No hard dependency on GA, Plausible, or any vendor.
- **Stable event surface:** Named events (route_view, brief_open, case_study_engagement) with defined payloads. New events require doctrine and doc update.
- **Debug visibility:** In-memory event log available via `useTelemetryDebugLog()` for debug UIs; events appended on every `track()` regardless of consent so dev/debug can inspect without sending to provider.
- **No side effects on UX:** Trackers render null; no visible UI from telemetry. Consent state does not change rendering.

---

## 2. Observable runtime behaviors

- **Provider:** `TelemetryProvider` wraps app (e.g. in locale layout). Accepts optional `provider` and `initialConsent`. When consent is false, `track()` appends to debug buffer only and does not call the provider.
- **Route view:** On pathname change (client-side nav), `route_view` fires with `{ pathname, locale? }`. Emitted by `RouteViewTracker` in layout.
- **Brief open:** On Brief page mount, `brief_open` fires once with `{ locale? }`. Emitted by `BriefOpenTracker`.
- **Case study engagement:** On case study entry page mount, `case_study_engagement` fires once with `{ slug, locale? }`. Emitted by `CaseStudyEngagementTracker`.
- **Debug log:** Any client component can call `useTelemetryDebugLog()` to get `{ events, clear }`. Events array reflects all `track()` calls in session; clearing does not affect provider.
- **Integration points:** Layout (RouteViewTracker); Brief page (BriefOpenTracker); Case study entry page (CaseStudyEngagementTracker). All under `apps/web/src/lib/telemetry/`.

---

## 3. Metrics of success

| Metric                | Target                                                       | How measured                                         |
| --------------------- | ------------------------------------------------------------ | ---------------------------------------------------- |
| Consent gate          | No provider call when consent false                          | Unit/integration: track() with consent false         |
| Event payloads        | route_view, brief_open, case_study_engagement match doc      | Types + integration tests                            |
| Debug log             | Events and clear available; events include all track() calls | useTelemetryDebugLog() behavior                      |
| No UI impact          | No visible elements from trackers                            | Trackers render null; no layout shift                |
| Provider pluggability | Custom backend can be passed to TelemetryProvider            | Implement TelemetryProviderBackend; setConsent(true) |

---

## 4. Extension rules

- **Add event type:** Define constant in `TELEMETRY_EVENTS`; document payload shape in authority-telemetry.md and in types. Add tracker component if page-scoped; ensure single responsibility (e.g. one event per tracker type). Do not add PII or high-granularity identifiers without privacy review.
- **Add provider:** Implement `TelemetryProviderBackend` (track(event)); pass instance to `TelemetryProvider`; ensure consent is set via cookie banner or equivalent before sending.
- **Debug dashboard:** Use `useTelemetryDebugLog()` only; do not send debug log to any backend. Optional: clear on session end or explicit user action.

---

## 5. Anti-degradation constraints

- **Do not** send events to any provider when consent is false; debug buffer is acceptable, external transmission is not.
- **Do not** block or delay render on telemetry; track() must be fire-and-forget from the component’s perspective.
- **Do not** add visible UI (banners, badges, or layout) from telemetry components; trackers must render null.
- **Do not** hardcode or bundle a specific analytics vendor; keep provider pluggable and default no-op.
- **Do not** change existing event payloads in a breaking way without updating types, docs, and any consumers (including debug tooling).
- **Do not** log PII or session identifiers in event payloads without explicit privacy-approved design.

---

## 6. References

- [Authority telemetry](../authority-telemetry.md)
- Library: `libs/authority-telemetry` (or `@joelklemmer/authority-telemetry`)
- Types: `TelemetryProviderBackend`, `TelemetryEventRecord`
- App trackers: `apps/web/src/lib/telemetry/`

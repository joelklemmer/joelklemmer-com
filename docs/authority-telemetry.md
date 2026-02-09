# Authority telemetry instrumentation

Privacy-first analytics scaffolding with pluggable providers and consent. No vendor lock-in.

## Architecture

- **Event hooks**: route views, brief opens, case study engagement.
- **Privacy-first**: pluggable provider; events are only sent when consent is granted.
- **Logging abstraction**: `track(name, payload)` via `useTelemetry()` or context.
- **Debug dashboard hooks**: `useTelemetryDebugLog()` exposes in-memory event log for debug UIs.

## Library: `@joelklemmer/authority-telemetry`

### Exports

| Export                               | Purpose                                                                   |
| ------------------------------------ | ------------------------------------------------------------------------- |
| `TelemetryProvider`                  | React context provider; accepts optional `provider` and `initialConsent`. |
| `useTelemetry()`                     | Returns `{ track, consent, setConsent }`.                                 |
| `useTelemetryDebugLog()`             | Returns `{ events, clear }` for debug dashboard.                          |
| `TELEMETRY_EVENTS`                   | Constants: `route_view`, `brief_open`, `case_study_engagement`.           |
| `noOpProvider`                       | Default provider (drops events).                                          |
| `TelemetryProviderBackend` interface | Implement to plug in GA, Plausible, or custom backend.                    |

### Event payloads

- **route_view**: `{ pathname, locale? }`
- **brief_open**: `{ locale? }`
- **case_study_engagement**: `{ slug, locale? }`

### Consent

- Default `initialConsent` is `false`. Set via `setConsent(true)` when user accepts (e.g. cookie banner).
- When consent is false, `track()` still appends to the debug buffer but does not call the provider.

## Integration points

### 1. Layout (route views)

**File**: `apps/web/src/app/[locale]/layout.tsx`

- Wrap children with `TelemetryProvider` (no-op provider by default).
- Render `RouteViewTracker` inside the provider. It uses `usePathname()` and fires `route_view` on change.
- No visual UI; tracker renders `null`.

### 2. Brief page (brief open)

**File**: `apps/web/src/app/[locale]/brief/page.tsx`

- Render `BriefOpenTracker` alongside `BriefScreen`.
- Fires `brief_open` once on mount with current locale.

### 3. Case study entry page (case study engagement)

**File**: `apps/web/src/app/[locale]/casestudies/[slug]/page.tsx`

- Render `CaseStudyEngagementTracker slug={slug}` alongside `CaseStudyEntryScreen`.
- Fires `case_study_engagement` once on mount with slug and locale.

### 4. App telemetry components

**Directory**: `apps/web/src/lib/telemetry/`

- `RouteViewTracker.tsx` – client component; pathname-driven `route_view`.
- `BriefOpenTracker.tsx` – client component; one-shot `brief_open`.
- `CaseStudyEngagementTracker.tsx` – client component; one-shot `case_study_engagement` with `slug` prop.
- `index.ts` – re-exports.

### 5. Debug dashboard (future)

- Any client component can call `useTelemetryDebugLog()` from `@joelklemmer/authority-telemetry` to read `events` and `clear()`.
- Events are appended on every `track()` call regardless of consent.
- No visual UI is added by this implementation; the hook only exposes data for a future debug panel.

## Pluggable provider

To send events to a vendor or custom backend:

1. Implement `TelemetryProviderBackend` (interface in `libs/authority-telemetry/src/lib/types.ts`):
   - `track(event: TelemetryEventRecord): void | Promise<void>`
2. Pass the instance to `TelemetryProvider` in the layout:  
   `<TelemetryProvider provider={myProvider}>`
3. Ensure consent is set (e.g. from cookie banner) before calling `setConsent(true)`.

## Events logged

| Event                   | When                              | Payload               |
| ----------------------- | --------------------------------- | --------------------- |
| `route_view`            | Pathname change (client-side nav) | `pathname`, `locale?` |
| `brief_open`            | Brief page mount                  | `locale?`             |
| `case_study_engagement` | Case study entry page mount       | `slug`, `locale?`     |

All events are pushed to the in-memory debug buffer and (when consent is true) to the configured provider.

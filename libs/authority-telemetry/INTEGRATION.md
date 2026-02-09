# Authority telemetry – integration points

Proof: events logged and where they are wired. No visual UI changes.

## Events logged

| Event                   | When                              | Payload               |
| ----------------------- | --------------------------------- | --------------------- |
| `route_view`            | Pathname change (client-side nav) | `pathname`, `locale?` |
| `brief_open`            | Brief page mount                  | `locale?`             |
| `case_study_engagement` | Case study entry page mount       | `slug`, `locale?`     |

All events are pushed to the in-memory debug buffer and (when consent is true) to the configured provider.

## Integration points (files)

| Location                                                    | Purpose                                                                                                                  |
| ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `apps/web/src/app/[locale]/layout.tsx`                      | `TelemetryProvider` wraps shell children; `RouteViewTracker` renders inside (fires `route_view` on pathname change).     |
| `apps/web/src/app/[locale]/brief/page.tsx`                  | `BriefOpenTracker` rendered alongside `BriefScreen` (fires `brief_open` once on mount).                                  |
| `apps/web/src/app/[locale]/casestudies/[slug]/page.tsx`     | `CaseStudyEngagementTracker slug={slug}` alongside `CaseStudyEntryScreen` (fires `case_study_engagement` once on mount). |
| `apps/web/src/lib/telemetry/RouteViewTracker.tsx`           | Client component; pathname-driven `route_view`.                                                                          |
| `apps/web/src/lib/telemetry/BriefOpenTracker.tsx`           | Client component; one-shot `brief_open`.                                                                                 |
| `apps/web/src/lib/telemetry/CaseStudyEngagementTracker.tsx` | Client component; one-shot `case_study_engagement` with `slug` prop.                                                     |
| `apps/web/src/lib/telemetry/index.ts`                       | Re-exports trackers.                                                                                                     |

## Debug dashboard hooks

- Any client component can call `useTelemetryDebugLog()` from `@joelklemmer/authority-telemetry` to read `events` and `clear()`.
- Events are appended on every `track()` call regardless of consent.
- No visual UI is added by this implementation; the hook only exposes data for a future debug panel.

## Pluggable provider

See `docs/authority-telemetry.md` for implementing `TelemetryProviderBackend` and passing a provider to `TelemetryProvider`.

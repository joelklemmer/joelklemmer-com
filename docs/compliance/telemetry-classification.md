# Telemetry classification (event and field governance)

All telemetry events and their fields are governed by the telemetry registry. Emission is blocked unless consent and purpose allow.

## Registry

- **Location:** `apps/web/public/compliance/telemetry.registry.json`
- **Schema:** Event entries with `eventName`, `category`, `purposeScopes`, `sensitivity`, `fieldClassifications`, `piiRisk`, `allowedContexts`.

## Rules

1. **Every emitted event** must have an entry in the registry with classification metadata.
2. **High-risk fields** (identityLinked, crossContext, or high piiRisk) may only be emitted when the event's `allowedContexts` include the current context and consent permits.
3. **Emission guard:** `shouldEmitEvent(registry, eventName, payload, consentState)` returns false unless consent matches the event's category and purposes.
4. **New events:** Add a registry entry before emitting. CI validator `validate-telemetry-governance.ts` fails if events are emitted without a registry entry or if high-risk fields are used without allowed context.

## Mapping internal telemetry to registry

- **authority-telemetry** events (route_view, brief_open, case_study_engagement) are registered in telemetry.registry.json with category `analytics`, purposeScopes `["measurement"]`, and field classifications.
- When adding a new event in code, add a corresponding entry to the registry and ensure the telemetry provider checks consent via the emission guard or via SyncConsentToTelemetry (analytics category).

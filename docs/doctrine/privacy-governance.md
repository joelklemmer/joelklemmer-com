# Privacy and data governance doctrine

This document describes the engineering controls and governance for consent and data on the JoelKlemmer.com platform. It does not provide legal guarantees.

## Scope

- **Consent engine:** Versioned consent state, receipt, and history; strict opt-in by default.
- **Categories:** essential, functional, analytics, experience, marketing.
- **Purposes:** measurement, experimentation, personalization, security, fraud, recommendation, profiling.
- **Registry:** Single source of truth for vendors and telemetry events; policy surfaces generated from it.
- **Runtime gating:** Non-essential scripts, iframes, and embeds do not execute until consent permits.
- **Telemetry:** Event and field-level classification; emission guarded by consent and purpose.

## Principles

1. **Strict opt-in:** If region or consent is uncertain, non-essential processing is not enabled.
2. **No placeholders:** Runtime gates are real; no cosmetic compliance.
3. **Registry-driven:** Policy pages (cookies, subprocessors, retention) derive from the compliance registry.
4. **Withdrawal as easy as grant:** One action to withdraw; revocation hooks and audit log.

## Implementation

- **libs/compliance:** Consent state v2, receipt hashing, region resolver, GPC/DNT, dependency graph, revocation hooks, consent store, policy adapter, ConsentProviderV2, ConsentSurfaceV2, EmbedGate, ScriptLoaderV2.
- **libs/telemetry-governance:** Event registry types, emission guard (shouldEmitEvent), field classification.
- **Registry:** `apps/web/public/compliance/vendors.registry.json`, `telemetry.registry.json`, `compliance.schema.json`.
- **Routes:** `/cookies`, `/preferences`, `/subprocessors`, `/retention`, `/privacy-requests`.

## Verification

- `validate-compliance-registry.ts`: Schema, required fields, dependency graph, planned vendors inactive.
- `validate-tracker-usage.ts`: Analytics/pixels/embeds only via gate utilities.
- `validate-telemetry-governance.ts`: Events in registry; high-risk fields only in allowed context.
- Playwright e2e: pre-consent blocking, post-consent allowance, withdrawal and audit.

## References

- [VERIFY.md](../../VERIFY.md) — verify chain order.
- [docs/compliance/ropa.md](../compliance/ropa.md) — RoPA generation.
- [docs/compliance/telemetry-classification.md](../compliance/telemetry-classification.md) — event and field governance.

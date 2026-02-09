# Intelligence Layer — Extension Points

## Overview

Extension points allow a future intelligence provider (e.g. LLM-backed briefing) to plug in without changing the surface contract. The app **must** remain useful when no provider is present.

## IntelligenceProvider interface

Defined in `libs/content/src/lib/briefing-contracts.ts`:

```ts
export interface IntelligenceProvider {
  readonly id: string;
  isAvailable(): boolean | Promise<boolean>;
  getWhatMattersSummary?(context: { locale: string; claimProofMap: ClaimProofMap }): Promise<WhatMattersSummary | null>;
  getPanelContext?(context: { locale: string }): Promise<BriefingPanelContext | null>;
}
```

- **id** — Provider identifier (e.g. `'deterministic'` for fallback; future: `'llm-briefing'`).
- **isAvailable()** — Whether the provider can run in the current environment (e.g. API key present, feature flag).
- **getWhatMattersSummary** — Optional. If implemented and returns non-null, consumer may use it instead of `buildWhatMattersSummary()`. Otherwise use deterministic fallback.
- **getPanelContext** — Optional. If implemented and returns non-null, consumer may use it for panel copy/links. Otherwise use deterministic fallback.

## Consumer rules

1. **Never require a provider.** Screens build `BriefingContext` from deterministic builders only. No `IntelligenceProvider` is passed or invoked in the current implementation.
2. **Future integration pattern:** When a provider is added, the brief page (or a dedicated service) may:
   - Resolve a provider (e.g. from config or feature flag).
   - If `provider.isAvailable()` then optionally call `getWhatMattersSummary` / `getPanelContext`.
   - On `null` or error, use `buildWhatMattersSummary()` and `buildBriefingPanelContext()`.
3. **Non-degradation:** UI must not assume provider output is present. Always have deterministic data to render.

## Deterministic provider id

`DETERMINISTIC_BRIEFING_PROVIDER_ID = 'deterministic'` — Used to identify the built-in fallback in logs or telemetry. No type implements `IntelligenceProvider` in the codebase today; this is for future use.

## Where not to extend

- **No placeholder “AI” responses.** Do not add fake summaries or mock LLM output.
- **No provider in screens.** `BriefScreen` does not accept or call an `IntelligenceProvider`; it only uses content and deterministic builders.

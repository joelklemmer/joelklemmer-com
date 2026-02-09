# Intelligence Layer — Readiness Doctrine

## Purpose

The Intelligence Layer Surface provides **readiness architecture** for a context-aware briefing mode. It is **not** an AI demo: no LLM calls, no mock AI, no placeholders. All behavior is deterministic and useful today.

## Principles

1. **No fake AI.** Surfaces and contracts must be useful without any intelligence provider. Deterministic fallbacks (claim→proof map, “what matters” compression, contextual panel) are first-class.
2. **Extension points only.** Types and interfaces define contracts for future intelligence providers; the app does not implement or call them until a real provider exists.
3. **Non-degradation.** Adding or removing a future provider must not degrade the experience when the provider is unavailable. Fallbacks are always sufficient.

## Contracts (libs/content)

- **`BriefingContext`** — Full context: panel (scope + read path), claim/proof map, what-matters summary. Built from content only.
- **`ClaimProofMap`** — Structured claim→proof map. Built via `buildClaimProofMap()` from precomputed claim cards.
- **`WhatMattersSummary`** — Deterministic compression (e.g. top N claims by verification strength). Built via `buildWhatMattersSummary()`.
- **`IntelligenceProvider`** — Optional future contract: `id`, `isAvailable()`, optional `getWhatMattersSummary()`, `getPanelContext()`. Not implemented or called by the app.

## Deterministic fallbacks

- **Panel context:** `buildBriefingPanelContext(scopeSummary, readPathLinks)` — pure shape; caller supplies copy and links.
- **Claim/proof map:** `buildClaimProofMap(items)` — from `ClaimProofMapInputItem[]` (claim id, label, summary, category, proof links, case study count, last verified).
- **What matters:** `buildWhatMattersSummary(claimProofMap.entries, { maxItems })` — sorts by verification strength, returns top N. Source is always `'deterministic'`.

## Runtime behavior (briefing mode)

On the Executive Brief page (`/brief`):

1. **Contextual panel** — Collapsible “Briefing context” with scope summary and read-path links. Changes flow by surfacing context first.
2. **What matters at a glance** — Compressed list (top 6 claims by verification strength) with links to `#claim-<id>`. Enables quick scan.
3. **Claim–proof map** — Structured section listing each claim with its supporting records and case study count. Reference view after the interactive Brief Navigator.

All content is server-derived from the claims registry and public record; no client-side AI or placeholders.

## Extension points (future)

- **IntelligenceProvider** — When a real provider (e.g. LLM-backed) is added, the app can:
  - Call `provider.isAvailable()` and, if true, optionally call `getWhatMattersSummary()` / `getPanelContext()`.
  - If the provider returns `null` or throws, fall back to deterministic builders.
- **Non-degradation rule:** The UI must never depend on a provider for correctness or completeness. Deterministic data is always sufficient.

## Files and boundaries

| Area          | Location                                                              | Role                                                      |
| ------------- | --------------------------------------------------------------------- | --------------------------------------------------------- |
| Contracts     | `libs/content/src/lib/briefing-contracts.ts`                          | Types, `IntelligenceProvider`, deterministic builders     |
| UI primitives | `libs/ui`: `ContextualPanel`, `ClaimProofMapView`, `WhatMattersBlock` | Presentational; accept props only                         |
| Surface       | `libs/screens`: `BriefScreen`                                         | Builds `BriefingContext` from content, renders primitives |

## Validation

- **Contract validation:** `tools/validate-briefing-contracts.ts` (or equivalent) asserts that `buildClaimProofMap` and `buildWhatMattersSummary` produce valid shapes and that `WhatMattersSummary.source === 'deterministic'`.
- **CI:** All verify gates must remain green. No new failures from briefing surface or contracts.

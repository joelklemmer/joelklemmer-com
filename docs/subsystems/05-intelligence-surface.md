# Intelligence Surface — Subsystem Doctrine

**Authority:** Readiness architecture for context-aware briefing mode. Deterministic, useful today. No fake AI, no LLM calls, no placeholders. Extension points for future intelligence providers without degrading the experience when unavailable.

**Scope:** Entity graph and semantic index (`libs/intelligence`); briefing contracts and deterministic builders (`libs/content`); UI primitives (ContextualPanel, ClaimProofMapView, WhatMattersBlock); BriefScreen composition. Validation: intelligence-validate, briefing-contracts validation.

---

## 1. Engineering goals

- **Single source of truth for relationships:** Entity graph (claims, records, case studies, books) and semantic index (id, type, text, url) power evaluator-facing capabilities. Future features (intelligent nav, claim discovery, evidence aggregation, graph viz, AI context) build on this without structural overhaul.
- **No fake AI:** Surfaces and contracts must be useful without any intelligence provider. Deterministic fallbacks (claim→proof map, “what matters” compression, contextual panel) are first-class.
- **Extension points only:** Types and interfaces (e.g. `IntelligenceProvider`) define contracts for future providers; the app does not implement or call them until a real provider exists.
- **Non-degradation:** Adding or removing a future provider must not degrade correctness or completeness. Fallbacks are always sufficient; UI must never depend on a provider for required content.

---

## 2. Observable runtime behaviors

- **Entity graph:** Built from content loaders (getAllClaims, getPublicRecordEntries, getCaseStudyEntries, getBookEntries). Nodes: claim, record, caseStudy, book. Edges: supports (claim→record), references (record→case study, claim→case study, book→record). Sorted for determinism; no global mutation; SSR/static safe.
- **Semantic index:** `{ id, type, text, url }` per entity; ready for search or embeddings. No search or LLM integrated in foundation.
- **Briefing surface on /brief:** Contextual panel (scope summary, read-path links); “What matters at a glance” (top N claims by verification strength); Claim–proof map. All built via `buildBriefingPanelContext`, `buildWhatMattersSummary`, `buildClaimProofMap` from content. Source is always `'deterministic'`.
- **Validation:** web:intelligence-validate builds graph and index; checks no orphan nodes, no missing edge endpoints; contract validation ensures builders produce valid shapes and WhatMattersSummary.source === 'deterministic'.

---

## 3. Metrics of success

| Metric                 | Target                                                                  | How measured                 |
| ---------------------- | ----------------------------------------------------------------------- | ---------------------------- |
| Graph build            | Succeeds from content loaders; sorted, deterministic                    | intelligence-validate        |
| Orphan check           | Every node in at least one edge                                         | intelligence-validate        |
| Edge validity          | Every edge endpoint is a node id                                        | intelligence-validate        |
| Semantic index         | Builds without throw                                                    | intelligence-validate        |
| Briefing UI            | Panel, what-matters, claim–proof map render from deterministic data     | BriefScreen + builders       |
| Contract shape         | buildClaimProofMap, buildWhatMattersSummary valid; source deterministic | validate-briefing-contracts  |
| No provider dependency | App works without IntelligenceProvider                                  | No provider passed or called |

---

## 4. Extension rules

- **New node or edge type:** Extend graph model in intelligence layer; update validation (orphan and edge checks). Keep dependencies only on content, i18n, seo; no screens/sections/app routes.
- **New briefing primitive:** Add UI in libs/ui; accept props only. Build data in BriefScreen (or content layer) via existing or new deterministic builders. Do not add placeholder “AI” or mock LLM output.
- **Future provider:** Implement `IntelligenceProvider` (id, isAvailable(), optional getWhatMattersSummary, getPanelContext). Call only when isAvailable(); on null or throw, use deterministic builders. Never require provider for correctness or completeness.
- **Search/embeddings:** Consume semantic index or graph via library API; do not duplicate content or break graph build.

---

## 5. Anti-degradation constraints

- **Do not** add fake AI, mock LLM, or placeholder “intelligent” responses; deterministic behavior only until a real provider exists.
- **Do not** make UI depend on IntelligenceProvider for required content; deterministic data must always be sufficient.
- **Do not** introduce global mutation or non-determinism in graph/index build; SSR and static rendering must remain safe.
- **Do not** let intelligence layer depend on screens, sections, or app routes; keep boundary (content, i18n, seo only).
- **Do not** skip intelligence-validate or briefing-contracts validation in verify pipeline; both must pass for web:verify.
- **Do not** emit or display provider-derived content without fallback to deterministic builders when provider unavailable or errors.

---

## 6. References

- [Intelligence layer](../intelligence-layer.md)
- [Readiness doctrine](../intelligence-layer/readiness-doctrine.md)
- [Extension points](../intelligence-layer/extension-points.md)
- Contracts: `libs/content/src/lib/briefing-contracts.ts`
- Graph/index: `libs/intelligence`
- UI: `libs/ui` (ContextualPanel, ClaimProofMapView, WhatMattersBlock)
- Validation: web:intelligence-validate, validate-briefing-contracts

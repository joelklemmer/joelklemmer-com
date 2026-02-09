# Interactive Intelligence Layer

## Purpose

The Intelligence Layer is the semantic relationship infrastructure that powers evaluator-facing capabilities without visible UI in the initial foundation. It provides a normalized, typed entity graph and a searchable text corpus derived from content (claims, public record, case studies, books). This layer is architectural only: no feature flags, no routing changes, no refactors to existing modules.

**Design principle:** The layer must function as the single source of truth for relationships and indexable text so that future features—intelligent navigation, claim discovery, evidence aggregation, graph visualization, AI assistant context, and executive evaluator tooling—can be built without structural overhaul.

## Architecture

- **Library:** `libs/intelligence` (scope tag: `scope:intelligence`).
- **Dependencies:** Only `@joelklemmer/content`, `@joelklemmer/i18n`, and `@joelklemmer/seo`. No dependencies on screens, sections, or app routes.
- **Outputs:** Pure data: an entity graph (nodes and edges) and a semantic index (id, type, text, url). No UI, no side effects beyond deterministic, request-scoped memoization when a cache is provided.

## Graph model

### Node types

| Kind        | Description                                                       | Source                    |
| ----------- | ----------------------------------------------------------------- | ------------------------- |
| `claim`     | Registry claim (id, labelKey, summaryKey, category, recordIds)    | Content claims registry   |
| `record`    | Public record / proof (id, title, slug, artifactType, date)       | Content public-record MDX |
| `caseStudy` | Case study (id, title, slug, summary, date, proofRefs, claimRefs) | Content case-studies MDX  |
| `book`      | Book (id, title, slug, summary, publicationDate, proofRefs)       | Content books MDX         |

### Edge relationships

| Kind          | Direction           | Meaning                                  |
| ------------- | ------------------- | ---------------------------------------- |
| `supports`    | Claim → Record      | Claim is evidenced by this record        |
| `references`  | Record → Case Study | Case study cites this record (proofRefs) |
| `references`  | Claim → Case Study  | Case study cites this claim (claimRefs)  |
| `references`  | Book → Record       | Book cites this record (proofRefs)       |
| `verifies`    | Reserved            | For future verification semantics        |
| `derivesFrom` | Reserved            | For future derivation lineage            |

The graph is built by reading content loaders: `getAllClaims`, `getPublicRecordEntries`, `getCaseStudyEntries`, `getBookEntries`. Nodes and edges are sorted for determinism. No global mutation; suitable for SSR and static rendering.

## Future expansion hooks

- **AI integration readiness:** The semantic index (claim/record/case study/book summaries and titles with URLs) is the natural input for embeddings and RAG. The graph provides context for “claims that support this record” and “case studies that reference this claim.”
- **Search readiness:** The index structure `{ id, type, text, url }` is ready for a search backend or client-side filter. No search is integrated in this foundation.
- **Visualization readiness:** `EntityGraph` (nodes + edges) can be consumed by a future graph visualization component without changing the library’s public API.
- **Streaming:** The graph cache adapter is designed so a per-request cache can be supplied by the runtime (e.g. Next.js), enabling memoized graph access per request and future server streaming without global state.

## Validation

Target `web:intelligence-validate` runs after `content-validate` and `pgf-validate` in the verify pipeline. It:

1. Builds the entity graph (fails if content loaders throw).
2. Checks for orphan nodes (every node must appear in at least one edge).
3. Checks for missing references (every edge endpoint must be a node id).
4. Builds the semantic index (fails if index generation throws).

All checks must pass for `nx run web:verify` to succeed.

## Nx and module boundaries

- The intelligence library is tagged `type:lib` and `scope:intelligence`.
- It depends only on libs with `type:lib` (content, i18n, seo). No boundary violations.
- Route files and UI continue to use only `@joelklemmer/screens` and `@joelklemmer/sections`; the intelligence layer is not yet referenced from routes or feature flags.

## Briefing-mode surface (readiness)

The **Intelligence Layer Surface** adds briefing-mode groundwork without AI:

- **Contracts** in `libs/content/src/lib/briefing-contracts.ts`: `BriefingContext`, `ClaimProofMap`, `WhatMattersSummary`, `IntelligenceProvider` (extension point). Deterministic builders: `buildClaimProofMap`, `buildWhatMattersSummary`, `buildBriefingPanelContext`.
- **UI primitives** in `libs/ui`: `ContextualPanel`, `ClaimProofMapView`, `WhatMattersBlock`. Used on the Executive Brief page for contextual panel, “what matters” compression, and claim–proof map.
- **Runtime:** Brief page builds context from content and renders the primitives; reading flow is context → what matters → claims → claim–proof map. No LLM; all behavior is deterministic.

See **docs/intelligence-layer/readiness-doctrine.md** and **docs/intelligence-layer/extension-points.md** for readiness doctrine, extension points, and non-degradation rules.

## Compliance

The layer is designed to comply with:

- Nx module boundary rules
- Presentation Governance Framework (PGF)
- WCAG 2.2 AA+ (no UI in this phase; data layer only)
- RTL compatibility (no layout; data only)
- Static rendering safety (deterministic, no global mutation)
- Build determinism (sorted nodes/edges and index)

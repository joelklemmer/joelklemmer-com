# Authority Signal Integration (UASIL)

## Purpose

The Unified Authority Signal Integration Layer (UASIL) ensures the platform simultaneously and consistently expresses five non-prioritized authority signals in a **structural** (not narrative) way:

1. **Strategic Cognition**
2. **Systems Construction**
3. **Operational Transformation**
4. **Institutional Leadership**
5. **Public-Service Statesmanship**

Signals are embedded in data and structure—binding content entities to weight vectors, driving traversal order and future ranking—without visible labels or route/slug changes. The implementation integrates with existing governance (PGF, Content OS, Intelligence Layer, Visual Authority System) and does not require architectural rework.

---

## Architectural Rationale

- **Non-narrative:** No on-page labels such as “Strategic Cognition”; signals influence order, weighting, and future UX tuning only.
- **Registry-based:** A central registry (`libs/authority-signals`) holds canonical signal ids and binding schema; a mapping layer (`libs/authority-mapping`) maps every major entity (claims, records, case studies, books, brief node) to a signal weight vector.
- **Intelligence Layer:** Graph nodes and semantic index entries carry an optional `signalVector`; when a resolver is provided at build time, the Intelligence Layer attaches vectors for search ranking, graph traversal weighting, and AI companion context.
- **Executive Brief:** The Brief Navigator receives claim cards with an optional `dominantSignalId`; cards are ordered by dominant signal so traversal reflects signal clusters. Structure is exposed via `data-dominant-signal` for future styling or analytics; no visible label is rendered.
- **Visual Authority:** Tokens expose optional hooks (`--authority-spacing-density`, `--authority-hierarchy-emphasis`, `--authority-motion-restraint`, `--authority-depth-layer`) so signals can subtly influence layout and motion in a restrained, accessibility-compliant way.

---

## Modules

| Module                                | Role                                                                                                                                                                                                                                                        |
| ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `libs/authority-signals`              | Canonical signal enum, `SignalWeightVector` and binding schema, central registry (`registerBinding`, `getSignalVector`, `getAggregateCoverage`), and helpers (`getDominantSignalId`, `toFullVector`).                                                       |
| `libs/authority-mapping`              | Entity bindings config (claim/record/caseStudy/book/briefNode → vector), `populateRegistryFromConfig`, `getStructuredMapping`, `getEntitySignalVector`, and diagnostics (coverage, imbalance, redundancy).                                                  |
| Intelligence Layer                    | Optional `signalVector` on graph nodes and semantic index entries; `buildEntityGraph(options?.getSignalVector)` and `buildSemanticIndex(locale, options?.getSignalVector)` attach vectors when a resolver is provided.                                      |
| Executive Brief                       | `BriefScreen` populates the registry, resolves vectors per claim, computes `dominantSignalId`, sorts claim cards by signal cluster, and passes `dominantSignalId` to the navigator; `BriefNavigator` sets `data-dominant-signal` on cards (structure only). |
| `libs/tokens`                         | UASIL CSS variables and `authoritySignalTokens` for spacing/hierarchy/motion/depth; no visible change by default.                                                                                                                                           |
| `tools/validate-authority-signals.ts` | Ensures every claim, record, case study, book, and brief node has a binding; runs diagnostics (gaps, starvation, overconcentration); integrated into the verify pipeline after `intelligence-validate` without reordering other stages.                     |

---

## Extension Strategy

- **New content:** When adding a claim, public record, case study, or book, add a corresponding entry to `ENTITY_BINDINGS_CONFIG` in `libs/authority-mapping/src/lib/entityBindingsConfig.ts` with a `signalVector` (e.g. balanced or with a primary signal). Re-run `nx run web:authority-signals-validate`.
- **New signals:** The five signals are fixed in this layer; changing the set would require updates to `AUTHORITY_SIGNAL_IDS`, the schema, and the registry. Not recommended without governance review.
- **Search / AI:** Consumers of the entity graph or semantic index can use `node.signalVector` / `entry.signalVector` for ranking, filtering, or context; the resolver is supplied where the graph/index is built (e.g. app or build script) by calling `populateRegistryFromConfig()` and passing `getSignalVector` from the registry.

---

## Governance Alignment

- **PGF:** No copy or tone change; no visible signal labels. Structure and data only.
- **Content OS:** Bindings are keyed by stable entity ids (claim id, record id/slug, case study slug, book slug); no content schema or route changes.
- **Intelligence Layer:** Additive only; existing graph and index behavior unchanged when no resolver is passed.
- **Visual Authority System:** New tokens are optional and restrained; motion and hierarchy remain within existing limits (duration, contrast, reduced-motion).
- **Verify pipeline:** `authority-signals-validate` runs after `intelligence-validate`; no stage reordering; all existing verify steps unchanged.

---

## Future Adaptive Capabilities

- **Search ranking:** Use `signalVector` on semantic index entries to modulate relevance by signal mix.
- **Graph traversal:** Weight edges or node importance by signal when building recommendation or “related” views.
- **AI companion:** Pass signal vectors as context so responses align with the intended authority mix.
- **Adaptive UX:** Use `data-dominant-signal` and authority token overrides to tune density, hierarchy, or motion per cluster in a restrained way, with continued WCAG 2.2 AA+ and reduced-motion compliance.

---

## Verification

- Run `nx run web:authority-signals-validate` to check that every major entity is mapped and diagnostics (imbalance, starvation) are within bounds.
- Full pipeline: `nx run web:verify` must remain green, including the new authority-signals-validate step.

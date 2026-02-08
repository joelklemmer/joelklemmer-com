# Authority Signal Topology Differentiation (ASTD)

## Purpose

Authority Signal Topology Differentiation extends the Unified Authority Signal Integration Layer (UASIL) by eliminating signal redundancy clusters and introducing multidimensional signal variance across all entities. The goal is to maximize orthogonality between entity vectors, preserve doctrinal coverage, and maintain five-signal presence while supporting richer distribution and entropy-aware ordering.

---

## Entropy Model

### Signal entropy score

- **Definition:** Mean over the five authority signals of the Shannon entropy of each signal’s weight distribution across entities. Normalized to [0, 1]; higher means more diversity.
- **Use:** Validation fails on **severe collapse** when the score is below a baseline threshold (e.g. 0.12). Flattening (all entities converging to similar vectors) is warned only.
- **Formula:** For each signal id, build a distribution from entity weights → entropy; average across signals and normalize by max entropy (log₂(5)).

### Topology dimensionality index

- **Definition:** Ratio of unique effective vector signatures to total entities. Range [0, 1]; 1 = all entities have distinct vectors.
- **Use:** Fail validation when below a severe threshold (e.g. 0.15); indicates too many entities sharing the same or near-identical profile.

### Variance distribution report

- **Contents:** Per-signal mean and variance across entities, overall variance, and count of unique signatures vs total entities.
- **Use:** Diagnostics and tuning; no direct fail/warn from the report alone.

### Severe collapse vs flattening

- **Severe collapse:** Very low entropy and/or dimensionality (e.g. almost all entities share one or two signatures). Validation **fails**.
- **Flattening:** Low variance across entities (similar distributions). Validation **warns** only; differentiation and ordering are intended to mitigate.

---

## Differentiation Strategy

### Vector expansion model (libs/authority-signals)

- **Primary weights:** Unchanged; doctrinal coverage is preserved.
- **Secondary emphasis:** Optional 0–1 weights applied with a factor to effective weight; used to differentiate within clusters.
- **Tertiary modulation:** Optional 0–1 weights for finer variance.
- **Negative weighting:** Optional 0–1 weights subtracted in effective weight for contrast.
- **Contextual override hooks:** `contextOverrides` keyed by context string; `getSignalVector(kind, id, context)` returns weights overridden for that context. Enables context-specific resolution without changing routes or slugs.

Effective weight for each signal:  
`primary + secondary×factor + tertiary×factor − negative×factor`, clamped to [0, 1].  
Helpers: `getEffectiveWeights(vector)`, `toFullVectorFromVector(vector)`, `getDominantSignalIdFromEffective(vector)`.

### Topology differentiation engine (libs/authority-mapping)

- **generateDifferentiatedBindings(baseConfig):** Produces a binding list from the base config by:
  - Computing effective signatures (rounded effective weights) and clustering entities by signature.
  - For clusters with more than one entity, adding small secondary/tertiary modulation so each entity gets a distinct emphasis (e.g. on under-used signals in the cluster).
  - Preserving primary weights and five-signal presence; no doctrinal change.

- **Validator flags:**
  - **Vector duplication:** Multiple entities with the same effective signature → warning.
  - **Low entropy clusters:** Many entities sharing the same profile (e.g. ≥4) → warning.
  - **Signal flattening:** Very low variance across entity vectors → warning.

The registry and structured mapping use differentiated bindings; the verify pipeline and PGF remain unchanged.

---

## Executive Brief adaptive ordering

- **Sort keys (in order):**
  1. Dominant signal (by canonical signal order).
  2. Entropy contribution (descending; more distinctive entities first within a signal).
  3. Traversal diversity: after grouping by dominant signal and sorting by entropy, items are interleaved in round-robin by signal so that consecutive items tend to differ in dominant signal, maximizing cognitive dimensional exposure during exploration.

---

## Intelligence layer variance propagation

- **Semantic index:** Entries may carry `signalEntropyContribution` when a variance resolver is provided. Ranking and clustering logic can use this for relevance and diversity.
- **Graph:** Nodes may carry `signalEntropyContribution`; edges may carry `weight` derived from signal diversity (e.g. 1 − cosine similarity of effective vectors). Higher weight = more orthogonal endpoints.
- **Resolvers:** Existing `getSignalVector` is unchanged. Optional `getSignalVariance(kind, id)` returns a scalar entropy contribution (e.g. from `getEntityEntropyContribution` in authority-mapping). No breaking changes; all new fields and options are optional.

---

## Future adaptive weighting notes

- **Contextual overrides:** Use `contextOverrides` and `getSignalVector(..., context)` for locale, channel, or role-specific weighting without new routes or content schemas.
- **Dynamic weighting:** Secondary/tertiary/negative could be tuned from analytics or A/B tests while keeping primary weights and doctrine fixed.
- **Search and clustering:** Semantic index and graph already expose `signalVector` and optional `signalEntropyContribution` and edge `weight`; ranking and clustering algorithms can use these for diversity and doctrinal balance.
- **Thresholds:** `SEVERE_ENTROPY_THRESHOLD` and `SEVERE_DIMENSIONALITY_THRESHOLD` in entropy metrics can be adjusted as the entity set grows or governance requirements change.

---

## Verification

- Run `nx run web:authority-signals-validate` to ensure:
  - Every major entity is mapped.
  - Entropy score and dimensionality index are above severe thresholds.
  - Variance distribution and topology warnings (duplication, low entropy clusters, flattening) are reviewed.
- Full pipeline: `nx run web:verify` must remain green, with no route/slug/verify-order changes and no PGF or accessibility regressions.

# Subsystem Doctrine Documentation

Engineering doctrine for authority systems. Each document defines **engineering goals**, **observable runtime behaviors**, **metrics of success**, **extension rules**, and **anti-degradation constraints**.

## Subsystems

| #   | Subsystem                     | Document                                                           | Summary                                                                            |
| --- | ----------------------------- | ------------------------------------------------------------------ | ---------------------------------------------------------------------------------- |
| 1   | **Navigation Cognition**      | [01-navigation-cognition.md](01-navigation-cognition.md)           | Nav as executive parsing system; scan path, rank encoding, single source of truth. |
| 2   | **Interaction Micro-Physics** | [02-interaction-micro-physics.md](02-interaction-micro-physics.md) | Focus order, skip link, focus-visible, no traps, motion governance.                |
| 3   | **Proof Density**             | [03-proof-density.md](03-proof-density.md)                         | Page-by-page intent, proof linkage, schema, UX, a11y, performance.                 |
| 4   | **Authority Telemetry**       | [04-authority-telemetry.md](04-authority-telemetry.md)             | Privacy-first events, pluggable provider, consent, debug log.                      |
| 5   | **Intelligence Surface**      | [05-intelligence-surface.md](05-intelligence-surface.md)           | Entity graph, briefing contracts, deterministic fallbacks, extension points.       |
| 6   | **Performance Perception**    | [06-performance-perception.md](06-performance-perception.md)       | Core Web Vitals, Lighthouse budgets, no visual tradeoffs.                          |
| 7   | **Media Governance**          | [07-media-governance.md](07-media-governance.md)                   | Naming, alt doctrine, derivatives, tiers, validators.                              |

## Use

- **Implementers:** Follow engineering goals and extension rules; ensure observable behaviors and metrics are satisfied.
- **Reviewers:** Use anti-degradation constraints as regression checklist; verify metrics of success are measured in CI or audit.
- **Program:** Subsystem doctrine supports [authority-platform-program](../program/authority-platform-program.md) and quality gates; validators and E2E referenced here are part of `web:verify`.

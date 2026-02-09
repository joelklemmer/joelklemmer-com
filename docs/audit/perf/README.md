# Performance audit (Agent 7 — Performance Perception)

Evidence and metrics for **performance as cognitive trust**: render sequencing, resource priority, and enforced budgets.

## How to run

1. **Build and run Lighthouse CI** (same as CI):
   ```bash
   pnpm nx run web:build
   pnpm nx run web:perf-validate
   ```
   Or directly:
   ```bash
   pnpm exec lhci autorun --config=./lighthouserc.cjs
   ```
2. **Reports** are written to `tmp/lighthouse`. To capture a snapshot for before/after:
   - Copy the relevant manifest/report from `tmp/lighthouse` into this folder with a date suffix, or
   - Record the numeric values in `performance-perception-optimization.md`.

## Enforcement

Budgets are defined in **`lighthouserc.cjs`**. The CI job **lighthouse** runs after build; **the build fails when any assertion fails**. All assertions are `error` (no warn-only).

See `performance-perception-optimization.md` for budget table and before/after metrics.

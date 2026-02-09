# Performance Perception Optimization (Agent 7)

**Mission:** Treat performance as cognitive trust. Measurable improvements and enforced budgets.

## Budgets (enforced in CI)

| Metric                    | Budget      | Unit  | Assertion |
| ------------------------- | ----------- | ----- | --------- |
| Performance (category)    | ≥ 0.7       | score | error     |
| Accessibility (category)  | ≥ 0.9       | score | error     |
| Largest Contentful Paint  | ≤ 1800      | ms    | error     |
| Cumulative Layout Shift   | ≤ 0.05      | —     | error     |
| Interaction to Next Paint | ≤ 200       | ms    | error     |
| Total Blocking Time       | ≤ 300       | ms    | error     |
| First Contentful Paint    | ≤ 1800      | ms    | error     |
| Server response time      | ≤ 600       | ms    | error     |
| Total byte weight         | ≤ 2 500 000 | bytes | error     |

Routes under test: `/en`, `/en/brief`, `/en/media`.

## Implemented optimizations

- **Render sequencing:** Header/masthead fallbacks reserve `--masthead-bar-height` to avoid CLS; hero uses `min-height` and aspect-ratio; briefing-critical content (hero, brief CTA) prioritized.
- **Resource prioritization:** LCP hero image preload via `getCriticalPreloadLinks()` (libs/seo); Next.js font (Inter) with `preload: true` and `display: swap` in root layout; critical routes use preload links in metadata.
- **Cognitive load:** `optimizePackageImports` in Next config for `@joelklemmer/ui`, `@joelklemmer/sections`, `@joelklemmer/a11y`, `@joelklemmer/seo` to reduce JS on critical routes.

## Before / after metrics

Capture from `tmp/lighthouse` after runs. Fill when baselining or after changes.

| Route              | LCP (ms) | CLS | FCP (ms) | TBT (ms) | INP (ms) | Perf score | Total bytes |
| ------------------ | -------- | --- | -------- | -------- | -------- | ---------- | ----------- |
| /en (before)       | —        | —   | —        | —        | —        | —          | —           |
| /en (after)        | —        | —   | —        | —        | —        | —          | —           |
| /en/brief (before) | —        | —   | —        | —        | —        | —          | —           |
| /en/brief (after)  | —        | —   | —        | —        | —        | —          | —           |
| /en/media (before) | —        | —   | —        | —        | —        | —          | —           |
| /en/media (after)  | —        | —   | —        | —        | —        | —          | —           |

_Run: `pnpm exec lhci autorun --config=./lighthouserc.cjs` then read from `tmp/lighthouse`._

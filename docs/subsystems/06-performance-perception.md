# Performance Perception — Subsystem Doctrine

**Authority:** Performance as cognitive trust. Measurable improvements and enforced budgets. Enterprise-grade stability without visual, token, or routing changes.

**Scope:** Core Web Vitals (LCP, CLS, INP), Lighthouse categories (performance, accessibility), TTFB, bundle size, and CI assertions. Image/font optimization, prefetch tuning, caching, Lighthouse CI.

---

## 1. Engineering goals

- **Core Web Vitals:** LCP < 1.8s, CLS ≈ 0, INP < 200ms. TTFB minimized via caching. These targets are cognitive-trust signals: fast, stable, responsive.
- **Lighthouse budgets:** Performance category ≥ 0.7 (error); Accessibility ≥ 0.9 (error). LCP, CLS, INP, FCP, TBT, server response time, and total byte weight asserted in CI (lighthouserc.cjs).
- **No visual/layout/token/route tradeoffs:** Performance hardening must not modify design, tokens, or routing. Proof required for every change: bundle diff, Lighthouse scores, Web Vitals summary, files changed, verify pipeline green.
- **Resource discipline:** Next/Image everywhere applicable; priority only on LCP hero; strategic prefetch (footer and nav quiet links use prefetch={false}); immutable static and media caching; font preload and display swap.

---

## 2. Observable runtime behaviors

- **LCP:** Hero image (Home) is priority-loaded; other heroes and media thumbs use lazy loading. Critical preload links via getCriticalPreloadLinks() where used. Next/Image with sizes and AVIF/WebP.
- **CLS:** Masthead height reserved (--masthead-bar-height); hero min-height and aspect-ratio; no layout shift from images (explicit dimensions/sizes). Render sequencing avoids reflow.
- **INP:** Interaction feedback uses short duration (motion-duration-feedback); optimizePackageImports for critical libs to reduce JS. No long main-thread blocks on critical path.
- **Lighthouse CI:** Runs on built production server; URLs include /en, /en/brief, /en/media. Assertions fail the run if performance < 0.7, LCP > 1800ms, CLS > 0.1, INP > 200ms (and other configured thresholds). Reports in tmp/lighthouse.
- **Bundle:** ANALYZE=true runs bundle analyzer; no automated removal—manual audit for heavy imports and unused deps.

---

## 3. Metrics of success

| Metric              | Target                                    | How measured                                       |
| ------------------- | ----------------------------------------- | -------------------------------------------------- |
| LCP                 | < 1.8s                                    | Lighthouse CI (largest-contentful-paint, error)    |
| CLS                 | ≈ 0 (≤ 0.1)                               | Lighthouse CI (cumulative-layout-shift, error)     |
| INP                 | < 200ms                                   | Lighthouse CI (interaction-to-next-paint, error)   |
| Performance score   | ≥ 0.7                                     | Lighthouse CI (categories.performance, error)      |
| Accessibility score | ≥ 0.9                                     | Lighthouse CI (categories.accessibility, error)    |
| TBT                 | ≤ 300ms                                   | Lighthouse CI (warn)                               |
| FCP                 | ≤ 1800ms                                  | Lighthouse CI (error)                              |
| Total byte weight   | ≤ 2.5MB                                   | Lighthouse CI (error)                              |
| Verify green        | build, verify-fast, a11y, lighthouse pass | CI and local nx run web:verify / lighthouse-budget |

---

## 4. Extension rules

- **New route or heavy component:** Ensure it does not regress LCP/CLS/INP on tested URLs; add route to Lighthouse collect list if it is a key user path. Use optimizePackageImports and lazy loading where appropriate.
- **New image:** Use Next/Image; set sizes and dimensions; avoid priority except for LCP candidate. Prefer thumb/card/hero derivatives per media governance.
- **New font or critical asset:** Preload only when LCP or critical path; document in performance-optimization.md. Do not add blocking scripts or styles without budget check.
- **Prefetch:** Default prefetch for above-the-fold CTAs is acceptable; footer, nav quiet links, and locale switcher must use prefetch={false}.
- **Proof for any perf change:** Document bundle diff (build:analyze), Lighthouse scores, Web Vitals summary, list of files changed, and confirm verify + lighthouse jobs green.

---

## 5. Anti-degradation constraints

- **Do not** lower Lighthouse assertion thresholds (performance, LCP, CLS, INP) without program-level approval and documented justification.
- **Do not** introduce visual, layout, token, or routing changes as part of “performance” work; performance doctrine is optimization only.
- **Do not** remove or weaken image optimization (Next/Image, formats, sizes, priority policy) or prefetch discipline (footer/nav prefetch={false}).
- **Do not** add blocking resources or large JS on critical path without bundle analysis and Lighthouse impact check.
- **Do not** skip Lighthouse CI or the lighthouse job in CI; both are required for merge.
- **Do not** ignore verify pipeline (build, a11y, lighthouse); all must remain green after changes.

---

## 6. References

- [Performance optimization](../performance-optimization.md)
- [Proof Density Roadmap §13 (Performance hardening)](../authority/proof-density-roadmap.md)
- [Performance perception optimization (audit)](../audit/perf/performance-perception-optimization.md)
- `lighthouserc.cjs` (assertions, collect URLs)
- `.github/workflows/ci.yml` (lighthouse job)
- `nx run web:lighthouse-budget`, `pnpm run build:analyze`

# CI Failure Map

**Purpose:** First real error per failing job (build, verify-fast, lighthouse) for fixing CI without weakening gates.  
**Source:** Local reproduction (Windows) + `docs/audit/ci-failures-report.md` (Lighthouse/Visual evidence).  
**Note:** GitHub PR check run logs were not accessible; this map is from local runs and the existing audit report.

---

## Job → Root error → File(s) → Why it fails

### build

- **Local:** Build passed (`pnpm nx run web:build --verbose` with `BASELINE_BROWSER_MAPPING_IGNORE_OLD_DATA=1`).
- **If CI fails:** Likely causes — (1) **Lockfile:** `pnpm install --frozen-lockfile` fails when `package.json` has exact versions (`chrome-launcher`, `puppeteer`) but lockfile had caret ranges. (2) **Linux parity:** Case-sensitive paths, env not set for head-invariants (e.g. `NEXT_PUBLIC_IDENTITY_SAME_AS`). (3) **Repo clean step:** Build or a step produces uncommitted changes (e.g. `next-env.d.ts` not restored).
- **Root error (if install fails):**  
  `ERR_PNPM_OUTDATED_LOCKFILE  Cannot install with "frozen-lockfile" because pnpm-lock.yaml is not up to date with package.json`  
  `specifiers in the lockfile don't match specifiers in package.json: chrome-launcher (lockfile: ^1.2.0, manifest: 1.2.1), puppeteer (lockfile: ^24.0.0, manifest: 24.37.2)`
- **Files:** `package.json` (exact versions), `pnpm-lock.yaml` (must match).

### verify-fast

- **First failing step (local):** `docs:arch:check` — architecture outputs stale after lockfile change.
- **Root error (verbatim):**  
  `Architecture outputs are stale: stamp workspaceHash 098e6df68f218017... != current d6c4701d4b6414f5.... Run: nx run docs:arch`
- **File(s):** `docs/architecture/.stamp.json`, `tools/docs/generate-architecture.ts`. Hash from `nx.json`, `package.json`, `pnpm-lock.yaml`.
- **Why:** `workspaceHash` changed (e.g. after updating `pnpm-lock.yaml`); stamped outputs no longer match. Fix: run `nx run docs:arch` and commit generated files.
- **Other verify-fast steps:** All other validators (format, lint, security, content, i18n, pgf, …, agent-overlay, web:test) passed locally.

### lighthouse

- **CI step:** Build → `lighthouse-harness-validate` → `lighthouse-timespan` (env: `RATE_LIMIT_MODE=off`, `SKIP_LH_BUILD=1`, `LH_CHROME_MAJOR=136`, `LH_FORM_FACTOR=desktop`, `LH_THROTTLING_METHOD=provided`).
- **First failing assertions (from `docs/audit/ci-failures-report.md` and `.lighthouseci/assertion-results.json`):**
  1. **largest-contentful-paint** — `maxNumericValue` ≤ 1800 ms, actual ~3019–3165 ms on `/en`, `/en/brief`, `/en/media`. **Route:** all three. **Why:** LCP element (hero image) loads in ~3s; threshold 1.8s.
  2. **interaction-to-next-paint** — `auditRan` ≥ 1, actual 0. **Why:** INP audit did not run (timespan run may not populate INP).
  3. **meta-description** — `minScore` ≥ 0.9, actual 0 on `/en`, `/en/media`. **Why:** Lighthouse reports document meta description missing or not detected.
  4. **canonical** — `minScore` ≥ 0.9, actual 0 on `/en/brief`. **Why:** Valid `rel=canonical` not detected.
  5. **aria-allowed-role** — `minScore` ≥ 0.9, actual 0 (all routes). **Why:** ARIA roles on incompatible elements.
  6. **bf-cache**, **target-size**, **unused-javascript**, **legacy-javascript-insight**, **network-dependency-tree-insight** — various failures (see audit report).
- **Config:** `lighthouserc.serverless.cjs` — `preset: 'lighthouse:recommended'` plus explicit assertions (LCP ≤1800, CLS ≤0.05, INP ≤200, etc.). Assertions run in `tools/lhci-assert-from-lhrs.ts` (no `auditRan` handling; only `minScore` / `maxNumericValue`).
- **Files:** `lighthouserc.serverless.cjs`, `tools/run-lighthouse-timespan.ts`, `tools/collect-lhr-timespan.ts`, `tools/lhci-assert-from-lhrs.ts`; app metadata in `libs/seo`, `apps/web/src/app/[locale]/*/page.tsx` (canonical/description).

---

## Summary

| Job             | First error / cause                                                                 | Fix (done or recommended)                                                                                                                       |
| --------------- | ----------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| **build**       | Lockfile out of date (exact deps)                                                   | `pnpm install --no-frozen-lockfile`; commit updated `pnpm-lock.yaml`.                                                                           |
| **verify-fast** | docs:arch:check — architecture stale                                                | Run `nx run docs:arch`; commit `docs/architecture/` and `.stamp.json`.                                                                          |
| **lighthouse**  | LCP > 1800 ms; INP auditRan 0; meta-description/canonical/aria/bf-cache/target-size | Fix metadata/canonical in HTML; optimize LCP; fix a11y; or adjust only flaky/CI-specific assertions per policy (no blanket threshold lowering). |

---

## Exact CI commands (from `.github/workflows/ci.yml`)

- **verify-fast:** `pnpm install --frozen-lockfile` → `pnpm audit --audit-level=critical` → `pnpm nx format:check --all` → `pnpm nx run web:lint` → validators block (security through `web:test` including `docs:arch:check`).
- **build:** `pnpm install --frozen-lockfile` → `pnpm nx run web:build --verbose` (env: `BASELINE_BROWSER_MAPPING_IGNORE_OLD_DATA=1`) → bundle-guard, server-import-graph, critical-bundle → `git checkout -- apps/web/next-env.d.ts` → repo clean check → `pnpm nx run web:head-invariants-validate --verbose` (env: `RATE_LIMIT_MODE=off`, `STANDALONE=1`).
- **lighthouse:** Install → Chrome 136 → Build → `pnpm nx run web:lighthouse-harness-validate --verbose` → `pnpm nx run web:lighthouse-timespan --verbose` (env: `SKIP_LH_BUILD=1`, etc.).

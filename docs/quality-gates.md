# Quality gates

This document describes every quality gate in the repo: how to run it, what it checks, and what success looks like. All gates are designed to run on **Node v20+** (see `engines` in `package.json`).

## Visual Authority System

Evaluator-facing surfaces (Executive Brief, Public Record, Case Studies, and related proof/evidence UI) are governed by the [Visual Authority System](visual-authority-system.md). That spec defines typography hierarchy, layout rhythm, evidence UI patterns, interaction rules, and an anti-pattern blacklist. **Deviations require documented justification.** When changing layout, typography, or interaction on those surfaces, consult the spec; it works alongside the [PGF](pgf.md) (which governs tone and copy) and does not alter verify order or existing gate behavior.

## Overview

| Gate                  | Nx target                          | What it checks                                                |
| --------------------- | ---------------------------------- | ------------------------------------------------------------- |
| Format                | `nx format:check`                  | Prettier / Nx format across the workspace                     |
| Lint                  | `nx run web:lint`                  | ESLint for the web app                                        |
| Content validate      | `nx run web:content-validate`      | MDX frontmatter, proofRefs, claims, artifacts, media          |
| Governance validate   | `nx run web:governance-validate`   | Governance doc and config checks                              |
| i18n validate         | `nx run web:i18n-validate`         | Translation completeness (chrome + meta + contentOS)          |
| PGF validate          | `nx run web:pgf-validate`          | H1/lede uniqueness, claims registry, primary CTA labels       |
| Intelligence validate | `nx run web:intelligence-validate` | Intelligence layer and semantic index                         |
| Content OS validate   | `nx run web:content-os-validate`   | Page intent map, contentOS intents, meta/CTA, no placeholders |
| Sitemap validate      | `nx run web:sitemap-validate`      | Dynamic public record and case study URLs for all locales     |
| SEO validate          | `nx run web:seo-validate`          | Canonical and hreflang for core routes                        |
| Test                  | `nx run web:test`                  | Unit tests (currently a placeholder)                          |
| Build                 | `nx run web:build`                 | Next.js production build                                      |
| A11y                  | `nx run web:a11y`                  | Playwright + axe-core accessibility scans                     |
| E2E                   | `nx e2e web-e2e`                   | Playwright E2E tests                                          |

**Single command to run all web gates in order:** `nx run web:verify` (see [Dev workflow](dev-workflow.md)).

---

## 1. Format check

- **Run:** `nx format:check --all` or `pnpm format:check`
- **What it checks:** Nx format (Prettier) across the workspace. Fails if any file is not formatted. Uses `.prettierignore`; tool-generated typing files (e.g. `apps/web/next-env.d.ts`) are excluded so format check does not fail when their content varies by environment.
- **Success:** Exit code 0, no diff output.

---

## 2. Lint (web)

- **Run:** `nx run web:lint`
- **What it checks:** ESLint for the web app (from `@nx/eslint` plugin). Uses `eslint.config.mjs` at repo root.
- **Success:** Exit code 0; no errors or warnings (depending on config).

---

## 3. Content validate

- **Run:** `nx run web:content-validate`
- **Implementation:** Runs `tools/validate-content.ts` via **tsx** (no `@swc-node/register`). Uses `tsconfig.base.json` for path aliases. The script imports from `@joelklemmer/content/validate` (not `@joelklemmer/content`) to avoid loading `next-mdx-remote`, which has ESM-only deps that break under tsx on Node 20.
- **What it checks:**
  - MDX frontmatter against schemas (case studies, public record/proof, institutional) in `libs/content/src/lib/schemas.ts`
  - proofRefs in case studies reference existing public record IDs
  - Claim registry in `libs/content/src/lib/claims.ts` references valid record IDs and has at least one recordId per claim
  - Artifacts manifest and files (e.g. `apps/web/public/artifacts/`)
  - Media manifest and integrity (e.g. `apps/web/public/media/`)
- **Success:** Exit code 0 and stdout: `Content validation passed.`

---

## 4. i18n validate

- **Run:** `nx run web:i18n-validate`
- **Implementation:** Runs `tools/validate-i18n.ts` via **tsx** with `tsconfig.base.json`.
- **What it checks:** For each locale, JSON message files (`libs/i18n/src/messages/<locale>/*.json`) satisfy required keys for `common`, `nav`, `footer`, `meta`, `brief`, `publicRecord`, `contentOS`, and other namespaces.
- **Success:** Exit code 0 and stdout: `i18n validation passed.`

---

## 5a. Content OS validate

- **Run:** `nx run web:content-os-validate`
- **Implementation:** Runs `tools/validate-content-os.ts` via **tsx** with `tsconfig.base.json`.
- **What it checks:** (1) `docs/page-intent-map.md` documents all primary routes. (2) Required `contentOS` intent keys exist for all locales. (3) Home, Brief, Work, Books, Public Record, Contact have meta.title and meta.description; home has hero.cta; contact has pathways and mailto.buttonLabel. (4) No placeholder language (lorem, placeholder, sample, coming soon, tbd, to be added, draft) in default-locale user-facing strings.
- **Success:** Exit code 0 and stdout: `Content OS validation passed.`

---

## 5. PGF validate

- **Run:** `nx run web:pgf-validate`
- **Implementation:** Runs `tools/validate-pgf.ts` via **tsx** with `tsconfig.base.json`. Uses default locale messages and `@joelklemmer/content/validate` claim/contact registries.
- **What it checks:** (Mechanical only; see [PGF](pgf.md).)
  - **Check 1:** No duplicate page H1 (`meta.title`) across core screens (Home, Brief, Case Studies, Books, Public Record, Contact, Privacy, Terms, Accessibility, Security) for the default locale.
  - **Check 2:** No duplicate lede (`meta.description`) across those same screens (default locale).
  - **Check 3:** Claims registry: no duplicate `labelKey` or `summaryKey` in `libs/content/src/lib/claims.ts`.
  - **Check 4:** Primary CTA labels (contact pathways, home CTA, mailto button) must be unique unless on the allowlist (e.g. "Read more").
- **Success:** Exit code 0 and stdout: `PGF validation passed.`
- **Failure output:** Clear report listing each duplicate with file paths or identifiers (e.g. meta key, claim id, CTA source).

---

## 6. Sitemap validate

- **Run:** `nx run web:sitemap-validate`
- **Implementation:** Runs `tools/validate-sitemap.ts` via **tsx**. Uses sync slug getters from `@joelklemmer/content/validate` and `buildSitemapEntries` from `@joelklemmer/seo`.
- **What it checks:** Expected sitemap entry count per locale; no duplicate URLs; every dynamic public record and case study URL present for each locale.
- **Success:** Exit code 0 and stdout: `Sitemap validation passed: N URLs across 4 locales.`

---

## 7. SEO validate

- **Run:** `nx run web:seo-validate`
- **Implementation:** Runs `tools/validate-seo.ts` via \*\*tsx`. Calls `getCanonicalUrl`and`hreflangAlternates`from`@joelklemmer/seo` for core pathnames.
- **What it checks:** Canonical URL format for each locale; hreflang alternates include en/uk/es/he and x-default.
- **Success:** Exit code 0 and stdout: `SEO validation passed: canonical and hreflang for N core routes.`

---

## 8. Test (web)

- **Run:** `nx run web:test`
- **What it checks:** Currently a placeholder that prints “No web tests configured”. Intended for future unit tests.
- **Success:** Exit code 0.

---

## 9. Build (web)

- **Run:** `nx run web:build` or `nx build web`
- **What it checks:** Next.js production build. Identity sameAs is required in production (set `NEXT_PUBLIC_IDENTITY_SAME_AS` in CI). Required artifact/media files and checksums are enforced only when `RELEASE_READY=1` (see [CI command sequence and env](#ci-command-sequence-and-env)).
- **Success:** Exit code 0; build output under `dist/` (or configured output path).

---

## 10. A11y

- **Run:** `nx run web:a11y`
- **Implementation:** Runs `tools/run-a11y.ts` (tsx). The script **injects safe placeholder env vars only when missing** (`NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_IDENTITY_SAME_AS`, `RELEASE_READY`) so the gate is deterministic without requiring CI or local env. Production identity enforcement in `libs/seo` is unchanged; only the a11y runner supplies these defaults for the spawned build/start process. The script allocates a free port (prefer 4300) via `get-port`, starts the web server on that port, sets `BASE_URL` and `PORT` for Playwright, then runs Playwright a11y (`apps/web-e2e/playwright.a11y.config.ts`). Playwright reads `BASE_URL` and uses `reuseExistingServer: true`, so no port collision with an existing dev server. No manual freeing of port 3000 required.
- **What it checks:** axe-core accessibility scans across required routes/locales (see `apps/web-e2e/src/a11y/`). Also: rate limiter returns 429 with an accessible HTML shell when limit exceeded (when limiter enabled via `RATE_LIMIT_MODE`; CI uses `RATE_LIMIT_MODE=off` for stability; 429 shell test skipped there); locale invariants (html lang, document title, metadata) across locales.
- **Success:** Exit code 0; no a11y violations reported; limiter and locale-invariant specs pass.
- **Build/start parity:** The a11y harness runs `nx run web:build` then `nx start web`; a successful ready check and tests prove that the build output path matches what `next start` uses. See [Dev workflow](dev-workflow.md) for distDir notes.
- **Report path:** The a11y JSON report is written to `tmp/reports/a11y.json` (gitignored). In CI it is uploaded as the `a11y-report` artifact. Verify must not create tracked diffs; this path is outside the repo tree for commit purposes.

---

## 11. E2E

- **Run:** `nx e2e web-e2e`
- **What it checks:** Full Playwright E2E suite (default config). May depend on a prior build or serve.
- **Success:** Exit code 0; all specs pass.

---

## Verify target (all gates in order)

- **Run:** `nx run web:verify`
- **What it does:** Runs the following in order; stops on first failure:
  1. `nx format:check --all`
  2. `nx run web:lint`
  3. `nx run web:content-validate`
  4. `nx run web:governance-validate`
  5. `nx run web:i18n-validate`
  6. `nx run web:pgf-validate`
  7. `nx run web:intelligence-validate`
  8. `nx run web:content-os-validate`
  9. `nx run web:sitemap-validate`
  10. `nx run web:seo-validate`
  11. `nx run web:test`
  12. `nx run web:build`
  13. `nx run web:restore-generated-typings` (hygiene: restores `next-env.d.ts`; does not affect format)
  14. `nx run web:a11y`

No steps are skipped; all of these targets exist in this repo. If a target were removed in the future, the verify target would need to be updated to match. **Note:** If `web:lint` (or any other step) has existing failures in the codebase, `web:verify` will fail at that step until those issues are fixed. Verify must not create uncommitted changes; see [CI parity](ci-parity.md) (repo must remain clean in CI).

---

## CI Failure Root Cause

When CI fails, paste the **exact failing command** and **error line(s)** from the GitHub Actions log below so we can track root causes.

**Example (paste real failure here):**

```
# Failing step: Verify (lint, content, i18n, ...)
# Error:
#   Error: Invalid NEXT_PUBLIC_IDENTITY_SAME_AS: sameAs is empty
#   at getIdentitySameAs (libs/seo/src/lib/identity.ts:27)
```

**Common causes addressed by this doc and CI config:**

- **Playwright browsers missing in CI:** Error `browserType.launch: Executable doesn't exist` occurs because GitHub-hosted runners do not ship browser binaries. CI now runs `pnpm exec playwright install --with-deps chromium` after `pnpm install` and before `web:verify`, and caches `~/.cache/ms-playwright` so subsequent runs reuse the install. See [CI parity](ci-parity.md).
- **Visual baseline drift:** CI visual job runs on ubuntu-22.04 with `PLAYWRIGHT_BROWSERS_PATH=0`. Baselines must be generated in the same environment. Use the workflow "Update Linux visual baselines" (Actions tab). Local Windows or macOS snapshots are not acceptable for CI. See `apps/web-e2e/__screenshots__/linux/README.md`.
- **Missing env in CI:** `NEXT_PUBLIC_SITE_URL` or `NEXT_PUBLIC_IDENTITY_SAME_AS` not set in the workflow. CI now sets `NEXT_PUBLIC_SITE_URL=https://example.invalid` and `NEXT_PUBLIC_IDENTITY_SAME_AS=https://example.invalid/ci` so SEO/identity validators and the Next build do not fail.
- **Artifact/media strict enforcement:** With `RELEASE_READY=0` (default in CI), missing required artifact files or checksum mismatches **warn** but do not fail. Only when `RELEASE_READY=1` (e.g. when cutting a release) are required artifacts and checksums enforced. Invalid manifest schema still fails in all environments.
- **Install or version drift:** CI pins Node to 20.19.0 and uses `pnpm install --frozen-lockfile`. Run `pnpm ci:verify` locally to match CI (see [CI parity](ci-parity.md)).
- **A11y timeouts:** Playwright a11y uses `waitUntil: 'domcontentloaded'` and a 3‑minute test timeout; CI retries once on failure. See [CI parity](ci-parity.md) for a11y assumptions.

---

## CI command sequence and env

CI (`.github/workflows/ci.yml`) runs:

1. Checkout, setup **Node 20.19.0**, pnpm, caches, **Versions** (node -v, npm -v, pnpm -v).
2. **Install:** `pnpm install --frozen-lockfile`
3. **Install Playwright browsers:** `pnpm exec playwright install --with-deps chromium` — runners do not ship browsers; CI caches `~/.cache/ms-playwright` (keyed by `pnpm-lock.yaml`) to speed subsequent runs.
4. **Verify:** `pnpm nx run web:verify --verbose`

**Required env vars for CI** (set in the workflow so validators and build do not fail):

| Variable                       | CI value                     | Purpose                                                                                                                                                           |
| ------------------------------ | ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`         | `https://example.invalid`    | Sitemap and SEO canonical/hreflang validators; Next build.                                                                                                        |
| `NEXT_PUBLIC_IDENTITY_SAME_AS` | `https://example.invalid/ci` | Identity JSON-LD; build fails in production if empty/invalid unless this is set.                                                                                  |
| `RELEASE_READY`                | `0`                          | When `0` or unset: artifact/media missing or checksum mismatch only warns. When `1`: required artifacts and media are enforced (use only when cutting a release). |

**RELEASE_READY usage:**

- **CI / local dev:** Do not set `RELEASE_READY` or set `RELEASE_READY=0`. Content validate and build will not fail on missing optional/required artifact files or checksum mismatch; invalid manifest schema still fails.
- **Production release:** Set `RELEASE_READY=1` in the release pipeline so that required artifacts must exist and checksums match.

---

## Technical notes

- **Install:** This repo supports both **pnpm** (canonical; `packageManager` in package.json) and **npm**. If `npm install` fails with `Cannot read properties of null (reading 'matches')`, the cause is npm's arborist hitting a null reference during ideal-tree build (e.g. after a previous pnpm install left a different `node_modules` layout). **Fix:** run `npm cache verify`, then `npm cache clean --force`, remove `node_modules` if present, and run `npm install` again. See debug log stack: `Link.matches` in `@npmcli/arborist`.
- **Content and i18n scripts:** Executed with `npx tsx --tsconfig tsconfig.base.json` so that path aliases resolve. Works on Node 20+ and Windows (PowerShell). The previous runner `node -r @swc-node/register/transpile-only` was removed due to `ERR_PACKAGE_PATH_NOT_EXPORTED` on Node 20.
- **tsx:** Added as a devDependency; documented here and in [Elite hardening report](elite-hardening-report.md).

---

## PR checklist (paste into GitHub PR notes)

Use this after making changes that affect quality gates (e.g. runner switch, new verify target).

- [ ] **Commands executed** (from repo root, Node 20+):
  - `npm install` or `pnpm install`
  - `nx run web:content-validate`
  - `nx run web:build`
  - `nx run web:verify`
- [ ] **Results:**
  - install: (pass / fail)
  - content-validate: (pass / fail)
  - build: (pass / fail)
  - verify: (pass / fail)
- [ ] **Windows:** Ran the above in PowerShell: (yes / no)
- [ ] **Remaining known issues:** (none / describe)

---

## Local run plan (after changes)

Run from repo root (Node v20+). Use PowerShell on Windows.

1. **Install dependencies**

   ```bash
   pnpm install
   ```

   Success: exit 0; `tsx` appears in devDependencies.

2. **Content validation**

   ```bash
   nx run web:content-validate
   ```

   Success: exit 0, stdout contains `Content validation passed.`

3. **i18n validation**

   ```bash
   nx run web:i18n-validate
   ```

   Success: exit 0, stdout contains `i18n validation passed.`

4. **Full verify** (lint → content-validate → i18n-validate → pgf-validate → sitemap-validate → seo-validate → test → build → a11y)
   ```bash
   nx run web:verify
   ```
   Success: exit 0 after all steps complete. If lint (or another step) has pre-existing failures, verify will fail at that step; fix those before expecting verify to pass.

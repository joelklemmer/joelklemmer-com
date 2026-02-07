# Quality gates

This document describes every quality gate in the repo: how to run it, what it checks, and what success looks like. All gates are designed to run on **Node v20+** (see `engines` in `package.json`).

## Overview

| Gate | Nx target | What it checks |
|------|-----------|----------------|
| Format | `nx format:check` | Prettier / Nx format across the workspace |
| Lint | `nx run web:lint` | ESLint for the web app |
| Content validate | `nx run web:content-validate` | MDX frontmatter, proofRefs, claims, artifacts, media |
| i18n validate | `nx run web:i18n-validate` | Translation completeness (chrome + meta) |
| Test | `nx run web:test` | Unit tests (currently a placeholder) |
| Build | `nx run web:build` | Next.js production build |
| A11y | `nx run web:a11y` | Playwright + axe-core accessibility scans |
| E2E | `nx e2e web-e2e` | Playwright E2E tests |

**Single command to run all web gates in order:** `nx run web:verify` (see [Dev workflow](dev-workflow.md)).

---

## 1. Format check

- **Run:** `nx format:check --all` or `pnpm format:check`
- **What it checks:** Nx format (e.g. Prettier) across the workspace. Fails if any file is not formatted.
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
- **What it checks:** For each locale, JSON message files (`libs/i18n/src/messages/<locale>/*.json`) satisfy required keys for `common`, `nav`, `footer`, and `meta` (chrome + critical meta translation completeness).
- **Success:** Exit code 0 and stdout: `i18n validation passed.`

---

## 5. Test (web)

- **Run:** `nx run web:test`
- **What it checks:** Currently a placeholder that prints “No web tests configured”. Intended for future unit tests.
- **Success:** Exit code 0.

---

## 6. Build (web)

- **Run:** `nx run web:build` or `nx build web`
- **What it checks:** Next.js production build. Also enforces sameAs identity when `NEXT_PUBLIC_IDENTITY_SAME_AS` is set; can enforce artifact/media manifests in production.
- **Success:** Exit code 0; build output under `dist/` (or configured output path).

---

## 7. A11y

- **Run:** `nx run web:a11y`
- **Implementation:** Delegates to `nx run web-e2e:a11y` (Playwright with `apps/web-e2e/playwright.a11y.config.ts`).
- **What it checks:** axe-core accessibility scans across required routes/locales (see `apps/web-e2e/src/a11y/`).
- **Success:** Exit code 0; no a11y violations reported.

---

## 8. E2E

- **Run:** `nx e2e web-e2e`
- **What it checks:** Full Playwright E2E suite (default config). May depend on a prior build or serve.
- **Success:** Exit code 0; all specs pass.

---

## Verify target (all gates in order)

- **Run:** `nx run web:verify`
- **What it does:** Runs the following in order; stops on first failure:
  1. `nx run web:lint`
  2. `nx run web:content-validate`
  3. `nx run web:i18n-validate`
  4. `nx run web:test`
  5. `nx run web:build`
  6. `nx run web:a11y`

No steps are skipped; all of these targets exist in this repo. If a target were removed in the future, the verify target would need to be updated to match. **Note:** If `web:lint` (or any other step) has existing failures in the codebase, `web:verify` will fail at that step until those issues are fixed.

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

4. **Full verify** (lint → content-validate → i18n-validate → test → build → a11y)
   ```bash
   nx run web:verify
   ```
   Success: exit 0 after all six steps complete. If lint (or another step) has pre-existing failures, verify will fail at that step; fix those before expecting verify to pass.

# CI parity

Run locally **exactly** what CI runs so failures are reproducible and fixable before push.

## What CI runs

1. **Versions** (for logs): `node -v`, `npm -v`, `pnpm -v`, `git --version`
2. **Install:** `pnpm install --frozen-lockfile`
3. **Install Playwright browsers:** `pnpm exec playwright install --with-deps chromium` — GitHub runners do not ship browsers; this installs Chromium and Linux system deps so `web:a11y` can run. CI caches `~/.cache/ms-playwright` (keyed by `pnpm-lock.yaml`) to speed subsequent runs.
4. **Verify:** `pnpm nx run web:verify --verbose`
5. **Restore generated typings (hygiene only):** `git checkout -- apps/web/next-env.d.ts` so Next build overwrites do not dirty the tree. This step does **not** fix format-check failures; format stability is ensured by excluding the file from formatting (see below).
6. **Repo must be clean:** `git status --porcelain` must be empty; otherwise CI fails with the list of changed files.
7. **Upload a11y report:** The a11y JSON report is uploaded as a workflow artifact (`tmp/reports/a11y.json` → artifact name `a11y-report`). Download it from the job summary if needed.

The verify target runs, in order: format check, lint, content-validate, i18n-validate, sitemap-validate, seo-validate, test, build, a11y. See [Quality gates](quality-gates.md).

### Repo must remain clean in CI

Verify must not create uncommitted changes. After verify, CI runs `git status --porcelain`. If any file is modified or untracked (in tracked dirs), the job fails. This keeps CI deterministic and prevents generators (e.g. a11y report, Next typegen) from slipping in. The a11y report is written to `tmp/reports/a11y.json` (gitignored) and is available as a workflow artifact; it is not committed.

### next-env.d.ts is excluded from format checks

`apps/web/next-env.d.ts` is **tool-generated** by Next.js (regenerated on `next dev` / `next build`). Its content or whitespace can vary by environment (e.g. optional `import "./.next/dev/types/routes.d.ts"`, line endings, or trailing newlines). So `nx format:check --all` would otherwise fail in CI when the file on disk differs from what Prettier would output. To keep CI deterministic without weakening quality gates, this file is listed in **`.prettierignore`** at the repo root. Nx format check uses Prettier and respects `.prettierignore`, so the file is not formatted or checked. The committed version is minimal (reference directives only; no dynamic imports). `.gitattributes` enforces `eol=lf` for `*.d.ts` to avoid line-ending churn.

## Run locally (PowerShell)

From the repo root, with **Node 20.19.x** (see `engines` in `package.json`):

```powershell
node -v
npm -v
pnpm -v
pnpm install --frozen-lockfile
pnpm nx run web:verify --verbose
```

Or use the single script that matches CI:

```powershell
pnpm run ci:verify
```

This runs `pnpm install --frozen-lockfile` then `pnpm nx run web:verify --verbose`. If you recently ran `nx format:write` and it changed `pnpm-lock.yaml`, run `pnpm install` once before `ci:verify` so Nx can read the pnpm store (`.modules.yaml`) correctly.

## Env vars (match CI when needed)

CI sets `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_IDENTITY_SAME_AS`, and `RELEASE_READY` in the workflow so validators and the Next build do not fail. **The a11y runner (`tools/run-a11y.ts`) also sets these as safe placeholders when missing** so `nx run web:a11y` (and thus `web:verify`) is deterministic locally and in CI without relying on ambient env.

To avoid drift with CI when running verify or build **outside** the a11y step, set the same env locally if needed:

| Variable                       | CI value                     | Local (optional)                                                           |
| ------------------------------ | ---------------------------- | -------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`         | `https://example.invalid`    | Omit (defaults to `http://localhost:3000` in validators) or set for parity |
| `NEXT_PUBLIC_IDENTITY_SAME_AS` | `https://example.invalid/ci` | Omit in dev (identity warns); set for production build parity              |
| `RELEASE_READY`                | `0`                          | Omit or `0` so artifact/media strict checks do not run                     |

**PowerShell example (same as CI):**

```powershell
$env:NEXT_PUBLIC_SITE_URL = "https://example.invalid"
$env:NEXT_PUBLIC_IDENTITY_SAME_AS = "https://example.invalid/ci"
$env:RELEASE_READY = "0"
pnpm run ci:verify
```

## A11y execution assumptions

- **Runner:** `nx run web:a11y` runs `tools/run-a11y.ts`, which injects safe placeholder env vars when missing (`NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_IDENTITY_SAME_AS`, `RELEASE_READY`), picks a **free port** (prefer 4300) via `get-port`, starts the web server on that port, sets `BASE_URL=http://127.0.0.1:<port>` and `PORT` for Playwright, runs Playwright a11y with that `BASE_URL`, then cleans up. No manual port management; port 3000 can be occupied without failing a11y. CI sets the same env in the workflow; local a11y runner sets placeholders if not set so the gate is self-sufficient.
- **Config:** `apps/web-e2e/playwright.a11y.config.ts`. When `BASE_URL` is set, Playwright uses it as `baseURL` and `reuseExistingServer: true` (server was already started by the runner). When not set, Playwright starts the server itself on port 3000 (legacy fallback).
- **Test timeout:** 180 seconds (3 min) for the full a11y smoke (all locales × routes).
- **Navigation:** `page.goto(..., { waitUntil: 'domcontentloaded', timeout: 15000 })`.
- **Retries:** In CI, Playwright retries the a11y spec up to 2 times on failure (config `retries: isCi ? 2 : 0`). Use only for transient failures (e.g. navigation timeouts); real a11y violations should be fixed, not relied on retries.
- **Workers:** CI runs with 1 worker for stability.

If a11y fails in CI with a timeout, ensure the run has enough time and that the dev/server is up before tests start. Increasing `test.setTimeout` or navigation timeout in `apps/web-e2e/src/a11y/a11y.spec.ts` is acceptable for stability; do not relax a11y violation checks.

## Case sensitivity and paths

CI runs on Linux (Ubuntu). Import paths are case-sensitive there. Ensure:

- All imports use the same casing as the actual filenames (e.g. `@joelklemmer/content` and path aliases in `tsconfig.base.json`).
- No Windows-only path assumptions (e.g. backslashes); `path.join` and `process.cwd()` are used so paths work on Linux.

If a job fails only in CI with "module not found" or similar, check that the path casing matches the repo layout.

## Caching

CI caches pnpm store and Playwright browsers. Cache keys use `pnpm-lock.yaml` hash. If dependencies or Playwright versions change, the next run may be slower; failures should not be caused by cache unless the cache is corrupted (then disable or clear cache for that job).

- **Playwright:** Path `~/.cache/ms-playwright` (on the runner: `/home/runner/.cache/ms-playwright`). Key: `${{ runner.os }}-ms-playwright-${{ hashFiles('pnpm-lock.yaml') }}` with restore-keys `${{ runner.os }}-ms-playwright-`. The workflow sets `PLAYWRIGHT_BROWSERS_PATH` to this path so the "Install Playwright browsers" step populates it and a11y uses it. Cache restores on hit; on miss, `pnpm exec playwright install --with-deps chromium` runs and the cache is saved at job end. This avoids re-downloading Chromium every run while keeping installs deterministic (lockfile-based key).

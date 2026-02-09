# CI Verify Topology

This document describes the GitHub Actions CI job topology, why it prevents timeout, how to run checks locally (in parallel vs exclusive), and which caches are used.

## 1. CI job topology

CI is split into three jobs instead of one monolith:

| Job             | Purpose                                                                 | Timeout | Runs                           |
| --------------- | ----------------------------------------------------------------------- | ------- | ------------------------------ |
| **verify-fast** | Format, lint, and all validators (no Next build, no Playwright)         | 20 min  | In parallel with `build`       |
| **build**       | `nx run web:build`, then restore-generated-typings and repo-clean check | 25 min  | In parallel with `verify-fast` |
| **a11y**        | `nx run web:a11y` (Playwright + axe); depends on `build`                | 25 min  | After `build` succeeds         |

### Why this prevents timeout

- The previous single job ran the full `web:verify` pipeline (format, lint, all validators, test, build, restore-generated-typings, a11y) in one runner. Build + a11y (which builds again and runs Playwright) could push the run over the default or practical timeout.
- Splitting allows:
  - **verify-fast** to finish in a bounded time (no heavy Next build or browser work).
  - **build** to run independently and fail fast if the app does not build or leaves the repo dirty.
  - **a11y** to run only after build succeeds, with its own timeout; Nx cache from `build` can make the inner build in `web:a11y` a cache hit.
- No gates are removed: the same checks run as before (format, lint, all validators, build, repo clean, a11y). Concurrency cancellation (see below) avoids wasted runs on the same branch.

### Concurrency

- **Group:** `ci-${{ github.workflow }}-${{ github.ref }}`
- **Cancel in progress:** `true`
- Effect: a new push to the same branch cancels any in-progress CI run for that branch.

## 2. Local workflow (what can run in parallel vs exclusive)

- **Can run in parallel (no shared mutable state):**
  - `nx format:check --all`
  - `nx run web:lint`
  - Any single validator: `nx run web:content-validate`, `nx run web:authority-program-validate`, etc.
  - These can be run in separate terminals or in a single script with `parallel: true` (as long as you don’t run two steps that modify the same file).

- **Should be exclusive / ordered locally:**
  - **Build** must complete before **a11y**, because `web:a11y` (via `tools/run-a11y.ts`) runs `nx build web` then `nx start web` and then Playwright. If you run `web:a11y` alone, it does the build itself; if you run full `web:verify`, run it once (build and a11y are already ordered in the verify command list).
  - **Restore-generated-typings** and **repo-clean** checks: run after build when you want to ensure the repo has no generated diffs (e.g. `next-env.d.ts`).

- **Full local verify (unchanged):**
  - `pnpm nx run web:verify --verbose` — runs format, lint, all validators, test, build, restore-generated-typings, a11y in sequence. Use this for a single “everything” check; CI does not run this monolith anymore but the script is unchanged.

## 3. Caches used and what they cover

| Cache          | Directory (or scope)                            | Key (concept)                                                                                                            | Used in jobs             |
| -------------- | ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | ------------------------ |
| **pnpm store** | `pnpm store path` (output of `pnpm store path`) | `${{ runner.os }}-pnpm-${{ hashFiles('pnpm-lock.yaml') }}`                                                               | verify-fast, build, a11y |
| **Nx**         | `.nx/cache`                                     | `${{ runner.os }}-nx-${{ hashFiles('pnpm-lock.yaml') }}` with `restore-keys: ${{ runner.os }}-nx-`                       | verify-fast, build, a11y |
| **Playwright** | `/home/runner/.cache/ms-playwright` (Linux)     | `${{ runner.os }}-ms-playwright-${{ hashFiles('pnpm-lock.yaml') }}` with `restore-keys: ${{ runner.os }}-ms-playwright-` | a11y only                |

- **pnpm store:** Speeds up `pnpm install --frozen-lockfile` across jobs.
- **Nx:** Speeds up Nx targets (e.g. build, lint, validators); build job can populate it and a11y job can reuse it for the inner `nx build web` in `web:a11y`.
- **Playwright:** Browser binaries so the a11y job does not re-download Chromium every run.

## 4. Relation to `ci:verify` and `web:verify`

- The **`ci:verify`** script (`pnpm install --frozen-lockfile && pnpm nx run web:verify --verbose`) is **unchanged**. It still runs the full pipeline locally or in any environment that calls it.
- The **GitHub Actions workflow** no longer runs that monolith; it runs the three jobs above so that verification does not time out while keeping all gates (format, lint, validators, build, repo clean, a11y).

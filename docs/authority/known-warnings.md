# Known Warnings

Version 1.0

This document records non-fatal warnings that may appear during `nx run web:verify` or related commands. They are tolerated by design; removal would require a defined change boundary.

---

## MaxListenersExceededWarning (Nx/tsx)

**What it is.** Node emits a warning when more than 11 listeners are added to the same event (e.g. `exit`, `SIGINT`, `SIGTERM`, `SIGHUP` on `process`). During verify, multiple Nx targets run tsx in sequence; each run can register listeners, and the process is long-lived, so the default limit is exceeded.

**Why tolerated.** The Nx/tsx execution model runs many small scripts in the same process. Increasing the listener count does not indicate a real leak in our code; it is a side effect of the pipeline structure. Fixing it would require either running each validator in a separate process (slower, more complex) or adjusting Node/Nx configuration project-wide.

**Change boundary to remove.** Run validators in isolated subprocesses (e.g. nx run-many with each validator as a separate task and no shared process), or set `process.setMaxListeners(n)` in a single, controlled entry point used by all validators. The latter is a minimal code change but must be applied consistently and documented.

---

## Next.js middleware deprecation notice

**What it is.** Next.js 16 warns that the "middleware" file convention is deprecated and recommends using "proxy" instead. The message points to the Next.js docs for migration.

**Why tolerated.** The current middleware implements locale routing and possibly other cross-cutting behavior. Migrating to the new "proxy" convention requires reading the new Next.js API, refactoring the middleware file, and verifying locale and routing behavior. Until that migration is scheduled, the warning is non-fatal and does not affect correctness.

**Change boundary to remove.** Refactor `apps/web` middleware to the new proxy convention per Next.js 16 documentation, then re-run verify and a11y to confirm behavior is unchanged.

---

## baseline-browser-mapping age notice

**What it is.** The `baseline-browser-mapping` package (or its data) prints a notice that the data in the module is over two months old and suggests `npm i baseline-browser-mapping@latest -D` for accurate Baseline data.

**Why tolerated.** The package is a devDependency used by the build or tooling. Updating it is a dependency and compatibility decision; the build and verify pipeline currently succeed. The notice is informational.

**Change boundary to remove.** Run `pnpm add -D baseline-browser-mapping@latest` (or equivalent) and re-run build and verify. If a major version bumps, check release notes for breaking changes and update any code that depends on the package.

---

## NO_COLOR / FORCE_COLOR Playwright env warning

**What it is.** During a11y (Playwright) runs, Node may emit: "The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set." Playwright or the test runner sets FORCE_COLOR for terminal output; some environments also set NO_COLOR to disable ANSI. The two conflict, and Node warns.

**Why tolerated.** The warning does not affect test results or a11y outcomes. Removing it would require coordinating environment variables in the Nx/Playwright configuration (e.g. unset FORCE_COLOR when NO_COLOR is set, or document that CI/local must not set both in a conflicting way). That touches the test runner or CI config.

**Change boundary to remove.** Adjust the a11y target or Playwright config so that FORCE_COLOR is not set when NO_COLOR is set (or vice versa), or standardize on one of the two in all environments. May require changes in project.json, playwright config, or CI.

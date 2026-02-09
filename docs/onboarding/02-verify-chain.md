# Module 02 — Verify chain

What the verify chain is, how to run it, and how to run individual validators. Required after any change that touches content, code, or config covered by the chain.

## Commands to run

**Full chain (local parity with CI):**

```bash
pnpm run ci:verify
```

Runs `pnpm install --frozen-lockfile` then `pnpm nx run web:verify --verbose`. Use before push when you want install + full verify.

```bash
nx run web:verify
```

Same as above minus the install step. Use when deps are already installed.

**Validate-only (no build, no a11y):**

```bash
nx run web:validate
```

Runs format:check, lint, and all `*-validate` targets in order; no clean, audit, test, build, restore, a11y. Defined in `apps/web/project.json` → `targets.validate`.

**Single validator (example):**

```bash
nx run web:content-validate
nx run web:i18n-validate
nx run web:sitemap-validate
nx run web:tokens-validate
```

Replace with any target from `apps/web/project.json` under `targets` whose name ends with `-validate`, or `security-validate`.

## Expected outputs

- **verify:** Sequential logs; clean step removes `apps/web/.next` if present; each validator prints success message (e.g. `Content validation passed.`); build completes; a11y runs last. Exit 0.
- **validate:** Same validator messages; no build or a11y. Exit 0.
- **Single validator:** One script output. Example: `nx run web:i18n-validate` → `i18n validation passed.` and exit 0.

## Failure modes and corrective actions

| Failure                                | Cause                                               | Corrective action                                                                                                                                                   |
| -------------------------------------- | --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Verify stops at a validator            | That validator threw or process.exit(1)             | Read the error (file path, key, or rule). Fix the underlying content/code; run `nx run web:<that-target>` until it passes, then re-run verify.                      |
| Verify passes locally, CI fails        | CI runs same steps but different env (e.g. no .env) | Set CI env vars in `.github/workflows/ci.yml` (e.g. NEXT_PUBLIC_SITE_URL, NEXT_PUBLIC_IDENTITY_SAME_AS). Ensure CI runs same validator set as `web:verify`.         |
| build step produces uncommitted files  | Generated files (e.g. next-env.d.ts)                | Verify includes `restore-generated-typings` after build to revert next-env.d.ts. If other generated files appear, add them to .gitignore or restore step.           |
| a11y step fails with “build not found” | a11y expects existing build                         | Verify runs build before a11y and uses SKIP_A11Y_BUILD=1. If you run a11y alone, run `nx run web:build` first or set SKIP_A11Y_BUILD=1 when a build already exists. |

## Verify targets to run

- After content/code/config changes: `nx run web:verify` (or `pnpm run ci:verify` from clean clone).
- After changing only one subsystem: run the relevant validator then full verify, e.g. `nx run web:i18n-validate && nx run web:verify`.
- Before opening a PR: `nx run web:verify` at least once on your branch.

## Documentation updates required

- When adding or removing a verify step: update [VERIFY.md](../../VERIFY.md) (steps list and order), [docs/audit/verify-targets-and-validators.md](../audit/verify-targets-and-validators.md), and [docs/quality-gates.md](../quality-gates.md). If CI is updated, update `.github/workflows/ci.yml` and VERIFY.md “CI jobs” section.

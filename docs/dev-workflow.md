# Dev workflow

Day-to-day commands for developing and validating the web app in this Nx monorepo. All commands assume you are in the repo root and use Node v20+. You can use **npm** or **pnpm** (repo has `packageManager: pnpm`; if `npm install` fails, see [Quality gates](quality-gates.md) Technical notes).

## Visual Authority System

When working on **evaluator-facing surfaces** (Executive Brief, Public Record index/entry, Case Studies index/entry), follow the [Visual Authority System](visual-authority-system.md). It defines typography, layout rhythm, evidence UI patterns, and interaction rules; deviations require documented justification. The spec aligns with [PGF](pgf.md) language governance and does not change verify order or gate behavior. Consult the spec before changing layout, typography, or interaction on those screens.

## Run all quality gates (recommended before PR)

```bash
nx run web:verify
```

Runs in order: lint → content-validate → governance-validate → i18n-validate → pgf-validate → intelligence-validate → content-os-validate → sitemap-validate → seo-validate → test → build → a11y. Stops on first failure. See [Quality gates](quality-gates.md) for details.

## Individual gates

- **Content validation** (MDX frontmatter, proofRefs, claims, artifacts, media):

  ```bash
  nx run web:content-validate
  ```

- **A11y** (Playwright + axe-core):

  ```bash
  nx run web:a11y
  ```

- **Build** (Next.js production build):
  ```bash
  nx run web:build
  ```
  Or use the root script: `pnpm build` (same as `nx build web`).

Other useful targets: `nx run web:lint`, `nx run web:i18n-validate`, `nx run web:pgf-validate`, `nx run web:content-os-validate`, `nx run web:test`. Full list is in [Quality gates](quality-gates.md).

## Development server

```bash
nx dev web
```

Or: `pnpm dev`.

## E2E and format

- E2E: `nx e2e web-e2e` (or `pnpm test:e2e`)
- Format check: `pnpm format:check`
- Format write: `pnpm format`

## Nx and Next.js output (distDir)

The web app uses a custom `distDir` in `apps/web/next.config.js` (multiple nested `.next` levels) so that the Nx build output matches what `next start` expects when run via `nx start web` from the project root. The exact level count is determined by how Nx/Next resolve the output path; see the comment in `next.config.js`. Do not change or remove `distDir` without verifying that `nx start web` and the a11y harness (`nx run web:a11y`) still find the build.

## Windows (PowerShell)

All of the above commands work in PowerShell. Content and i18n validation use `npx tsx`, which avoids PATH issues when `tsx` is installed as a devDependency.

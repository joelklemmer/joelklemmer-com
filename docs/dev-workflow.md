# Dev workflow

Day-to-day commands for developing and validating the web app in this Nx monorepo. All commands assume you are in the repo root and use Node v20+. You can use **npm** or **pnpm** (repo has `packageManager: pnpm`; if `npm install` fails, see [Quality gates](quality-gates.md) Technical notes).

## Run all quality gates (recommended before PR)

```bash
nx run web:verify
```

Runs in order: lint → content-validate → i18n-validate → test → build → a11y. Stops on first failure. See [Quality gates](quality-gates.md) for details.

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

Other useful targets: `nx run web:lint`, `nx run web:i18n-validate`, `nx run web:test`. Full list is in [Quality gates](quality-gates.md).

## Development server

```bash
nx dev web
```
Or: `pnpm dev`.

## E2E and format

- E2E: `nx e2e web-e2e` (or `pnpm test:e2e`)
- Format check: `pnpm format:check`
- Format write: `pnpm format`

## Windows (PowerShell)

All of the above commands work in PowerShell. Content and i18n validation use `npx tsx`, which avoids PATH issues when `tsx` is installed as a devDependency.

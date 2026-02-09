# Contributing

This document states workflow, guardrails, and PR expectations. It reflects the current process; follow it so changes pass the verify chain and match institutional standards.

## Prerequisites

- **Node:** ≥20.19.0 (see `package.json` engines). CI uses 20.19.0.
- **Package manager:** pnpm (canonical). Use `pnpm install` and `pnpm run <script>`.
- **Tasks:** Run via Nx (e.g. `nx run web:build`, `nx run web:verify`). See [README.md](README.md) and [VERIFY.md](VERIFY.md).

## Workflow

1. **Clone and install:** `pnpm install`
2. **Develop:** `pnpm dev` (runs `nx dev web`). Edit code and content under `apps/web`, `libs/`, `content/`, `libs/i18n/src/messages/`.
3. **Validate before pushing:** Run the full verify chain: `nx run web:verify`. For CI parity including frozen lockfile: `pnpm run ci:verify`. Fix any failing step before opening a PR.
4. **PR:** Ensure CI passes. All jobs (verify-fast, build, a11y, visual, lighthouse as configured) must succeed. Build must not produce uncommitted changes.

## Guardrails

- **Route pages** (`apps/web/src/app/**/page.tsx`): Keep under ~120 lines; no heavy inline JSX; delegate to `libs/screens` and `libs/sections`.
- **User-facing strings:** Only from next-intl (locale JSON) or MDX. No hardcoded copy in app or `libs/ui`.
- **Imports:** Apps may import only from `libs/*` and local files. Libs do not import from apps. Use library public APIs; avoid deep cross-lib imports.
- **Copy and tone:** Follow [docs/pgf.md](docs/pgf.md) and [docs/content-operating-system.md](docs/content-operating-system.md). No duplicate H1, lede, or primary CTA across core screens; no placeholder language in default locale. Run `nx run web:pgf-validate` and `nx run web:content-os-validate`; fix any reported errors.
- **Content and proof:** Public Record and proof entries follow [docs/public-record-subsystem.md](docs/public-record-subsystem.md) and [docs/public-record-doctrine.md](docs/public-record-doctrine.md). Claims and proofRefs must match the claims registry and content-validate.

## Verify chain

The single source of truth for the gate sequence is `apps/web/project.json` → `targets.verify.options.commands`. It runs clean, format check, audit, lint, all validators (security through authority-constitution, then telemetry-scoring-validate), test, build, restore generated typings, and a11y. Do not bypass or reorder steps. See [VERIFY.md](VERIFY.md) for the full list in execution order and failure meaning, and [docs/quality-gates.md](docs/quality-gates.md) for per-gate behavior.

## PR checklist

Before submitting:

- [ ] `pnpm install` (or `pnpm run ci:verify` for full parity) completed successfully.
- [ ] `nx run web:verify` passed (all steps green).
- [ ] No uncommitted changes after build (e.g. `next-env.d.ts` restored).
- [ ] New or changed user-facing copy passes `nx run web:pgf-validate` and `nx run web:content-os-validate`.
- [ ] New or changed content (MDX, proof, public record) passes `nx run web:content-validate`.
- [ ] Route pages remain thin; no new hardcoded user-facing strings in app or ui.

If you change the verify chain (add/remove a target or reorder): update `apps/web/project.json`, [VERIFY.md](VERIFY.md), and `.github/workflows/ci.yml` as needed, and document in [docs/quality-gates.md](docs/quality-gates.md).

## Documentation

- Root: [README.md](README.md), [ARCHITECTURE.md](ARCHITECTURE.md), [VERIFY.md](VERIFY.md), [AGENTS.md](AGENTS.md), this file.
- Subsystem and doctrine: `docs/` (pgf, content-operating-system, public-record-subsystem, public-record-doctrine, home-subsystem, quality-gates, etc.). When editing docs, keep them aligned with the current implementation and avoid aspirational or marketing language.

# joelklemmer-com

Nx monorepo for the JoelKlemmer.com platform: Next.js 16 (App Router), shared libraries, content in MDX, and a verify chain that gates all changes.

## Stack

- **Runtime:** Node ≥20.19.0 (see `package.json` engines)
- **Package manager:** pnpm (canonical; `packageManager` in package.json)
- **Build:** Nx 22 with `@nx/next`, `@nx/playwright`, `@nx/eslint`
- **App:** `apps/web` — Next.js 16, next-intl, MDX via next-mdx-remote
- **Content:** `content/` (MDX), `libs/i18n/src/messages/` (locale JSON)
- **Validation:** `tools/validate-*.ts` invoked as Nx targets on project `web` (see `apps/web/project.json`)

## Repository layout

| Path           | Role                                                                                                                       |
| -------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `apps/web`     | Next.js application; route pages under `src/app/[locale]/`                                                                 |
| `apps/web-e2e` | Playwright E2E, a11y, visual (presentation-integrity), interaction configs                                                 |
| `libs/*`       | Shared libraries (content, i18n, seo, screens, sections, ui, tokens, a11y, authority-\*, aec, etc.); apps import libs only |
| `content/`     | MDX: brief, case-studies, proof/public-record, frameworks, institutional, books, writing, press, operating-system          |
| `tools/`       | Validators and scripts; run via `nx run web:<target>`                                                                      |
| `docs/`        | Architecture, subsystem doctrine, PGF, Content OS, quality gates, audits                                                   |

Routes: `/`, `/brief`, `/work`, `/operating-system`, `/writing`, `/writing/[slug]`, `/contact`, `/press`, `/proof`, `/proof/[slug]`, `/publicrecord`, `/publicrecord/[slug]`, `/casestudies`, `/casestudies/[slug]`, `/books`, `/books/[slug]`, `/media`, `/media-kit`, `/bio`, `/faq`, `/now`, `/privacy`, `/terms`, `/accessibility`, `/security`.

## Guardrails

- **Route files** (`apps/web/src/app/**/page.tsx`): Thin; under ~120 lines; no heavy inline JSX. Composition in `libs/screens` and `libs/sections`.
- **Copy:** User-facing strings in `apps/web` and `libs/ui` come from next-intl or MDX; no hardcoded user-facing text.
- **Imports:** Apps may import only from `libs/*` and local files; libs do not import from apps. Use each library’s public API; avoid deep cross-lib dependency chains.
- **Governance:** PGF ([docs/pgf.md](docs/pgf.md)) and Content OS ([docs/content-operating-system.md](docs/content-operating-system.md)) govern tone, copy, page intent, and proof linkage. Enforced by `nx run web:pgf-validate` and `nx run web:content-os-validate`.

## Commands

Run tasks via Nx. From repo root:

| Action           | Command              | Nx equivalent                                                       |
| ---------------- | -------------------- | ------------------------------------------------------------------- |
| Install          | `pnpm install`       | —                                                                   |
| Dev server       | `pnpm dev`           | `nx dev web`                                                        |
| Production build | `pnpm build`         | `nx build web`                                                      |
| E2E tests        | `pnpm test:e2e`      | `nx e2e web-e2e`                                                    |
| Full verify      | `pnpm run ci:verify` | `pnpm install --frozen-lockfile` then `nx run web:verify --verbose` |

**Verify (full gate chain):** `nx run web:verify`. Source of truth: `apps/web/project.json` → `targets.verify.options.commands`. See [VERIFY.md](VERIFY.md) for order and failure meaning.

**Single validators (examples):** `nx run web:content-validate`, `nx run web:pgf-validate`, `nx run web:content-os-validate`, `nx run web:security-validate`, `nx run web:i18n-validate`. Full list in `apps/web/project.json` and [VERIFY.md](VERIFY.md).

## Documentation

| Document                                                             | Purpose                                                             |
| -------------------------------------------------------------------- | ------------------------------------------------------------------- |
| [ARCHITECTURE.md](ARCHITECTURE.md)                                   | Nx layering, thin route rule, module boundaries, PGF and Content OS |
| [VERIFY.md](VERIFY.md)                                               | Verify chain in execution order, failure meaning, CI jobs           |
| [AGENTS.md](AGENTS.md)                                               | Nx and agent execution rules, file scope, evidence, non-negotiables |
| [CONTRIBUTING.md](CONTRIBUTING.md)                                   | Workflow, guardrails, PR expectations                               |
| [docs/quality-gates.md](docs/quality-gates.md)                       | Per-gate behavior and run instructions                              |
| [docs/pgf.md](docs/pgf.md)                                           | Presentation Governance Framework (tone, copy, proof)               |
| [docs/content-operating-system.md](docs/content-operating-system.md) | Content OS rules and page intent                                    |
| [docs/public-record-doctrine.md](docs/public-record-doctrine.md)     | Public Record verification method and disclosure layers             |

## CI

`.github/workflows/ci.yml` runs jobs: **verify-fast** (format check, lint, validators, test), **build** (install, `nx run web:build`, restore `next-env.d.ts`, assert clean repo), **a11y** (needs build; `nx run web:a11y`), **visual** (needs build; `nx run web-e2e:visual`), **lighthouse** (install, build, `lhci autorun`). Verify-fast runs a subset of validators; local full chain is `nx run web:verify`. See [VERIFY.md](VERIFY.md).

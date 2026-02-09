# Agent execution model

This file defines how automated agents (AI assistants, bots, CI helpers) must operate in this repository. It includes Nx-specific rules (kept for automatic updates) and the institutional execution model.

<!-- nx configuration start-->
<!-- Leave the start & end comments to automatically receive updates. -->

## Nx

- When running tasks (build, lint, test, e2e, etc.), use Nx: `nx run <project>:<target>`, `nx run-many`, `nx affected`. Do not invoke the underlying tool directly when an Nx target exists.
- Use the Nx MCP server and its tools when available to answer questions about the workspace.
- For repository architecture questions, use the Nx workspace tool first.
- For a specific project, use the Nx project details tool to inspect structure and dependencies.
- For Nx configuration or best practices, use the Nx docs tool; do not assume undocumented behavior.
- For project graph or configuration errors, use the Nx workspace tool to retrieve errors.
- For plugin behavior, check `node_modules/@nx/<plugin>/PLUGIN.md` when present.

<!-- nx configuration end-->

## Truth sources

Architecture and behavior are defined by the codebase and by `docs/` (PGF, Content OS, subsystem docs, quality-gates). Do not introduce aspirational or “should” content that does not match current implementation. Documentation must state what **is**, not what “should” or “will” be.

## Verify chain

The gate for all changes is `nx run web:verify`. Agents must not suggest or apply changes that skip or reorder verify steps. New validators belong in `tools/` and in `apps/web/project.json`, and must be added to the verify target in the correct doctrinal order (see [VERIFY.md](VERIFY.md)).

## Layering and module boundaries

- **Apps import only from `libs/*` and local files.** No app imports from another app.
- **Libs do not import from apps.** No lib may `import` from `apps/web` or `apps/web-e2e`.
- **Cross-lib dependencies:** Use each library’s public API (exports in `libs/<name>/src/index.ts` or documented entry points). Avoid deep cross-lib dependency chains; keep dependencies explicit (e.g. sections may use ui, screens use sections/ui).
- **Path aliases:** Defined in `tsconfig.base.json` (e.g. `@joelklemmer/content`, `@joelklemmer/seo`, `@joelklemmer/screens`, `@joelklemmer/ui`, `@joelklemmer/i18n`, `@joelklemmer/tokens`, `@joelklemmer/a11y`, `@joelklemmer/sections`). The app uses `@/*` → `apps/web/*`.

## Thin route composer rule

- **Route pages** (`apps/web/src/app/**/page.tsx`): Keep under ~120 lines. No heavy inline JSX. Delegate composition to `libs/screens` and `libs/sections`.
- **Composition lives in libs:** Page-level composition in `libs/screens` (e.g. HomeScreen, BriefScreen, PublicRecordScreen). Section building in `libs/sections` (HeroSection, ListSection, FooterSection, etc.). Route files wire props and pass data only.

## Copy and content

User-facing strings come from next-intl (locale JSON in `libs/i18n/src/messages/<locale>/*.json`) or from MDX. Do not add hardcoded user-facing text in app or UI code. PGF and Content OS rules (tone, no duplicate H1/lede/CTA, no placeholders) are enforced by validators; edits to copy must pass `nx run web:pgf-validate` and `nx run web:content-os-validate`.

## PGF and Content OS as governance

- **PGF (Presentation Governance Framework):** Governs tone, copy, and proof linkage. Defined in [docs/pgf.md](docs/pgf.md). Enforced by `nx run web:pgf-validate` (`tools/validate-pgf.ts`).
- **Content OS (Content Operating System):** Governs proof-forward, evaluator-grade content, page intent, meta/CTA, and placeholder bans. Defined in [docs/content-operating-system.md](docs/content-operating-system.md). Enforced by `nx run web:content-os-validate` (`tools/validate-content-os.ts`).
- Both are governance sources; validators are the mechanical enforcement. Do not add copy or content that would fail these targets.

## Documentation edits

When updating root or subsystem docs, ensure they reflect the current repo: real paths, real targets, real validator names. Do not add marketing tone or unverified claims. Reference [ARCHITECTURE.md](ARCHITECTURE.md), [VERIFY.md](VERIFY.md), and [docs/quality-gates.md](docs/quality-gates.md) for canonical structure and verify order. All links in root docs must resolve to existing files.

## CI parity

Local “full check” is `pnpm run ci:verify` (install with frozen lockfile + `nx run web:verify`). Agents should not recommend removing or bypassing CI steps. Any new gate that must block merge must be added to both `web:verify` (in `apps/web/project.json`) and the CI workflow (`.github/workflows/ci.yml`).

---

## File scope rules (strict)

Agents must respect the following file and directory scope when proposing or applying changes.

| Scope            | Allowed                                                                                                                                                                         | Not allowed                                                                                                                              |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| **Root docs**    | Edit only: `README.md`, `ARCHITECTURE.md`, `VERIFY.md`, `AGENTS.md`, `CONTRIBUTING.md`.                                                                                         | Editing product code, `apps/*`, `libs/*`, `content/`, or other root files (e.g. `package.json`, `nx.json`) when the task is “docs only”. |
| **Product code** | `apps/web`, `apps/web-e2e`, `libs/*`, `content/`, `tools/*` (validators/scripts) when the task explicitly includes code changes.                                                | Changing product code when the task is “Only update the root doc files” or “documentation only”.                                         |
| **Validators**   | New or changed validators in `tools/validate-*.ts`; new targets in `apps/web/project.json`; updates to `VERIFY.md` and `.github/workflows/ci.yml` to keep chain and CI in sync. | Reordering or removing verify steps without updating all of: `project.json`, `VERIFY.md`, `ci.yml`, `docs/quality-gates.md`.             |
| **Links**        | Links that resolve to existing files under the repo (e.g. `docs/pgf.md`, `docs/quality-gates.md`).                                                                              | Broken links or links to files that do not exist.                                                                                        |

When in doubt: if the user specifies “only update root doc files” or “do not change product code,” restrict edits to the root documentation files listed above and do not modify `apps/`, `libs/`, `content/`, or tool scripts.

---

## Evidence requirements

- **Nx targets and commands:** When documenting commands or steps, use the exact target names and scripts that exist. Confirm targets in `apps/web/project.json` (e.g. `nx run web:verify`, `nx run web:pgf-validate`) and CI in `.github/workflows/ci.yml`. Do not document targets or scripts that are not present.
- **Verify order:** The single source of truth for verify order is `apps/web/project.json` → `targets.verify.options.commands`. Documentation must match that order.
- **Governance references:** PGF and Content OS are documented in `docs/pgf.md` and `docs/content-operating-system.md`. Reference these paths; do not invent or relocate governance docs.

---

## Non-negotiables

1. **Do not skip or reorder verify steps.** The sequence in [VERIFY.md](VERIFY.md) must match `apps/web/project.json`. Do not suggest bypassing format, lint, audit, or any validator.
2. **Do not add aspirational language to root or subsystem docs.** Use factual, present-tense descriptions of what the repo does and what exists.
3. **Do not add hardcoded user-facing strings** in app or UI code. All such strings come from `libs/i18n` or MDX.
4. **Do not introduce app→app or lib→app imports.** Layering is apps → libs only; libs never import from apps.
5. **Do not add links that do not resolve.** Before committing doc changes, ensure every linked path exists in the repo.
6. **Do not change product code** when the task restricts edits to root documentation.

Agents that generate code or docs must produce output that passes the verify chain and respects the guardrails in [README.md](README.md) and [CONTRIBUTING.md](CONTRIBUTING.md).

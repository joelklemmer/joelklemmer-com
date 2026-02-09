# Documentation Gap Report

**Produced:** Audit of existing docs vs. repo state (paths, Nx targets, CI). No speculative claims; evidence from file enumeration and comparison only.

---

## 1. Enumerated documentation

### 1.1 Root

| Document        | Exists | Role                                              |
| --------------- | ------ | ------------------------------------------------- |
| README.md       | Yes    | Repo overview, stack, layout, commands, doc index |
| ARCHITECTURE.md | Yes    | Nx layering, libs, subsystems, PGF/Content OS     |
| VERIFY.md       | Yes    | Verify chain steps and order, CI jobs             |
| CONTRIBUTING.md | Yes    | Workflow, guardrails, PR checklist                |
| AGENTS.md       | Yes    | Agent execution model, Nx rules                   |

### 1.2 docs/\*\* (non-audit)

| Path / pattern                | Count | Notes                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| ----------------------------- | ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| docs/\*.md (root)             | 28    | authority-\*, brief-subsystem, books-subsystem, case-studies-subsystem, ci-parity, contact-subsystem, content-operating-system, copy-decision-log, dev-workflow, home-subsystem, institutional-pages-subsystem, intelligence-layer, media-governance, media-publishing-checklist, page-intent-map, performance-optimization, pgf, program ref, proof ref, public-record-doctrine, public-record-subsystem, quality-gates, visual-authority-system, elite-hardening-report |
| docs/authority/\*.md          | 24    | Specs, parity, constitution, navigation, motion, theme, etc.                                                                                                                                                                                                                                                                                                                                                                                                              |
| docs/subsystems/\*.md         | 7     | 01–07: navigation, interaction, proof-density, authority-telemetry, intelligence-surface, performance-perception, media-governance                                                                                                                                                                                                                                                                                                                                        |
| docs/intelligence-layer/\*.md | 2     | extension-points, readiness-doctrine                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| docs/program/\*.md            | 1     | authority-platform-program                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| docs/proof/\*.md              | 2     | attachments-standard, sprint-2-implementation-report                                                                                                                                                                                                                                                                                                                                                                                                                      |
| docs/security/\*.md           | 3     | COOKIE-AUDIT, HEADERS-REPORT, SECURITY-HARDENING-SUMMARY                                                                                                                                                                                                                                                                                                                                                                                                                  |

### 1.3 docs/audit/\*\*

| Path                     | Notes                                                                                                           |
| ------------------------ | --------------------------------------------------------------------------------------------------------------- |
| docs/audit/\*.md         | duplication-fragmentation-map, platform-state-audit, simulated-language-evidence, verify-targets-and-validators |
| docs/audit/home/\*.md    | 12 files (agent reports, FINAL_REPORT, LOCKS, etc.)                                                             |
| docs/audit/perf/\*.md    | performance-perception-optimization.md, README.md                                                               |
| docs/audit/_.txt, _.json | evidence-\*.txt, nx-graph.json, nx-project-web.json                                                             |

### 1.4 Apps and libs READMEs

| Location                     | README present |
| ---------------------------- | -------------- |
| apps/web                     | No             |
| apps/web-e2e                 | No             |
| libs/a11y                    | Yes            |
| libs/aec                     | Yes            |
| libs/authority-density       | Yes            |
| libs/authority-mapping       | Yes            |
| libs/authority-orchestration | Yes            |
| libs/authority-signals       | Yes            |
| libs/authority-telemetry     | Yes            |
| libs/content                 | Yes            |
| libs/evaluator-mode          | Yes            |
| libs/intelligence            | Yes            |
| libs/screens                 | Yes            |
| libs/sections                | Yes            |
| libs/seo                     | Yes            |
| libs/tokens                  | Yes            |
| libs/ui                      | Yes            |

### 1.5 Tools

| Location | README present                     |
| -------- | ---------------------------------- |
| tools/   | No (no tools/\*\*/README.md found) |

---

## 2. Coverage matrix

| Category             | Covered by                                                                                                                                          | Gaps                                                                               |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| **Root governance**  | README, ARCHITECTURE, VERIFY, CONTRIBUTING, AGENTS                                                                                                  | All five present; VERIFY and README list validators that CI does not run (see §4). |
| **Doctrine docs**    | public-record-doctrine, authority-telemetry-doctrine, intelligence-layer/readiness-doctrine, PGF (pgf.md), Content OS (content-operating-system.md) | —                                                                                  |
| **Subsystem docs**   | docs/subsystems/01–07, plus docs/\*-subsystem.md (home, brief, books, case-studies, contact, institutional-pages, public-record)                    | Subsystem numbering (01–07) vs. flat \*-subsystem.md; no single index.             |
| **Runtime docs**     | authority-telemetry.md, presentation-integrity-runtime-map, performance-optimization, dev-workflow                                                  | quality-gates and dev-workflow verify lists incomplete.                            |
| **Development docs** | CONTRIBUTING, dev-workflow, quality-gates                                                                                                           | quality-gates overview table missing many validators.                              |
| **Library READMEs**  | All 16 libs under libs/ have README.md                                                                                                              | —                                                                                  |
| **Tool READMEs**     | None                                                                                                                                                | No tools/ README; validator list only in VERIFY.md and audit.                      |

---

## 3. Stale content: doc claims vs. repo

### 3.1 Nx targets (apps/web/project.json)

- **Verify target:** Contains, in order, security-validate → … → authority-constitution-validate → telemetry-scoring-validate → test → build → restore-generated-typings → a11y. Includes **briefing-contracts-validate** and **telemetry-scoring-validate**.
- **CI (.github/workflows/ci.yml) verify-fast job:** Runs security-validate through authority-constitution-validate, then test. Does **not** run **briefing-contracts-validate** or **telemetry-scoring-validate**.
- **Evidence:** Grep of ci.yml for `nx run web:` shows no `briefing-contracts-validate` or `telemetry-scoring-validate`.

### 3.2 README.md CI description

- README states CI runs “briefing-contracts” among validators. CI does not run that target. Stale.

### 3.3 VERIFY.md

- Lists steps 1–34 including step 11 (briefing-contracts-validate) and step 30 (authority-constitution-validate); does not list telemetry-scoring-validate as a numbered step. project.json verify commands include telemetry-scoring-validate after authority-constitution-validate. VERIFY.md step list and CI job list are out of sync with CI implementation (CI omits two validators).

### 3.4 docs/audit/verify-targets-and-validators.md

- Validator table omits **briefing-contracts-validate** and **telemetry-scoring-validate**. Both exist as targets in apps/web/project.json and run in web:verify.

### 3.5 docs/quality-gates.md

- Overview table lists: Format, Lint, Content validate, Governance validate, i18n, PGF, Intelligence, Content OS, Sitemap, SEO, Test, Build, A11y, E2E. It does **not** list: security-validate, briefing-contracts-validate, authority-signals-validate, experience-intelligence-validate, frameworks-validate, aec-validate, orchestration-validate, home-validate, image-sitemap-validate, media-manifest/derivatives/authority/governance-validate, visual-contract-validate, tokens-validate, token-drift-validate, authority-program-validate, authority-constitution-validate, telemetry-scoring-validate. So the “overview” is incomplete.

### 3.6 docs/dev-workflow.md

- States verify runs: “lint → content-validate → governance-validate → i18n-validate → pgf-validate → intelligence-validate → content-os-validate → sitemap-validate → seo-validate → test → build → a11y”. Omits security-validate and all validators between intelligence-validate and content-os-validate (briefing-contracts, authority-signals, experience-intelligence, frameworks, aec, orchestration, home), image-sitemap-validate, all media validators, visual-contract, seo, tokens, token-drift, authority-program, authority-constitution, telemetry-scoring. Stale/incomplete.

### 3.7 E2E target (web-e2e)

- **apps/web-e2e/project.json** defines only: **a11y**, **visual**, **interaction**. No target named **e2e**.
- **package.json** script: `"test:e2e": "nx e2e web-e2e"`. That invokes the **e2e** target on web-e2e, which does not exist. Command will fail unless Nx provides a default e2e target for the project; schema default for new projects is "e2e" but this project has no e2e target defined.
- **docs/quality-gates.md** and **docs/dev-workflow.md** reference `nx e2e web-e2e` / `pnpm test:e2e`. If the intended behavior is to run a specific suite, the doc should reference the actual target (e.g. visual or interaction).

### 3.8 Paths and files

- **docs/authority-telemetry.md**, **docs/subsystems/04-authority-telemetry.md:** Reference `apps/web/src/lib/telemetry/`. **Confirmed:** directory exists with BriefOpenTracker, CaseStudyEngagementTracker, RouteViewTracker, index.ts.
- **docs/authority/navigation, docs/subsystems/01-navigation-cognition:** Reference `PRIMARY_NAV_ENTRIES` in `libs/sections/src/lib/navigation/primaryNavConfig.ts`. **Confirmed:** file exists and exports PRIMARY_NAV_ENTRIES.
- **docs/public-record-subsystem.md:** References `content/public-record/*.mdx`, `content/proof/*.mdx`, `apps/web/public/proof/manifest.json`, `libs/content/src/lib/claims.ts`. **Confirmed:** paths exist.

---

## 4. Missing or duplicated docs

### 4.1 Missing

- **apps/web/README.md** — No app-level overview or run instructions.
- **apps/web-e2e/README.md** — No description of a11y/visual/interaction targets or configs.
- **tools/README.md** — No overview of tools/ (validators and scripts); only VERIFY.md and audit doc list them.

### 4.2 Overlap / duplication

- **authority-telemetry** — docs/authority-telemetry.md vs. docs/subsystems/04-authority-telemetry.md (same scope; one is doctrine/spec, one is subsystem doctrine).
- **media-governance** — docs/media-governance.md vs. docs/subsystems/07-media-governance.md.
- **intelligence** — docs/intelligence-layer.md, docs/subsystems/05-intelligence-surface.md, docs/intelligence-layer/ (extension-points, readiness-doctrine).
- **performance** — docs/performance-optimization.md vs. docs/subsystems/06-performance-perception.md.

Not treated as defects: public-record-doctrine vs. public-record-subsystem are intentionally split (doctrine vs. subsystem).

---

## 5. Ranked list of doc defects

### P0 — Drift risks (CI/verify/commands wrong or broken)

| #   | Defect                                                                                                                                                          | Evidence                                                                                                      |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| 1   | **CI verify-fast omits two validators** that run in `web:verify`: **briefing-contracts-validate**, **telemetry-scoring-validate**. Local verify and CI diverge. | apps/web/project.json verify commands include both; .github/workflows/ci.yml verify-fast does not run either. |
| 2   | **README claims CI runs “briefing-contracts”** among validators; CI does not.                                                                                   | README.md “CI” bullet; grep of ci.yml.                                                                        |
| 3   | **`nx e2e web-e2e` / `pnpm test:e2e`** reference target **e2e** on web-e2e; project defines only **a11y**, **visual**, **interaction**. Command may fail.       | apps/web-e2e/project.json; package.json script test:e2e.                                                      |

### P1 — Authority risks (canonical lists wrong or incomplete)

| #   | Defect                                                                                                                                                                                                                                                                                                                                  | Evidence                                                         |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| 4   | **VERIFY.md** step list and CI job description do not match CI: CI omits briefing-contracts-validate and telemetry-scoring-validate. VERIFY.md does not list telemetry-scoring as a numbered step.                                                                                                                                      | VERIFY.md steps 1–34; project.json verify; ci.yml.               |
| 5   | **docs/audit/verify-targets-and-validators.md** validator table missing **briefing-contracts-validate** and **telemetry-scoring-validate**.                                                                                                                                                                                             | Table in that file; project.json targets.                        |
| 6   | **docs/quality-gates.md** overview table lists only a subset of gates; missing security, briefing-contracts, authority-signals, experience-intelligence, frameworks, aec, orchestration, home, image-sitemap, all media validators, visual-contract, tokens, token-drift, authority-program, authority-constitution, telemetry-scoring. | quality-gates.md table vs. project.json verify commands.         |
| 7   | **docs/dev-workflow.md** verify step list is a short, incomplete subset of actual verify order.                                                                                                                                                                                                                                         | dev-workflow.md “Run all quality gates” vs. project.json verify. |

### P2 — Completeness

| #   | Defect                                                                                                                   | Evidence                                  |
| --- | ------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------- |
| 8   | **No apps/web README** — App purpose and run/build not documented at app level.                                          | No README in apps/web.                    |
| 9   | **No apps/web-e2e README** — E2E targets (a11y, visual, interaction) and configs not described at app level.             | No README in apps/web-e2e.                |
| 10  | **No tools/ README** — No single doc listing validators and scripts under tools/ with brief purpose.                     | No README in tools/.                      |
| 11  | **Subsystem index** — No single doc that lists all subsystem docs (01–07 + \*-subsystem.md) and their roles.             | Multiple places (subsystems/, docs root). |
| 12  | **quality-gates.md** — Deeper gate descriptions may exist for some validators; overview table is incomplete (see P1 #6). | Table vs. full verify list.               |

---

## 6. Summary

- **Root governance:** All five root docs present; README and VERIFY out of sync with CI (P0).
- **Doctrine/subsystem:** Present with some overlap between root-level docs and docs/subsystems/ (authority-telemetry, media-governance, intelligence, performance).
- **Stale content:** CI vs. verify (two validators missing in CI); README CI list; verify-targets-and-validators table; quality-gates and dev-workflow verify lists incomplete; e2e target reference.
- **Missing:** apps/web and apps/web-e2e READMEs; tools/ README; optional subsystem index.
- **Defects:** 3 P0 (CI/verify/command drift), 4 P1 (authority/completeness of canonical lists), 5 P2 (missing docs/completeness).

No changes were made to any docs outside `docs/audit/`. This report is additive under `docs/audit/documentation-gap-report.md`.

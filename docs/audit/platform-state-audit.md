# Platform State Audit — Truth Report

**Mission:** Provable Platform State Audit for JoelKlemmer.com. No product behavior changed.  
**Deliverable:** This report + supporting evidence logs in `docs/audit/`.  
**Date:** 2025-02-08.

---

## P0 Escalation: Stub in authority-critical subsystem

**Finding:** Rate limiting in the global request path is a **stub**. Middleware calls it; stub always returns success, so 429 is never returned.

| Item   | Evidence                                                                                                                                                                 |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| File   | `apps/web/src/lib/rateLimit.ts`                                                                                                                                          |
| Code   | Lines 2–3: "Rate limiting middleware stub." "Enterprise placeholder: wire to a store …"                                                                                  |
| Code   | Lines 18–21: `return { success: true, remaining: Number.POSITIVE_INFINITY };`                                                                                            |
| Wiring | `apps/web/src/middleware.ts`: `import { rateLimit } from './lib/rateLimit';` … `const limit = rateLimit(request); if (!limit.success) return new NextResponse(..., 429)` |
| Doc    | `docs/security/SECURITY-HARDENING-SUMMARY.md` — documents stub and middleware usage                                                                                      |

**Action:** Stop and escalate; do not treat as production-ready rate limiting until replaced with a real implementation.

---

## 1. Nx project inventory and dependency topology

**Command run:**  
`pnpm nx show projects`  
**Output (evidence):** project list below.  
**Graph:** `pnpm nx graph --file=docs/audit/nx-graph.json` → `docs/audit/nx-graph.json`.

### 1.1 Projects (18)

| Project                 | Type | Root                         |
| ----------------------- | ---- | ---------------------------- |
| authority-orchestration | lib  | libs/authority-orchestration |
| authority-telemetry     | lib  | libs/authority-telemetry     |
| authority-density       | lib  | libs/authority-density       |
| authority-mapping       | lib  | libs/authority-mapping       |
| authority-signals       | lib  | libs/authority-signals       |
| evaluator-mode          | lib  | libs/evaluator-mode          |
| intelligence            | lib  | libs/intelligence            |
| sections                | lib  | libs/sections                |
| content                 | lib  | libs/content                 |
| screens                 | lib  | libs/screens                 |
| web-e2e                 | e2e  | apps/web-e2e                 |
| tokens                  | lib  | libs/tokens                  |
| a11y                    | lib  | libs/a11y                    |
| i18n                    | lib  | libs/i18n                    |
| aec                     | lib  | libs/aec                     |
| seo                     | lib  | libs/seo                     |
| web                     | app  | apps/web                     |
| ui                      | lib  | libs/ui                      |

### 1.2 Dependency topology (evidence: docs/audit/nx-graph.json → graph.dependencies)

**web** depends on: screens, i18n, evaluator-mode, authority-orchestration, authority-mapping, intelligence, aec, ui, a11y, authority-density, authority-telemetry, sections, content, seo.

**screens** depends on: i18n, content, sections, seo, a11y, authority-density, evaluator-mode, authority-mapping, authority-signals, authority-orchestration, aec, intelligence, ui.

**sections** depends on: a11y, aec, ui, authority-density.

**content** depends on: i18n.

**intelligence** depends on: content, authority-signals.

**aec** depends on: intelligence, authority-orchestration, authority-signals, evaluator-mode.

**seo** depends on: i18n.

**ui** depends on: a11y, i18n.

**authority-orchestration** depends on: evaluator-mode.

**authority-density** depends on: a11y.

**authority-mapping** depends on: authority-signals.

**web-e2e** depends on: web, i18n, content.

**authority-telemetry, authority-signals, evaluator-mode, tokens, a11y, i18n:** no lib dependencies (roots).

---

## 2. Verify targets and validators

**Evidence log:** `docs/audit/verify-targets-and-validators.md`.  
**Source of truth:** `apps/web/project.json` (targets), `package.json` (ci:validate, ci:verify), `.github/workflows/ci.yml`.

### 2.1 Verify target

- **Command:** `pnpm run ci:verify` → `pnpm install --frozen-lockfile && pnpm nx run web:verify --verbose`
- **Definition:** `apps/web/project.json` → targets.verify (sequential: rm .next, format:check, audit, lint, security-validate, then all \*-validate, test, build, restore next-env.d.ts, a11y).

### 2.2 Validators (what they validate; what causes failure)

| Validator                        | Validates                                     | Fails when                                 |
| -------------------------------- | --------------------------------------------- | ------------------------------------------ |
| security-validate                | .well-known/security.txt (Contact, Expires)   | Missing/invalid file or Expires not future |
| content-validate                 | Content frontmatter, slugs, refs              | Content validation errors                  |
| governance-validate              | Governance rules                              | Governance validation errors               |
| i18n-validate                    | Message keys, structure                       | i18n validation errors                     |
| pgf-validate                     | PGF (headings, CTAs)                          | PGF validation errors                      |
| intelligence-validate            | Entity graph, semantic index                  | Graph/index errors (exit 1)                |
| authority-signals-validate       | Entity→signals, entropy, topology             | Load or mapping errors (exit 1)            |
| experience-intelligence-validate | Experience/intelligence surface               | Validation errors (exit 1)                 |
| frameworks-validate              | Framework content                             | Validation errors (exit 1)                 |
| aec-validate                     | AEC (brief) panels/intent                     | AEC validation errors (exit 1)             |
| orchestration-validate           | Authority orchestration                       | Orchestration errors (exit 1)              |
| content-os-validate              | Content OS meta/CTA, no placeholder copy      | Content OS validation errors               |
| home-validate                    | Home: no placeholder, H1, links, outline, PGF | Home validation errors                     |
| sitemap-validate                 | Sitemap URLs, required set, no duplicates     | Sitemap validation errors                  |
| image-sitemap-validate           | Image sitemap count/fields/files              | Image sitemap validation errors            |
| media-manifest-validate          | Manifest completeness, sitemap eligibility    | Manifest errors                            |
| media-derivatives-validate       | Media derivatives                             | Validation errors                          |
| media-authority-validate         | Tier C not sitemap-eligible, authority rules  | Media authority errors                     |
| visual-contract-validate         | Visual contract                               | Validation errors                          |
| seo-validate                     | JSON-LD, sameAs, meta                         | SEO validation errors                      |
| tokens-validate                  | Token file, required tokens (25)              | Missing file or tokens                     |
| token-drift-validate             | No literal/non-token colors in components     | Token drift violations                     |
| authority-program-validate       | Program doc, required block, sitemap outputs  | Missing/invalid program                    |
| authority-constitution-validate  | Authority constitution                        | Constitution errors (exit 1)               |
| test                             | (no-op)                                       | Never                                      |

**Sample evidence:**

- `pnpm nx run web:security-validate` → `docs/audit/evidence-security-validate.txt` ("security.txt: valid …").
- `pnpm nx run web:tokens-validate` → `docs/audit/evidence-tokens-validate.txt` ("Token completeness passed: 25 required tokens present.").

---

## 3. Subsystem audit (runtime entrypoints, trigger/observe, CI/verify, docs, verdict)

### 3.1 Navigation

| Item                | Evidence                                                                                                                                                                               |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Runtime entrypoints | `apps/web/src/app/[locale]/layout.tsx` — builds navItems from `getTranslations('nav')`; Shell/Header/Nav from `@joelklemmer/ui`. Routes: /, /brief, /work, /writing, /proof, /contact. |
| Components          | `libs/ui/src/lib/Nav.tsx`, `libs/ui/src/lib/Header.tsx`, `libs/ui/src/lib/Shell.tsx`.                                                                                                  |
| Trigger/observe     | Load any locale route; header and nav render; switch locale via LanguageSwitcherPopover.                                                                                               |
| CI/verify           | No dedicated nav validator. E2E (visual, a11y) hit routes. Lint on web + ui.                                                                                                           |
| Docs                | `docs/audit/home/nav-language-system.md`, `docs/authority/masthead-spec.md`.                                                                                                           |
| **Verdict**         | **REAL** — nav from i18n and layout; RTL/locale from next-intl + i18n.                                                                                                                 |

### 3.2 Interaction micro-physics (theme, density, A11y)

| Item                | Evidence                                                                                                                               |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Runtime entrypoints | Layout: ThemeProvider, ContrastProvider, AccessibilityPanel, DensityViewProvider (authority-density). ThemeToggle, ACPProvider (a11y). |
| Components          | `libs/ui/src/lib/ThemeToggle.tsx`, `libs/ui/src/lib/AccessibilityPanel.tsx`; density from `@joelklemmer/authority-density`.            |
| Trigger/observe     | Toggle theme; open accessibility panel; change density view.                                                                           |
| CI/verify           | web:a11y (Playwright + axe); token-drift-validate; visual E2E (theme-prepaint, responsive-layout).                                     |
| Docs                | `docs/authority/theme-spec.md`, `docs/audit/home/theme-a11y-system.md`, `docs/authority/responsiveness-constitution.md`.               |
| **Verdict**         | **REAL** — theme and a11y wired; density provider in layout.                                                                           |

### 3.3 Proof density / proof pipeline

| Item                | Evidence                                                                                                                                                                                                                                               |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Runtime entrypoints | Routes: `apps/web/src/app/[locale]/proof/page.tsx`, `[locale]/proof/[slug]/page.tsx` (ProofScreen, ProofEntryScreen). Brief: claim→proof map in `libs/content/src/lib/briefing-contracts.ts`; proof manifest in `libs/content/src/lib/proof-files.ts`. |
| Content             | content/public-record or content/proof (MDX); slugs from libs/content/sitemap-data.ts and content.ts.                                                                                                                                                  |
| Trigger/observe     | Visit /proof, /proof/[slug]; open brief and see proof links.                                                                                                                                                                                           |
| CI/verify           | content-validate, intelligence-validate, authority-signals-validate, sitemap-validate (proof URLs). tools/verify-proof-attachments.ts exists.                                                                                                          |
| Docs                | `docs/proof/attachments-standard.md`, `docs/authority/proof-density-roadmap.md`, `libs/content/src/lib/briefing-contracts.ts`.                                                                                                                         |
| **Verdict**         | **REAL** — proof/public record rendered from content; brief uses claim→proof map; validators cover content and sitemap.                                                                                                                                |

### 3.4 Telemetry

| Item                | Evidence                                                                                                                                                                                                       |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Runtime entrypoints | `apps/web/src/app/[locale]/layout.tsx` — TelemetryProvider from `@joelklemmer/authority-telemetry`. `CaseStudyEngagementTracker` on casestudies/[slug]; RouteViewTracker in layout; BriefOpenTracker on brief. |
| Backend             | `libs/authority-telemetry/src/lib/provider.ts` — noOpProvider (events dropped). Default: no send.                                                                                                              |
| Trigger/observe     | Visit case study, brief, or route; events invoked; no network send (no-op). useTelemetryDebugLog for in-memory events.                                                                                         |
| CI/verify           | No dedicated telemetry validator. Lint on authority-telemetry.                                                                                                                                                 |
| Docs                | `docs/authority-telemetry.md`, `libs/authority-telemetry/INTEGRATION.md`.                                                                                                                                      |
| **Verdict**         | **PARTIAL** — API and event flow REAL; backend INERT (no-op). Not mock; designed pluggable.                                                                                                                    |

### 3.5 Intelligence surface (entity graph, semantic index, brief)

| Item                | Evidence                                                                                                                                                                                                      |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Runtime entrypoints | Brief: `apps/web/src/app/[locale]/brief/actions.ts` — getEntityGraph, buildSemanticIndex from `@joelklemmer/intelligence`; surfacePriorityMatrix (orchestration); authority-mapping. BriefScreen, AEC panels. |
| Components          | Screens use intelligence for brief; sections use AEC/orchestration.                                                                                                                                           |
| Trigger/observe     | Submit brief form; server action builds graph/index and responds.                                                                                                                                             |
| CI/verify           | intelligence-validate, authority-signals-validate, aec-validate, orchestration-validate.                                                                                                                      |
| Docs                | `docs/intelligence-layer.md`, `docs/authority/home-signal-map.md`.                                                                                                                                            |
| **Verdict**         | **REAL** — graph and index used in brief; validators enforce graph and mapping.                                                                                                                               |

### 3.6 Performance perception

| Item            | Evidence                                                                                                                              |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Runtime         | Next.js app; LCP/CLS/INP via real user or Lighthouse.                                                                                 |
| CI              | `.github/workflows/ci.yml` — lighthouse job: build then `pnpm exec lhci autorun --config=./lighthouserc.cjs`.                         |
| Assertions      | `lighthouserc.cjs`: performance ≥ 0.7, accessibility ≥ 0.9, LCP &lt; 1.8s, CLS ≤ 0.05, INP &lt; 200ms, TBT &lt; 300ms, FCP &lt; 1.8s. |
| Trigger/observe | Run lhci autorun; reports in tmp/lighthouse.                                                                                          |
| Docs            | `docs/performance-optimization.md`, `tools/lighthouse-budget-stub.ts` (invokes real lhci).                                            |
| **Verdict**     | **REAL** — Lighthouse CI runs against built app with real assertions.                                                                 |

### 3.7 Media authority

| Item                | Evidence                                                                                                                                             |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Runtime entrypoints | `apps/web/src/app/[locale]/media/page.tsx` — MediaLibraryScreen. `libs/content` media manifest, tiers, isMediaSitemapEligible; sitemap-images route. |
| Trigger/observe     | Visit /media; request /sitemap-images.                                                                                                               |
| CI/verify           | media-manifest-validate, media-derivatives-validate, media-authority-validate, image-sitemap-validate.                                               |
| Docs                | `docs/media-publishing-checklist.md`, `libs/content/src/lib/media.ts`.                                                                               |
| **Verdict**         | **REAL** — media page and image sitemap; validators enforce manifest and authority rules.                                                            |

### 3.8 Tokens

| Item        | Evidence                                                                                           |
| ----------- | -------------------------------------------------------------------------------------------------- |
| Runtime     | `libs/tokens` — design tokens; Tailwind/theme consume.                                             |
| CI/verify   | tokens-validate (required tokens present), token-drift-validate (no literal colors in components). |
| **Verdict** | **REAL** — tokens used; CI enforces completeness and no drift.                                     |

### 3.9 A11y

| Item        | Evidence                                                                            |
| ----------- | ----------------------------------------------------------------------------------- |
| Runtime     | ACPProvider, AccessibilityPanel, contrast/theme; axe not at runtime (dev/CI).       |
| CI/verify   | web:a11y (tools/run-a11y.ts — Playwright + @axe-core/playwright); E2E a11y.spec.ts. |
| **Verdict** | **REAL** — a11y in layout and components; CI runs axe.                              |

### 3.10 i18n

| Item        | Evidence                                                                                                                               |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Runtime     | next-intl; getMessages, getTranslations; libs/i18n (locales, defaultLocale, loadMessages). Layout and screens use t()/getTranslations. |
| CI/verify   | i18n-validate (keys, structure, blocklisted placeholder copy). E2E i18n-overflow, i18n-rtl-stress.                                     |
| **Verdict** | **REAL** — i18n wired; validators and E2E cover messages and RTL.                                                                      |

### 3.11 SEO

| Item        | Evidence                                                                                              |
| ----------- | ----------------------------------------------------------------------------------------------------- |
| Runtime     | sitemap.ts, robots.ts, sitemap-images route; metadata/JSON-LD from screens and libs/seo.              |
| CI/verify   | seo-validate, sitemap-validate, image-sitemap-validate; authority-program-validate (sitemap outputs). |
| **Verdict** | **REAL** — routes and metadata; validators enforce structure and required URLs.                       |

### 3.12 Content OS

| Item        | Evidence                                                               |
| ----------- | ---------------------------------------------------------------------- |
| Runtime     | operating-system page; content from libs/content; meta/CTA in screens. |
| CI/verify   | content-os-validate (meta/CTA, no placeholder in default-locale copy). |
| Docs        | `docs/content-operating-system.md`.                                    |
| **Verdict** | **REAL** — content and validators enforce Content OS rules.            |

### 3.13 Proof pipeline (content → proof pages)

| Item        | Evidence                                                                                                                                                      |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Runtime     | Proof list/detail from content (public-record or proof MDX); brief proof links from briefing-contracts; proof manifest (files) from libs/content/proof-files. |
| CI/verify   | content-validate, sitemap-validate (proof URLs), verify-proof-attachments.                                                                                    |
| **Verdict** | **REAL** — proof content and manifest used; validators cover content and sitemap.                                                                             |

---

## 4. Duplication and fragmentation

**Evidence log:** `docs/audit/duplication-fragmentation-map.md`.

Summary:

- **Sitemap:** Single builder (libs/seo); slug/eligibility in libs/content; no duplicate implementations.
- **Content root:** Resolved in multiple tools and in content lib; no single exported root constant.
- **Authority:** Five libs (signals, mapping, density, orchestration, telemetry); fragmented by concern, no file-level duplication.
- **Validation:** 24+ tools/validate-\*.ts; core rules in libs (content/validate, intelligence/validate, authority-mapping); tools call into libs.

---

## 5. Simulated language / inert wiring

**Evidence log:** `docs/audit/simulated-language-evidence.md`.

- **P0:** Rate limit stub in middleware (see escalation above).
- **Telemetry:** Default backend no-op; API real, send inert.
- **Placeholder in copy:** Validators (home, content-os) blocklist placeholder text; AEC/UI use "placeholder" as UX/key only.
- **No simulated language** found in user-facing copy; validators enforce absence.

---

## 6. Evidence file index

| File                                        | Purpose                                             |
| ------------------------------------------- | --------------------------------------------------- |
| docs/audit/nx-graph.json                    | Nx project graph and dependency edges               |
| docs/audit/nx-project-web.json              | nx show project web --json                          |
| docs/audit/evidence-security-validate.txt   | Output of nx run web:security-validate              |
| docs/audit/evidence-tokens-validate.txt     | Output of nx run web:tokens-validate                |
| docs/audit/verify-targets-and-validators.md | All verify targets and validator failure conditions |
| docs/audit/duplication-fragmentation-map.md | Duplication/fragmentation map with file paths       |
| docs/audit/simulated-language-evidence.md   | Stub/placeholder/mock evidence and P0 escalation    |

---

## 7. Commands run (reproducibility)

```
pnpm nx show projects
pnpm nx graph --file=docs/audit/nx-graph.json
pnpm nx show project web --json  → docs/audit/nx-project-web.json
pnpm nx run web:security-validate  → docs/audit/evidence-security-validate.txt
pnpm nx run web:tokens-validate   → docs/audit/evidence-tokens-validate.txt
```

All claims in this report are backed by the above evidence files or by explicit file paths and code references in the report. Where a claim could not be proven, it is marked UNKNOWN; the only P0 finding is the rate-limit stub in middleware.

**End of report.**

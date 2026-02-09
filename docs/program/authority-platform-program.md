# Authority Platform Program

Institutional-grade platform program for JoelKlemmer.com. Bounded increments, verifiable gates, no system left behind.

---

## 1. Subsystem Inventory

### A. Media Governance & Lifecycle

| Aspect                | Current state                                                                                                                    | Missing / risks                                                                                 | Completion criteria                                                                        |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| **Manifest**          | `apps/web/public/media/manifest.json`; schema in `libs/content/src/lib/media.ts`; `getMediaManifest()`, tier/visibility helpers. | Tier C may still exist in repo; no automated prune.                                             | Tier C absent from public media; prune tool produces report and updates manifest.          |
| **Governance policy** | `docs/media-publishing-checklist.md` (asset rules, naming, alt).                                                                 | No explicit "media governance policy" doc for lifecycle/tiers.                                  | Policy doc exists; validator enforces presence.                                            |
| **Lifecycle tools**   | `tools/ingest-media.ts`, `tools/apply-media-overrides.ts`, `tools/prune-media-tier-c.ts`, `tools/media-authority-classifier.ts`. | `prune-media.ts` (program) not yet created; no PRUNE REPORT or `media-prune-log.json` contract. | `tools/prune-media.ts` exists; produces PRUNE REPORT; writes `tools/media-prune-log.json`. |

**Files/targets:** `libs/content/src/lib/media.ts`, `tools/validate-media-manifest.ts`, `tools/validate-media-authority.ts`, `apps/web/public/media/manifest.json`.

---

### B. Media Performance & Delivery

| Aspect            | Current state                                                                                               | Missing / risks                                                                  | Completion criteria                                                                               |
| ----------------- | ----------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| **Thumbnails**    | `getMediaThumbPath()` in content lib; MediaLibraryClient uses thumb with master fallback; hardcoded 96×125. | No size tokens; thumbs may be too large; list must never load master by default. | `--media-thumb-size` tokens (56/64/72); list uses thumb derivative only; master only on fallback. |
| **Cache headers** | `next.config.js`: `/media/:path*` has `max-age=31536000, immutable`.                                        | —                                                                                | Verified by deployment hardening checks.                                                          |
| **Derivatives**   | Convention: `base.webp` → `base__thumb.webp` (and card/hero).                                               | —                                                                                | Validators enforce thumb presence for Tier A.                                                     |

**Files:** `apps/web/next.config.js`, `libs/screens/src/lib/MediaLibraryClient.tsx`, `libs/content/src/lib/media.ts`.

---

### C. Media Metadata + SEO (manifest, sitemap-images, JSON-LD)

| Aspect              | Current state                                                                                      | Missing / risks                                           | Completion criteria                                                                                  |
| ------------------- | -------------------------------------------------------------------------------------------------- | --------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| **Manifest**        | Single `manifest.json`; schema with alt, descriptor, tier, optional persona/formality/visualTone.  | Bulk descriptors wrong; no deterministic "signals" field. | Manifest "signals" field (attire, framing, background, expression, purpose); validator for Tier A/B. |
| **Sitemap (pages)** | `apps/web/src/app/sitemap.ts`; `buildSitemapEntries()` in `@joelklemmer/seo`; validate-sitemap.ts. | —                                                         | Present; validated.                                                                                  |
| **Image sitemap**   | `apps/web/src/app/sitemap-images/route.ts`; uses `getMediaManifestSitemapEligible`; cache headers. | Split if >50k; correctness of URLs.                       | Correct and split if needed; validator ensures route exists.                                         |
| **JSON-LD**         | `MediaPageJsonLd` in seo lib; Person, Report, WebSite on relevant pages.                           | —                                                         | Media page emits clean structured data; no spam signals.                                             |

**Files:** `apps/web/src/app/sitemap.ts`, `apps/web/src/app/sitemap-images/route.ts`, `libs/seo/src/lib/seo.ts`, `libs/content/src/lib/media.ts`.

---

### D. UI System (tokens, surfaces, typography, layout, components)

| Aspect         | Current state                                                                                                                                       | Missing / risks                   | Completion criteria                                                              |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------- | -------------------------------------------------------------------------------- |
| **Tokens**     | `libs/tokens/src/lib/tokens.css`; `apps/web/src/styles/00-tokens.css`; `--container-max-width`, `--readable-max-width`, typography, color, spacing. | No `--media-thumb-size` yet.      | Media thumb tokens; token-driven only.                                           |
| **Surfaces**   | `libs/ui`: Container, Box, AuthoritySurface, Shell.                                                                                                 | Page Frame component not defined. | Page Frame in libs/ui: lanes, section spacing, hero composition, reading rhythm. |
| **Typography** | Tokens: display-heading, section-heading, body-analytical, meta-label; Tailwind layers.                                                             | —                                 | Preserved; no monolithic CSS.                                                    |
| **Layout**     | `20-layout.css`; section-shell; Container.                                                                                                          | "Thin center column" effect.      | Content stage background materiality; controlled depth.                          |
| **Components** | Sections (HeroSection, etc.); screens; Shell.                                                                                                       | —                                 | Cards, headings, nav proportions upgraded per Phase 3.                           |

**Files:** `libs/tokens/`, `libs/ui/`, `libs/sections/`, `apps/web/src/styles/`.

---

### E. UX System (cadence, hierarchy, navigation, filters, density)

| Aspect         | Current state                                                   | Missing / risks                                                   | Completion criteria                                  |
| -------------- | --------------------------------------------------------------- | ----------------------------------------------------------------- | ---------------------------------------------------- |
| **Navigation** | Shell, nav, footer; locale switcher.                            | —                                                                 | Footer quiet link; no sitewide galleries.            |
| **Filters**    | MediaLibraryClient: kind filter (client-side from visible set). | "Stalled/loading" concern; must be server-side and instantaneous. | Filtering server-side; loading UI; no long blocking. |
| **Density**    | authority-density lib; tokens.                                  | —                                                                 | Preserved.                                           |
| **Hierarchy**  | Visual Authority System doc; section headings.                  | —                                                                 | Stronger composition per Phase 3.                    |

**Files:** `libs/screens/src/lib/MediaLibraryClient.tsx`, `libs/authority-density/`, `docs/visual-authority-system.md`.

---

### F. AX System (keyboard, focus, SR semantics, reduced motion)

| Aspect             | Current state                                                  | Missing / risks | Completion criteria              |
| ------------------ | -------------------------------------------------------------- | --------------- | -------------------------------- |
| **Focus**          | `focusRingClass`, `skipLinkClass` in `@joelklemmer/a11y`.      | —               | WCAG 2.2 AA+ preserved.          |
| **SR**             | `visuallyHiddenClass` (sr-only); aria labels on media filters. | —               | SR semantics intact.             |
| **Reduced motion** | Tokens: `motion-reduce:transition-none`; duration-fast.        | —               | No degradation.                  |
| **A11y gate**      | `tools/run-a11y.ts`; Playwright + axe; `web:a11y`.             | —               | Part of verify; must stay green. |

**Files:** `libs/a11y/src/lib/a11y.ts`, `tools/run-a11y.ts`, `apps/web-e2e/`.

---

### G. Intelligence Layer & Discoverability (entity graph, structured data integrity)

| Aspect              | Current state                                                                                                                                   | Missing / risks | Completion criteria                              |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | --------------- | ------------------------------------------------ |
| **Entity graph**    | `libs/intelligence`: `buildEntityGraph`, claims/records/case studies/books/frameworks.                                                          | —               | Validated; structured data consistent.           |
| **Structured data** | Person, Report, WebSite, MediaPageJsonLd; validate-seo checks.                                                                                  | —               | No spam signals; media page indexable and clean. |
| **Validators**      | validate-intelligence, validate-authority-signals, validate-experience-intelligence, validate-frameworks, validate-aec, validate-orchestration. | —               | All in verify.                                   |

**Files:** `libs/intelligence/`, `libs/seo/`, `tools/validate-seo.ts`, `tools/validate-intelligence.ts`.

---

### H. Validation & Quality Gates (Nx targets, validators, tests, a11y smoke)

| Aspect           | Current state                                                                                                                                                                                                                                                                                                                                                                                                                  | Missing / risks                               | Completion criteria                                                                                        |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| **Nx targets**   | web:lint, content-validate, governance-validate, i18n-validate, pgf-validate, intelligence-validate, authority-signals-validate, experience-intelligence-validate, frameworks-validate, aec-validate, orchestration-validate, content-os-validate, sitemap-validate, media-manifest-validate, media-authority-validate, visual-contract-validate, seo-validate, tokens-validate, test, build, restore-generated-typings, a11y. | authority-program-validate not yet in verify. | `web:authority-program-validate` exists and is part of verify; no bypass.                                  |
| **Program gate** | —                                                                                                                                                                                                                                                                                                                                                                                                                              | Missing.                                      | `tools/validate-authority-program.ts` enforces subsystems, targets, routes, SEO outputs, media governance. |
| **Tests**        | web:test placeholder.                                                                                                                                                                                                                                                                                                                                                                                                          | —                                             | Placeholder acceptable; a11y smoke in verify.                                                              |
| **A11y**         | web:a11y in verify.                                                                                                                                                                                                                                                                                                                                                                                                            | —                                             | Must remain green.                                                                                         |

**Files:** `apps/web/project.json`, `tools/validate-*.ts`, `docs/quality-gates.md`.

---

### I. Deployment Hardening (cache headers, route stability, RSC boundaries)

| Aspect              | Current state                                                  | Missing / risks | Completion criteria                                       |
| ------------------- | -------------------------------------------------------------- | --------------- | --------------------------------------------------------- |
| **Cache headers**   | next.config.js: security headers; `/media/:path*` immutable.   | —               | Correct; verified by program validator or separate check. |
| **Route stability** | [locale] dynamic segment; all indexable routes under [locale]. | —               | i18n-safe; sitemap matches.                               |
| **RSC boundaries**  | Server components for data; client for MediaLibraryClient.     | —               | No regression.                                            |

**Files:** `apps/web/next.config.js`, `apps/web/src/app/[locale]/`.

---

## 2. Completion Criteria (Objective, Testable)

- **Program gate:** `nx run web:authority-program-validate` passes; it is part of `web:verify` and must be green.
- **Media:** Tier C not in public media; thumbs use size tokens; list uses thumb only (master only on fallback); descriptor/signals validator for Tier A/B; prune tool exists and produces report + log.
- **SEO:** Sitemap and image sitemap exist and are correct; /media indexable; Media Usage statement (in /terms or /media); internal linking rules (footer quiet link; no sitewide galleries).
- **Visual authority:** Page Frame component; content stage materiality; token-driven; WCAG preserved.
- **Quality:** All validators in verify; no placeholders that bypass checks; i18n (en/uk/es/he) and a11y intact.

---

## 3. Work Breakdown Structure (WBS)

| WBS | Deliverable                                                                                                                                                                                             |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0   | Repo-wide system audit (this doc); program gate validator; wire into verify.                                                                                                                            |
| 1   | Media library: thumb size tokens; filtering server-side/instant; delete specified images; prune tool + report.                                                                                          |
| 2   | Descriptor refinement: manifest "signals" field; validator for Tier A/B.                                                                                                                                |
| 3   | Visual Authority: Page Frame; content stage; cards/headings/nav/hero upgrades.                                                                                                                          |
| 4   | SEO: image sitemap correct/split; /media indexable; Media Usage statement; internal linking.                                                                                                            |
| 5   | Quality/performance: content-visibility; Next Image sizing; cache headers; Lighthouse CI budget (stub target `web:lighthouse-budget`; TODO: add real Lighthouse CI and budget thresholds when adopted). |

---

## 4. Execution Order

1. **Phase 0 (Step 1):** Create this program doc; create `tools/validate-authority-program.ts`; add `web:authority-program-validate`; wire into `web:verify`. Run verify; report changes.
2. **Phase 1–2 (Step 2):** Media library fixes: thumb tokens, filtering, delete list, prune tool.
3. **Phase 2 continued (Step 3):** Descriptor refinement system + validators.
4. **Phase 3 (Step 4):** Visual Authority upgrades (Page Frame, surfaces, hierarchy).
5. **Phase 4:** SEO + crawl authority.
6. **Phase 5:** Quality + performance hardening.

---

## 5. Definition of Done (per increment)

- All changes are bounded and verifiable.
- `pnpm nx run web:verify --verbose` is GREEN after each increment.
- No validators bypassed; no placeholders/mocks for required behavior.
- i18n (en/uk/es/he) and WCAG 2.2 AA+ not degraded.
- Token-driven UI; no monolithic CSS.
- Program doc updated if new subsystems or criteria are added.

---

## 6. Machine-Readable Contract (for validate-authority-program.ts)

The following block is read by `tools/validate-authority-program.ts`. Do not remove or alter the block id.

```authority-program-required
{
  "requiredNxTargets": [
    "content-validate",
    "governance-validate",
    "i18n-validate",
    "pgf-validate",
    "intelligence-validate",
    "authority-signals-validate",
    "experience-intelligence-validate",
    "frameworks-validate",
    "aec-validate",
    "orchestration-validate",
    "content-os-validate",
    "sitemap-validate",
    "image-sitemap-validate",
    "media-manifest-validate",
    "media-authority-validate",
    "media-governance-validate",
    "visual-contract-validate",
    "seo-validate",
    "tokens-validate",
    "token-drift-validate",
    "test",
    "build",
    "restore-generated-typings",
    "a11y",
    "authority-program-validate"
  ],
  "requiredVerifyIncludes": [
    "authority-program-validate",
    "media-manifest-validate",
    "media-authority-validate",
    "media-governance-validate",
    "sitemap-validate",
    "image-sitemap-validate",
    "seo-validate"
  ],
  "requiredRoutes": [
    "accessibility",
    "bio",
    "books",
    "brief",
    "casestudies",
    "contact",
    "faq",
    "media",
    "media-kit",
    "now",
    "operating-system",
    "press",
    "privacy",
    "proof",
    "publicrecord",
    "security",
    "terms",
    "work",
    "writing"
  ],
  "requiredSeoOutputs": [
    "apps/web/src/app/sitemap.ts",
    "apps/web/src/app/sitemap-images/route.ts"
  ],
  "mediaGovernancePath": "docs/media-governance.md",
  "requiredSubsystemPaths": [
    "apps/web/public/media/manifest.json",
    "libs/content/src/lib/media.ts",
    "tools/validate-media-manifest.ts",
    "tools/validate-media-authority.ts",
    "tools/validate-media-governance.ts",
    "tools/validate-image-sitemap.ts",
    "libs/tokens/src/lib/tokens.css",
    "libs/ui/src/lib/Container.tsx",
    "libs/ui/src/lib/PageFrame.tsx",
    "libs/a11y/src/lib/a11y.ts",
    "libs/intelligence/src/lib/buildEntityGraph.ts",
    "libs/seo/src/lib/seo.ts",
    "tools/run-a11y.ts",
    "apps/web/next.config.js"
  ]
}
```

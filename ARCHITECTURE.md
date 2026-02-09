# Architecture

This document describes the current platform structure: Nx layering, libraries, subsystems, and the roles of the Presentation Governance Framework (PGF) and Content Operating System (Content OS). It reflects the implemented codebase, not aspirational design.

## Nx workspace

- **Configuration:** `nx.json` uses plugins: `@nx/next`, `@nx/playwright`, `@nx/eslint`. Default base branch: `main`.
- **Projects:** `apps/web` (Next.js app), `apps/web-e2e` (Playwright). Libraries are under `libs/` with tags (e.g. `scope:web`, `type:app`) where defined in `project.json`.
- **Path aliases:** Defined in `tsconfig.base.json`; e.g. `@joelklemmer/content`, `@joelklemmer/content/validate`, `@joelklemmer/seo`, `@joelklemmer/screens`, `@joelklemmer/ui`, `@joelklemmer/i18n`, `@joelklemmer/tokens`, `@joelklemmer/a11y`, `@joelklemmer/sections`, and authority/intelligence/aec/evaluator-mode libs. The app uses `@/*` → `apps/web/*`.
- **Module boundaries:** Apps depend on libs; libs do not depend on apps. No lib imports from `apps/`. Cross-lib dependencies are explicit (e.g. sections may use ui, screens use sections/ui). Use each library’s public API; avoid deep cross-lib dependency chains.

## Applications

- **web** (`apps/web`): Next.js 16 App Router. Locale segment `[locale]`; routes under `src/app/[locale]/`. Uses next-intl, MDX (next-mdx-remote), Tailwind, design tokens from `libs/tokens`. Entry: `layout.tsx` → `[locale]/layout.tsx` → per-route `page.tsx`.
- **Thin route composer rule:** Route files (`apps/web/src/app/**/page.tsx`) stay under ~120 lines with no heavy inline JSX. Page-level composition lives in `libs/screens` (e.g. HomeScreen, BriefScreen); section building in `libs/sections` (HeroSection, ListSection, etc.). Route pages wire props and pass data only.
- **web-e2e** (`apps/web-e2e`): Playwright. Configs: default e2e, a11y, visual (presentation-integrity). Uses `BASE_URL`/`PORT` from env or a11y runner; CI installs Chromium and caches browsers.

## Libraries (layering)

Libraries are the single source of behavior and structure for the app; the app wires routes to screens and sections.

| Library                     | Responsibility                                                                                                                                                                              |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **content**                 | Content loading, frontmatter/slugs, claims registry, proof/public-record data, media manifest, sitemap data. Exports `validate` entry for validators (no next-mdx-remote in validate path). |
| **i18n**                    | Locale messages (`libs/i18n/src/messages/<locale>/*.json`). Namespaces: common, nav, footer, meta, brief, publicRecord, proof, contentOS, home, etc.                                        |
| **seo**                     | Canonical URLs, hreflang, identity/sameAs, sitemap builder, JSON-LD.                                                                                                                        |
| **screens**                 | Page-level composition: HomeScreen, BriefScreen, PublicRecordScreen, ProofEntryScreen, CaseStudyEntryScreen, etc.; BriefNavigator, MediaLibraryClient.                                      |
| **sections**                | Reusable sections: HeroSection, ListSection, FooterSection, FrameworkCard, navigation, AEC panel, evidence/verification sections.                                                           |
| **ui**                      | Shell, Header, Nav, LanguageMenu, ThemeToggle, Container, PortraitImage, AccessibilityPanel, ClaimProofMapView, ContextualPanel, etc.                                                       |
| **tokens**                  | Design tokens (CSS and TS); single source for spacing, typography, color.                                                                                                                   |
| **a11y**                    | A11y utilities and ACP provider.                                                                                                                                                            |
| **aec**                     | AEC (brief) panel and intent.                                                                                                                                                               |
| **authority-signals**       | Entity→signals mapping and topology.                                                                                                                                                        |
| **authority-mapping**       | Authority mapping utilities.                                                                                                                                                                |
| **authority-orchestration** | Orchestration consistency.                                                                                                                                                                  |
| **authority-density**       | Density-aware layout context.                                                                                                                                                               |
| **authority-telemetry**     | Telemetry scoring and events.                                                                                                                                                               |
| **evaluator-mode**          | Evaluator mode context.                                                                                                                                                                     |
| **intelligence**            | Intelligence layer / semantic index; has separate validate entry for validators.                                                                                                            |

Validators in `tools/` import from `@joelklemmer/content/validate`, `@joelklemmer/seo`, `@joelklemmer/intelligence/validate`, etc., under `tsconfig.base.json` via `tsx`.

## Subsystem doctrine

Subsystems are documented in `docs/` and enforced by validators and runtime structure.

- **Public Record:** Verification-only evidence. Entries in `content/public-record/*.mdx` (or `content/proof/*.mdx`). Frontmatter: title, artifactType, source, date, verificationNotes, claimSupported, locale, slug; optional verification block, source object, attachments. Claims registry in `libs/content` links claims to record IDs. Three-layer disclosure (scan → substantiation → artifact) and “how to read” doctrine blocks; data attributes and Playwright specs in `apps/web-e2e`. See [docs/public-record-subsystem.md](docs/public-record-subsystem.md) and [docs/public-record-doctrine.md](docs/public-record-doctrine.md).
- **Home:** Single H1, required links, heading outline, no placeholder copy, PGF and Content OS compliance. Enforced by `home-validate`, `pgf-validate`, `content-os-validate`. See [docs/home-subsystem.md](docs/home-subsystem.md).
- **Brief:** Claims, proof linkage, briefing contracts. Validators: content-validate, briefing-contracts-validate, authority-signals-validate, aec-validate.
- **Media:** Manifest, derivatives, authority tiers, governance. Validators: media-manifest-validate, media-derivatives-validate, media-authority-validate, media-governance-validate.
- **Proof attachments:** Manifest at `apps/web/public/proof/manifest.json`; attachment id/filename/sha256 per entry. Verified by content-validate and verify-proof-attachments.

## PGF (Presentation Governance Framework)

PGF governs tone, copy, and proof linkage. It is defined in [docs/pgf.md](docs/pgf.md) and enforced mechanically by `nx run web:pgf-validate` (`tools/validate-pgf.ts`).

- **Tone:** Quiet authority; no hype, no exclamation points; short paragraphs; evaluator-facing, evidence-led.
- **Copy constraints:** No duplicate H1, lede, or primary CTA across core screens (default locale). No duplicate claim labelKey/summaryKey in claims registry. Primary CTA labels unique unless on allowlist.
- **Proof-forward:** Claims link to Public Record and Case Studies; validators ensure references and registries are consistent.
- **Page intent:** Each primary route has 10-second and 60-second outcome; maps to meta.title and meta.description. Uniqueness enforced by pgf-validate.

## Content OS (Content Operating System)

Content OS defines proof-forward, evaluator-grade content rules and page intent. It is defined in [docs/content-operating-system.md](docs/content-operating-system.md) and enforced by `nx run web:content-os-validate` (`tools/validate-content-os.ts`).

- **Canonical voice:** Aligned with PGF (quiet authority, no placeholder copy).
- **Page intent model:** 10s/60s outcomes; documented in `docs/page-intent-map.md`; contentOS intent keys in i18n for all locales.
- **Meta/CTA:** Home, Brief, Work, Books, Public Record, Contact have meta.title and meta.description; home has hero.cta; contact has pathways and mailto.buttonLabel. No placeholder language (lorem, placeholder, sample, etc.) in default-locale user-facing strings.
- **Non-duplication:** Aligned with PGF; pgf-validate enforces H1/lede/CTA uniqueness; content-os-validate enforces intent keys and no placeholders.

PGF and Content OS work together: PGF is the enforceable framework for tone and copy uniqueness; Content OS adds page intent, meta/CTA requirements, and placeholder bans. Both are referenced by subsystem docs (e.g. home, public record, authority) and by the verify chain.

## Tools and validators

Validators live in `tools/` and are invoked as Nx targets on `web` (see `apps/web/project.json`). Each runs via `npx tsx --tsconfig tsconfig.base.json tools/<script>.ts`. They assert schema, references, registries, and doctrine rules; on failure they throw or `process.exit(1)`. The verify target runs a fixed sequence of these plus format, lint, audit, test, build, restore-generated-typings, and a11y. See [VERIFY.md](VERIFY.md).

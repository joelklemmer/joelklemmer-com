# @joelklemmer/sections

## System role

Page sections and composition blocks: hero, claims, case study, contact pathways, framework cards, verification rails, evidence graph, footer, nav, AEC briefing panel, etc. Sections are composed by screens; they do not define routes. They depend on `ui`, `content`, `i18n`, and optionally `authority-*`/`aec` for data and layout. Route files in `apps/web` are allowed to import only `@joelklemmer/screens` and `@joelklemmer/sections`.

## Architectural boundaries

- **Tags:** `type:lib`, `type:section`. May depend only on other `type:lib` libraries.
- **No deep imports:** Use `@joelklemmer/sections` only.
- **Boundary:** Section-level components and navigation config (`PRIMARY_NAV_ENTRIES`, etc.). No route definitions, no full-page layout responsibility; screens own page structure and which sections to render. Section order and IDs (e.g. `#doctrine`, `#routes`) follow authority docs (e.g. `docs/authority/home-signal-map.md`, `docs/home-subsystem.md`).

## Public interfaces

- **Root** (`src/index.ts`): Re-exports `./lib/sections`.
- **sections.ts:** ArtifactSingleSection, BriefClaimsSection, CaseStudySection, CardGridSection, ContactPathwaySection, ContactPathwaysSection, ContactGuidanceSection, MailtoComposerSection, DefinitionListSection, EvidenceGraphSection, FrameworkCard, FrameworkDetailSection, FrameworkIntentBand, FallbackNoticeSection, FooterSection, HeaderSection, HeroSection, IdentityScopeSection, LinkListSection, ListSection, MdxSection, PrimaryNavSection, PRIMARY_NAV_ENTRIES, QuantifiedOutcomesSection, ReadPathSection, SectionVisualAnchor, StartHereSection, VerificationGuidanceSection, VerificationRailsSection, AECBriefingPanel (and prop types).

## Dependency constraints

- May depend on `ui`, `content`, `i18n`, `tokens`, `a11y`, and other `type:lib` (e.g. `authority-signals`, `authority-density`, `aec`). Must not depend on `screens` (screens depend on sections).

## Example usage

```tsx
import { HeroSection, VerificationRailsSection, FrameworkCard } from '@joelklemmer/sections';

<>
  <HeroSection ... />
  <VerificationRailsSection items={rails} />
  <section id="doctrine">...</section>
</>
```

## Interaction with verify pipeline

- No validator in `tools/` imports sections directly. Home/content/authority validators assert structure and copy; section IDs and order are asserted by e2e (e.g. presentation-integrity). Changing section contracts or PRIMARY_NAV_ENTRIES may affect screens and e2e.

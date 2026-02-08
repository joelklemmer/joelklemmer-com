# Home subsystem

## Purpose and evaluator intent

The Home page (`/`) is the orientation system for institutional evaluation. It provides structured entry points to the authority verification ecosystem, prioritizing the Executive Brief as the dominant entry point for evaluator review.

**10-second outcome:** Understand that this is an authority verification ecosystem for executive evaluation, board review, and public record.

**60-second outcome:** Access the Executive Brief and understand the primary routes (Case Studies, Public Record) for verification.

## Non-goals

The Home page does **not**:

- Serve as a marketing landing page (no testimonials, hype, or sales language)
- Provide detailed content (content lives in Executive Brief, Case Studies, Public Record)
- Act as a blog or news feed (no dynamic content streams)
- Include interactive features beyond navigation (no forms, calculators, or widgets)
- Duplicate content from other pages (PGF no-duplication rules enforced)
- Render placeholder content (validator blocks placeholder blocks)

The Home page is a **structural entry point** that routes evaluators to verification materials, not a content destination itself.

## Authority signals mapping

The Home page does not directly bind to authority signals (it is an entry point, not a content entity). However, it routes to entities that carry signal vectors:

- **Executive Brief** (`briefNode` entity) – Balanced vector (0.2 per signal) via `ENTITY_BINDINGS_CONFIG`
- **Case Studies** – Each case study has its own signal vector (e.g., `strategic_cognition`, `systems_construction`, `operational_transformation`)
- **Public Record** – Each record has its own signal vector
- **Frameworks** – Each framework emphasizes a primary signal (e.g., `strategic-cognition-lens` → `strategic_cognition`)

The Home page's role is **structural routing** to signal-weighted content, not signal expression itself. Authority signals are embedded in the content entities (claims, records, case studies, frameworks) that Home routes to, not in Home's UI or copy.

## Section contracts

The Home page is built from these sections in order (defined by `HOME_IA_ORDER` in `libs/screens/src/lib/HomeScreen.tsx`):

### 1. Hero (`hero`)

**Contract:**

- **Renders:** Exactly one H1 (`<h1 id="hero-title">`), lede paragraph, primary CTA button, optional portrait image
- **Component:** `HeroSection`
- **i18n keys:** `hero.title`, `hero.lede`, `hero.cta`, `hero.portraitAlt`
- **Required:** H1 title, lede, CTA (all non-empty)
- **CTA target:** `/${locale}/brief` (Executive Brief)
- **Image:** Portrait at `/media/portraits/joel-klemmer__portrait__studio-graphite__2026-01__01__hero.webp` (1200x1500, priority loading)

**Validator enforces:** Exactly one H1 on Home (HeroSection renders single H1).

### 2. Routes (`routes`)

**Contract:**

- **Renders:** Executive Brief card (H2) + Verification Rails section (H2 + H3 items)
- **Component:** Custom section with `Link` for Executive Brief, `VerificationRailsSection` for other routes
- **i18n keys:** `routes.title`, `routes.items[]` (each with `title`, `description`, `path`)
- **Required:** Executive Brief route (`path` contains `/brief`), Case Studies route (`path` contains `/work`), Public Record route (`path` contains `/proof`)
- **Section ID:** `id="routes"`

**Validator enforces:** All three primary routes (Executive Brief, Case Studies, Public Record) must exist in `routes.items`.

### 3. Claim Summary (`claims`)

**Contract:**

- **Renders:** H2 heading + unordered list of claim strings
- **Component:** `ListSection`
- **i18n keys:** `claims.title`, `claims.items[]` (array of strings)
- **Required:** Non-empty title, at least one claim item
- **Content:** Each claim should reference Public Record where applicable

**Validator enforces:** No duplicate headings (claims.title must not duplicate routes.title or doctrine title).

### 4. Doctrine (`doctrine`)

**Contract:**

- **Renders:** H2 heading + lede + grid of framework cards (max 3)
- **Component:** Custom section with `FrameworkCard` components
- **i18n keys:** `frameworks.section.title`, `frameworks.section.lede`, framework-specific keys
- **Required:** Only rendered if frameworks exist (`getFrameworkList().length > 0`)
- **Section ID:** `id="doctrine"`
- **Links:** Each card links to `/${locale}/brief#doctrine`

**Validator enforces:** No duplicate headings (doctrine title must not duplicate routes.title or claims.title).

## Fixed IA order

The section order is enforced by `HOME_IA_ORDER`:

```typescript
const HOME_IA_ORDER: SectionId[] = ['hero', 'routes', 'claims', 'doctrine'];
```

This order ensures:

- Hero first (primary orientation)
- Routes section immediately follows (contains Executive Brief as dominant entry point, then verification rails)
- Claim summary offers quick verification context
- Doctrine provides framework context

## Heading outline enforcement

The Home page must follow a strict heading hierarchy:

- **H1:** One per page, in Hero section (`HeroSection` component renders `<h1>`)
- **H2:** Section headings (`routes`, `claims`, `doctrine` all use `<h2>`). The Executive Brief within routes also uses H2.
- **H3:** Subsection headings within sections (e.g., individual route items in `VerificationRailsSection`)

The validator enforces:

- Exactly one H1 on the Home page (from Hero section)
- All section titles use H2
- No skipped heading levels (no H3 without preceding H2)

## PGF no-duplication rules

Home page headings must not duplicate headings from other core pages:

- **H1 (meta.home.title):** Must be unique across all core screens (enforced by `validate-pgf.ts`)
- **H2 section headings:** Must not duplicate other pages' H1 or lede text
- **Executive Brief CTA:** Must be present and link to `/brief`

The validator checks that Home headings don't duplicate other page headings (H1/H2) from the meta.json and other content files.

## Required content

### Executive Brief CTA (required)

The Executive Brief CTA is **required** and must:

- Be present in `home.routes.items` with `path` containing `/brief`
- Render as an H2 heading inside the routes section
- Link to `/${locale}/brief`
- Display title and description from the route item

The validator fails if:

- No route item with `path` containing `/brief` exists
- The Executive Brief item is missing title or description

### No placeholder blocks

All content in `libs/i18n/src/messages/en/home.json` must be real content. The validator blocks:

- Placeholder text (lorem, placeholder, sample, coming soon, tbd, to be added, draft)
- Empty strings
- Missing required keys

## Content structure

### i18n keys (home namespace)

- `hero.title` – H1 text (must match `meta.home.title`)
- `hero.lede` – Hero lede paragraph
- `hero.cta` – Primary CTA label (links to `/brief`)
- `hero.portraitAlt` – Alt text for hero portrait
- `routes.title` – H2 for verification rails section
- `routes.items[]` – Array of route items, each with:
  - `title` – Route title
  - `description` – Route description
  - `path` – Route path (must include `/brief` for Executive Brief)
- `claims.title` – H2 for claim summary section
- `claims.items[]` – Array of claim strings (should reference Public Record)

### Section IDs

- `hero` – Hero section (no explicit id, uses semantic section)
- `routes` – Routes section (contains Executive Brief + Verification Rails, id="routes")
- `claims` – Claim summary section
- `doctrine` – Doctrine/frameworks section

## Implementation details

### Component usage

- `HeroSection` – Renders H1, lede, CTA, and portrait image
- `VerificationRailsSection` – Renders routes as verification rails (H2 + H3 items)
- `ListSection` – Renders claim summary (H2 + list)
- `FrameworkCard` – Renders individual framework cards
- `Container` – Wraps sections for consistent layout

### Server components

All sections are server components. No client-side JavaScript is required for the Home page structure.

### Image handling

Hero portrait:

- Path: `/media/portraits/joel-klemmer__portrait__studio-graphite__2026-01__01__hero.webp`
- Dimensions: 1200x1500
- Aspect ratio: Prevents CLS
- Responsive sizes: `(max-width: 768px) 100vw, min(380px, 40vw)`
- Priority loading: Above-fold image uses `priority` prop

## Accessibility guarantees and ACP behavior

### WCAG 2.2 AA compliance

- **Heading hierarchy:** Exactly one H1 (Hero), H2 for sections (routes, claims, doctrine), H3 for subsections
- **Skip link:** Provided by Shell layout (skip to main content)
- **Focus management:** All interactive elements (links, buttons) have visible focus indicators via `focusRingClass`
- **Semantic landmarks:** Hero uses `<section>`, routes/claims/doctrine use semantic sections
- **Image alt text:** Hero portrait has descriptive alt text from `hero.portraitAlt`
- **ARIA labels:** Hero section uses `aria-labelledby="hero-title"`, visual elements use `aria-hidden` where appropriate

### Accessibility Control Panel (ACP) behavior

The Home page respects ACP preferences set via `AccessibilityPanel`:

- **Theme:** Light/Dark/System (applied via `data-theme` on `<html>`)
- **Contrast:** Default/High (applied via `data-contrast="high"`)
- **Motion:** Default/Reduced (applied via `data-motion="reduced"`)
- **Text size:** Default/Large (applied via `data-text-size="large"`)

ACP preferences are persisted in `localStorage` and applied globally (not Home-specific). The Home page inherits these preferences through CSS custom properties and data attributes.

### Reduced motion support

All transitions and animations respect `prefers-reduced-motion` and ACP motion preference. Hero image loading and section transitions use `motion-reduce:transition-none` classes.

## i18n rules

### Supported locales

- **en** (English) – Default locale
- **uk** (Ukrainian)
- **es** (Spanish)
- **he** (Hebrew) – RTL locale

### RTL support

- **Hebrew (`he`):** Renders with `dir="rtl"` and `lang="he"` at `<html>` level (set in root layout)
- **Logical properties:** All CSS uses logical properties (`start`/`end` instead of `left`/`right`) for RTL compatibility
- **Text alignment:** Text respects RTL direction automatically via logical properties

### Translation contract

- **Namespace:** `home` (primary), `frameworks` (for doctrine section)
- **Stable keys:** Message keys are stable; do not churn keys without migration plan
- **Required keys:** All keys in `home.json` must be translated for all locales (validator enforces completeness)
- **Empty strings:** Not allowed (validator blocks empty strings in required fields)

### Locale-aware routing

- **Path structure:** `/{locale}/` (e.g., `/en/`, `/he/`)
- **Default locale:** `en` (fallback for missing translations)
- **Canonical URLs:** Each locale has its own canonical URL (e.g., `https://example.com/en/`, `https://example.com/he/`)
- **Hreflang:** All locale variants + `x-default` pointing to default locale

## SEO outputs summary

### Structured data (JSON-LD)

Home emits two JSON-LD schemas:

1. **WebSite schema** (`WebSiteJsonLd`)
   - `@type`: `WebSite`
   - `name`: "Joel R. Klemmer"
   - `url`: Canonical site URL for Home page (locale-aware)

2. **Person schema** (`PersonJsonLd`)
   - `@type`: `Person`
   - `name`: "Joel Robert Klemmer"
   - `alternateName`: "Joel R. Klemmer"
   - `url`: Site URL
   - `sameAs`: Array of verified identity URLs (from `NEXT_PUBLIC_IDENTITY_SAME_AS` env var)

### Meta tags

- **Title:** `meta.home.title` (e.g., "Joel Robert Klemmer")
- **Description:** `meta.home.description` (e.g., "Orientation system for institutional evaluation.")
- **Canonical:** `/{locale}/` (locale-aware)
- **Hreflang:** All locale variants (`en`, `uk`, `es`, `he`) + `x-default`
- **OG Image:** `/media/og/joel-klemmer__og__home__2026-01__01.webp`

### Sitemap

Home is included in XML sitemap with:

- All locale variants (`/{locale}/`)
- Priority: 1.0 (highest)
- Change frequency: Weekly

## Validation gates

The Home subsystem validator (`tools/validate-home.ts`) enforces:

1. **No placeholder blocks** – Scans `home.json` for placeholder language (lorem, placeholder, sample, coming soon, tbd, to be added, draft)
2. **Exactly one H1** – Ensures HeroSection renders exactly one H1 (no duplicate H1s)
3. **Required primary route links** – Executive Brief (`/brief`), Case Studies (`/work`), Public Record (`/proof`) must exist in `routes.items`
4. **No duplicate section headings** – `routes.title`, `claims.title`, and doctrine title must be unique
5. **Required Executive Brief CTA** – Ensures route item with `/brief` path exists and has title/description
6. **Heading outline enforcement** – Validates H1 → H2 → H3 hierarchy
7. **PGF no-duplication** – Ensures Home headings don't duplicate other page headings

Run validation:

```bash
nx run web:home-validate
```

The validator is included in `nx run web:verify` and must pass before PR merge.

## Related documentation

- [page-intent-map.md](page-intent-map.md) – Home intent (10s/60s outcomes)
- [content-operating-system.md](content-operating-system.md) – Content OS rules
- [pgf.md](pgf.md) – Presentation Governance Framework
- [brief-subsystem.md](brief-subsystem.md) – Executive Brief subsystem (target of primary CTA)

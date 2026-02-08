# Home subsystem

## Purpose and evaluator intent

The Home page (`/`) is the orientation system for institutional evaluation. It provides structured entry points to the authority verification ecosystem, prioritizing the Executive Brief as the dominant entry point for evaluator review.

**10-second outcome:** Understand that this is an authority verification ecosystem for executive evaluation, board review, and public record.

**60-second outcome:** Access the Executive Brief and understand the primary routes (Case Studies, Public Record) for verification.

## Section list and what belongs in each

The Home page is built from these sections in order (defined by `HOME_IA_ORDER` in `libs/screens/src/lib/HomeScreen.tsx`):

1. **Hero** (`hero`) – Primary page heading (H1), lede, and CTA to Executive Brief. Includes portrait image with proper aspect ratio and CLS prevention.

2. **Routes** (`routes`) – **Required section containing Executive Brief (dominant entry point) and Verification Rails.** The Executive Brief is rendered first as a prominent card (H2) linking to `/brief`. Verification Rails follow, showing other primary routes (Case Studies, Public Record) from `home.routes.items`. The Executive Brief CTA is required; the validator enforces its presence.

3. **Claim Summary** (`claims`) – Short list of provable claims from `home.claims.items`. Each claim should reference Public Record where applicable.

4. **Doctrine** (`doctrine`) – Framework cards (max 3) linking to `/brief#doctrine`. Only rendered if frameworks are available. Uses `FrameworkCard` component.

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

## Validation gates

The Home subsystem validator (`tools/validate-home.ts`) enforces:

1. **No placeholder blocks** – Scans `home.json` for placeholder language
2. **Required Executive Brief CTA** – Ensures route item with `/brief` path exists
3. **Heading outline enforcement** – Validates H1 → H2 → H3 hierarchy
4. **PGF no-duplication** – Ensures Home headings don't duplicate other page headings

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

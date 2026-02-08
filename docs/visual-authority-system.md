# Visual Authority System

The Visual Authority System is the authoritative visual hierarchy and interaction standard for **evaluator-facing surfaces** on JoelKlemmer.com. It defines how credibility, density, and clarity are communicated visually. It is not cosmetic; it governs typography, layout rhythm, evidence UI patterns, interaction rules, and forbids specific anti-patterns.

**Scope:** Evaluator-facing screens (Executive Brief, Public Record, Case Studies, and related proof/evidence surfaces). Marketing or decorative pages are out of scope.

**Governance:** This spec aligns with the [Presentation Governance Framework (PGF)](pgf.md) for tone and copy. Deviations require documented justification. Developers must consult this spec when changing evaluator-facing layout, typography, or interaction.

---

## 1. Typography Hierarchy

### H1 (Page title) scale and usage

- **Token:** `--text-3xl` (2rem) with `--leading-tight` (1.2).
- **Tailwind:** `text-display font-semibold tracking-tight`.
- **Usage:** One per screen; reserved for the primary page heading (e.g. HeroSection title, Case Studies index title). Do not use for section headings.
- **Constraint:** No scaling outside this hierarchy; no arbitrary font sizes for H1.

### Section heading scale

- **Token:** `--text-2xl` (1.5rem) with `--leading-tight`.
- **Tailwind:** `text-title font-semibold`.
- **Usage:** All `<h2>` section titles (Claims, Artifacts, Verification, Metadata, etc.). Subsections use `<h3>` with `text-base font-semibold`.
- **Constraint:** Section headings must not use `text-display` or larger; no decorative weight or letter-spacing beyond the standard.

### Metadata typography

- **Labels (dt, category, badges):** `text-xs font-semibold uppercase tracking-wide text-text` for definition-term style; category labels and small metadata use `text-xs text-muted` or `text-xs font-medium text-muted`.
- **Values (dd, meta strings):** `text-base text-muted` or `text-sm text-muted`; last verified / date metadata use `text-xs text-muted`.
- **Constraint:** Metadata must be visually subordinate to section headings and body; no bold or large type for metadata-only content.

### Evidence text styling

- **Evidence body / description:** `text-base text-muted` or `text-sm text-muted`; summaries use `text-sm text-muted`.
- **Evidence labels (e.g. “Supporting records”):** `text-xs` or `text-sm` with `text-muted` or `font-medium text-muted` for inline labels.

### Definition list styling

- **Container:** `<dl className="grid gap-4 text-sm text-muted md:grid-cols-2">`; item wrapper `section-shell` (grid gap from tokens).
- **Term:** `<dt className="text-xs font-semibold uppercase tracking-wide text-text">`.
- **Definition:** `<dd className="text-base text-muted">`.
- **Constraint:** All definition-list sections (metadata, verification, attachments) must follow this pattern for consistency.

### Link density rules

- **Inline links:** Prefer sparse placement; avoid more than a few inline links per paragraph. In evidence lists, use list items with one link per item where possible.
- **Constraint:** No dense “link farms”; link lists must use `LinkListSection` or equivalent list structure with clear spacing (`gap-2` or token spacing).

### Paragraph line-length limits

- **Maximum readable width for body/lede:** `max-w-2xl` (42rem / `--readable-max-width`) for lede and long-form body copy (IdentityScopeSection, HeroSection lede).
- **Constraint:** Long paragraphs of body text must not span full container width; use `max-w-2xl` or equivalent.

### Maximum paragraph density

- **Vertical rhythm:** Paragraphs and blocks separated by `var(--space-4)` (section-shell gap) or `mt-2`/`mt-3` where appropriate; avoid stacking more than three short paragraphs without intervening spacing or headings.
- **Constraint:** No “wall of text”; use section headings and list structures to break density.

### Contrast minimums

- **Text on background:** Body text and muted text must meet WCAG 2.2 AA (4.5:1 for normal text; 3:1 for large text). Use `hsl(var(--color-text))` and `hsl(var(--color-muted))` against `hsl(var(--color-bg))` / `hsl(var(--color-surface))`; high-contrast mode uses `:root[data-contrast='high']`.
- **Links/accents:** Accent and focus colors must meet 3:1 against background; focus ring must be clearly visible (focus-visible ring defined in a11y).

### Localization expansion tolerance

- **Layout:** Labels and short strings may expand in translation (e.g. German, Hebrew). Avoid fixed widths for labels; use `min-w-0` and flex/grid that allow wrap or shrink. RTL: no hardcoded `ml-`/`mr-` for spacing that should flip; use logical properties or `ms-`/`me-` where Tailwind supports it, or equivalent RTL-safe spacing.
- **Constraint:** Typography scale must not be reduced to “fit” translated text; allow wrap and multi-line.

---

## 2. Layout Rhythm

### Container width standards

- **Main content container:** `max-w-4xl` (56rem) with horizontal padding `px-6` (Container component). All section content must sit inside this container for consistency.
- **Token:** `--container-max-width: 56rem` (documented; implementation may use Tailwind `max-w-4xl`).

### Maximum readable text width

- **Body/lede:** `max-w-2xl` (42rem). Use for hero lede, identity scope body, and any long-form paragraph that is not a grid or list.
- **Token:** `--readable-max-width: 42rem`.

### Section vertical spacing token usage

- **Section outer:** Sections use `section-shell` (grid gap `var(--space-4)`).
- **Between sections:** Consistent vertical separation via `section-shell` on section and Container; no ad-hoc large margins that break rhythm.
- **Constraint:** Use `--space-4` as the default section-internal gap; `--space-6` or `--space-8` only for major block separation when documented.

### Grid rules

- **Claim cards:** `grid gap-4 md:grid-cols-2`; card internal spacing `p-4` and internal grid gap via `section-shell`.
- **Evidence lists:** List sections use `grid gap-2` for list items; definition lists use `grid gap-4 md:grid-cols-2`.
- **Record metadata:** Definition list layout as in Definition list styling; two columns at `md` and up when multiple items.

### Card density limits

- **Single card:** Padding at least `p-4`; internal blocks separated by `mt-2` or equivalent. No more than one primary heading (h3) per card; metadata and links clearly grouped.
- **Constraint:** Cards must not be overcrowded; if content grows, consider expanding layout or splitting sections rather than reducing padding below `p-4`.

### Breakpoint consistency expectations

- **Breakpoints:** Use Tailwind default breakpoints (sm, md, lg). Section and grid behavior (e.g. `md:grid-cols-2`) must be consistent across Brief, Public Record, and Case Studies; no one-off breakpoints for the same pattern.

### RTL mirroring behavior

- **Layout:** `dir="rtl"` on `html` must mirror layout (flex/grid order, borders, padding). Avoid `left`/`right` in CSS for layout; use `start`/`end` or logical properties. Skip links and focus positions already use logical positioning where applicable.
- **Constraint:** No visual regressions in RTL; test RTL locales for section alignment and link/list flow.

---

## 3. Evidence UI Patterns

These patterns apply to proof/evidence surfaces (e.g. Public Record entry, Brief claim cards, Case Study references).

### DefinitionListSection

- **Structure:** Section with `section-shell`, Container, `<h2 className="text-title font-semibold">`, then `<dl className="grid gap-4 text-sm text-muted md:grid-cols-2">`. Each item: wrapper with `section-shell`, `<dt className="text-xs font-semibold uppercase tracking-wide text-text">`, `<dd className="text-base text-muted">`.
- **Visual weight:** Heading (h2) > term (dt) > value (dd). No extra borders or backgrounds on individual rows unless specified for a specific use case.

### LinkListSection

- **Structure:** Section with `section-shell`, Container, `<h2 className="text-title font-semibold">`, then `<ul className="grid gap-2 text-base text-muted">`. Each item: list item with link, optional bullet (aria-hidden). Links: `focusRingClass`, `underline underline-offset-4`, `hover:text-accent`.
- **Visual weight:** Heading > list; links are secondary to the section title.

### Verification badges

- **Style:** Small, low-emphasis indicators (e.g. record count, verification strength). Use `text-xs text-muted` or `text-xs font-medium`; do not use large badges or pill shapes that compete with content. Category labels: `text-xs text-muted` or `text-xs font-semibold uppercase tracking-wide text-text` when they act as terms.

### Record counts

- **Display:** Inline with metadata (e.g. “N records”, “Last verified: date”). Use `text-xs text-muted` or same as surrounding metadata; no oversized numbers or icons.

### Artifact metadata

- **Title:** `font-medium text-text`. Version/date: `text-sm text-muted`. Scope label: `text-xs text-muted` with optional `font-medium` on label part. Checksum: `font-mono text-xs text-muted` with `break-all` for hash.

### Checksum display

- **Style:** `font-mono text-xs text-muted`; full hash may be truncated in UI with “…” with copy button for full value. Label: “Checksum” or equivalent with `font-medium` before value.

### Verification strength indicators

- **Style:** Subtle (e.g. small dot or text count). Use `text-xs` or small icon; color `text-muted` or `accent` for “filled” state. No large progress bars or decorative graphics.

### Category labels

- **Style:** `text-xs text-muted` or `text-xs font-semibold uppercase tracking-wide text-text` when used as a term. Must be visually below section heading and card title.

### Last verified metadata

- **Style:** `text-xs text-muted`; same line or immediately below record/case study counts. No bold or prominent styling.

### Visual weight hierarchy and spacing

- **Order (strongest to weakest):** Page title (H1) > Section heading (H2) > Card/list title (H3) > Term/label (dt, category) > Body/meta (dd, description, date) > Muted metadata (e.g. last verified).
- **Spacing:** Section gap `var(--space-4)`; list item gap `var(--space-2)`; definition list item gap `var(--space-4)`; card internal `p-4` and `mt-2` between logical blocks.

---

## 4. Interaction Rules

### Hover behavior constraints

- **Links:** `hover:text-accent`; no background color change required; underline may remain. Buttons: `hover:border-accent hover:text-accent` or `hover:bg-muted/50` for secondary actions.
- **Constraint:** No decorative hover effects (scale, rotation, shadows); no hover-only critical information.

### Focus-visible requirements

- **All interactive elements:** Use `focusRingClass` from `@joelklemmer/a11y`: `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-bg`. Global `:focus-visible` in global.css provides fallback outline.
- **Constraint:** Focus must be clearly visible; no removal of focus outline without equivalent ring.

### Motion-reduce compliance rules

- **Global:** `@media (prefers-reduced-motion: reduce)` in global.css sets `animation-duration: 0.01ms`, `transition-duration: 0.01ms`, `scroll-behavior: auto`. All custom transitions must respect this (Tailwind `motion-reduce:transition-none` where used).
- **Constraint:** No animation or transition that cannot be disabled or near-instant when reduced motion is preferred.

### Animation duration limits

- **Permitted:** Transitions for color/border/opacity only; maximum 200ms. Use tokens `--transition-duration-fast` (150ms) or `--transition-duration-normal` (200ms) when adding new transitions.
- **Constraint:** No animation longer than 200ms; no looping or decorative animation.

### Permitted transition types

- **Allowed:** `transition-colors`, `transition-opacity`; for focus ring and hover state changes only.
- **Forbidden:** `transform`, `filter`, or layout transitions for decorative effect.

### Keyboard interaction expectations

- **Expandable panels:** Expand/collapse with Enter/Space; Escape closes; focus moves to close button when opened and back to trigger when closed. No keyboard traps.
- **Links and buttons:** Standard tab order; no custom tab index unless required for accessibility (e.g. skip link).
- **Constraint:** All interactive UI must be keyboard operable and focus order logical.

### Expandable panel behavior

- **Trigger:** `aria-expanded`, `aria-controls` pointing to panel id. Panel: `role="region"` with `aria-label` for the region.
- **Focus:** On open, focus moves to close button or first focusable in panel; on close, focus returns to trigger.
- **Constraint:** No auto-expand on page load for multiple panels; at most one expanded at a time for list-of-cards pattern.

### Interactive graph/list toggles

- **Toggle group:** Use `role="group"`, `aria-label` on group; buttons with `aria-pressed`. Selected state: `bg-accent/20 text-accent`; transition `transition-colors motion-reduce:transition-none`.
- **Constraint:** Toggle state must be announced to screen readers; no icon-only toggle without accessible name.

---

## 5. Anti-Pattern Blacklist

The following are **explicitly forbidden** on evaluator-facing surfaces. This list is enforceable by review and must not be overridden without documented justification.

1. **Decorative gradients** — No gradient backgrounds or gradient text for decoration.
2. **Hero marketing density** — No large hero images, multiple CTAs, or marketing-style hero blocks on Brief, Public Record, or Case Studies index/entry.
3. **Unbounded shadows** — No box-shadows except minimal, token-bound shadow if later introduced for elevation (currently none); no large or diffuse decorative shadows.
4. **Excess animation** — No parallax, scroll-triggered animation, or repeated motion; no animation beyond permitted transitions.
5. **Decorative motion** — No motion for purely aesthetic effect; no loading “skeleton” animation beyond minimal opacity if ever needed.
6. **Long-form center-aligned text blocks** — Body and evidence text must not be center-aligned for long passages; center alignment only for short labels or single-line content where appropriate.
7. **Oversized iconography** — Icons must be small and supportive (e.g. inline with text); no large decorative icons that dominate layout.
8. **Non-semantic animation** — Animation must not convey critical information; all meaning must be available without motion.
9. **Typography scaling outside hierarchy** — No arbitrary font sizes; all text must use the defined scale (text-xs, text-sm, text-base, text-lg, text-xl, text-title, text-display).
10. **Visual duplication of metadata hierarchy** — Do not repeat the same metadata (e.g. “Last verified”) in two different visual treatments that suggest different importance; use one consistent pattern.

---

## 6. Token Additions (from audit)

The following tokens were added to support this spec. Existing tokens were not renamed or removed.

- **`--container-max-width`:** `56rem` — Standard main content width (aligns with Tailwind `max-w-4xl`). Use for documentation and future theming; Container component may continue using `max-w-4xl`.
- **`--readable-max-width`:** `42rem` — Maximum width for body/lede paragraphs (aligns with Tailwind `max-w-2xl`).
- **`--transition-duration-fast`:** `150ms` — For color/opacity transitions (hover, focus).
- **`--transition-duration-normal`:** `200ms` — Maximum permitted transition duration.

These are defined in `libs/tokens/src/lib/tokens.css`. No existing token usage was changed.

---

## 7. When to Consult This Spec

- Changing typography (font size, weight, or heading levels) on Brief, Public Record, Case Studies, or proof/evidence sections.
- Adding or changing layout (grid, container, spacing) on evaluator-facing screens.
- Introducing new evidence UI patterns (definition lists, link lists, badges, checksums).
- Adding hover, focus, or transition behavior.
- Considering any visual treatment that might fall under the anti-pattern blacklist.

Deviations require documented justification (e.g. in PR or design doc) and should be rare.

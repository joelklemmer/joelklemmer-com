# Responsiveness Constitution

**Purpose:** Binding rules for responsiveness across mobile, tablet, desktop, ultrawide, TV, and constrained IoT widths. Single source of truth for breakpoint intent, lane doctrine, typography scaling, spacing rhythm, no-horizontal-scroll enforcement, authority preservation on ultrawide, and accessibility. Compatible with existing tokens, lanes, and PGF (Presentation Governance Framework).

**Scope:** 320px floor through ultra-wide (TV). All locales and RTL. No route/slug changes. Tokens remain source of truth. WCAG 2.2 AA+ maintained.

**Status:** Enforcement-layer specification. All layout and responsive decisions must align. No code in this document; implementation references `responsive-contract.md`, `20-layout.css`, and token files.

---

## 1. Breakpoints and intent

Breakpoints are defined by **intent**, not only by pixel values. Implementation uses CSS media queries and, where needed, Tailwind theme (sm/md/lg/xl/2xl). No `xs` in Tailwind; use `min-width: 320px` and max-width queries for small screens.

| Name      | Min width     | Intent                                                                                               |
| --------- | ------------- | ---------------------------------------------------------------------------------------------------- |
| **xs**    | 320px (floor) | Minimum supported viewport; no layout below this. Constrained IoT and narrow devices must not break. |
| **sm**    | 640px         | Narrow tablet / large phone; wider gutters, two-column potential.                                    |
| **md**    | 768px         | Tablet; hero grid, section layout shifts, portrait beside content.                                   |
| **lg**    | 1024px        | Desktop; full hero composition, wider content lanes.                                                 |
| **xl**    | 1280px        | Large desktop; optimal reading and portrait scaling.                                                 |
| **2xl**   | 1536px        | Extra-large; cap line length, increase padding only.                                                 |
| **ultra** | 1920px+       | Ultra-wide / TV; padding and type scale up; line length **never** stretched.                         |

**Checklist — Breakpoints**

- [ ] No layout or critical content assumes a viewport narrower than 320px without a documented exception.
- [ ] All breakpoint-dependent rules use the named intents above (or tokens that map to them); no one-off pixel values for the same pattern elsewhere.
- [ ] Constrained IoT / very narrow widths (e.g. 320–359px): single column, touch-friendly, no horizontal scroll; content remains in lanes with gutter.
- [ ] TV / ultra-wide: treated as **ultra** (1920px+); authority preservation rules apply (see §6).

---

## 2. Lane doctrine (full-bleed vs readable vs wide)

Content is placed in one of three **lane** variants. Only the inner content is constrained; section backgrounds and page chrome may be full-bleed. This doctrine is compatible with `Container` variants and `responsive-contract.md`.

| Variant      | Intent                                                 | Typical use                                             |
| ------------ | ------------------------------------------------------ | ------------------------------------------------------- |
| **full**     | No max-width; viewport width with gutter padding only. | Masthead, full-bleed section backgrounds, footer bar.   |
| **wide**     | Executive / briefing width (~56rem).                   | Hero plate (title + portrait), routes, doctrine, cards. |
| **readable** | Optimal line length for long-form text (~42rem).       | Hero lede, body copy, lists, articles.                  |

**Rules**

- Full-bleed: section wrapper spans viewport; inner content uses `Container` (readable or wide) so the lane is constrained and centered.
- Readable lane: max-width `var(--readable-max-width)` (42rem); never increased on ultrawide.
- Wide lane: max-width `var(--container-max-width)` (56rem); never increased on ultrawide.
- Full lane: no max-width; padding from `--container-padding-x` / `--container-padding-x-wide` only.

**Checklist — Lanes**

- [ ] Section backgrounds that should span edge-to-edge use full-bleed wrapper; inner content is in a lane (readable or wide).
- [ ] Long-form text (body, lede, articles) uses readable lane (42rem max).
- [ ] Hero plate, cards, and executive content use wide lane (56rem max).
- [ ] Masthead and footer use full lane (gutter padding only).
- [ ] Lane max-widths are token-driven; no hardcoded rem/px for lane width.

---

## 3. Typography scaling rules (including ultrawide)

- **Hero display:** Tokenized fluid scale; e.g. `--hero-display-size: clamp(2.75rem, 6vw + 1.5rem, 3.5rem)`. Min/max cap prevents over-scaling on ultrawide.
- **Section headings:** Use `--section-heading-size` or fluid clamp tokens; avoid raw viewport units alone.
- **Body:** Fixed `--body-analytical-size` (1rem); line height and line length (readable lane) carry readability. No stretched paragraphs at any width.
- **Fluid type:** Prefer clamp-based tokens for hero and headings; avoid `vw`-only so ultrawide does not blow up type.
- **Ultrawide:** Line length is never increased; type may scale only within clamp max; body remains 1rem.

**Checklist — Typography**

- [ ] Hero and display use clamp-based tokens with explicit min and max.
- [ ] Body copy uses fixed size (1rem); no viewport-based body scaling.
- [ ] At 1920px+ no increase in readable or wide lane max-width; no paragraph stretching.
- [ ] Section headings use tokens; no one-off font-size values for the same hierarchy level.

---

## 4. Spacing rhythm rules (8px scale)

- All gutters, section spacing, and vertical rhythm derive from the **8px spacing scale** (tokens: `--space-1` through `--space-8`, and `--space-10` where documented for layout).
- No arbitrary pixel values for spacing; use `--space-*`, `--section-block-margin`, `--content-lane-gap`, `--hero-block-gap`, etc.
- Section rhythm: `--section-block-margin`, `--section-inner-gap`, `--home-section-gap` / `--home-section-gap-md` for home.
- Gutter: `--container-padding-x` (base), `--container-padding-x-wide` at sm+; at ultra (1920px+) padding may step up (e.g. `--container-padding-x-wide: var(--space-10)`); line length unchanged.

**Checklist — Spacing**

- [ ] All new spacing uses tokens from the 8px scale; no magic numbers.
- [ ] Section-to-section and block spacing use section rhythm tokens.
- [ ] Gutter uses `--container-padding-x` / `--container-padding-x-wide`; logical properties for RTL.

---

## 5. No-horizontal-scroll rule and enforcement

- **Rule:** At every supported viewport (320px through ultrawide) and every locale (including RTL), the document must not produce a horizontal scrollbar. `overflow-x: clip` on `html` is the global enforcement; no content may cause overflow.
- **Causes to avoid:** Fixed widths larger than viewport; long unbroken strings (use `overflow-wrap: break-word` where needed); negative margins or positioning that pull content outside; non-logical insets that break in RTL.
- **Enforcement:** Manual and E2E checks at 320, 375, 768, 1024, 1280, 1536, 1920+; `document.documentElement.scrollWidth <= clientWidth + tolerance` (e.g. 1px). i18n-rtl-stress tests cover locale × viewport.

**Checklist — No horizontal scroll**

- [ ] `html` has `overflow-x: clip` (or equivalent) and no layout removes it.
- [ ] At 320px, 375px, 768px, 1024px, 1280px, 1536px, 1920+ no horizontal scroll for default and RTL locales.
- [ ] Long words and URLs wrap or break; no fixed-width containers that exceed viewport.
- [ ] E2E (e.g. i18n-rtl-stress) runs in CI and includes no-horizontal-scroll assertion per locale × viewport.

---

## 6. Authority preservation rules (ultrawide)

On ultrawide (1920px+), the interface must preserve institutional authority and readability. Stretched paragraphs and edge-to-edge text destroy authority.

- **Line length:** Do not increase. Readable ≤42rem, wide ≤56rem at all breakpoints including ultra.
- **Padding:** Increase horizontal padding (e.g. `--container-padding-x-wide` or `--container-padding-x-ultra`) so content does not sit at screen edges; section backgrounds remain full-bleed, inner lane centered.
- **Type:** Only hero/display may scale up to a clamp max; body and section headings do not grow with viewport.
- **Sections:** Full-bleed section backgrounds remain full width; only the inner lane container is constrained and centered.

**Checklist — Authority preservation (ultrawide)**

- [ ] At 1920px+ readable lane max-width remains 42rem; wide lane 56rem.
- [ ] At 1920px+ horizontal padding increases via tokens; content does not hug screen edges.
- [ ] No paragraph or lede block is allowed to span full viewport width on ultrawide.
- [ ] Hero/display type uses clamp max only; no unbounded vw scaling.

---

## 7. RTL and localization

- **Logical properties only:** Use `margin-inline`, `padding-inline`, `inset-inline`, `start`/`end` in CSS and Tailwind (e.g. `ps-*`, `pe-*`, `ms-*`, `me-*`). No `left`/`right` for layout.
- **Flexbox/Grid:** Prefer inline-start/inline-end or logical equivalents so RTL mirrors without extra rules.
- **Direction:** `dir` and locale are set by the app (e.g. next-intl); layout must not assume LTR. RTL (e.g. Hebrew) must mirror layout correctly.
- **Safe-area:** Where appropriate, gutters include `env(safe-area-inset-inline-start)` and `env(safe-area-inset-inline-end)` so notches and system UI do not clip content.
- **Localization:** All responsive behavior (breakpoints, lanes, spacing) is locale-agnostic; only `dir` and text affect layout. No responsive rule may depend on locale except via `dir`.

**Checklist — RTL and localization**

- [ ] No hardcoded `left`/`right` or `ml-*`/`mr-*` for layout that should flip in RTL; use logical or `ms-*`/`me-*`.
- [ ] Gutters and padding use logical properties; RTL mirrors correctly.
- [ ] E2E or manual check: RTL locale (e.g. `he`) shows mirrored layout; no overlap or clipped focus.
- [ ] Safe-area insets considered for notched/narrow devices where applicable.

---

## 8. Accessibility requirements (touch targets, focus, reduced motion)

- **Touch targets:** Interactive elements (links, buttons, nav items, masthead utilities) meet minimum touch target size (e.g. 44×44px) on touch-capable viewports; use tokens such as `--masthead-touch-min: 44px` and `masthead-touch-target` where specified.
- **Focus:** Visible focus ring on all focusable elements; `:focus-visible` with token `--focus-ring-width`, `--focus-ring-offset`, `--focus-ring-color`. Focus ring must not be clipped by overflow (e.g. masthead, modals); no `overflow: hidden` on a focusable ancestor without ensuring the ring is visible.
- **Reduced motion:** Respect `prefers-reduced-motion: reduce` and `data-motion="reduced"` (or `motion-reduce-force`): set `scroll-behavior: auto`; set animation/transition duration to near-zero where required (e.g. 0.01ms); disable or simplify parallax/backdrop motion. Documented in `10-base.css` and token usage.
- **Contrast and semantics:** WCAG 2.2 AA+ maintained at all breakpoints; no responsive change may reduce contrast or remove semantic structure.

**Checklist — Accessibility**

- [ ] Masthead and primary nav/utilities use minimum 44px touch target on mobile/tablet.
- [ ] Focus ring is visible and not clipped at all viewports (including desktop and ultrawide) and in RTL.
- [ ] Reduced-motion preference disables or minimizes animations/transitions and scroll behavior per 10-base.css.
- [ ] No responsive change weakens focus styles, semantics, or contrast below WCAG 2.2 AA.

---

## 9. Master enforcement checklist

Use this checklist for any change that affects layout, breakpoints, lanes, typography scaling, spacing, overflow, or RTL. Each item is testable (yes/no).

**Breakpoints and intents**

- [ ] New or changed breakpoint usage aligns with §1 (xs/sm/md/lg/xl/2xl/ultra) and named intent.
- [ ] 320px and constrained IoT widths do not break layout; no horizontal scroll.

**Lanes**

- [ ] Content uses correct lane (full / wide / readable) per §2; no full-viewport text blocks for body/lede.
- [ ] Full-bleed sections use inner Container (lane); token-driven max-widths only.

**Typography**

- [ ] Hero/display use clamp-based tokens; body fixed 1rem; no stretched paragraphs on ultrawide (§3).

**Spacing**

- [ ] All spacing uses 8px-scale tokens; gutters use container-padding tokens; logical properties for RTL (§4).

**No horizontal scroll**

- [ ] No new overflow cause; `overflow-x: clip` on html preserved; E2E or manual check at 320, 375, 768, 1024, 1280, 1536, 1920+ and RTL (§5).

**Authority preservation (ultrawide)**

- [ ] At 1920px+ line length unchanged; padding increased via tokens; no edge-to-edge paragraphs (§6).

**RTL and localization**

- [ ] Logical properties only; no LTR-only layout; RTL mirroring and focus verified (§7).

**Accessibility**

- [ ] Touch targets ≥44px where required; focus ring visible and not clipped; reduced motion respected (§8).

**Compatibility**

- [ ] Changes are compatible with existing tokens (`libs/tokens`, `apps/web/src/styles/00-tokens.css`), lanes (Container, full-bleed, content-lane-grid), and PGF (no conflict with tone/copy governance).
- [ ] `responsive-contract.md` and this constitution stay aligned; if contract is updated, constitution is reviewed.

---

## 10. Enforcement and proof (operational)

This section makes the constitution **operational**: how to verify compliance and what evidence to produce. No code in this doc; implementation lives in validators, E2E, and CI.

**Validation and CI**

- [ ] **Authority constitution validator** (`nx run web:authority-constitution-validate`) runs in CI and references this document; any change to layout/tokens/breakpoints must not break it.
- [ ] **Responsive layout E2E** (`responsive-layout.spec.ts`) and **i18n-rtl-stress** cover breakpoints and RTL; no-horizontal-scroll assertions run at defined viewports (320, 375, 768, 1024, 1280, 1536, 1920+).
- [ ] **Token drift validator** (`nx run web:token-drift-validate`) ensures layout-related tokens stay in the governance list; no one-off values for lanes or breakpoints.
- [ ] **Visual / presentation-integrity** E2E runs at key breakpoints; layout regressions are caught before merge.

**Proof checklist (per release or major layout change)**

- [ ] Run full CI (`verify-fast`, `build`, `a11y`, `visual`, `lighthouse`); all green.
- [ ] Run responsive + RTL E2E at all constitution viewports; no horizontal scroll, no overlap.
- [ ] Confirm lane usage: no full-bleed body/lede; readable/wide max-widths token-driven.
- [ ] Confirm typography: hero/display use clamp tokens; body 1rem; ultrawide no stretched paragraphs.
- [ ] Confirm spacing: 8px scale tokens only; gutters use container-padding; logical properties for RTL.
- [ ] Confirm accessibility: touch targets, focus ring, reduced motion respected at all breakpoints.

**Conflict resolution**

- This constitution overrides ad-hoc responsive decisions. If `responsive-contract.md` or implementation (e.g. `20-layout.css`) conflicts, this document wins; update the contract or code to align.
- PGF governs copy and proof; this document governs layout and responsiveness only.

---

## 11. References

- **Breakpoints and lanes (implementation):** `docs/authority/responsive-contract.md`
- **Layout and lanes (CSS):** `apps/web/src/styles/20-layout.css`
- **Tokens:** `libs/tokens/src/lib/tokens.css`, `apps/web/src/styles/00-tokens.css`
- **Page Frame:** `libs/ui/src/lib/PageFrame.tsx`; lane composition and section rhythm.
- **RTL and i18n stress:** `docs/authority/i18n-rtl-stress.md`; E2E `apps/web-e2e/src/presentation-integrity/i18n-rtl-stress.spec.ts`
- **Design doctrine:** `docs/authority/design-constitution.md`; **Design checklist:** `docs/authority/design-constitution-checklist.md`
- **PGF (tone/copy):** `docs/pgf.md` — this constitution governs layout only; PGF governs copy and proof-forward rules.
- **Enforcement:** §10 (Enforcement and proof); validators and E2E in CI.

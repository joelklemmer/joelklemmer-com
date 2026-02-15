# Home page: localhost vs Figma — visual differences

**Purpose:** Audit of differences between the home page (below header) at localhost and the Figma design. Header is fixed; photo subject excluded. Authority: [https://pages-tile-41445691.figma.site/](https://pages-tile-41445691.figma.site/).

**Date:** 2026-02-15

---

## 1. Hero headline (H1)

| Aspect          | Figma                                                                                                     | localhost                                                                                                 | Status                  |
| --------------- | --------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- | ----------------------- |
| **Content**     | "Institutional Systems." / "Capital Governance." / "Operational Authority." (3 lines, each phrase intact) | "Institutional Architecture." / "Capital Discipline." / "Operational Stewardship." (Final Recommendation) | Diverges (intentional)  |
| **Line breaks** | Three phrases on three lines; no mid-phrase wrap                                                          | Each word on its own line ("Institutional", "Systems.", "Capital", etc.) — wrapping incorrectly           | ❌ **Wrong**            |
| **Font**        | Large, bold **serif**                                                                                     | Serif (Crimson Pro) in CSS                                                                                | ✓ Aligned               |
| **Line height** | Generous vertical spacing                                                                                 | `line-height: 1.2`                                                                                        | ⚠ Verify against Figma |
| **Color**       | Dark gray / black                                                                                         | `hsl(var(--color-text))`                                                                                  | ✓ Aligned               |

**Root cause:** Thesis spans wrap mid-phrase when the content column is narrow. Need `white-space: nowrap` (with narrow-viewport fallback) or a wider minimum column width so "Institutional Systems." stays on one line.

---

## 2. Supporting paragraph (lede)

| Aspect         | Figma                                                                                     | localhost                                                                                                         | Status               |
| -------------- | ----------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | -------------------- |
| **Content**    | "Institutions run on structure. Capital requires discipline. Governance is architecture." | "Institutions are built on structure. Capital demands discipline. Enduring governance is engineered." (hero.lede) | Diverges (Final Rec) |
| **Font**       | Smaller, lighter weight **sans-serif**                                                    | **Serif** (Crimson Pro)                                                                                           | ❌ **Wrong**         |
| **Color**      | Medium gray (lighter than heading)                                                        | `hsl(var(--color-muted))`                                                                                         | ✓ Aligned            |
| **Size**       | Smaller than heading                                                                      | `--text-body-large` (1.125rem)                                                                                    | ✓ Aligned            |
| **Visibility** | Below heading, above CTAs                                                                 | Present in markup                                                                                                 | ✓ Aligned            |

**Root cause:** Figma shows lede as sans-serif; codebase uses serif. Tokens and 55-figma-parity both set `--font-serif` for lede.

---

## 3. CTA buttons

| Aspect                | Figma                                                          | localhost                                                  | Status       |
| --------------------- | -------------------------------------------------------------- | ---------------------------------------------------------- | ------------ |
| **Primary label**     | "Executive Brief →" (with arrow)                               | "Executive Brief" (no arrow)                               | ❌ **Wrong** |
| **Primary styling**   | Dark solid bg, white text, **slightly rounded corners**        | Dark solid, white text, **rectangular** (border-radius: 0) | ❌ **Wrong** |
| **Secondary label**   | "Case Studies"                                                 | "Case Studies"                                             | ✓ Aligned    |
| **Secondary styling** | White/light bg, thin dark border, **slightly rounded corners** | Outline, rectangular                                       | ❌ **Wrong** |
| **Horizontal gap**    | Clear gap between buttons                                      | `gap: var(--space-4)`                                      | ✓ Aligned    |
| **Vertical spacing**  | Adequate padding                                               | `padding: var(--space-3) var(--space-6)`                   | ✓ Aligned    |

**Root cause:** (1) CTA arrow removed in prior revert; (2) figma-site-design-spec and 55-figma-parity enforce `border-radius: 0` per token import, but Figma screenshot shows slightly rounded corners — spec may be outdated or design evolved.

---

## 4. Portrait / image container

| Aspect            | Figma                                             | localhost                                             | Status                   |
| ----------------- | ------------------------------------------------- | ----------------------------------------------------- | ------------------------ |
| **Shape**         | Rectangular, no visible border                    | Rectangular, `border-radius: 0`                       | ✓ Aligned                |
| **Shadow**        | No visible shadow                                 | `box-shadow: 0 1px 3px hsl(var(--color-text) / 0.04)` | ⚠ Subtle shadow present |
| **Background**    | N/A (image)                                       | `--color-neutral-100` light grey behind subject       | ✓ Aligned                |
| **Placement**     | Right of text, vertically aligned with text block | Same grid layout                                      | ✓ Aligned                |
| **Photo subject** | Excluded per user                                 | Excluded                                              | —                        |

---

## 5. Page background

| Aspect           | Figma                        | localhost                                 | Status    |
| ---------------- | ---------------------------- | ----------------------------------------- | --------- |
| **Color**        | Light off-white / beige      | `--color-bg: 60 11% 96%` (warm off-white) | ✓ Aligned |
| **Footer strip** | Lighter gray strip at bottom | `--color-footer` (surface-elevated)       | ✓ Aligned |

---

## 6. Spacing and layout

| Aspect                  | Figma                          | localhost                                       | Status                |
| ----------------------- | ------------------------------ | ----------------------------------------------- | --------------------- |
| **Heading → paragraph** | Generous vertical spacing      | `--hero-block-gap` (var(--space-6) from tokens) | ⚠ Verify exact value |
| **Paragraph → buttons** | Adequate spacing               | Same gap                                        | ✓ Aligned             |
| **Button → button**     | Clear horizontal gap           | `var(--space-4)`                                | ✓ Aligned             |
| **Text column padding** | Notable padding from left edge | Gutter + container padding                      | ✓ Aligned             |
| **Two-column layout**   | Text left, image right         | `hero-authority-grid` 1fr + portrait            | ✓ Aligned             |

---

## 7. Summary: fixes applied (2026-02-15)

1. **Hero line breaks:** ✓ Added `white-space: nowrap` to thesis spans; fallback `normal` on viewports &lt; 480px.
2. **Lede font:** ✓ Changed to sans-serif in 55-figma-parity and 20-layout.
3. **Primary CTA:** ✓ Added " →" to label in en, es, he, uk home.json.
4. **Button radius:** ✓ Added `border-radius: 0.25rem` to hero CTAs in 55-figma-parity.
5. **Portrait shadow:** ✓ Removed via `box-shadow: none !important` on .hero-portrait-wrapper in 55-figma-parity.

---

_For exact pixel values, inspect the live Figma site or use DevTools._

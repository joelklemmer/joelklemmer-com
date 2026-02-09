# Responsive Contract

**Purpose:** Site-wide responsive layout system that matches Figma responsive intent, eliminates the "boxed/container-only" feel, and preserves readability and authority. Single source of truth for breakpoints, lanes, gutters, and typography scaling.

**Scope:** 320px through ultra-wide (TV). No route/slug/locale changes. next-intl + RTL preserved. Tokens remain source of truth. WCAG 2.2 AA+ maintained.

---

## 1. Breakpoints

| Name      | Min width     | Purpose                                                                  |
| --------- | ------------- | ------------------------------------------------------------------------ |
| **xs**    | 320px (floor) | Minimum supported viewport; no layout below this.                        |
| **sm**    | 640px         | Narrow tablet / large phone; wider gutters, two-column potential.        |
| **md**    | 768px         | Tablet; hero grid, section layout shifts.                                |
| **lg**    | 1024px        | Desktop; full hero composition, wider content lanes.                     |
| **xl**    | 1280px        | Large desktop; optimal reading and portrait scaling.                     |
| **2xl**   | 1536px        | Extra-large; cap line length, increase padding.                          |
| **ultra** | 1920px+       | Ultra-wide / TV; padding and type scale up, line length never stretched. |

Breakpoints are implemented via CSS media queries and, where needed, Tailwind’s default theme (sm/md/lg/xl/2xl). No `xs` in Tailwind; use `min-width: 320px` and max-width queries for small screens.

---

## 2. Lane variants

Content is placed in one of three **lane** variants so that only the inner content is constrained; section backgrounds and page chrome can be full-bleed.

| Variant      | Purpose                                                | Typical use                                             |
| ------------ | ------------------------------------------------------ | ------------------------------------------------------- |
| **readable** | Optimal line length for long-form text (~42rem).       | Hero lede, body copy, lists, articles.                  |
| **wide**     | Executive / briefing width (~56rem).                   | Hero plate (title + portrait), routes, doctrine, cards. |
| **full**     | No max-width; viewport width with gutter padding only. | Masthead, full-bleed section backgrounds, footer bar.   |

---

## 3. Max widths per lane at each breakpoint

All values use tokens; rem where specified.

| Breakpoint      | readable                          | wide                               | full |
| --------------- | --------------------------------- | ---------------------------------- | ---- |
| xs (320px)      | 100% (minus gutter)               | 100% (minus gutter)                | 100% |
| sm (640px+)     | `var(--readable-max-width)` 42rem | `var(--container-max-width)` 56rem | 100% |
| md (768px+)     | 42rem                             | 56rem                              | 100% |
| lg (1024px+)    | 42rem                             | 56rem                              | 100% |
| xl (1280px+)    | 42rem                             | 56rem                              | 100% |
| 2xl (1536px+)   | 42rem                             | 56rem                              | 100% |
| ultra (1920px+) | 42rem (unchanged)                 | 56rem (unchanged)                  | 100% |

Line length is **never** increased on ultra-wide; instead, padding and type scale (see §6).

---

## 4. Gutter rules (safe-area aware)

- **Gutter token:** `--container-padding-x` (base), `--container-padding-x-wide` at sm+.
- **Logical properties only:** `padding-inline-start`, `padding-inline-end` (or Tailwind `ps-*` / `pe-*`) so RTL mirrors correctly.
- **Safe-area:** Add `env(safe-area-inset-inline-start)` and `env(safe-area-inset-inline-end)` into gutter calc where appropriate so notches and system UI do not clip content. Optional token: `--gutter-inline-start: calc(var(--container-padding-x) + env(safe-area-inset-inline-start, 0px));` (and same for end and wide variant).
- **8px scale:** All gutters and section spacing derive from the 8px spacing scale (tokens); no arbitrary pixel values.

---

## 5. Typography scaling strategy

- **Hero display:** Already tokenized: `--hero-display-size: clamp(2.75rem, 6vw + 1.5rem, 3.5rem);`. Min 2.75rem, max 3.5rem, fluid between.
- **Section headings:** Use `--section-heading-size` (1.5rem) or fluid clamp if a token is added (e.g. `clamp(1.25rem, 2vw + 1rem, 1.5rem)`).
- **Body:** Fixed `--body-analytical-size` (1rem); line height and line length (readable lane) do the work. No stretched paragraphs.
- **Fluid type:** Prefer clamp-based tokens for hero and headings; avoid viewport units alone to prevent over-scaling on ultra-wide.

---

## 6. Ultra-wide (1920px+) rules

- **Line length:** Do not increase. Keep readable ≤42rem, wide ≤56rem.
- **Padding:** Increase horizontal padding (e.g. `--container-padding-x-wide` or a dedicated `--container-padding-x-ultra`) so content does not sit at screen edges.
- **Type:** Slight scale-up for hero/display only via clamp max; body and section headings can use existing tokens or a modest clamp max.
- **Sections:** Full-bleed section backgrounds remain full width; only the inner lane container is constrained and centered.

---

## 7. RTL notes

- **Logical properties only:** Use `margin-inline`, `padding-inline`, `inset-inline`, `start`/`end` in CSS and Tailwind (e.g. `ps-*`, `pe-*`, `ms-*`, `me-*`). No `left`/`right` for layout.
- **Flexbox/Grid:** Prefer `inline-start`/`inline-end` or logical equivalents so RTL mirrors without extra rules.
- **next-intl:** `dir` and locale are set by the app; layout must not assume LTR.

---

## 8. Implementation checklist

- [x] Container component with variants: `readable`, `wide`, `full` (libs/ui Container.tsx).
- [x] FullBleed wrapper for section backgrounds (libs/ui FullBleed.tsx).
- [x] Page background and section shells full viewport width; only inner content in lanes (page-frame max-width: none; content-lane-grid full width).
- [x] Hero: full-bleed section; inner lane wide; portrait scales with breakpoints (existing tokens in 20-layout.css).
- [x] Masthead: full width; inner Container for identity/nav/utilities (Shell/Header unchanged).
- [ ] Responsiveness: validate manually at 320, 375, 768, 1024, 1280, 1536, 1920+; no horizontal scroll; RTL correct; no contrast regressions.

## 9. Responsiveness testing checklist

Validate manually (and in code where possible):

| Viewport | Checks                                                                  |
| -------- | ----------------------------------------------------------------------- |
| 320px    | No horizontal scroll; nav usable; hero stacks; portrait constrained.    |
| 375px    | Same; touch targets adequate.                                           |
| 768px    | Hero grid; portrait beside content; section spacing.                    |
| 1024px   | Full hero composition; portrait max-width 420px.                        |
| 1280px   | Portrait max-width 450px; lanes centered.                               |
| 1536px   | No stretched paragraphs; padding from tokens.                           |
| 1920px+  | Ultra-wide padding (--container-padding-x-wide); line length unchanged. |
| RTL      | Logical properties only; layout mirrors; nav/hero correct.              |
| Contrast | No regressions; WCAG 2.2 AA+ maintained.                                |

# Figma vs localhost — visual differences

**Purpose:** Audit of differences between [https://pages-tile-41445691.figma.site/](https://pages-tile-41445691.figma.site/) and http://localhost:3001/en. Figma is visual authority; the codebase must match.

**Date:** 2026-02-14

---

## 1. Masthead (header)

| Aspect                   | Figma                                    | localhost             | Status    |
| ------------------------ | ---------------------------------------- | --------------------- | --------- |
| **Background (light)**   | Light surface (off-white)                | Light (00-tokens.css) | ✓ Aligned |
| **Text (light)**         | Dark grey, serif on light                | Dark on light         | ✓ Aligned |
| **Wordmark**             | Uniform weight and size (per Figma site) | Same structure        | ✓ Aligned |
| **Nav links**            | Serif, dark on light                     | Serif, dark on light  | ✓ Aligned |
| **Utility icons**        | Dark/muted on light                      | Dark/muted on light   | ✓ Aligned |
| **Hamburger breakpoint** | Full nav above xl (1280px)               | 1280px                | ✓ Aligned |
| **Background (dark)**    | Dark surface (similar to page)           | Dark surface          | ✓ Aligned |

---

## 2. Page / hero

| Aspect              | Figma                                         | localhost                | Action    |
| ------------------- | --------------------------------------------- | ------------------------ | --------- |
| **Page bg (light)** | Off-white / light beige ≈ rgb(248, 246, 241)  | `--color-bg` 40 30% 96%  | ✓ Aligned |
| **Hero H1**         | Large dark serif (≈60–80px), bold             | font-weight 700, clamp() | ✓ Aligned |
| **Hero lede**       | Serif, muted grey                             | Serif (Crimson Pro)      | ✓ Aligned |
| **Portrait**        | Right column, light grey bg, rectangular crop | Same structure           | Aligned   |
| **CTAs**            | Primary filled dark, secondary outline        | Same                     | Aligned   |

---

## 3. Sections

| Aspect                    | Figma                           | localhost      | Action                   |
| ------------------------- | ------------------------------- | -------------- | ------------------------ |
| **Institutional Domains** | H2 + 3 cards (H3 + description) | Same           | Aligned                  |
| **Selected Work**         | H2 + case card + View All CTA   | Same           | Aligned                  |
| **Card material**         | Flat / subtle shadow            | authority-card | ✓ Flatter shadow aligned |

---

## 4. Footer

| Aspect            | Figma                                                | localhost                    | Action         |
| ----------------- | ---------------------------------------------------- | ---------------------------- | -------------- |
| **Layout**        | Three columns with headers                           | `groups` prop, three columns | Aligned        |
| **Headers**       | INSTITUTIONAL RESOURCES, CONTEXT, LEGAL & GOVERNANCE | Same from i18n               | Aligned        |
| **Bottom bar**    | © 2026, WCAG 2.2 AA+, scroll-to-top button          | Same                         | Aligned        |
| **Scroll-to-top** | Dark rectangular, chevron-up                         | FooterScrollToTop            | Verify styling |
| **Background**    | Light grey, distinct from main                       | `--color-footer`             | Aligned        |

---

## 5. Typography

| Aspect       | Figma                       | localhost        | Action    |
| ------------ | --------------------------- | ---------------- | --------- |
| **Headings** | Crimson Pro, Georgia, serif | `--font-serif`   | Aligned   |
| **Body**     | Serif (Figma spec)          | `--font-serif`   | ✓ Aligned |
| **Hero H1**  | Display serif, bold         | hero-title       | Aligned   |
| **Nav**      | Serif, `--text-nav`         | nav-primary-link | Aligned   |

---

## 6. Containers and shells

| Aspect                 | Figma                 | localhost                             | Action  |
| ---------------------- | --------------------- | ------------------------------------- | ------- |
| **Max width**          | 1280px                | `--container-max-width`               | Aligned |
| **Horizontal padding** | ~100–150px at desktop | `--container-padding-x` 5rem @ 1280px | Aligned |
| **Single lane**        | Unified content band  | Container variant="wide"              | Aligned |

---

## 7. Summary of implementation changes

1. **Masthead light mode:** ✓ Implemented. Light surface background, dark text via `--masthead-bg`, `--masthead-text`, `--masthead-text-muted` in figma-make.tokens.patch.css (Figma site authority). 50-masthead-responsive.css consumes these tokens.
2. **Verify:** Page bg warmth (✓ 00-tokens), hero lede font (✓), scroll-to-top rectangular dark (✓ 55-figma-parity), card shadows (✓).
3. **No change:** Functionality, routes, backend, i18n content — keep as is.

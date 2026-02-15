# Figma Make published site — design spec

**Source:** [https://pages-tile-41445691.figma.site/](https://pages-tile-41445691.figma.site/)

**Authority:** This doc describes the Figma site. The codebase must align with Figma — not the other way around. When in doubt, inspect the live site or Figma source.

---

## 1. Page structure

### Hero

- **H1 (Figma reference):** "Institutional Systems. Capital Governance. Operational Authority." (three lines, period-terminated phrases)
- **Lede (Figma reference):** "Institutions run on structure. Capital requires discipline. Governance is architecture."
- **H1 (implementation):** "Institutional Architecture. Capital Discipline. Operational Stewardship." (Final Recommendation)
- **Lede (implementation):** "Institutions are built on structure. Capital demands discipline. Enduring governance is engineered."
- **CTAs:** Executive Brief (primary), Case Studies (secondary)
- **Layout:** Two-column — headline/lede/CTAs left, portrait right
- **Portrait (Figma):** Light grey background behind subject; rectangular crop
- **Portrait (implementation):** Refined contrast, cooler tone, subtle vignette, matte finish (Final Recommendation)

### Sections

- **Institutional Domains** (H2)
  - Governance Architecture (H3) + description
  - Capital Stewardship (H3) + description
  - Operational Systems (H3) + description
- **Selected Work** (H2)
  - Case study card: title, sector, capital scale, governance impact, summary
  - CTA: View All Case Studies

### Header (masthead) — Figma authority

**Source: https://pages-tile-41445691.figma.site/ — this doc describes Figma; implementation must match.**

- **Background (light mode):** Black. `--masthead-bg: hsl(0 0% 0%)`, `--masthead-bg-scrolled` set in `00-tokens.css`. Dark mode uses surface match from patch.
- **Text (light mode):** Dark text on light surface. `--masthead-text`, `--masthead-text-muted`, `--masthead-focus` for header content and focus rings. Matches Figma site exactly.
- **Wordmark:** One line by default ("Joel R. Klemmer"). Wraps to two lines responsively when space constrains. Serif (Crimson Pro). Uniform weight and size. `wordmarkLine1`/`wordmarkLine2` in i18n, rendered inline with `<wbr>` for responsive break.
- **Nav:** Serif, `--text-nav` size, normal weight. Home, Executive Brief, Case Studies, Books, Public Record, Contact.
- **Utils:** Globe (language), Moon/Sun (theme toggle — icon switches by mode), Sliders (accessibility menu)
- **Layout:** Logo left, nav center, utilities right. Hamburger below xl (1280px); full nav above xl. On mobile: logo truncates, hamburger + utilities stay right and tappable (50-masthead-responsive.css). Icons (globe, theme, a11y, hamburger) use `--masthead-text-muted` for muted accent on the masthead background.

### Footer (detailed)

**Three-column layout with section headers:**

| Column | Header                  | Links                                                         |
| ------ | ----------------------- | ------------------------------------------------------------- |
| 1      | INSTITUTIONAL RESOURCES | Media Library, Media Kit, Press Kit, Executive Bio            |
| 2      | CONTEXT                 | FAQ, Now                                                      |
| 3      | LEGAL & GOVERNANCE      | Privacy, Terms, Accessibility, Security, Cookies, Preferences |

**Footer structure:**

- Horizontal divider line(s) between link section and bottom bar
- **Section headers:** Uppercase, lighter grey than link text
- **Link groups:** Grouped under headers, one link per line within column
- **Bottom bar:**
  - Left: © 2026 Joel R. Klemmer. All rights reserved.
  - Right: WCAG 2.2 AA+ statement
  - Far right: Scroll-to-top button — dark rectangular, upward-pointing chevron
- **Background:** Light grey, distinct from main content area

---

## 2. Typography

- **Headings:** Serif (Crimson Pro or similar)
- **Wordmark:** Serif (Crimson Pro). One line by default; wraps to two when narrow. Uniform weight and size.
- **Hero H1:** Large display size (≈60–80px), tight line-height (~1.1–1.2), bold
- **Nav:** Serif, `--text-nav`, dark
- **Body/descriptions:** Serif, standard size
- **Footer headers:** Uppercase, small caps or all-caps, lighter grey

---

## 3. Layout and spacing

- **Page background:** Light off-white (≈rgb(248, 246, 241))
- **Header (light mode):** Black masthead (`--masthead-bg` in `00-tokens.css`). Dark mode uses surface match from patch.
- **Padding:** Generous horizontal (~100–150px)
- **Hero:** Clear top spacing between header and content
- **Portrait:** Right column, light grey bg, no heavy border/shadow
- **Footer:** Full-width, light grey bg, generous vertical padding

---

## 4. Buttons and controls

- **Primary CTA (Executive Brief):** Filled, dark
- **Secondary CTA (Case Studies):** Outline or muted fill
- **Scroll to top:** Dark rectangular button, chevron-up icon
- **Nav links:** Text-style, no button treatment
- **Utility icons:** Compact, right-aligned in header

---

## 5. Alignment with current codebase

| Figma site                          | joelklemmer-com                 | Status                                                                   |
| ----------------------------------- | ------------------------------- | ------------------------------------------------------------------------ |
| Three thesis lines                  | `thesisLines` in HeroSection    | ✓                                                                        |
| Executive Brief + Case Studies CTAs | `hero.cta`, `hero.ctaSecondary` | ✓                                                                        |
| Institutional Domains (3 cards)     | InstitutionalDomainsSection     | ✓                                                                        |
| Selected Work + case card           | SelectedWorkSection             | ✓                                                                        |
| Nav items                           | PRIMARY_NAV_ENTRIES             | ✓ (labels differ: Books=writing, Case Studies=work, Public Record=proof) |
| Footer links (flat list)            | FooterSection                   | ⚠ See below                                                             |
| Portrait right of hero              | hero-authority-grid 1fr + 480px | ✓                                                                        |
| Scroll to top                       | ScrollToTop component           | ✓                                                                        |

### Footer differences

| Figma                                                | joelklemmer-com                                |
| ---------------------------------------------------- | ---------------------------------------------- |
| Three columns with headers                           | Single flat flex-wrap list                     |
| INSTITUTIONAL RESOURCES, CONTEXT, LEGAL & GOVERNANCE | No column grouping                             |
| © 2026 + WCAG 2.2 AA+ in bottom bar                 | No copyright/accessibility statement in footer |
| Label "Quiet navigation" (a11y)                      | Same label                                     |

---

## 6. Routes on Figma site

- `/` — Home
- `/executive-brief` — Brief
- `/case-studies` — Case studies

---

## 7. Design tokens (from prior Figma Make import)

- `--font-serif`: Crimson Pro
- `--font-sans`: Inter
- `--text-hero`: 3rem
- `--text-hero-line`: 1.15
- `--max-width`: 1280px
- `--nav-height`: 76px
- Hero lede: sans-serif (live Figma site)
- Hero CTAs: slightly rounded corners (0.25rem) on live Figma site
- Portrait, cards: rectangular (border-radius 0)

---

## 8. Implementation: Figma parity layer

The design layer `apps/web/src/styles/55-figma-parity.css` loads last and enforces Figma design:

- Hero portrait, cards, section anchors, scroll-to-top: rectangular (`border-radius: 0`)
- Hero CTAs: slightly rounded (`0.25rem`) per live Figma site
- Hero lede: sans-serif
- Typography, spacing, and layout per Figma spec. See also `00-tokens.css` and `docs/authority/figma-vs-localhost-differences.md`.

---

## 9. Import procedure (tokens from Figma Make)

**Tokens must come from this project only:** https://pages-tile-41445691.figma.site/

If tokens were imported from a different Figma project, colors and specs will be wrong. Re-import:

1. Open the Figma Make project that publishes to https://pages-tile-41445691.figma.site/
2. Go to the **Code** tab
3. Click **Download code**
4. Extract the zip
5. Run: `npx tsx tools/import-figma-make.ts [path-to-extract-or-src.zip]`

The validator `nx run web:figma-source-validate` checks that `figma-make.tokens.json` meta includes the correct source URL. Run after every import.

---

_Captured from browser inspection, accessibility snapshot, and footer scroll. For exact CSS values, inspect the live site or use DevTools._

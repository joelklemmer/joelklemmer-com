# Figma vs libs — UI, components, shells, containers conflict audit

**Purpose:** Identify libs components that conflict with [Figma design](https://pages-tile-41445691.figma.site/). Fix so visuals align.

**Date:** 2026-02-14

---

## 1. libs/shell

### ServerShell.tsx

| Conflict              | Current                                      | Figma                                         | Fix                           |
| --------------------- | -------------------------------------------- | --------------------------------------------- | ----------------------------- |
| Details fallback menu | `nav-primary-menu` uses `bg-surface` (white) | When masthead black, menu should match (dark) | ✓ Fixed via 30-components.css |
| Nav visibility        | Desktop hidden < xl via 20-layout            | Hamburger below 1280px ✓                      | Already correct               |

### MobileNavSheet.tsx

| Conflict         | Current              | Figma                        | Fix                                      |
| ---------------- | -------------------- | ---------------------------- | ---------------------------------------- |
| Sheet background | `bg-surface` (white) | Dark to match black masthead | ✓ Fixed via `.mobile-nav-sheet` override |

### HeaderControlsClient.tsx

| Conflict       | Current                | Figma                  | Fix                                              |
| -------------- | ---------------------- | ---------------------- | ------------------------------------------------ |
| Utility order  | Globe, Theme, Sliders  | Globe, Moon, Sliders ✓ | Already correct                                  |
| Dropdown menus | Portaled, `bg-surface` | N/A (Figma static)     | Dropdowns stay light for readability; acceptable |

---

## 2. libs/ui

### Container.tsx

| Conflict      | Current                       | Figma                                 | Fix                                                            |
| ------------- | ----------------------------- | ------------------------------------- | -------------------------------------------------------------- |
| Lane variants | readable, wide, full          | Max 1280px, ~100–150px padding        | ✓ max-w-container = --container-max-width; padding from tokens |
| Full variant  | max-w-none, ps/pe container-x | Masthead full-bleed, inner bar 1280px | ✓ Correct                                                      |

### PageFrame.tsx

| Conflict     | Current               | Figma                | Fix                                         |
| ------------ | --------------------- | -------------------- | ------------------------------------------- |
| contentStage | Adds page-frame-stage | Flat stage, no float | ✓ Tokens set authority-depth-illusion: none |

### Sheet (sheet.tsx)

| Conflict    | Current               | Figma                               | Fix                                                 |
| ----------- | --------------------- | ----------------------------------- | --------------------------------------------------- |
| Base styles | bg-surface, shadow-lg | Mobile nav dark when masthead black | ✓ Override via .mobile-nav-sheet for MobileNavSheet |

### FooterScrollToTop.tsx

| Conflict | Current         | Figma                          | Fix     |
| -------- | --------------- | ------------------------------ | ------- |
| Styling  | bg-accent, dark | Dark rectangular, chevron-up ✓ | Aligned |

### DropdownMenu (dropdown-menu.tsx)

| Conflict     | Current                   | Figma                      | Fix                                            |
| ------------ | ------------------------- | -------------------------- | ---------------------------------------------- |
| Menu content | bg-surface, border-border | Opened from black masthead | Light menus acceptable for contrast; no change |

---

## 3. libs/sections

### FooterSection.tsx

| Conflict          | Current                              | Figma                                                  | Fix                                                      |
| ----------------- | ------------------------------------ | ------------------------------------------------------ | -------------------------------------------------------- |
| Bottom bar layout | Three flex children, justify-between | Left: copyright; Right: WCAG; Far right: scroll-to-top | ✓ Fixed: footer-bottom-right groups WCAG + scroll-to-top |

### InstitutionalDomainsSection.tsx

| Conflict      | Current            | Figma                                | Fix                                         |
| ------------- | ------------------ | ------------------------------------ | ------------------------------------------- |
| Domain blocks | Plain divs, h3 + p | H3 + description (no explicit cards) | Acceptable; Figma may show as simple blocks |

### SelectedWorkSection.tsx

| Conflict   | Current                      | Figma                       | Fix                                    |
| ---------- | ---------------------------- | --------------------------- | -------------------------------------- |
| Case block | border-t, pt-6, custom hover | "Case study card" per Figma | ✓ Fixed: authority-card for case block |

### HeroSection.tsx

| Conflict  | Current                           | Figma  | Fix     |
| --------- | --------------------------------- | ------ | ------- |
| Structure | thesisLines, lede, CTAs, portrait | Same ✓ | Aligned |

---

## 4. Summary of fixes to apply

1. **ServerShell** — Style `.nav-primary-menu` dark when light theme (masthead black).
2. **FooterSection** — Bottom bar: group WCAG + scroll-to-top on the right.
3. **SelectedWorkSection** — Use `authority-card` for the case study block.

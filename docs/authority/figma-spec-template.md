# Figma Spec Template

**Role:** Figma Parity Spec Extractor.

**Purpose:** Reusable spec for extracting Figma design decisions into code tasks. Use per frame or component set. **Compatible with Cursor MCP workflows and Nx structure.** No code changes in this doc—spec only.

**How to use:** Copy this template into a new file (e.g. `docs/authority/specs/[frame-name]-spec.md`), fill each section from Figma, then use it to drive implementation and parity checks.

---

## 1. Frame identification

| Field                    | Value                                                                 |
| ------------------------ | --------------------------------------------------------------------- |
| **Frame name**           | _e.g. Home Hero, Masthead Light_                                      |
| **Figma URL**            | _Link to frame or file (e.g. https://www.figma.com/file/…?node-id=…)_ |
| **Figma version / date** | _Version name or date of capture_                                     |
| **Design file**          | _File name in Figma if multiple_                                      |

---

## 2. Breakpoints and constraints

Align with [Responsive Contract](responsive-contract.md): xs (320) / sm (640) / md (768) / lg (1024) / xl (1280) / 2xl (1536) / ultra (1920+).

| Breakpoint       | Frame width (Figma) | Min/max container        | Constraints / notes              |
| ---------------- | ------------------- | ------------------------ | -------------------------------- |
| xs               | _e.g. 320_          | _e.g. 100% − gutter_     | _Floor; no layout below_         |
| sm               | _e.g. 640_          | _readable / wide / full_ | _Lane used_                      |
| md               | _e.g. 768_          | _—_                      | _—_                              |
| lg               | _e.g. 1024_         | _—_                      | _—_                              |
| xl / 2xl / ultra | _—_                 | _—_                      | _Line length cap, padding scale_ |

- **Lane used for this frame:** readable | wide | full
- **Horizontal constraints:** Left/right pin, center, fill, scale (describe from Figma)
- **Vertical constraints:** Top/bottom pin, center, fill (describe from Figma)

---

## 3. Component inventory and variants

| Component / layer (Figma) | Variants         | Repo component (path)                   | Notes |
| ------------------------- | ---------------- | --------------------------------------- | ----- |
| _e.g. Masthead_           | Light, Dark, RTL | `libs/ui/src/lib/Nav.tsx`               | _—_   |
| _e.g. Hero title_         | —                | `libs/sections/src/lib/HeroSection.tsx` | _—_   |
| _…_                       | _—_              | _—_                                     | _—_   |

- **Figma component set / variants:** _List all (e.g. Theme: Light/Dark, State: Default/Hover, Language: LTR/RTL)_
- **Instance swap or overrides:** _Any props that change content or layout_

---

## 4. Exact measurements

Use 8px scale where applicable; document exceptions.

| Element / area           | Padding                        | Gaps                               | Radii      | Other (min-height, icon size, etc.) |
| ------------------------ | ------------------------------ | ---------------------------------- | ---------- | ----------------------------------- |
| _e.g. Section container_ | _e.g. 24px block, 16px inline_ | _—_                                | _—_        | _—_                                 |
| _e.g. Card_              | _—_                            | _e.g. 12px between title and body_ | _e.g. 8px_ | _min touch 44px_                    |
| _e.g. Icon + label_      | _—_                            | _e.g. 8px_                         | _—_        | _Icon 20×20_                        |

- **Padding scale:** _e.g. 8, 16, 24, 32 (all in px or rem)_
- **Gap scale:** _e.g. 8, 12, 16, 24_
- **Border radius tokens:** _e.g. --radius-sm 4px, --radius-md 8px_
- **Touch targets:** _Minimum 44×44px for interactive elements; list any smaller and justify_

---

## 5. Typography tokens mapping

| Figma style name    | Font | Size | Weight | Line height | Letter spacing | CSS token / class          |
| ------------------- | ---- | ---- | ------ | ----------- | -------------- | -------------------------- |
| _e.g. Hero/Display_ | _—_  | _—_  | _—_    | _—_         | _—_            | _e.g. --text-hero-display_ |
| _e.g. Body/Large_   | _—_  | _—_  | _—_    | _—_         | _—_            | _—_                        |
| _e.g. Label/Small_  | _—_  | _—_  | _—_    | _—_         | _—_            | _—_                        |

- **Source of truth:** _e.g. `apps/web/src/styles/10-base.css`, `theme-spec.md`, or design tokens lib_
- **RTL:** _Any different font or metrics for RTL (e.g. he/uk); see [i18n-rtl-stress](i18n-rtl-stress.md)_

---

## 6. Color tokens mapping

| Figma fill / role   | Light value | Dark value | CSS token              |
| ------------------- | ----------- | ---------- | ---------------------- |
| _e.g. Background_   | _#FFFFFF_   | _#0a0a0a_  | `var(--color-bg)`      |
| _e.g. Surface_      | _—_         | _—_        | `var(--color-surface)` |
| _e.g. Text primary_ | _—_         | _—_        | `var(--color-text)`    |
| _e.g. Border_       | _—_         | _—_        | `var(--color-border)`  |

- **Theme contract:** _Only semantic tokens; no hardcoded hex in components. See [theme-spec](theme-spec.md)._
- **High-contrast / focus:** _Any dedicated focus or high-contrast colors_

---

## 7. Interaction states

| Component / element   | Default | Hover            | Active | Focus                | Disabled      |
| --------------------- | ------- | ---------------- | ------ | -------------------- | ------------- |
| _e.g. Nav link_       | _—_     | _underline / bg_ | _—_    | _outline 2px offset_ | _opacity 0.5_ |
| _e.g. Button primary_ | _—_     | _—_              | _—_    | _—_                  | _—_           |
| _e.g. Theme toggle_   | _—_     | _—_              | _—_    | _—_                  | _—_           |

- **Focus visible:** _e.g. 2px outline, offset 2px, token --color-focus_
- **Transitions:** _e.g. color 150ms, background 200ms_

---

## 8. Accessibility notes

| Item                  | Spec                                                                                                        |
| --------------------- | ----------------------------------------------------------------------------------------------------------- |
| **Labels**            | _aria-label / visible text for each interactive element; icon-only buttons must have sr-only or aria-label_ |
| **Focus order**       | _Tab order matches visual order; any custom order documented_                                               |
| **Landmarks**         | _banner, main, navigation, contentinfo as applicable_                                                       |
| **Heading hierarchy** | _Single h1 per view; h2/h3 order_                                                                           |
| **Touch targets**     | _Min 44×44px; list exceptions_                                                                              |
| **Reduced motion**    | _Respect prefers-reduced-motion where animations exist_                                                     |

---

## 9. RTL notes

| Aspect      | LTR | RTL                                     | Token / implementation                                         |
| ----------- | --- | --------------------------------------- | -------------------------------------------------------------- |
| **Layout**  | _—_ | _Mirror horizontal layout_              | _Logical properties: margin-inline, padding-inline, start/end_ |
| **Icons**   | _—_ | _Flip directional icons (e.g. chevron)_ | _dir="rtl" or transform scaleX(-1) where needed_               |
| **Text**    | _—_ | _No flip of body text_                  | _dir on container from locale_                                 |
| **Spacing** | _—_ | _Same values, logical_                  | _Use inline/block not left/right_                              |

- **Locales in scope:** _e.g. en, es, he, uk_
- **Reference:** [i18n-rtl-stress](i18n-rtl-stress.md)

---

## 10. Acceptance criteria and required screenshots

- [ ] All measurements from §4 implemented within tolerance (_e.g. ±1px or token match_).
- [ ] Typography (§5) and color (§6) use tokens only; no hardcoded values.
- [ ] All variants in §3 render correctly at breakpoints in §2.
- [ ] Interaction states (§7) match spec; focus visible and keyboard operable.
- [ ] Accessibility (§8) and RTL (§9) criteria met.
- [ ] Screenshot parity: _List viewports and variants that require screenshots for comparison._

**Required screenshots (viewport × variant):**

| Viewport        | Theme | Locale/RTL | Pass/fail |
| --------------- | ----- | ---------- | --------- |
| _e.g. 375×667_  | Light | en (LTR)   | _—_       |
| _e.g. 375×667_  | Dark  | en (LTR)   | _—_       |
| _e.g. 768×1024_ | Light | en (LTR)   | _—_       |
| _e.g. 1280×720_ | Light | he (RTL)   | _—_       |

---

## 11. Files likely impacted

**Use this section to avoid overlap when multiple people or tasks touch the same area.** List repo paths that implementation or parity work will likely change.

| Area            | Files / paths                                                                  | Notes                              |
| --------------- | ------------------------------------------------------------------------------ | ---------------------------------- |
| **Styles**      | _e.g. `apps/web/src/styles/10-base.css`, `20-layout.css`, `30-components.css`_ | _Tokens, layout, component styles_ |
| **Components**  | _e.g. `libs/ui/src/lib/Nav.tsx`, `libs/sections/src/lib/HeroSection.tsx`_      | _Structure and props_              |
| **Tokens**      | _e.g. `libs/tokens/` or `apps/web/` token files_                               | _If new tokens added_              |
| **i18n**        | _e.g. `libs/i18n/src/messages/[locale]/…`_                                     | _Labels, RTL copy_                 |
| **Tests / E2E** | _e.g. `apps/web-e2e/`_                                                         | _Visual or a11y tests_             |

- **Nx projects:** _e.g. `web`, `ui`, `sections`—run `nx affected` or target these for build/lint._
- **MCP / Cursor:** _Reference this spec in tasks so “files likely impacted” is considered before edits._

---

**Related:** [figma-parity-workflow](figma-parity-workflow.md), [figma-parity-checklist](figma-parity-checklist.md), [responsive-contract](responsive-contract.md), [theme-spec](theme-spec.md), [parity-execution-log](parity-execution-log.md).

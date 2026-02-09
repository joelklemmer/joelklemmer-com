# Parity Execution Log — Visual Authority Parity Executor

**Mission:** Bring the running application into visual, behavioral, and accessibility alignment with the approved Figma masthead and homepage hero frames. Precision parity and stabilization only.

**Execution date:** 2026-02-08

---

## 1. Visual deltas discovered and resolved

| Area                   | Delta                                                                                     | Resolution                                                                                                                                       |
| ---------------------- | ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Accessibility icon** | Trigger used circle/plus/info icon; Figma specifies person (head + shoulders).            | Replaced with inline SVG Person icon: circle (head) + path (shoulders/body), 20×20, stroke 2.                                                    |
| **Language icon**      | Globe SVG lacked explicit dimensions and shrink-0 for baseline alignment.                 | Added `width={20}` `height={20}` `strokeWidth={2}` and `className="shrink-0"` for optical consistency with other masthead icons.                 |
| **Theme icons**        | Sun/Moon/System icons needed consistent shrink-0 for alignment.                           | Added `shrink-0` to SunIcon, MoonIcon, SystemIcon classNames.                                                                                    |
| **Nav mobile**         | Menu button was 40×40 (w-10 h-10); Figma requires 44×44 touch targets.                    | Replaced fixed size with `masthead-touch-target`; added `.masthead-nav .masthead-touch-target` rule for min-width/min-height 44px.               |
| **Theme script**       | Stored theme value was used raw; invalid values could set `data-theme` to non-light/dark. | Validate stored value: only `"light"` \| `"dark"` \| `"system"` accepted; otherwise treat as `"system"` and resolve from `prefers-color-scheme`. |
| **Hero**               | Already token-driven (hero-display, hero-lede, hero-action-link, content lane, portrait). | No structural changes; confirmed typography scale, 8px spacing scale, CTA and portrait tokens in place.                                          |

---

## 2. Changes applied

- **AccessibilityPanel.tsx:** Person SVG (head + shoulders), 20×20, stroke 2, `shrink-0`.
- **LanguageSwitcherPopover.tsx:** Globe SVG explicit 20×20, stroke 2, `shrink-0`.
- **ThemeToggle.tsx:** Sun, Moon, System icons: added `shrink-0` to className for baseline alignment.
- **Nav.tsx:** Mobile menu button uses `masthead-touch-target`; removed fixed `w-10 h-10` and `h-9` container; menu SVG numeric props `width={20}` `height={20}` `strokeWidth={2}`.
- **theme-script.ts:** Theme read from localStorage validated; only `light` / `dark` / `system` applied; invalid or missing → `system` then resolve from OS.
- **20-layout.css:** `.masthead-nav .masthead-touch-target` added so nav mobile button gets min-width and min-height `var(--masthead-touch-min)` (44px).

---

## 3. Components touched

| Component               | File                                          | Change summary                  |
| ----------------------- | --------------------------------------------- | ------------------------------- |
| AccessibilityPanel      | `libs/ui/src/lib/AccessibilityPanel.tsx`      | Person icon SVG                 |
| LanguageSwitcherPopover | `libs/ui/src/lib/LanguageSwitcherPopover.tsx` | Globe SVG dimensions + shrink-0 |
| ThemeToggle             | `libs/ui/src/lib/ThemeToggle.tsx`             | Icon shrink-0 consistency       |
| Nav                     | `libs/ui/src/lib/Nav.tsx`                     | 44×44 touch target, icon props  |
| Theme script            | `apps/web/src/app/theme-script.ts`            | Stored theme validation         |
| Layout (masthead)       | `apps/web/src/styles/20-layout.css`           | Nav touch target rule           |

---

## 4. Token adjustments

- None. All masthead and hero sizing use existing tokens:
  - `--masthead-touch-min`: 44px
  - `--masthead-bar-height`: 3rem
  - `--masthead-icon-size`: 1.25rem (20px)
  - `--masthead-icon-stroke`: 2
  - Hero: `--hero-display-*`, `--hero-lede-*`, `--hero-cta-letter-spacing`, `--hero-action-link` (via 20-layout), `--readable-line-length`, `--space-*` (8px scale).

---

## 5. Accessibility considerations

- **Touch targets:** All masthead utility buttons and nav menu button now meet 44×44px minimum (WCAG 2.2).
- **Icons:** Single set, stroke 2, 20×20; Language → globe, Theme → sun/moon/system monitor, Accessibility → person; all `aria-hidden` with visible labels/titles.
- **Theme:** Tri-mode (system/light/dark) with validated storage; no `data-theme="system"` on root; script prevents flash; labels distinguish Light/Dark/System (with resolved state when system).
- **RTL:** No change; logical properties (start/end) and dropdown positioning already in use.
- **Focus/keyboard:** Existing focus ring, focus trap, and keyboard operation preserved; no validators or a11y rules disabled.

---

## 6. Verification

- Run: `pnpm nx run web:verify`
- Run: `pnpm run ci:verify`
- Fix any type errors, token misuse, a11y failures, i18n, ESLint, formatting, tests until both pass.
- **Note:** If `web:build` fails with "Unable to acquire lock at .next/lock", remove `apps/web/.next/lock` (or delete `.next`) and re-run. Ensure no other `next build` or dev server is using the same repo.

---

_Do not redesign. Parity and stabilization only. Architecture and Nx boundaries unchanged._

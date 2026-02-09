# Visual Parity Log — Masthead & Home Hero

**Purpose:** Track Figma parity for Masthead and Home Hero. Figma is source of truth.

**Target frames:** Masthead Light, Masthead Dark, Home Hero Light, Home Hero Dark, RTL (Hebrew).

---

## Parity checklist (commit-style)

- [x] Masthead: single horizontal bar (identity | nav | utilities); no second nav row
- [x] Utility controls: Language, Theme, Accessibility; order preserved
- [x] Icons: single set, stroke 2, 20×20; no emoji — Globe (language), Sun/Moon/Monitor (theme), Person (accessibility), Menu (mobile nav)
- [x] Theme: tri-mode (light, dark, system); system follows `prefers-color-scheme`; no flash on load (theme script in head)
- [x] Touch targets: utility buttons min 44×44px
- [x] Nav active state: understated (font-medium, border-b-2 border-border); no bright background
- [x] RTL: logical properties (start/end); dropdowns anchor end-0
- [x] Hero: typography scale (hero-display, hero-lede), content lane max-width, CTA token-styled
- [x] Hero: portrait block sizing, ratio, surface from tokens
- [x] No hardcoded colors; tokens/semantic variables only
- [ ] `pnpm nx run web:verify` — green
- [ ] `pnpm run ci:verify` — green

---

## Concrete deltas (resolved)

| Area     | Delta                                   | Resolution                                                                   |
| -------- | --------------------------------------- | ---------------------------------------------------------------------------- |
| Icons    | Language: ensure globe icon             | Inline SVG Globe (circle + ellipse + latitude)                               |
| Icons    | Theme: system = monitor                 | Inline SVG Monitor (screen + stand)                                          |
| Icons    | Accessibility: person/figure, not emoji | Inline SVG Person (head + shoulders)                                         |
| Icons    | Nav mobile: no ☰ emoji                 | Inline SVG Menu (three lines)                                                |
| Masthead | Single bar                              | Nav in Header centerContent; navContent=null in Shell                        |
| Masthead | 44×44 utility buttons                   | .masthead-touch-target in 20-layout.css                                      |
| Theme    | Tri-mode visible in UI                  | ThemeToggle cycles light→dark→system; aria-label includes "System"           |
| Theme    | No flash                                | theme-script.ts in root layout &lt;head&gt;; applies data-theme before paint |
| Hero     | Typography                              | --hero-display-size/line/spacing/weight, --hero-lede-size/line in tokens     |
| Hero     | CTA                                     | .hero-action-link uses tokens (border, bg, radius, hover)                    |
| RTL      | Dropdowns                               | end-0, text-start on menus                                                   |

---

## Files touched (implementation)

- `libs/ui/src/lib/Nav.tsx` — Menu SVG for mobile (no emoji)
- `libs/ui/src/lib/ThemeToggle.tsx` — Sun/Moon/Monitor SVGs (system = monitor)
- `libs/ui/src/lib/LanguageSwitcherPopover.tsx` — Globe SVG, visuallyHiddenClass
- `libs/ui/src/lib/AccessibilityPanel.tsx` — Person SVG (head + shoulders)
- `libs/ui/src/lib/Header.tsx` — Identity link uses min-height bar (not 44px); spec 44px for utilities only
- `docs/authority/parity-log.md` — this file

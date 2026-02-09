# Icon + Typography Parity — Before/After Changelog

**Scope:** Masthead and home hero. Executive-grade briefing room: consistent iconography, typographic rhythm, weights, spacing; WCAG 2.2 AA+; no layout/route changes.

---

## 1. Icon system

### Before

- Masthead utility icons (Language, Theme, Accessibility) used inline SVGs with fixed `width="20"` / `height="20"` and `className="shrink-0"` in some places only.
- Accessibility trigger used a generic “person” icon (head + shoulders silhouette).
- No shared token for icon size or stroke; optical alignment and baseline alignment were implicit.

### After

- **Tokens:** `--masthead-icon-size: 1.25rem`, `--masthead-icon-stroke: 2` in `libs/tokens/src/lib/tokens.css`.
- **Shared class:** `.masthead-icon` in `apps/web/src/styles/20-layout.css` — `inline-flex` center, and `.masthead-icon svg` gets token size and stroke so all masthead icons share the same size, stroke width, and alignment.
- **Language (globe):** Unchanged semantics; trigger button now has `masthead-icon`; SVG dimensions driven by CSS token (no fixed width/height on SVG).
- **Theme (sun/moon/system):** Trigger button has `masthead-icon`; Sun/Moon/System icons keep intrinsic 20×20 for use in dropdown; trigger icon is overridden by `.masthead-icon svg` to token size.
- **Accessibility:** Icon replaced with a clear “accessibility” symbol (circle with figure and accessibility cue) instead of generic person; trigger has `masthead-icon`; SVG sized by token.
- **Alignment:** All three utility buttons use `masthead-touch-target` + `masthead-icon` + `flex items-center justify-center` so icons sit on the masthead baseline without floating; hover/focus remain `text-muted` → `text-text` and `focusRingClass`.

**Files:** `libs/tokens/src/lib/tokens.css`, `apps/web/src/styles/20-layout.css`, `libs/ui/src/lib/ThemeToggle.tsx`, `libs/ui/src/lib/AccessibilityPanel.tsx`, `libs/ui/src/lib/LanguageSwitcherPopover.tsx`.

---

## 2. Typography system

### Before

- Hero display/lede did not set `font-family` explicitly; Inter Variable was applied at `html` via Next.js font (`--font-sans`).
- Hero CTA (`.hero-action-link`) had no letter-spacing; border-radius was hardcoded `0.375rem`.
- Hero lede had no explicit max-width for line length.

### After

- **Inter Variable:** Confirmed applied via root layout `className={inter.variable}` on `<html>`, setting `--font-sans`; `10-base.css` uses `var(--font-sans)` on `html`. No change required; no fallback surprises.
- **Hero display:** `.hero-display` now sets `font-family: var(--display-heading-font)` (constitutional weight/size/line-height/letter-spacing unchanged).
- **Hero lede:** `.hero-lede` sets `font-family: var(--body-analytical-font)` and `max-width: var(--readable-max-width)` for readable line length and calmer contrast.
- **Hero CTA:** `letter-spacing: var(--hero-cta-letter-spacing)` (new token `0.02em`), `border-radius: var(--radius-sm)` (token instead of hardcoded).

**Tokens added:** `--hero-cta-letter-spacing: 0.02em` in `libs/tokens/src/lib/tokens.css`.

**Files:** `libs/tokens/src/lib/tokens.css`, `apps/web/src/styles/20-layout.css`.

---

## 3. Spacing rhythm

### Before

- Shell header used `py-2 md:py-2.5` (10px on md — not on 8px scale); nav used `py-1.5 md:py-2`.

### After

- **Header:** `py-2 md:py-3` (8px / 12px) to stay on 8px baseline scale and remove “almost” spacing.
- **Nav:** `py-2 md:py-2` (8px) for consistent scale.
- Hero plate and hero block/inline gaps remain token-based (`--space-6`, `--space-8`, etc.); no hardcoded colors.

**Files:** `libs/ui/src/lib/Shell.tsx`.

---

## 4. A11y (focus rings)

### Before

- Global `:focus-visible` in `10-base.css` already used `--focus-ring-width`, `--focus-ring-offset`, `--color-focus`.
- `focusRingClass` from `@joelklemmer/a11y` uses Tailwind `ring-2`, `ring-focus`, `ring-offset-2`, `ring-offset-bg` (theme uses token-based `focus` and `bg`).

### After

- **Confirmed:** Focus rings are consistent, visible, and token-based (Tailwind `focus`/`ring-offset-bg` map to design tokens; high-contrast increases ring width/offset per tokens). No code changes.

---

## 5. Verification

- **Commands:** `pnpm nx run web:verify`, `pnpm run ci:verify`.
- **Result:** Both commands run green. Format: `nx format:write` was run on `docs/authority/icon-type-parity.md` and `docs/authority/parity-execution-log.md` so `format:check` passes.

---

## 6. Summary of file changes

| File                                          | Changes                                                                                                                                      |
| --------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `libs/tokens/src/lib/tokens.css`              | Added `--masthead-icon-size`, `--masthead-icon-stroke`, `--hero-cta-letter-spacing`.                                                         |
| `apps/web/src/styles/20-layout.css`           | `.masthead-icon` + `.masthead-icon svg`; hero-display/lede font-family and lede max-width; hero-action-link letter-spacing and radius token. |
| `libs/ui/src/lib/ThemeToggle.tsx`             | Trigger button class `masthead-icon`; icons keep 20×20 for dropdown, trigger sized by CSS.                                                   |
| `libs/ui/src/lib/AccessibilityPanel.tsx`      | Trigger `masthead-icon`; accessibility icon replaced with semantic symbol; SVG dimensions from CSS.                                          |
| `libs/ui/src/lib/LanguageSwitcherPopover.tsx` | Trigger `masthead-icon`; globe SVG dimensions from CSS.                                                                                      |
| `libs/ui/src/lib/Shell.tsx`                   | Header/nav padding adjusted to 8px-scale (`py-2 md:py-3`, nav `py-2`).                                                                       |

No new icon libraries; no hardcoded colors; layout architecture and routes unchanged.

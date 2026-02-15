# Masthead specification

**Purpose:** Canonical reference for the site masthead (header, primary navigation, utility controls). Authority verification environment, not marketing. Fortune-10 institutional standard.

**Scope:** Structure, interaction rules, focus order, RTL, token usage. No new routes; no copy hype.

---

## 1. Structure

The masthead is a single horizontal bar with three regions:

| Region     | Content            | Behavior                                                                                                                                                                      |
| ---------- | ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Left**   | Identity anchor    | "Joel R. Klemmer" as home link; one line by default, wraps to two responsively. Figma: [figma-site-design-spec.md](figma-site-design-spec.md). No logo mark unless specified. |
| **Center** | Primary navigation | Home, Executive Brief, Case Studies, Books, Public Record, Contact. Desktop: horizontal list. Mobile: collapsed behind a menu trigger (hamburger or compact disclosure).      |
| **Right**  | Utility controls   | Language, Theme, Accessibility. Consistent icon size and minimum touch target (44px). Order: Language, Theme, Accessibility.                                                  |

- One bar only: no separate "header row" and "nav row." Identity, nav, and utilities share the same horizontal strip.
- Implemented via `Header` with optional `centerContent` (Nav) and `headerControls` (utilities). Shell renders a single `<header>` with one `Container`; when `navContent` is omitted or null, no second nav row is rendered.

---

## 2. Interaction rules

### Skip link

- First focusable element on the page.
- Visible only on keyboard focus (e.g. first Tab). Uses `skipLinkClass`: sr-only by default, fixed position and visible when focused.
- Target: `#main-content` (or configurable `mainId`).
- No other interaction; single activation moves focus to main.

### Identity link

- Standard link to home (`/[locale]`). Activatable with Enter/Space (native link behavior).
- Focus-visible ring per `focusRingClass`. No hover decoration beyond subtle color if desired.

### Primary navigation

- **Desktop:** List of links. Active page: `aria-current="page"`; visual state understated (e.g. font weight, subtle bottom border in token color). No bright background or tab-like boxes.
- **Mobile:** Trigger button toggles a disclosure panel. Trigger has `aria-expanded`, `aria-controls`, `aria-label`. Panel is a list of same links; Escape or outside click closes; focus returns to trigger on close. Arrow keys move focus within open panel.
- Hover and focus: disciplined transition (color/border only); no large background blocks. Contrast must meet AA in light and dark.

### Utility controls

- **Language:** Button opens a menu of locale links. Menu: Escape to close, Arrow Up/Down to move, Enter to activate. Focus trap (Tab wraps within menu). Focus returns to trigger on close. RTL: menu aligns to end (right in LTR, left in RTL).
- **Theme:** Button cycles light → dark → system. No menu; single activation. `aria-label` reflects current theme (e.g. "Theme: Light").
- **Accessibility:** Button opens the existing Accessibility Control Panel (dialog-like). Focus trap, Escape to close, focus returns to trigger. Panel contains theme, contrast, motion, text size, underline links. No changes to panel content in masthead scope beyond ensuring trigger is discoverable and labeled.

All utility buttons:

- Minimum 44×44px touch target.
- Single icon set: inline SVGs, consistent stroke (2) and size (20×20 or 1.25rem). No emoji.
- Accessible name via `aria-label`; optional `title`; no reliance on icon alone.
- `focusRingClass` for focus-visible.

---

## 3. Focus order

1. Skip to content (when focused, becomes visible).
2. Identity (home) link.
3. Primary nav: desktop — each link in order; mobile — menu trigger, then (when open) each link in order.
4. Language button, then (when open) menu items.
5. Theme button.
6. Accessibility button, then (when open) panel controls.

DOM order matches this order so that Tab and Shift+Tab produce the expected sequence. No positive `tabindex`.

---

## 4. RTL notes

- Layout uses logical properties: `start`/`end`, `ms`/`me`, `ps`/`pe`, `text-start` so that in `dir="rtl"` (e.g. Hebrew) the bar mirrors without code change.
- Masthead regions: left = start, right = end. In RTL, "identity" stays at start (visual right in RTL), "utilities" at end (visual left in RTL).
- Dropdowns and panels: positioned with `end-0` (and `start-auto` if needed) so they align to the trigger side in both LTR and RTL. No clipping; sufficient padding from viewport edge.
- Nav links and menu items: `text-start` so label alignment follows direction.

---

## 5. Token usage notes

- No hardcoded palette. Use CSS variables / design tokens for:
  - Background: `--color-surface`, `--color-surface-elevated` where needed.
  - Text: `--color-text`, `--color-muted`.
  - Borders: `--color-border`, `--color-border-subtle`.
  - Focus: `--color-focus` (and focus ring width/offset).
  - Accent (sparingly for active state): `--color-accent` or muted variant; avoid bright blocks.
- Masthead height and padding: use spacing tokens (e.g. `--space-*`, `--container-padding-*`) or a single masthead height variable if added to tokens. Consistent across breakpoints; only padding may step up at wider breakpoints.
- Contrast: all states must pass AA in light and dark themes. High-contrast mode (data attribute or media) may increase focus ring weight per a11y tokens.

---

## 6. Responsive behavior

- **Desktop (e.g. 1024px+):** Full bar: identity | nav list | utilities. Nav items inline; no hamburger.
- **Tablet (e.g. 768px–1023px):** Same layout if space allows; otherwise nav may wrap or collapse per implementation (e.g. single row with wrap, or collapse to menu).
- **Mobile (e.g. &lt; 768px):** Identity and utilities remain visible. Primary nav collapses to a single menu trigger; opening shows a list (stacked). List is clearly labeled and remains "institutional" (no app-like icon-only nav as primary).

Breakpoints and exact pixel values should align with existing app breakpoints (e.g. Tailwind `md`/`lg`) and tokens.

---

## 7. Active / hover / focus styling rules

- **Identity link:** Default text color (inherited). Hover: no strong decoration (optional subtle darkening via token). Focus: `focusRingClass` (ring-2 ring-focus ring-offset-2); no change to active state beyond native.
- **Primary nav (desktop):** Default: `text-muted`. Hover: `hover:text-text`. Active page: `text-text font-medium border-b-2 border-border` (understated; no bright background). Focus: `focusRingClass` on each link.
- **Primary nav (mobile menu):** Items default `text-text`; hover `hover:bg-muted/50`. Active page: `font-medium bg-muted/30 border-s-2 border-border`. Focus: `focusRingClass`; panel uses `end-0` for RTL-safe alignment.
- **Utility buttons (Language, Theme, Accessibility):** Default: `text-muted`. Hover: `hover:text-text`. Focus: `focusRingClass`. All use `masthead-touch-target` (min 44×44px). No active state (toggle/cycle or open panel).
- **Dropdown/panel menus:** Background `bg-surface`, border `border-border`. Menu item hover: `hover:bg-muted/50`. Current item (e.g. language): may use `bg-accent/10 text-accent` or equivalent token; keep understated. Focus on items: `focusRingClass`.
- **Consistency:** All interactive elements use `focusRingClass` from `@joelklemmer/a11y`; no custom focus outlines. Transitions use `motion-reduce:transition-none` where present. No exclamation points or decorative emphasis in UI copy.

---

## 8. Files involved

| Concern            | Primary file(s)                                                                            |
| ------------------ | ------------------------------------------------------------------------------------------ |
| Masthead structure | `libs/ui/src/lib/Header.tsx`, `libs/ui/src/lib/Shell.tsx`                                  |
| Primary nav        | `libs/ui/src/lib/Nav.tsx`                                                                  |
| Utilities          | `libs/ui/src/lib/LanguageSwitcherPopover.tsx`, `ThemeToggle.tsx`, `AccessibilityPanel.tsx` |
| Composition        | `apps/web/src/app/[locale]/layout.tsx`                                                     |
| Masthead styles    | `apps/web/src/styles/20-layout.css`, `30-components.css`, `40-utilities.css`               |
| Skip link / focus  | `libs/ui/src/lib/Shell.tsx`, `libs/a11y` (focusRingClass, skipLinkClass)                   |
| Nav hierarchy      | [Navigation cognitive hierarchy](navigation-cognitive-hierarchy.md) (rank, order, e2e)     |

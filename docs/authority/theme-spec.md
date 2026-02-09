# Theme system — tri-mode (system / light / dark)

**Authority:** Single source of truth for theme behavior, storage, and DOM contract.  
**Scope:** All locales, including RTL. No route changes; tokens remain source of truth.

---

## 1. Storage

| Item        | Value                                    |
| ----------- | ---------------------------------------- |
| Storage key | `joelklemmer-theme`                      |
| Persisted   | `localStorage` (browser)                 |
| Values      | `"system"` \| `"light"` \| `"dark"`      |
| Default     | `"system"` (when key missing or invalid) |

Only these three strings are persisted. Any other value is treated as `"system"`.

---

## 2. Data attributes

The document root (`<html>`) **never** receives `data-theme="system"`. It always receives a **resolved** value:

| Attribute    | Allowed values        | When set                      |
| ------------ | --------------------- | ----------------------------- |
| `data-theme` | `"light"` \| `"dark"` | Always (see derivation below) |

- **Light mode (stored `"light"`):** `document.documentElement` gets `data-theme="light"`.
- **Dark mode (stored `"dark"`):** `document.documentElement` gets `data-theme="dark"`.
- **System mode (stored `"system"`):** `data-theme` is set to the **current OS preference**: `"light"` or `"dark"` from `prefers-color-scheme`.

So CSS and tokens depend only on `[data-theme='light']` and `[data-theme='dark']`. There is no `data-theme="system"` in the DOM.

---

## 3. How system mode is derived

- **Source:** `window.matchMedia('(prefers-color-scheme: dark)')`.
- **Resolved value:**
  - If the media query matches → **dark**.
  - Otherwise → **light**.
- **When it updates:** In system mode, the runtime listens to `change` on that `MediaQueryList` and re-applies the resolved theme to the root (so `data-theme` switches to `"light"` or `"dark"` when the user changes OS theme).

Derivation is done in:

1. **Inline script (no flash):** `apps/web/src/app/theme-script.ts` runs in `<head>` before any CSS. It reads `joelklemmer-theme`; if `"system"`, it sets `data-theme` to the current `prefers-color-scheme` result so the first paint is correct.
2. **Runtime:** `libs/ui/src/lib/ThemeProvider.tsx` applies the same rule on mount and when the user changes theme; when stored value is `"system"`, it listens for `prefers-color-scheme` changes and updates `data-theme` accordingly.

---

## 4. No flash of incorrect theme

- The inline script runs **synchronously** in `<head>` before body or CSS, so the root has the correct `data-theme` before first paint.
- No theme is rendered from React until after hydration; the script already set the attribute, so there is no flash when the provider runs.
- Tokens and components use only `data-theme="light"` and `data-theme="dark"` (no `data-theme="system"`), so there is no conflict with `prefers-color-scheme` after the script has run. The media query in tokens is only a **fallback** when `data-theme` is absent (e.g. no JS).

---

## 5. Accessibility semantics

- **Theme control (e.g. ThemeToggle):**
  - Trigger: minimum 44×44px touch target (`masthead-touch-target`), `aria-expanded`, `aria-controls`, `aria-haspopup="true"`, and an `aria-label` that states the current mode (e.g. “Theme: System (Light)” or “Theme: Dark”).
  - Popover: `role="menu"`, `aria-labelledby` pointing to the trigger. Options use `role="menuitemradio"` and `aria-checked` for the selected mode.
- **Labels:** Screen reader text clearly distinguishes:
  - **Light** — explicit light theme.
  - **Dark** — explicit dark theme.
  - **System** — follow device (with current resolved state when helpful, e.g. “System (Light)”).
- **Keyboard:** Full operation (Enter/Space to open and select); Escape closes the theme menu. Arrow keys move between options where applicable.
- **RTL:** Layout and positioning use logical properties (e.g. `end`, `start`) so theme UI works in all locales, including RTL.

---

## 6. Token and CSS contract

- **Tokens** (e.g. `libs/tokens/src/lib/tokens.css`):
  - Define surfaces and colors for `:root[data-theme='light']` and `:root[data-theme='dark']`.
  - Optional: `@media (prefers-color-scheme: dark)` fallback for `:root:not([data-theme='light'])` when `data-theme` is not set (no-JS).
- **Components:** Use semantic tokens (e.g. `var(--color-bg)`, `var(--color-surface)`) only; no hardcoded theme colors. Theme is controlled solely via `data-theme` on the root.

---

## 7. File reference

| Concern                        | Location                                                                                      |
| ------------------------------ | --------------------------------------------------------------------------------------------- |
| Storage key                    | `libs/ui/src/lib/ThemeProvider.tsx` (`THEME_STORAGE_KEY`), `apps/web/src/app/theme-script.ts` |
| Inline script                  | `apps/web/src/app/theme-script.ts`                                                            |
| Provider / apply               | `libs/ui/src/lib/ThemeProvider.tsx`                                                           |
| Theme UI                       | `libs/ui/src/lib/ThemeToggle.tsx`                                                             |
| Tokens                         | `libs/tokens/src/lib/tokens.css`                                                              |
| Root layout (script injection) | `apps/web/src/app/layout.tsx`                                                                 |

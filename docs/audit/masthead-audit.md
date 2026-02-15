# Masthead responsive audit

**Purpose:** Trace masthead/header entry points, CSS cascade, and responsive behavior. Ensure no duplicates or disconnections.

**Date:** 2026-02-14

---

## 1. Entry points (single source of truth)

| Layer      | File                                   | Role                                                                                                            |
| ---------- | -------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| **Layout** | `apps/web/src/app/[locale]/layout.tsx` | Imports `global.css`; composes `ServerShell` with `mobileNavSlot`, `headerDeferredSlot`. No other shell/header. |
| **Shell**  | `libs/shell/src/lib/ServerShell.tsx`   | **Only** masthead implementation. Renders `<header data-testid="masthead">` with identity, nav, utilities.      |
| **Root**   | `apps/web/src/app/layout.tsx`          | `html`/`body`; no header. Passes `children` to `[locale]` layout.                                               |

**Unused (not in render path):** `libs/ui/Header.tsx`, `libs/ui/Shell.tsx`, `libs/sections/HeaderSection.tsx` — docs reference them; app does not import.

---

## 2. DOM structure (ServerShell)

```
header[data-testid="masthead"]
  Container
    .masthead-bar
      .masthead-identity (wordmark link)
      .masthead-nav.masthead-nav-primary
        nav.nav-primary
          ul.nav-primary-list[data-nav="desktop"]   ← desktop nav (hidden < 1280px)
          div.nav-primary-mobile[data-nav="mobile"] ← mobile hamburger (hidden ≥ 1280px)
            MobileNavSheet (SheetTrigger + SheetContent)
      .masthead-utilities-wrap
        .masthead-utilities
          headerDeferredSlot (Language, Theme, Accessibility)
```

---

## 3. CSS cascade

| File                | Load order    | Masthead rules                                                                       |
| ------------------- | ------------- | ------------------------------------------------------------------------------------ |
| `index.css`         | 1             | Tokens, Tailwind base/components/utilities                                           |
| `app-layers.css`    | 2             | 10-base, **20-layout**, 30-components, 40-utilities                                  |
| `20-layout.css`     | In app-layers | **Responsive nav:** `[data-nav="desktop"]` / `[data-nav="mobile"]` with `!important` |
| `30-components.css` | In app-layers | `.nav-primary-list` layout (no `display`; visibility from 20-layout)                 |

**Token override order:** `tokens.css` → `figma-make.tokens.patch.css` → `00-tokens.css`. `00-tokens.css` wins for masthead light-mode (black bg, light text).

---

## 4. Responsive rules (50-masthead-responsive.css)

**Professional UX:** Links condense progressively by breakpoint, then hamburger (no abrupt pop).

| Viewport    | Nav       | Gap     | Link padding |
| ----------- | --------- | ------- | ------------ |
| &lt; 1024px | Hamburger | —       | —            |
| 1024–1099px | Desktop   | 0.75rem | 0.75rem      |
| 1100–1279px | Desktop   | 1rem    | 0.875rem     |
| 1280–1535px | Desktop   | 1.25rem | 1rem         |
| ≥ 1536px    | Desktop   | 1.5rem  | 1rem         |

Wordmark: `clamp()` for responsive sizing. Icons: `clamp(1rem, 2vw + 0.75rem, 1.25rem)`.

---

## 5. Checklist for future changes

- [ ] Masthead structure lives only in `ServerShell.tsx`
- [ ] Responsive visibility lives in `20-layout.css` (data-nav + media query)
- [ ] `.nav-primary-list` must not set `display` in `30-components.css`
- [ ] No Tailwind `hidden`/`flex` on nav elements — data-nav + layout CSS controls visibility

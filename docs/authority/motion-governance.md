# Motion governance

**Authority:** Single source of truth for transition durations, easings, and reduced-motion behavior.  
**Scope:** All interaction feedback (hover, focus, press). Decisive briefing-room feel: low-latency, no mushy easing.

---

## 1. Tokens (libs/tokens)

| Token                                        | Default                          | Purpose                                        |
| -------------------------------------------- | -------------------------------- | ---------------------------------------------- |
| `--transition-duration-fast`                 | 150ms                            | General short transitions (e.g. card hover).   |
| `--transition-duration-normal`               | 200ms                            | Slightly longer (e.g. panel open).             |
| `--motion-duration-feedback`                 | 80ms                             | **Hover/focus/press** — decisive, low-latency. |
| `--ease-authority`                           | cubic-bezier(0.25, 0.1, 0.25, 1) | General ease.                                  |
| `--ease-authority-out` / `--motion-ease-out` | cubic-bezier(0.33, 1, 0.68, 1)   | **Interaction** — crisp, no mush.              |

All duration tokens are overridden under `prefers-reduced-motion: reduce` to `0.01ms` in the same file, so any rule using `var(--motion-duration-*)` or `var(--transition-duration-*)` automatically respects reduced motion.

---

## 2. Reduced motion

- **Media:** `@media (prefers-reduced-motion: reduce)` in `libs/tokens/src/lib/tokens.css` sets:
  - `--transition-duration-fast: 0.01ms`
  - `--transition-duration-normal: 0.01ms`
  - `--motion-duration-feedback: 0.01ms`
- **Runtime override:** `html[data-motion='reduced']` and `html.motion-reduce-force` (ACP / theme script) apply `transition-duration: 0.01ms !important` and `animation-duration: 0.01ms !important` to all elements (see `apps/web/src/styles/10-base.css`, `40-utilities.css`).
- **Scroll:** `scroll-behavior: auto` when reduced motion; otherwise `smooth` only when not reduced.

Behavior change is observable: with reduced motion, transitions and animations are effectively instant. CI asserts token values and scroll-behavior in `apps/web-e2e/src/interaction/reduced-motion.spec.ts`.

---

## 3. Where tokens are used

- **Base focus ring** (`10-base.css`): `:focus-visible` outline uses `--motion-duration-feedback` and `--motion-ease-out`.
- **Interactive elements** (`30-components.css`): `a`, `button`, `input`, etc. use `--motion-duration-feedback` and `--motion-ease-out` for outline/offset.
- **Components:** Cards, nav links, hero frame use `--transition-duration-fast` / `--transition-duration-normal` and `--ease-authority`; interaction feedback uses feedback duration where appropriate.
- **Tailwind:** `duration-feedback`, `ease-out` (→ `--motion-ease-out`) in `apps/web/tailwind.config.js` for use with `focusRingClass` and `interactionTransitionClass` (libs/a11y).

---

## 4. Rules

1. **No hardcoded durations** for hover/focus/press — use `var(--motion-duration-feedback)` or Tailwind `duration-feedback`.
2. **No mushy easing** for interaction — use `--motion-ease-out` (or Tailwind `ease-out`).
3. **Every transition** that is purely decorative or motion-heavy must be disabled or near-instant when `prefers-reduced-motion: reduce` or `data-motion="reduced"` / `motion-reduce-force`; using the tokens satisfies this.
4. **Utility class:** `motion-reduce:transition-none` (Tailwind) is used on interactive components so that when reduced motion is on, transitions are disabled even if the component adds its own transition class.

---

## 5. Validation

- `tools/validate-tokens.ts` includes `--motion-duration-feedback` and `--motion-ease-out` in the motion group.
- Playwright: `apps/web-e2e/src/interaction/reduced-motion.spec.ts` checks token values and scroll-behavior with `emulateMedia({ reducedMotion: 'reduce' })`.

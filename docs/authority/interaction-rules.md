# Interaction rules (focus and keyboard)

**Authority:** Deterministic focus order, skip link behavior, focus-visible rules, no focus traps.  
**Scope:** Shell, Header, Nav, all interactive primitives in libs/ui and app.

---

## 1. Focus order contract

Tab order is deterministic and documented:

1. **Skip link** (first focusable)
2. **Header:** identity link → primary nav (desktop links or mobile menu trigger) → utilities (theme, language, a11y panel)
3. **Main** (focusable as skip target only; `tabindex="-1"`)
4. **Footer** and in-page interactive elements

Constants: `FOCUS_ORDER` and `MAIN_CONTENT_ID` in `libs/a11y/src/lib/a11y.ts`. Shell uses `MAIN_CONTENT_ID` for `main` id and skip link `href`.

---

## 2. Skip link

- **Visibility:** `sr-only` until focused; on focus, becomes visible (fixed, high z-index, styled).
- **Target:** `#main-content` (or prop `mainId`); main landmark has `id={mainId}` and `tabIndex={-1}` so it can receive focus when the skip link is activated.
- **No trap:** Skip link does not trap focus; activating it moves focus to main, then next Tab continues into main content.
- **Selector for E2E:** `[data-skip-link]` on the `<a>`.

---

## 3. Focus-visible rules

- **No focus styling on `:focus` alone** — use `:focus-visible` so mouse users do not see a persistent ring; keyboard users do.
- **Ring token-driven:** `--focus-ring-width`, `--focus-ring-offset`, `--focus-ring-color` (and high-contrast overrides) in tokens; base and component CSS use these for outline/ring.
- **No invisible focus:** Every focusable element must show a visible focus indicator when `:focus-visible`; CI checks that the focused element has non-zero outline or box-shadow in `apps/web-e2e/src/interaction/keyboard-navigation.spec.ts`.
- **Class:** `focusRingClass` from `@joelklemmer/a11y` applies ring + transition; use on all custom interactive elements (buttons, links, nav items, controls).

---

## 4. No focus traps

- **Modal/panel focus containment:** When a menu or panel is open (e.g. mobile nav, language switcher), focus may be contained **only while open**, with **Escape** closing and returning focus to the trigger. This is not a permanent trap.
- **Permanent traps:** Do not create regions that cannot be left by Tab or Escape (e.g. missing Escape handler, or tabindex that cycles only inside with no way out). Current implementation: mobile nav closes on Escape and returns focus to trigger; language popover and a11y panel follow the same pattern.

---

## 5. Keyboard navigation

- **Tab:** Moves focus in document order; first tab target is the skip link.
- **Enter / Space:** Activate links and buttons; Space on menu trigger opens menu.
- **Escape:** Closes open menu/popover and returns focus to trigger.
- **Arrow keys:** In menus (e.g. primary nav mobile menu), Arrow Down/Up move focus between items when implemented; Escape closes.

---

## 6. Implementation checklist

- [ ] Shell: skip link with `data-skip-link`, `href="#main-content"`, main with `id={mainId}`, `tabIndex={-1}`.
- [ ] All interactive elements: `focusRingClass` (or equivalent focus-visible ring).
- [ ] Transitions on interaction: `interactionTransitionClass` or token-based duration + `motion-reduce:transition-none`.
- [ ] Menus/popovers: Escape closes, focus returns to trigger; no permanent trap.

---

## 7. CI

Run interaction tests: `pnpm nx run web-e2e:interaction` (or add to CI pipeline).

- **Focus order:** `apps/web-e2e/src/interaction/focus-order.spec.ts` — first tab is skip link, skip href targets main, main is focusable, tab order proceeds to identity then nav.
- **Keyboard:** `apps/web-e2e/src/interaction/keyboard-navigation.spec.ts` — Tab moves focus, Enter on skip moves focus to main, focused element has visible indicator, Escape closes mobile nav and returns focus to trigger.
- **Reduced motion:** `apps/web-e2e/src/interaction/reduced-motion.spec.ts` — token values and scroll-behavior under `prefers-reduced-motion: reduce`.

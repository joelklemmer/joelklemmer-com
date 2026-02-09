# Interaction Micro-Physics — Subsystem Doctrine

**Authority:** Deterministic focus order, skip link behavior, focus-visible rules, no focus traps, and motion governance (durations, easings, reduced-motion). Decisive briefing-room feel: low-latency, no mushy easing.

**Scope:** Shell, Header, Nav, all interactive primitives in libs/ui and app. All transition durations and interaction feedback.

---

## 1. Engineering goals

- **Focus order contract:** Tab order is deterministic and documented: skip link first, then header (identity → nav → utilities), then main (skip target), then footer and in-page interactives. Constants: `FOCUS_ORDER`, `MAIN_CONTENT_ID` in `libs/a11y`.
- **Skip link:** Visible only on focus; target `#main-content`; main has `id={mainId}` and `tabIndex={-1}`; no focus trap—activating skip moves focus to main, next Tab continues into content.
- **Focus-visible only:** No focus styling on `:focus` alone; use `:focus-visible` so keyboard users see a ring and mouse users do not. Ring token-driven; every focusable element must show a visible indicator when `:focus-visible`.
- **No permanent focus traps:** Menus/panels may contain focus only while open; Escape closes and returns focus to trigger. No regions that cannot be left by Tab or Escape.
- **Motion governance:** Single source of truth for transition durations and easings. Interaction feedback (hover, focus, press) uses low-latency tokens; reduced-motion respected everywhere.

---

## 2. Observable runtime behaviors

- **Skip link:** `[data-skip-link]` on the `<a>`; `sr-only` until focused; on focus, becomes visible (fixed, high z-index). Activating it moves focus to main.
- **Focus ring:** Visible only on `:focus-visible`; uses `--focus-ring-width`, `--focus-ring-offset`, `--focus-ring-color` (and high-contrast overrides). `focusRingClass` from `@joelklemmer/a11y` applied on custom interactive elements.
- **Keyboard:** Tab (document order); Enter/Space (activate); Escape (close menu/popover, return focus to trigger). Arrow keys in menus where implemented.
- **Transitions:** Hover/focus/press use `--motion-duration-feedback` (80ms) and `--motion-ease-out`; no hardcoded durations. Under `prefers-reduced-motion: reduce` or `data-motion="reduced"`, durations override to 0.01ms; scroll-behavior is auto.
- **E2E:** Focus order spec (first tab = skip link, skip targets main, tab order); keyboard spec (Tab, Enter on skip, visible focus indicator, Escape closes mobile nav); reduced-motion spec (token values and scroll-behavior with reduced motion emulated).

---

## 3. Metrics of success

| Metric            | Target                                                         | How measured                          |
| ----------------- | -------------------------------------------------------------- | ------------------------------------- |
| First focusable   | Skip link                                                      | E2E focus-order.spec.ts               |
| Skip target       | Main receives focus on skip activation                         | E2E focus-order + keyboard-navigation |
| Focus visibility  | Every focused element has non-zero outline/box-shadow          | E2E keyboard-navigation.spec.ts       |
| Escape behavior   | Mobile nav / popover close and focus returns to trigger        | E2E keyboard-navigation.spec.ts       |
| No permanent trap | All regions escapable by Tab or Escape                         | E2E + manual audit                    |
| Motion tokens     | No hardcoded durations for interaction; feedback duration 80ms | validate-tokens.ts                    |
| Reduced motion    | Durations 0.01ms; scroll auto                                  | E2E reduced-motion.spec.ts            |

---

## 4. Extension rules

- **New interactive element:** Add `focusRingClass` (or equivalent) and use `var(--motion-duration-feedback)` / `--motion-ease-out` for transitions. Ensure it participates in document tab order; do not add tabindex > 0 without justification.
- **New menu or popover:** Implement Escape to close and return focus to trigger; contain focus only while open. Do not create regions that cannot be left by Tab or Escape.
- **New transition:** Use tokens only (`--transition-duration-fast`, `--transition-duration-normal`, `--motion-duration-feedback`); use `--motion-ease-out` for interaction feedback. Do not introduce hardcoded ms or non-authority easing.
- **Tailwind:** Use `duration-feedback`, `ease-out` (→ `--motion-ease-out`), and `motion-reduce:transition-none` where appropriate.

---

## 5. Anti-degradation constraints

- **Do not** style `:focus` without `:focus-visible`—mouse users must not see a persistent ring.
- **Do not** remove or bypass the skip link or change its target; do not make main non-focusable.
- **Do not** create permanent focus traps (e.g. modal with no Escape or tab cycle that never exits).
- **Do not** use hardcoded durations for hover/focus/press; do not use mushy easing for interaction.
- **Do not** add transitions that ignore `prefers-reduced-motion: reduce` or `data-motion="reduced"`; using the tokens satisfies this.
- **Do not** remove or weaken focus-order or keyboard E2E tests; they are the regression gate.

---

## 6. References

- [Interaction rules (focus and keyboard)](../authority/interaction-rules.md)
- [Motion governance](../authority/motion-governance.md)
- [Masthead specification](../authority/masthead-spec.md)
- `libs/a11y/src/lib/a11y.ts` (FOCUS_ORDER, MAIN_CONTENT_ID, focusRingClass, interactionTransitionClass)
- `libs/tokens/src/lib/tokens.css` (motion tokens, reduced-motion overrides)
- E2E: `apps/web-e2e/src/interaction/focus-order.spec.ts`, `keyboard-navigation.spec.ts`, `reduced-motion.spec.ts`

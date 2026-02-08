# Design Constitution Checklist

Version 1.0

Use this checklist during PR review when design, tokens, layout, navigation, a11y, i18n, or documentation change. Each item is testable (yes/no).

---

## Perception and authority signals

- [ ] Changes do not introduce hype, exclamation points, or persuasive flourish.
- [ ] The five authority signals (Strategic Cognition, Systems Construction, Operational Transformation, Institutional Leadership, Public Service Statesmanship) are not contradicted by copy or structure.
- [ ] No new decorative or partisan visual language.

---

## Typography and hierarchy

- [ ] One H1 per screen; no duplicate or missing page title.
- [ ] Section headings use the defined scale (H2/H3); no arbitrary font sizes.
- [ ] Body and lede use max readable width (e.g. max-w-2xl) where applicable.
- [ ] No new font weights or letter-spacing outside the documented hierarchy.

---

## Surfaces and tokens usage

- [ ] New or changed UI uses design tokens for color, spacing, and typography (no ad-hoc hex, RGB, or magic numbers).
- [ ] Color choices are from the allowed palette; no political or partisan color associations.
- [ ] Spacing uses the token scale (--space-\* or --spacing-8 through --spacing-128); section rhythm is preserved.
- [ ] **Single source of truth for palette and primitives:** `libs/tokens/src/lib/tokens.css`. App overrides only in `apps/web/src/styles/00-tokens.css`.
- [ ] tokens-validate and visual-contract-validate still pass.

---

## Navigation and affordances

- [ ] Links and buttons have clear, predictable behavior.
- [ ] No single-click destructive action without confirmation.
- [ ] Loading and error states are visible where applicable.
- [ ] Icons are utility-only and neutral; no decorative icons added.

---

## Accessibility

- [ ] New or changed components meet WCAG 2.2 AA (contrast, focus, semantics).
- [ ] No removal or weakening of focus styles or a11y attributes.
- [ ] nx run web:a11y passes after the change.

---

## i18n and RTL

- [ ] New copy uses i18n keys; no hardcoded strings in evaluator-facing UI.
- [ ] RTL: no new hardcoded ml-/mr- for spacing that should flip; logical or ms-/me- used where applicable.
- [ ] i18n-validate still passes.

---

## Performance

- [ ] No new layout shift (CLS) introduced; images and dynamic content have dimensions or reserves where needed.
- [ ] No new blocking or heavy assets without justification.

---

## Documentation updates

- [ ] If the change affects design doctrine or governance, docs/authority/design-constitution.md or this checklist is updated and versioned.
- [ ] known-warnings.md is updated if a new non-fatal warning is introduced or an existing one is removed.

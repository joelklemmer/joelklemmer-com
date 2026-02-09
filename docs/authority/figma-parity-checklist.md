# Figma-to-Code Parity Checklist

**One-page checklist.** Use per frame or per parity run. Tick when done; note viewports and pass/fail.

---

## Before implementation

| #   | Item                                                                                                                  |
| --- | --------------------------------------------------------------------------------------------------------------------- |
| ☐   | **Figma frame identified:** Name, URL, version/date recorded in spec.                                                 |
| ☐   | **Spec filled:** [figma-spec-template](figma-spec-template.md) sections 1–11 completed (or linked).                   |
| ☐   | **Breakpoints aligned:** Frame widths match [Responsive Contract](responsive-contract.md) (xs/sm/md/lg/xl/2xl/ultra). |
| ☐   | **Component mapping done:** Figma layers → repo paths documented; “Files likely impacted” listed.                     |
| ☐   | **Tokens only:** Typography and color mapped to existing (or planned) tokens; no hardcoded hex/font in components.    |

---

## Implementation

| #   | Item                                                                                                   |
| --- | ------------------------------------------------------------------------------------------------------ |
| ☐   | **Measurements:** Padding, gaps, radii from spec (§4); 8px scale where applicable.                     |
| ☐   | **Touch targets:** Interactive elements ≥ 44×44px (exceptions documented).                             |
| ☐   | **States:** Default, hover, active, focus, disabled implemented per spec (§7).                         |
| ☐   | **Logical properties:** RTL-safe (margin-inline, padding-inline, start/end); no left/right for layout. |
| ☐   | **A11y:** Labels, focus order, landmarks, heading hierarchy, reduced motion considered.                |

---

## Verification

| #   | Item                                                                                               |
| --- | -------------------------------------------------------------------------------------------------- |
| ☐   | **Dev server:** `pnpm nx run web:serve` running; single instance, no stale build.                  |
| ☐   | **Viewports checked:** 375 (xs), 768 (md), 1280 (lg) at minimum; match breakpoints.                |
| ☐   | **Light theme:** Screenshot or visual check — pass / fail.                                         |
| ☐   | **Dark theme:** Screenshot or visual check — pass / fail.                                          |
| ☐   | **RTL (if applicable):** Locale + dir; layout and icons correct — pass / fail.                     |
| ☐   | **Focus & keyboard:** Tab order, focus visible, no traps — pass / fail.                            |
| ☐   | **CI:** `pnpm nx run web:verify` (or equivalent) — green.                                          |
| ☐   | **Parity log:** Results recorded in [parity-execution-log](parity-execution-log.md) or parity log. |

---

## Quick reference

- **Spec template:** [figma-spec-template](figma-spec-template.md)
- **Workflow:** [figma-parity-workflow](figma-parity-workflow.md)
- **Breakpoints:** [responsive-contract](responsive-contract.md)
- **Theme/tokens:** [theme-spec](theme-spec.md)
- **RTL:** [i18n-rtl-stress](i18n-rtl-stress.md)

# Figma–Code Parity Workflow

**Purpose:** Disciplined parity harness between Figma (source of truth) and the repo. There is no automatic sync; use this workflow to capture specs, map to components, and run manual parity checks.

---

## 1. Capturing Figma frame specs

Capture the following for each frame or component variant you intend to implement or verify:

| Spec category    | What to record                                                                                                                                                                  |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Measurements** | Width × height of frame; min/max widths for containers; icon and touch-target sizes (e.g. 20×20, 44×44).                                                                        |
| **Type**         | Font family, size, weight, line height, letter spacing for headings, lede, body, labels.                                                                                        |
| **Spacing**      | Padding/margin between elements; section gaps; gutter; use 8px scale where applicable.                                                                                          |
| **Variants**     | Light / dark; RTL if applicable; any state (default, hover, active, focus).                                                                                                     |
| **Breakpoints**  | Which frame applies to which viewport (e.g. mobile 320–639, tablet 640–767, desktop 768+). Align with [Responsive Contract](responsive-contract.md) (xs/sm/md/lg/xl/2xl/ultra). |

**Where to store:** In a spec doc (e.g. `masthead-spec.md`, `hero-spec.md`) or in a parity checklist section. Reference Figma frame name and link if possible.

---

## 2. Mapping to repo components

| Step | Action                                                                                                                                                                          |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | Identify the Figma frame or component name (e.g. "Masthead Light", "Home Hero").                                                                                                |
| 2    | Locate the implementing component(s) in the repo (e.g. `libs/ui/src/lib/Nav.tsx`, `libs/sections/src/lib/HeroSection.tsx`).                                                     |
| 3    | Map Figma layers/groups to React components or DOM sections; note any shared tokens (e.g. `--masthead-touch-min`, `--hero-display-size`) in `theme-spec.md` or `20-layout.css`. |
| 4    | Document the mapping in the parity log or implementation map (e.g. [home-implementation-map.md](home-implementation-map.md)) so future parity runs know where to look.          |

Keep a short **Figma frame → Repo path** table in the spec or parity log for each major area (masthead, hero, footer, etc.).

---

## 3. Running screenshot parity checks (manual)

No automated screenshot diff in this harness; use a consistent manual process:

1. **Start dev server:**  
   `pnpm nx run web:serve` (or equivalent). Ensure a single instance; no stale build.

2. **Set viewport sizes:**  
   Use browser DevTools or a fixed window. Check at least:
   - **Mobile:** 375×667 (or 320×568 for xs floor)
   - **Tablet:** 768×1024
   - **Desktop:** 1280×720 or 1440×900

   Align widths with [Responsive Contract](responsive-contract.md) breakpoints so you hit xs, sm, md, lg as intended.

3. **Capture per variant:**  
   For each frame variant (e.g. Masthead Light, Masthead Dark, Hero Light, Hero Dark, RTL):
   - Set viewport and theme (and locale for RTL).
   - Scroll so the target frame is in view; remove or hide any overlays that obscure it.
   - Take a full-frame or region screenshot (browser or tool of choice).
   - Compare side-by-side with Figma (export from Figma at same width or overlay).

4. **Record results:**  
   Note pass/fail and any deltas in [parity-execution-log.md](parity-execution-log.md) or [parity-log.md](parity-log.md). Fix code and re-check until parity is achieved.

---

## 4. Parity checklist template

Copy and adapt for each parity run or new frame:

```markdown
## Parity checklist — [Frame/Area name]

- [ ] Figma frame specs captured (measurements, type, spacing, variants, breakpoints).
- [ ] Mapping to repo components documented (file paths, tokens).
- [ ] Dev server running; viewports used: \***\*\_\_\*\*** (e.g. 375, 768, 1280).
- [ ] Light theme: \***\*\_\_\*\*** (pass/fail).
- [ ] Dark theme: \***\*\_\_\*\*** (pass/fail).
- [ ] RTL (if applicable): \***\*\_\_\*\*** (pass/fail).
- [ ] Touch targets / a11y: \***\*\_\_\*\*** (pass/fail).
- [ ] `pnpm nx run web:verify` — green.
- [ ] `pnpm run ci:verify` — green.
```

---

**Related:** [parity-execution-log.md](parity-execution-log.md), [parity-log.md](parity-log.md), [responsive-contract.md](responsive-contract.md), [design-constitution-checklist.md](design-constitution-checklist.md).

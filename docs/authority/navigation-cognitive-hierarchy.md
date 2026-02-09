# Navigation Cognitive Hierarchy

**Purpose:** Navigation as an executive parsing system—scan path, hierarchy weight, authority structure signaling—with measurable outcomes. Not a menu; a perception system.

**Scope:** Primary nav order, rank encoding, typography/spacing constraints, a11y contract, RTL, and verification (e2e).

---

## 1. Doctrine

### Executive scan optimization

- **Brief hub primacy:** The Executive Brief is the dominant content hub. It is the first route after Home and carries the **primary** perceptual rank (typographic weight).
- **Proof-forward routing:** Case Studies (Work) and Public Record (Proof) are verification rails. They carry **secondary** rank and appear in that order after Brief.
- **Institutional credibility pathways:** Books (Writing) and Contact carry **tertiary** rank. They close the nav sequence.

### Perceptual weighting

- Typography, spacing, and interaction affordances encode rank **without design flourishes.** Remain minimal.
- **Primary:** Strongest weight (e.g. font-weight 700 on desktop link).
- **Secondary:** Default/institutional weight (600).
- **Tertiary:** Slightly reduced weight (500).
- No extra padding, borders, or icons to denote rank; weight alone suffices.

### Authority structure signaling

- Navigation labels and grouping reinforce the five authority signals **simultaneously** and structurally (no on-page signal labels per UASIL).
- Order and rank align with: Brief = balanced vector / hub; Work + Proof = verification; Writing + Contact = institutional. Labels come from i18n (`nav.*`); no duplication with other screens.

### Single source of truth

- **No parallel nav.** Use the existing masthead/layout engine only.
- Nav items are built from `PRIMARY_NAV_ENTRIES` in `libs/sections/src/lib/navigation`. Locale layout maps entries to `{ href, label, rank }` and passes them to `Nav` in `libs/ui`. No second list of links elsewhere.

---

## 2. Constraints

| Constraint         | Rule                                                                                                                                                                                   |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- | ------------------------------------------------------------------ |
| **Order**          | Home → Brief → Work → Writing → Proof → Contact. Defined in `PRIMARY_NAV_ENTRIES`.                                                                                                     |
| **Rank**           | Home: none (identity). Brief: primary. Work, Proof: secondary. Writing, Contact: tertiary.                                                                                             |
| **Encoding**       | `data-nav-rank` on each link (primary                                                                                                                                                  | secondary | tertiary). CSS in `30-components.css` applies font-weight by rank. |
| **Accessibility**  | Keyboard-first; focus ergonomics; skip link (Shell); landmark structure (`nav[aria-label]`); `aria-current="page"` on active route; RTL-safe (logical properties, `dir="rtl"` for he). |
| **No duplication** | Do not implement a separate nav component or duplicate item list; extend existing `Nav` and layout only.                                                                               |

---

## 3. Implementation map

| Concern                                     | Location                                                                                     |
| ------------------------------------------- | -------------------------------------------------------------------------------------------- |
| Order and rank config                       | `libs/sections/src/lib/navigation/primaryNavConfig.ts`                                       |
| Nav component (data-nav-rank, aria-current) | `libs/ui/src/lib/Nav.tsx`                                                                    |
| Perceptual weight CSS                       | `apps/web/src/styles/30-components.css` (`.nav-primary-link[data-nav-rank='primary']`, etc.) |
| Composition (build items from config)       | `apps/web/src/app/[locale]/layout.tsx`                                                       |
| Skip link, landmarks                        | `libs/ui/src/lib/Shell.tsx`, `libs/a11y` (skipLinkClass, focusRingClass)                     |
| E2E assertions                              | `apps/web-e2e/src/nav/navigation-hierarchy.spec.ts`                                          |

---

## 4. Verification

- **E2E (Playwright):** `apps/web-e2e/src/nav/navigation-hierarchy.spec.ts` asserts:
  - Desktop nav has `data-nav-rank` (Brief primary, Work/Proof secondary, Writing/Contact tertiary).
  - Focus order: first focusable is skip link (`href="#main-content"`).
  - `aria-current="page"` on active route (e.g. Brief on `/brief`).
  - RTL: `dir="rtl"` on document for Hebrew; nav and masthead visible.
  - Each locale: nav landmark has `aria-label`.
- **Run:** `nx e2e web-e2e` (includes nav tests). Full pipeline: `nx run web:verify` (lint, validators, build, a11y).

---

## 5. References

- [Masthead specification](masthead-spec.md) — structure, focus order, RTL, tokens.
- [Authority signal integration](../authority-signal-integration.md) — five signals, UASIL, no on-page labels.
- [Home signal map](home-signal-map.md) — routes and proof-forward discipline.

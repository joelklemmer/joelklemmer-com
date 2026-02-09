# Navigation Cognition — Subsystem Doctrine

**Authority:** Navigation as an executive parsing system: scan path, hierarchy weight, authority structure signaling. Not a menu; a perception system.

**Scope:** Primary nav order, rank encoding, typography/spacing, a11y contract, RTL, and verification (E2E). Single source of truth: masthead/layout engine only.

---

## 1. Engineering goals

- **Executive scan optimization:** The Executive Brief is the dominant content hub (first route after Home) and carries primary perceptual rank. Case Studies and Public Record are verification rails (secondary rank). Books and Contact close the sequence (tertiary rank).
- **Perceptual weighting without flourish:** Typography and spacing encode rank only—no extra padding, borders, or icons. Primary = strongest weight; secondary = default institutional; tertiary = slightly reduced.
- **Authority structure signaling:** Labels and grouping reinforce the five authority signals structurally; order and rank align with Brief = hub, Work + Proof = verification, Writing + Contact = institutional.
- **Single source of truth:** No parallel nav. Nav items built from `PRIMARY_NAV_ENTRIES`; locale layout maps entries to `{ href, label, rank }` and passes to `Nav`. No second list of links elsewhere.

---

## 2. Observable runtime behaviors

- **DOM:** Each nav link has `data-nav-rank="primary" | "secondary" | "tertiary"`. CSS in `30-components.css` applies font-weight by rank.
- **Landmarks:** `nav[aria-label]` present; `aria-current="page"` on the active route.
- **Focus order:** First focusable is skip link (`href="#main-content"`); then identity → primary nav (desktop links or mobile trigger) → utilities (theme, language, a11y panel) → main.
- **RTL:** For Hebrew, document has `dir="rtl"`; nav and masthead remain visible and correctly aligned (logical properties).
- **E2E-observable:** Navigation hierarchy spec asserts rank attributes, focus order, aria-current, RTL dir, and landmark labels per locale.

---

## 3. Metrics of success

| Metric           | Target                                                        | How measured                                   |
| ---------------- | ------------------------------------------------------------- | ---------------------------------------------- |
| Order compliance | Home → Brief → Work → Writing → Proof → Contact               | E2E + config audit (`PRIMARY_NAV_ENTRIES`)     |
| Rank encoding    | Brief primary; Work/Proof secondary; Writing/Contact tertiary | E2E `data-nav-rank` assertions                 |
| Focus order      | Skip link first; then header → main                           | E2E focus-order spec                           |
| Active route     | `aria-current="page"` on current route                        | E2E navigation-hierarchy spec                  |
| RTL integrity    | `dir="rtl"` for he; no horizontal scroll; nav visible         | E2E navigation-hierarchy + responsive-layout   |
| No duplication   | Single nav component; no duplicate item list                  | Code review + validator (no second nav source) |

---

## 4. Extension rules

- **Add nav item:** Extend `PRIMARY_NAV_ENTRIES` in `libs/sections/src/lib/navigation/primaryNavConfig.ts` only. Assign rank (primary | secondary | tertiary) and ensure i18n key exists (`nav.*`). Do not add a separate component or duplicate list.
- **Change rank semantics:** Update both config and `30-components.css` selectors (`.nav-primary-link[data-nav-rank='...']`). Run E2E nav and focus-order specs.
- **New locale:** Ensure layout builds nav items from the same config; add `aria-label` for nav landmark per locale. RTL locales must use logical properties and `dir="rtl"` where applicable.

---

## 5. Anti-degradation constraints

- **Order:** Do not reorder or drop core entries (Home, Brief, Work, Writing, Proof, Contact) without program-level change control.
- **Rank:** Do not demote Brief from primary or promote tertiary items to primary without explicit authority decision.
- **Encoding:** Do not remove `data-nav-rank` or break the CSS coupling; E2E will fail.
- **Accessibility:** Do not remove skip link, landmark labels, or `aria-current`; do not introduce focus traps or invisible focus.
- **Single source:** Do not implement a second nav component or duplicate item list; extend existing `Nav` and layout only.
- **RTL:** Do not use physical properties (left/right) for nav layout; use logical (inline-start/end). Do not break `dir="rtl"` for Hebrew.

---

## 6. References

- [Navigation Cognitive Hierarchy](../authority/navigation-cognitive-hierarchy.md)
- [Masthead specification](../authority/masthead-spec.md)
- [Authority signal integration](../authority-signal-integration.md)
- [Home signal map](../authority/home-signal-map.md)
- E2E: `apps/web-e2e/src/nav/navigation-hierarchy.spec.ts`

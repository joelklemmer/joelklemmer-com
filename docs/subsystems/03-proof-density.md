# Proof Density — Subsystem Doctrine

**Authority:** Page-by-page completion framework for proof density across the platform. Every route has a clear intent, required proof artifacts, schema, UX, a11y, and performance targets with a completion definition.

**Scope:** Core routes (/, /brief, /casestudies, /books, /publicrecord, /contact); listing and entry pages; footer quiet pages. No code changes from this doctrine alone—documentation and audit drive implementation.

---

## 1. Engineering goals

- **Intent clarity:** Each page has defined 10s and 60s purpose (reader understanding and next-step capability) aligned with [page-intent-map](../page-intent-map.md).
- **No claim without proof path:** Every claim must link to Public Record or case study where applicable. Brief, case study entries, book entries, and public record entries enforce proof linkage; Home and listing pages route to proof surfaces.
- **Schema and SEO:** Required JSON-LD and canonical/hreflang per route; Organization, WebSite, Person on Home; Report and Person on Brief; optional ItemList/Article/Book where specified.
- **UX and a11y:** Required elements (H1, CTAs, anchors, lists) and landmarks, focus, axe-clean per quality gates.
- **Performance:** LCP < 1.8s, CLS ≈ 0, INP < 200ms; Lighthouse performance ≥ 0.7, accessibility ≥ 0.9. Proof-density work does not relax these.

---

## 2. Observable runtime behaviors

- **Home:** H1 = identity; single primary CTA to Brief; verification rails (Brief, Case Studies, Public Record); claim summary items cite “(Public Record)” and do not make unlinked assertions. Organization + WebSite + Person JSON-LD.
- **Brief:** In-page anchors (#doctrine, #claims, #claim-{id}); links to Claims Index, Frameworks, Case Studies, Public Record; every claim has at least one proof path. Person + Report JSON-LD.
- **Case study / book / public record:** Listing cards link to entry; entry pages have context, evidence links, and back-links to Brief claim or Public Record. Canonical/hreflang; optional schema per roadmap.
- **Contact:** Pathway selection and CTA; no proof claim on page.
- **Footer pages:** Each has valid page, canonical/hreflang; Media has CollectionPage + ItemList where required. No duplicate H1/lede with core screens.
- **Validators:** pgf-validate (unique H1/lede/CTA), seo-validate (JSON-LD, canonicals), a11y, Lighthouse; verify pipeline and completion checklists in roadmap.

---

## 3. Metrics of success

| Metric           | Target                                                               | How measured                            |
| ---------------- | -------------------------------------------------------------------- | --------------------------------------- |
| 10s/60s intent   | Matches page-intent-map and roadmap per route                        | Audit + contentOS intents               |
| Proof linkage    | Every claim has proof path on Brief/entry pages                      | Audit + briefing-contracts / content    |
| Schema           | Organization, WebSite, Person, Report, CollectionPage where required | nx run web:seo-validate                 |
| Copy uniqueness  | No duplicate H1/lede/primary CTA across pages                        | nx run web:pgf-validate                 |
| A11y             | Landmarks, focus, axe clean                                          | nx run web:a11y                         |
| Performance      | LCP < 1.8s, CLS ≈ 0, INP < 200ms, perf ≥ 0.7                         | Lighthouse CI                           |
| Completion state | Roadmap checklists updated per sprint/release                        | docs/authority/proof-density-roadmap.md |

---

## 4. Extension rules

- **New route:** Add to proof-density roadmap with Purpose (10s/60s), Required proof artifacts, Schema types, UX elements, A11y validations, Performance targets, and Completion definition. Run weekly audit for touched routes.
- **New claim or evidence:** Ensure Brief and entry pages link bidirectionally; no standalone assertions. Update briefing-contracts and content loaders as needed.
- **New footer page:** Add to roadmap §10; ensure canonical/hreflang and no duplicate H1/lede; use prefetch={false} for footer links.
- **Performance work:** Follow §13 of roadmap: proof required (bundle diff, Lighthouse, Web Vitals, files changed, verify green); no visual/layout/token/route changes.

---

## 5. Anti-degradation constraints

- **Do not** add claims without at least one proof path (Public Record or case study link) on Brief and entry pages.
- **Do not** duplicate H1, lede, or primary CTA across pages; pgf-validate must pass.
- **Do not** emit duplicate or conflicting JSON-LD for the same entity across pages; single Person @id, Report about/mentions canonical URLs.
- **Do not** duplicate the same claim/evidence across attachments without differentiation (per attachments-standard).
- **Do not** relax performance targets or skip Lighthouse/Web Vitals assertions when changing proof or content.
- **Do not** perform performance “hardening” with visual, layout, token, or routing changes; proof checklist and pipeline must remain green.

---

## 6. References

- [Proof Density Roadmap](../authority/proof-density-roadmap.md)
- [Page intent map](../page-intent-map.md)
- [Home signal map](../authority/home-signal-map.md)
- [Quality gates](../quality-gates.md)
- [Performance optimization](../performance-optimization.md)
- [Attachments standard](../proof/attachments-standard.md)

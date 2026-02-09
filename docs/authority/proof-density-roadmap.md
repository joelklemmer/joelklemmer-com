# Proof Density Roadmap

**Purpose:** Page-by-page completion framework for proof density across JoelKlemmer.com. Ensures each route has a clear intent, required proof artifacts, schema, UX, a11y, and performance targets with a completion definition. No code changes—documentation and audit only.

**Scope:** Core routes `/`, `/brief`, `/casestudies`, `/books`, `/publicrecord`, `/contact`; listing and entry pages for casestudies, books, publicrecord; footer quiet links (media, media-kit, press, bio, faq, now, privacy, terms, accessibility, security).

**Alignment:** [page-intent-map.md](../page-intent-map.md), [home-signal-map.md](home-signal-map.md), [authority-platform-program.md](../program/authority-platform-program.md), [quality-gates.md](../quality-gates.md).

---

## 1. Home `/`

| Dimension                        | Requirement                                                                                                                                                                                                                                                                                   |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Purpose (10s)**                | Reader knows this is an authority verification site for executive evaluation.                                                                                                                                                                                                                 |
| **Purpose (60s)**                | Reader can choose Executive Brief, Case Studies, or Public Record as next step.                                                                                                                                                                                                               |
| **Required proof artifacts**     | None on-page. Primary CTA and route cards must route to proof surfaces (Brief, casestudies, publicrecord). Claim summary items must cite “(Public Record)” and not make unlinked assertions.                                                                                                  |
| **Required schema types**        | `Organization` (with `@id`); `WebSite`; `Person` (with `@id`, non-empty `sameAs`).                                                                                                                                                                                                            |
| **Required UX elements**         | H1 = identity; single primary CTA (“Open executive brief” → `/[locale]/brief`); Verification rails section with Executive Brief (dominant), Case Studies, Public Record; Doctrine section with cards linking to `/[locale]/brief#doctrine`.                                                   |
| **Required a11y validations**    | Skip to main content; landmark labels (header, nav, main, footer); focus ring on all interactive elements; no axe violations (web:a11y).                                                                                                                                                      |
| **Required performance targets** | LCP &lt; 1.8s; CLS ≈ 0; INP &lt; 200ms; Lighthouse performance ≥ 0.7, accessibility ≥ 0.9.                                                                                                                                                                                                    |
| **Completion definition**        | [ ] H1/lede/CTA unique (pgf-validate). [ ] Organization + WebSite + Person JSON-LD present and valid (seo-validate). [ ] Executive Brief and verification rails present (validate-home). [ ] No standalone claims on Hero; CTA and routes point to proof. [ ] a11y and Lighthouse gates pass. |

---

## 2. Executive Brief `/brief`

| Dimension                        | Requirement                                                                                                                                                                                                                                                                                      |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Purpose (10s)**                | Reader understands the Executive Brief is the primary authority hub for structured review.                                                                                                                                                                                                       |
| **Purpose (60s)**                | Reader can reach Claims, Case Studies, or Public Record and see evidence routing.                                                                                                                                                                                                                |
| **Required proof artifacts**     | Every claim must link to Public Record entries where applicable. Outcomes and case studies must be evidence-linked. No claim without proof path.                                                                                                                                                 |
| **Required schema types**        | `Person` (author identity); `Report` (with `author`, `mainEntityOfPage`, `about`/`mentions` for claim/casestudy/publicrecord URLs).                                                                                                                                                              |
| **Required UX elements**         | In-page anchors: `#doctrine`, `#claims`, `#claim-{id}`. Links to See Claims Index, See Frameworks and doctrine, See Case Studies, See Public Record; Contact link.                                                                                                                               |
| **Required a11y validations**    | Landmarks; focus management for anchor targets; link purpose clear (no “click here”); axe clean.                                                                                                                                                                                                 |
| **Required performance targets** | Same as Home (LCP, CLS, INP; Lighthouse thresholds).                                                                                                                                                                                                                                             |
| **Completion definition**        | [ ] Person + Report JSON-LD emitted; Report includes author and mainEntityOfPage (seo-validate). [ ] All claims have at least one proof path (public record or case study). [ ] Brief anchors and nav links present. [ ] pgf-validate passes (unique H1/lede/CTA). [ ] a11y and Lighthouse pass. |

---

## 3. Case Studies index `/casestudies`

| Dimension                        | Requirement                                                                                                                                                                  |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Purpose (10s)**                | Reader knows case studies are structured demonstrations with evidence links.                                                                                                 |
| **Purpose (60s)**                | Reader can open a case study and see context, constraints, actions, outcomes, and Public Record references.                                                                  |
| **Required proof artifacts**     | Listing: each entry must surface that evidence links exist. No requirement for on-page artifacts; proof lives on entry pages and in Public Record.                           |
| **Required schema types**        | Canonical and hreflang only (per validate-seo). Optional: `ItemList` of case study URLs for richer discovery.                                                                |
| **Required UX elements**         | List/cards of case studies with links to `/[locale]/casestudies/[slug]`; minimal hierarchy (heading, list).                                                                  |
| **Required a11y validations**    | List semantics; link text descriptive; landmarks; axe clean.                                                                                                                 |
| **Required performance targets** | Same as Home.                                                                                                                                                                |
| **Completion definition**        | [ ] Canonical and hreflang valid for `/casestudies`. [ ] Each card links to entry; no orphan slugs. [ ] Sitemap includes all case study slugs. [ ] a11y and Lighthouse pass. |

---

## 4. Case Study entry `/casestudies/[slug]`

| Dimension                        | Requirement                                                                                                                                                                                                                      |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Purpose (10s)**                | Reader sees one structured case study with clear context and evidence expectation.                                                                                                                                               |
| **Purpose (60s)**                | Reader sees context, constraints, actions, outcomes, and Public Record references; can navigate to linked claim or public record.                                                                                                |
| **Required proof artifacts**     | Each case study must reference Public Record where applicable; links to `/[locale]/publicrecord/[slug]` and `/[locale]/brief#claim-{id}`. No unlinked assertions.                                                                |
| **Required schema types**        | Canonical and hreflang. Optional: `Article` or `Report` with author, datePublished, and mainEntityOfPage.                                                                                                                        |
| **Required UX elements**         | Title (H1); sections (context, constraints, actions, outcomes); links to related public record and claim anchors; language switcher preserves slug.                                                                              |
| **Required a11y validations**    | Heading hierarchy; link purpose; landmarks; axe clean.                                                                                                                                                                           |
| **Required performance targets** | Same as Home.                                                                                                                                                                                                                    |
| **Completion definition**        | [ ] Entry exists for slug in sitemap; canonical/hreflang correct. [ ] At least one of: public record link or brief claim link where content warrants. [ ] No standalone claims without proof path. [ ] a11y and Lighthouse pass. |

---

## 5. Books index `/books`

| Dimension                        | Requirement                                                                                                                                                      |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Purpose (10s)**                | Reader knows books are published volumes with verification-linked references.                                                                                    |
| **Purpose (60s)**                | Reader can see metadata, verified references, and availability per book.                                                                                         |
| **Required proof artifacts**     | Listing: each book may reference Public Record; “no claim without proof” applies to any claim made in book metadata or excerpts.                                 |
| **Required schema types**        | Canonical and hreflang. Optional: `ItemList` of book entry URLs.                                                                                                 |
| **Required UX elements**         | List/cards of books with links to `/[locale]/books/[slug]`.                                                                                                      |
| **Required a11y validations**    | List semantics; link text descriptive; landmarks; axe clean.                                                                                                     |
| **Required performance targets** | Same as Home.                                                                                                                                                    |
| **Completion definition**        | [ ] Canonical and hreflang valid for `/books`. [ ] Each card links to entry; no orphan slugs. [ ] Sitemap includes all book slugs. [ ] a11y and Lighthouse pass. |

---

## 6. Book entry `/books/[slug]`

| Dimension                        | Requirement                                                                                                                    |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| **Purpose (10s)**                | Reader sees one book with metadata and verification-linked references.                                                         |
| **Purpose (60s)**                | Reader sees metadata, verified references, and availability; can follow links to Public Record or Brief where cited.           |
| **Required proof artifacts**     | Any claim in metadata or excerpts must have proof path (Public Record or Brief claim link). Books may reference Public Record. |
| **Required schema types**        | Canonical and hreflang. Optional: `Book` with author, datePublished, sameAs (e.g. retailer).                                   |
| **Required UX elements**         | Title (H1); metadata; links to related public record and/or brief claim where applicable; language switcher preserves slug.    |
| **Required a11y validations**    | Heading hierarchy; link purpose; landmarks; axe clean.                                                                         |
| **Required performance targets** | Same as Home.                                                                                                                  |
| **Completion definition**        | [ ] Entry exists for slug; canonical/hreflang correct. [ ] No claims without proof path. [ ] a11y and Lighthouse pass.         |

---

## 7. Public Record index `/publicrecord`

| Dimension                        | Requirement                                                                                                                                                                      |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Purpose (10s)**                | Reader knows the Public Record holds verification artifacts supporting claims.                                                                                                   |
| **Purpose (60s)**                | Reader can open a record and see type, date, source, verification, and claim linkage.                                                                                            |
| **Required proof artifacts**     | All entries are artifacts; each must support claims or case studies (linkage from Brief or case study). Listing surfaces that entries are verification artifacts.                |
| **Required schema types**        | Canonical and hreflang. Optional: `ItemList` of public record entry URLs.                                                                                                        |
| **Required UX elements**         | List/cards of public record entries with links to `/[locale]/publicrecord/[slug]`.                                                                                               |
| **Required a11y validations**    | List semantics; link text descriptive; landmarks; axe clean.                                                                                                                     |
| **Required performance targets** | Same as Home.                                                                                                                                                                    |
| **Completion definition**        | [ ] Canonical and hreflang valid for `/publicrecord`. [ ] Each card links to entry; no orphan slugs. [ ] Sitemap includes all public record slugs. [ ] a11y and Lighthouse pass. |

---

## 8. Public Record entry `/publicrecord/[slug]`

| Dimension                        | Requirement                                                                                                                                  |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| **Purpose (10s)**                | Reader sees one verification artifact with type, date, source, and claim linkage.                                                            |
| **Purpose (60s)**                | Reader sees full artifact details and can navigate to linked claim (Brief) or case study.                                                    |
| **Required proof artifacts**     | Entry is the proof artifact. Must link back to `/[locale]/brief#claim-{id}` and/or case study where this record is cited.                    |
| **Required schema types**        | Canonical and hreflang. Optional: structured type (e.g. `CreativeWork` or `Article`) with datePublished, author/source.                      |
| **Required UX elements**         | Title (H1); type, date, source; verification note; links to Brief claim and/or case study; language switcher preserves slug.                 |
| **Required a11y validations**    | Heading hierarchy; link purpose; landmarks; axe clean.                                                                                       |
| **Required performance targets** | Same as Home.                                                                                                                                |
| **Completion definition**        | [ ] Entry exists for slug; canonical/hreflang correct. [ ] At least one of: link to Brief claim or case study. [ ] a11y and Lighthouse pass. |

---

## 9. Contact `/contact`

| Dimension                        | Requirement                                                                                                                    |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| **Purpose (10s)**                | Reader knows contact is controlled intake for role, media, and public record requests.                                         |
| **Purpose (60s)**                | Reader can select a pathway and send a message by email.                                                                       |
| **Required proof artifacts**     | None. Pathways are descriptive; no proof claim on contact.                                                                     |
| **Required schema types**        | Canonical and hreflang.                                                                                                        |
| **Required UX elements**         | Pathway selection (role, media, public record request); primary CTA (e.g. send role inquiry by email or pathway-specific CTA). |
| **Required a11y validations**    | Form labels; focus order; landmarks; axe clean.                                                                                |
| **Required performance targets** | Same as Home.                                                                                                                  |
| **Completion definition**        | [ ] Canonical and hreflang valid. [ ] Pathways and CTA present. [ ] pgf-validate passes. [ ] a11y and Lighthouse pass.         |

---

## 10. Footer quiet pages (group)

Footer links: `media`, `media-kit`, `press`, `bio`, `faq`, `now`, `privacy`, `terms`, `accessibility`, `security`. Routes: `/[locale]/media`, `/[locale]/media-kit`, etc.

| Dimension                        | Requirement                                                                                                                                                                                                                           |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Purpose (10s)**                | Reader can identify the page (e.g. “Media,” “Privacy policy”) and its role.                                                                                                                                                           |
| **Purpose (60s)**                | Reader can consume the page content or complete the intended action (e.g. view media, read terms).                                                                                                                                    |
| **Required proof artifacts**     | Only where relevant: e.g. Media page lists Tier A/B assets with manifest-backed metadata; no proof claim on legal/utility pages (privacy, terms, accessibility, security).                                                            |
| **Required schema types**        | **Media `/media`:** `CollectionPage` with `ItemList` of `ImageObject` (validate-seo). All others: canonical and hreflang.                                                                                                             |
| **Required UX elements**         | Minimal: H1, main content, footer nav. Media: filter/list per MediaLibraryClient; no sitewide galleries.                                                                                                                              |
| **Required a11y validations**    | Landmarks; focus; axe clean; footer links use `prefetch={false}` (no over-prefetch).                                                                                                                                                  |
| **Required performance targets** | Same as Home; Media must not load master images in list (thumb only).                                                                                                                                                                 |
| **Completion definition**        | [ ] Each footer slug has a valid page; canonical and hreflang for each. [ ] `/media` emits CollectionPage + ItemList JSON-LD (seo-validate). [ ] No duplicate H1/lede with core screens (pgf-validate). [ ] a11y and Lighthouse pass. |

---

## 11. Audit cadence

- **Weekly:** Run proof-density audit for the current sprint’s touched routes.
  1. **Intent:** For each touched page, confirm 10s/60s intent still matches [page-intent-map.md](../page-intent-map.md) and this roadmap.
  2. **Proof artifacts:** For Brief, case study entries, book entries, public record entries—confirm every claim has a proof path and no new unlinked assertions.
  3. **Schema:** Run `nx run web:seo-validate`; fix any regression in Organization, WebSite, Person, Report, or CollectionPage/ItemList.
  4. **UX:** Spot-check required UX elements (CTAs, anchors, lists) on modified pages.
  5. **A11y:** Run `nx run web:a11y`; address any new violations.
  6. **Performance:** Run Lighthouse (CI or `nx run web:lighthouse-budget`); ensure LCP/CLS/INP and score thresholds hold.
  7. **Performance proof (if performance-related changes):** Bundle diff (`pnpm run build:analyze`), Lighthouse scores, Web Vitals summary, files-changed list; verify pipeline remains green (see §13).
  8. **Completion checklists:** Update checklist state in this doc for any page that reached “done” or regressed.

- **Per-release:** Full pass over all core routes and footer pages using this roadmap’s completion definitions; update roadmap checklists and fix gaps before release.

---

## 12. Preventing duplication across pages

- **Copy (H1, lede, primary CTA):** No reuse of the same phrase as H1, lede, or primary CTA across different pages. Enforced by `nx run web:pgf-validate`. Maintain [authority-copy-bank.md](../authority-copy-bank.md) and [copy-decision-log.md](../copy-decision-log.md); add new CTAs/headings there and ensure uniqueness.
- **Proof narrative:** Do not duplicate the same claim or evidence across multiple pages without clear differentiation (e.g. Brief = index and linkage; Public Record entry = single artifact; Case Study = single story). Per [attachments-standard.md](../proof/attachments-standard.md): no duplication of the same claim/evidence across attachments without differentiation.
- **Structured data:** Single source of truth per entity: Person @id used on Home and Brief; Report `about`/`mentions` reference canonical URLs for claims/casestudies/publicrecord. Do not emit duplicate or conflicting JSON-LD for the same entity on different pages.
- **Content OS / intents:** Keep `intents.<page>.tenSecond` and `intents.<page>.sixtySecond` in contentOS.json unique and aligned with this roadmap; use content-os-validate to catch drift.
- **Signals and routes:** Home does not bind as a content entity; signal coverage is via routing to Brief, Case Studies, Public Record, and doctrine. Avoid restating authority signals as on-page copy (UASIL: no on-page signal labels); structure and links carry the signal.
- **Visual hierarchy:** Per [visual-authority-system.md](../visual-authority-system.md), do not repeat the same metadata in two different visual treatments; use one consistent pattern per page type.

---

## 13. Performance hardening (Core Web Vitals)

**Objective:** Harden performance and Core Web Vitals **without** modifying visual layout, tokens, or content structure. Enterprise-grade stability; documentation and validation only in this roadmap—implementation lives in code and [performance-optimization.md](../performance-optimization.md).

### Target metrics

| Metric | Target                |
| ------ | --------------------- |
| LCP    | < 1.8s                |
| CLS    | ≈ 0                   |
| INP    | < 200ms               |
| TTFB   | Minimized via caching |

### Implementation checklist (reference)

1. **Image optimization** — Next/Image everywhere applicable; responsive sizes; AVIF/WebP enabled; priority only on hero; no layout shifts.
2. **Font optimization** — Inter variable properly subset; preload critical font weights; `font-display` swap/optional; prevent FOIT/FOUT.
3. **Bundle analysis** — Next bundle analyzer enabled; identify heavy imports; remove unused deps.
4. **Route prefetch tuning** — Strategic prefetch only; footer and nav quiet links use `prefetch={false}`; avoid over-prefetch.
5. **HTTP caching headers** — Immutable static assets; long max-age where appropriate.
6. **Lighthouse CI** — Performance scoring in pipeline; assertions for LCP, CLS, INP, performance score.

### Constraints

- **NO** visual changes.
- **NO** layout refactors.
- **NO** token modifications.
- **NO** routing changes.

### Proof required (performance work)

When performing or auditing performance work, show:

| Proof                    | How                                                                                            |
| ------------------------ | ---------------------------------------------------------------------------------------------- |
| **Bundle diff**          | Run `pnpm run build:analyze` before/after; document heavy-import changes.                      |
| **Lighthouse scores**    | CI job `lighthouse` or `nx run web:lighthouse-budget`; reports in `tmp/lighthouse` / artifact. |
| **Web Vitals summary**   | LCP &lt; 1.8s, CLS ≈ 0, INP &lt; 200ms per lighthouserc.cjs assertions.                        |
| **Files changed**        | List only performance-related files (images, fonts, cache, analyzer, LHCI).                    |
| **Verify remains green** | `nx run web:build`, verify-fast, a11y, lighthouse jobs pass.                                   |

**Completion definition (performance):** [ ] Bundle analyzer run and diff documented if bundle changed. [ ] Lighthouse CI green; scores meet thresholds. [ ] Web Vitals within targets. [ ] No visual/layout/token/route changes. [ ] Pipeline (verify-fast, build, a11y, lighthouse) green.

---

## 14. References

- [page-intent-map.md](../page-intent-map.md) — 10s/60s intents, CTAs, proof expectation, audience.
- [home-signal-map.md](home-signal-map.md) — Home sections, proof expectation, CTA alignment, non-duplication.
- [pgf.md](../pgf.md) — Tone, no duplication, proof-forward rules.
- [quality-gates.md](../quality-gates.md) — pgf-validate, seo-validate, a11y, verify pipeline.
- [performance-optimization.md](../performance-optimization.md) — LCP, CLS, INP, Lighthouse CI, bundle analyzer, proof checklist.
- §13 (Performance hardening) — Target metrics, implementation checklist, constraints, proof required.
- [authority-platform-program.md](../program/authority-platform-program.md) — Subsystem inventory, entity graph, validators.

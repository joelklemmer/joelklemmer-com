# Presentation Governance Framework (PGF)

The PGF is the enforceable system governing tone, copy, page intent, proof linkage, localization, and UI copy for JoelKlemmer.com. Use this document for authoring and the [PGF checklist](#pgf-checklist) during PR review.

## Tone

- **Quiet authority.** No hype, no exclamation points. Short paragraphs. Public-service professionalism.
- Voice: evaluator-facing, evidence-led, restraint over persuasion.

## Copy constraints

- **No duplication.** Do not repeat the same phrase as H1, lede, or CTA across different pages (see [quality gates](quality-gates.md) PGF gate).
- **No filler.** Every sentence must earn its place; remove throat-clearing and redundant headings.
- **No vague adjectives.** Prefer concrete, verifiable language over “leading,” “best-in-class,” “robust,” etc.

## Page intent model

Each primary route must state:

- **(a) 10-second outcome:** What the reader understands or can do in ~10 seconds (e.g. from the page H1/title and lede).
- **(b) 60-second outcome:** What the reader can do or conclude after ~60 seconds (e.g. from first screen + one scroll or key CTA).

These map to **meta.title** (H1) and **meta.description** (lede) for core screens. No two core screens may share the same H1 or the same lede (default locale); enforced by `nx run web:pgf-validate`.

## Proof-forward rules

- **Claims** must link to **Public Record** and **Case Studies** where applicable.
- In copy and UI, prefer linking to specific records or case studies over unlinked assertions.
- Use the [Copy decision log](copy-decision-log.md) for approved terms (e.g. Executive Brief, Public Record, Case Studies, Claims, Artifacts, Verification).

## Localization rules

- **Canonical source:** English (`en`) is the source of truth. All other locales must maintain parity (same keys, complete translations).
- **Translation parity:** i18n-validate ensures required namespaces and keys exist for all locales; PGF validates default-locale uniqueness (H1, lede, primary CTAs).
- **RTL safety:** For RTL locales (e.g. `he`), note layout and punctuation in component/docs; avoid assumptions about “left”/“right” in copy.

## UI copy rules

- **Buttons and labels:** Use consistent verbs; avoid repeating the same CTA label across unrelated actions (allowlist for known repeats, e.g. “Read more,” is documented in the PGF validator).
- **CTA verbs:** Be specific where possible (e.g. “Send role inquiry by email” vs generic “Contact”).
- **Microcopy patterns:** Fallback notices, a11y labels, and form hints follow the same tone and brevity.

## PGF checklist

Use during PR review when copy or structure changes:

- [ ] **Tone:** No exclamation points; short paragraphs; quiet authority.
- [ ] **No duplicate H1:** Core screens (Home, Brief, Case Studies, Books, Public Record, Contact, Privacy, Terms, Accessibility, Security) have unique `meta.title` in default locale.
- [ ] **No duplicate lede:** Same core screens have unique `meta.description` in default locale.
- [ ] **Claims registry:** No duplicate `labelKey` or `summaryKey` in `libs/content` claim registry.
- [ ] **Primary CTAs:** No duplicate CTA labels across primary CTAs (contact pathways, home CTA, mailto button) unless on allowlist.
- [ ] **Proof-forward:** New claims or assertions reference Public Record / Case Studies where applicable.
- [ ] **Copy decision log:** New or changed terms added to [copy-decision-log.md](copy-decision-log.md) with rationale.
- [ ] **Gate:** `nx run web:pgf-validate` passes.

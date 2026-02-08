# Content Operating System

The Content Operating System enforces proof-forward, evaluator-grade content across JoelKlemmer.com. It is governed by the [Presentation Governance Framework (PGF)](pgf.md) and the [Visual Authority System](visual-authority-system.md). This document defines the rules and workflow that replace placeholders with real content and keep them consistent.

## Canonical voice rules (quiet authority)

- **Tone:** Evaluator-facing, evidence-led. No hype, no exclamation points. Short paragraphs. Public-service professionalism.
- **Restraint over persuasion:** Prefer concrete, verifiable language. No vague adjectives ("leading," "best-in-class," "robust").
- **Every sentence earns its place:** Remove throat-clearing and redundant headings. No filler.

## Page intent model

Each primary route must define:

- **10-second outcome:** What the reader understands or can do in ~10 seconds (from H1/title and lede).
- **60-second outcome:** What the reader can do or conclude after ~60 seconds (first screen plus one scroll or key CTA).

These map to **meta.title** (H1) and **meta.description** (lede). Page intent is documented in [page-intent-map.md](page-intent-map.md) and reflected in [contentOS](page-intent-map.md#contentos-intents) intent keys for i18n.

## Proof binding rules

- **When a sentence must link to proof:** Any claim about an accomplishment, outcome, or verification must bind to Public Record and/or Case Studies using existing registries. Do not assert outcomes without a link to a record or case study.
- **Capability vs accomplishment:** If proof does not yet exist, frame as capability or scope, not as an accomplishment.
- **Artifacts:** Use the Copy decision log and artifact manifest for approved artifact labels and links.

## Microcopy rules (buttons, labels, CTAs)

- **Unique constraints:** One primary CTA per page. No duplicate CTA labels across primary routes unless on the PGF allowlist (e.g. "Read more").
- **Verbs:** Use specific verbs where possible (e.g. "Send role inquiry by email" vs generic "Contact").
- **Consistency:** Buttons, labels, and form hints follow the same tone and brevity as body copy. See [authority-copy-bank.md](authority-copy-bank.md) for controlled vocabulary.

## Non-duplication rules

- **Across pages:** No reused phrase as H1, lede, or primary CTA across different pages. Enforced by `nx run web:pgf-validate`.
- **Ledes:** Each core screen has a unique meta.description (default locale).
- **Headings:** Section headings must not repeat the same wording as another page's H1 or lede.

## Localization rules

- **Canonical English:** English (`en`) is the source of truth. All other locales maintain parity (same keys, complete translations).
- **Parity checks:** i18n-validate ensures required namespaces and keys exist for all locales. content-os-validate ensures intent keys exist.
- **RTL notes:** For RTL locales (e.g. `he`), avoid hardcoded "left"/"right" in copy; use logical properties in layout. Allow layout expansion for longer translated strings.

## Review workflow

1. **Author:** Draft or edit copy per PGF and this spec. Bind claims to proof where required.
2. **Reviewer:** Check tone, uniqueness (H1/lede/CTA), and proof binding.
3. **Proof check:** Confirm every claim links to Public Record or Case Study where applicable.
4. **i18n check:** Ensure keys exist in all locales; add contentOS intents if the page intent changed.
5. **Publish:** Run `nx run web:verify` (includes pgf-validate, content-os-validate, i18n-validate). Fix any reported errors before merge.

## Related docs

- [pgf.md](pgf.md) — Tone, copy constraints, proof-forward rules, PGF checklist.
- [page-intent-map.md](page-intent-map.md) — 10s/60s intent and primary CTA per route.
- [authority-copy-bank.md](authority-copy-bank.md) — Controlled vocabulary; references [copy-decision-log.md](copy-decision-log.md).

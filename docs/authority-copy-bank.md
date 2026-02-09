# Authority copy bank

Controlled vocabulary and phrase bank aligned to the [Presentation Governance Framework (PGF)](pgf.md). All approved terms and usage must align with the [Copy decision log](copy-decision-log.md); new or changed terms require a log entry and rationale before use.

## Primary terms (from Copy decision log)

| Term            | Approved wording                            | Use                                       |
| --------------- | ------------------------------------------- | ----------------------------------------- |
| Executive Brief | Executive brief (lowercase after first use) | Nav, meta.brief, brief hero, CTAs         |
| Public Record   | Public record (lowercase in body)           | Nav, meta.proof, proof pages, evidence UI |
| Case Studies    | Case studies                                | Nav, meta.work, casestudies index/entry   |
| Claims          | Claims                                      | Brief, claim registry                     |
| Artifacts       | Artifacts                                   | Brief, artifacts section, stable PDFs     |
| Verification    | Verification                                | Public record, brief, evidence UI         |

## CTA and action phrases

- **Open executive brief** — Home primary CTA only. Do not reuse as another page CTA.
- **Send role inquiry by email** — Contact pathway: recruiting. Unique.
- **Send board inquiry by email** — Contact pathway: board. Unique.
- **Send media request by email** — Contact pathway: media. Unique.
- **Send correction request by email** — Contact pathway: public record. Unique.
- **Send message by email** — Contact pathway: general. Unique.
- **Open email** — Mailto button label. Shared where the action is "open email client."
- **Read more** / **View case study details** — Allowlisted where context is clear; prefer specific verbs when possible.

## Page-level phrases (no duplication)

- Each core screen has exactly one primary CTA label (see PGF and content-operating-system). Do not repeat the same CTA string across Home, Brief, Case Studies, Books, Public Record, Contact unless on the allowlist.
- Ledes (meta.description) are unique per page. Do not copy a lede from one page to another.

---

## Microcopy Library (Home and masthead)

Controlled patterns for the Home hero and masthead utility labels. One pattern in use at a time per slot; no mixing. All patterns project the five authority signals (Strategic Cognition, Systems Construction, Operational Transformation, Institutional Leadership, Public-Service Statesmanship) structurally; no on-page signal labels.

### Hero headline patterns (choose one)

| Option | Wording                           | Use                                                                                |
| ------ | --------------------------------- | ---------------------------------------------------------------------------------- |
| A      | Joel Robert Klemmer               | Default. Identity only; no tagline in H1.                                          |
| B      | Joel Robert Klemmer               | With optional document-level tagline in meta or footer only; H1 remains name only. |
| C      | [Full legal or professional name] | If name ever changes; same rule: H1 = identity only.                               |

### Hero lede patterns (choose one)

| Option | Wording                                                                                   | Use                                                            |
| ------ | ----------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| A      | Verification dossier for executive and board review.                                      | Default. Orients evaluators; no claims.                        |
| B      | Authority verification dossier for executive evaluation, board review, and public record. | When “authority” and “public record” must appear in hero lede. |
| C      | Dossier for executive and board review with indexed claims and artifact access.           | When lede should nod to Brief content; still orient only.      |

### CTA labels (masthead and hero)

| Destination     | Label                | Context                                                                                                      |
| --------------- | -------------------- | ------------------------------------------------------------------------------------------------------------ |
| Executive Brief | Executive brief      | Nav item. Lowercase after first use in body.                                                                 |
| Executive Brief | Open executive brief | Home hero primary CTA only. Do not reuse as another page CTA.                                                |
| Public Record   | Public record        | Nav and route cards. Lowercase in body.                                                                      |
| Case Studies    | Case studies         | Nav and route cards.                                                                                         |
| Contact         | Contact              | Nav. In-page use contact pathway labels (Send role inquiry by email, etc.) per CTA and action phrases above. |

### Accessibility toggle label language

Use functional, neutral labels. No marketing or persuasion.

| Control           | Approved label (key)                   | Example                                     |
| ----------------- | -------------------------------------- | ------------------------------------------- |
| Panel             | accessibilityPanelLabel                | Accessibility settings                      |
| Theme             | themeLabel                             | Theme                                       |
| Theme options     | themeLight / themeDark / themeSystem   | Light, Dark, System                         |
| Theme action      | themeSwitchToLight / themeSwitchToDark | Switch to light theme, Switch to dark theme |
| Contrast          | contrastLabel                          | Contrast                                    |
| Contrast options  | contrastDefault / contrastHigh         | Default, High                               |
| Motion            | motionLabel                            | Reduce motion                               |
| Text size         | textSizeLabel                          | Text size                                   |
| Text size options | textSizeDefault / textSizeLarge        | Default, Large                              |
| Links             | underlineLinksLabel                    | Underline links                             |

### Language switcher label language

| Element                   | Approved pattern       | Example                       |
| ------------------------- | ---------------------- | ----------------------------- |
| Trigger (sr-only or aria) | languageSwitcherLabel  | Language options              |
| Per-option action         | languageSwitcherAction | Switch language to {language} |

Language names in the switcher use the locale’s self-name (e.g. English, Ukrainian, Spanish, Hebrew) from common.languages.

---

## Do not use

Banned phrases and patterns. Remove or replace if present in copy or UI.

- Exclamation points.
- Hype or superlatives: leading, best-in-class, best-in-breed, world-class, robust, cutting-edge, innovative (as marketing), transformative (as marketing).
- Throat-clearing: “Welcome to…,” “We are pleased to…,” “At [X] we…”
- Duplicate H1, lede, or primary CTA across core screens (enforced by pgf-validate).
- Generic or vague CTAs where a specific verb is approved (e.g. “Contact” for a mailto that is role-specific → use “Send role inquiry by email”).
- On-page labels for the five authority signals (Strategic Cognition, etc.); signals are structural only per UASIL.
- Marketing taglines in the hero H1; identity only.
- "View brief" or "See brief" as the Home hero primary CTA; use "Open executive brief" only.
- "Click here" or "Learn more" without a specific, approved verb or context.
- First-person plural for institutional tone ("we offer," "we provide"); prefer neutral or dossier framing.

---

## Signal mapping

Phrase or pattern → authority signal(s) evoked → intended reader effect. Signals are non-prioritized and expressed structurally; this table is for governance and authoring, not for rendering on the page.

| Phrase or pattern                                     | Authority signal(s)                                                   | Intended reader effect                                 |
| ----------------------------------------------------- | --------------------------------------------------------------------- | ------------------------------------------------------ |
| Joel Robert Klemmer (H1)                              | Institutional Leadership; Public-Service Statesmanship                | Identity; evaluator knows who is being assessed.       |
| Verification dossier for executive and board review.  | Institutional Leadership; Public-Service Statesmanship                | Orients to purpose: evaluation and record.             |
| Open executive brief                                  | All five (Brief is balanced vector)                                   | Single primary action; routes to proof and doctrine.   |
| Executive Brief / Case studies / Public record (nav)  | All five (structural; Brief balanced; routes per-entity)              | Clear IA; evaluator chooses verification path.         |
| Verification rails                                    | Systems Construction; Operational Transformation                      | Conveys structure and repeatable paths.                |
| Claim summary                                         | Operational Transformation; Institutional Leadership                  | Sets expectation that claims exist and are summarized. |
| (Public Record) in claim items                        | Public-Service Statesmanship; Institutional Leadership                | Signals proof exists; no unlinked assertions.          |
| Proof-forward; not proof-dependent (doctrine lede)    | Strategic Cognition; Systems Construction                             | Methods and frameworks; not proof substitute.          |
| Frameworks and doctrine (section title)               | Strategic Cognition; Systems Construction; Operational Transformation | Entry point to method; not proof substitute.           |
| Structured narrative, indexed claims, artifact access | All five (Brief as balanced vector)                                   | Sets expectation for Brief content and proof.          |
| Start here for evaluator review                       | Institutional Leadership; Public-Service Statesmanship                | Orients evaluator; single primary CTA.                 |
| Contact (nav)                                         | — (utility)                                                           | Clear IA; routes to pathway-specific mailto labels.    |
| Accessibility settings                                | — (utility)                                                           | Functional; inclusive access.                          |
| Language options / Switch language to {language}      | — (utility)                                                           | Functional; language choice.                           |

---

## When to update this bank

- Adding a new primary CTA: add to this bank and ensure it is unique (pgf-validate) and documented in copy-decision-log if it introduces a new term.
- Changing approved wording: update Copy decision log first; then update this bank and all usages; run pgf-validate and content-os-validate.

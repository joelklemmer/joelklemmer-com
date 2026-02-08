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

## When to update this bank

- Adding a new primary CTA: add to this bank and ensure it is unique (pgf-validate) and documented in copy-decision-log if it introduces a new term.
- Changing approved wording: update Copy decision log first; then update this bank and all usages; run pgf-validate and content-os-validate.

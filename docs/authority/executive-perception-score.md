# Executive Perception Score

**Purpose:** Scoring framework for the Home page (`/[locale]/`) across the five authority signals. Supports diagnostics, gap analysis, and priority recommendations. No code changes prescribed.

**Audience:** Authority Signal Auditor, design/product, and program governance.

**Signals (non-prioritized):** Strategic Cognition, Systems Construction, Operational Transformation, Institutional Leadership, Public Service Statesmanship. Per [home-signal-map.md](./home-signal-map.md), signals are structural—no on-page labels.

---

## 1. Quantitative Rubric

Each dimension is scored **1–5** (1 = absent/weak, 5 = fully expressed and proof-aligned). Half-points allowed for nuance. Aggregate is **mean of five dimensions**; report both per-dimension and overall.

| Score | Meaning                                                                        |
| ----- | ------------------------------------------------------------------------------ |
| **1** | Signal not present or contradicted; evaluator cannot infer the dimension.      |
| **2** | Hint only; implied by one element; no clear path to proof.                     |
| **3** | Present in structure or copy; path to proof exists but understated or partial. |
| **4** | Clearly expressed; proof expectation set; CTA or rails align. Minor gaps.      |
| **5** | Fully expressed; proof-forward; no duplication; tone and anchors align (PGF).  |

---

### 1.1 Strategic Cognition

_Frameworks, methods, and reasoning—not claims alone. "Proof-forward; not proof-dependent."_

| Criterion                           | Weight | 1                   | 2                    | 3                        | 4                                                   | 5                                                        |
| ----------------------------------- | ------ | ------------------- | -------------------- | ------------------------ | --------------------------------------------------- | -------------------------------------------------------- |
| Doctrine/frameworks visible on Home | 30%    | No doctrine section | Mention only         | Section present, generic | Section + lede "Proof-forward; not proof-dependent" | As 4 + cards link to Brief#doctrine; no proof substitute |
| Method vs claim balance             | 30%    | Only claims         | Claims dominate      | Some method language     | Doctrine lede + framework cards                     | Clear: methods in doctrine, claims in summary            |
| Path to deeper cognition            | 40%    | Dead end            | Link without context | Single link to brief     | Brief dominant + doctrine anchor                    | Brief dominant CTA + doctrine cards → brief#doctrine     |

**Score (1–5):** **\_**

---

### 1.2 Systems Construction

_Repeatable structure, verification rails, predictable paths. "Verification rails" and artifact access._

| Criterion                  | Weight | 1        | 2            | 3                           | 4                                                                               | 5                                                                  |
| -------------------------- | ------ | -------- | ------------ | --------------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| Verification rails present | 35%    | No rails | One link     | Multiple links, no grouping | Section "Verification rails" + Brief + Case Studies + Public Record             | As 4 + each rail describes proof type (artifacts, evidence, dates) |
| Structure legibility       | 35%    | Unclear  | Vague labels | Section titles only         | Clear H2 + rail titles + descriptions                                           | As 4 + fixed IA order (hero → routes → claims → doctrine)          |
| Artifact/system language   | 30%    | None     | Jargon only  | One rail mentions artifacts | Descriptions cite "artifact access," "evidence links," "verification artifacts" | As 4 + no duplicate CTA labels; rails distinct                     |

**Score (1–5):** **\_**

---

### 1.3 Operational Transformation

_Delivery, recovery, governance—tangible outcomes. Claim summary with (Public Record) expectation._

| Criterion                    | Weight | 1               | 2                         | 3                                   | 4                                             | 5                                                            |
| ---------------------------- | ------ | --------------- | ------------------------- | ----------------------------------- | --------------------------------------------- | ------------------------------------------------------------ |
| Operational claims on Home   | 35%    | None            | Generic                   | One claim                           | Claim summary section with 2+ items           | As 4 + items cite "(Public Record)" explicitly               |
| Proof expectation set        | 35%    | Claims unlinked | Claims without proof note | Single "(Public Record)"            | Each claim cites (Public Record)              | As 4 + primary CTA to Brief; no CTA in claims (summary only) |
| Governance/delivery language | 30%    | Missing         | Vague                     | Recovery/sponsor/delivery mentioned | Clear recovery plan, sponsor review, delivery | As 4 + no duplication with routes/doctrine copy              |

**Score (1–5):** **\_**

---

### 1.4 Institutional Leadership

_Identity, evaluator orientation, board-level framing. H1 and lede; Brief as dominant entry._

| Criterion             | Weight | 1                     | 2                    | 3                                | 4                                                           | 5                                                               |
| --------------------- | ------ | --------------------- | -------------------- | -------------------------------- | ----------------------------------------------------------- | --------------------------------------------------------------- |
| Identity clear (H1)   | 25%    | No name / wrong level | Name in body only    | H1 present                       | H1 = full name ("Joel Robert Klemmer")                      | As 4 + meta title "Home" (document only); no H1 duplication     |
| Evaluator orientation | 40%    | Consumer/marketing    | Generic professional | "Executive" or "board" mentioned | Lede: "executive and board review" / "Verification dossier" | As 4 + single primary CTA "View brief" / "Open executive brief" |
| Dominant entry point  | 35%    | Many equal CTAs       | Brief one of several | Brief prominent                  | Executive Brief as dominant card; rails secondary           | As 4 + CTA allowlist; pgf-validate enforces uniqueness          |

**Score (1–5):** **\_**

---

### 1.5 Public Service Statesmanship

_Public record, verification, no unlinked assertions. Quiet authority tone._

| Criterion              | Weight | 1                         | 2                 | 3                             | 4                                                                          | 5                                                         |
| ---------------------- | ------ | ------------------------- | ----------------- | ----------------------------- | -------------------------------------------------------------------------- | --------------------------------------------------------- |
| Public record present  | 35%    | No public record          | Link only         | Public Record rail with label | Rail + description "Verification artifacts with dates, sources, and notes" | As 4 + claims cite (Public Record); reader expects /proof |
| No unlinked assertions | 35%    | Multiple unsourced claims | Some unlinked     | One (Public Record)           | Every claim item includes "(Public Record)"                                | As 4 + hero has no standalone claims; orient only         |
| Tone (quiet authority) | 30%    | Hype / exclamation        | Neutral but bland | Professional                  | "Authority verification dossier," "Verification rails," "Claim summary"    | As 4 + no marketing language; short clauses; PGF-aligned  |

**Score (1–5):** **\_**

---

## 2. Page Evaluation (Current Home)

**Page:** `/[locale]/` (e.g. `/en`). **Source:** [HomeScreen](../../libs/screens/src/lib/HomeScreen.tsx), [home-signal-map](./home-signal-map.md), [en/home.json](../../libs/i18n/src/messages/en/home.json).

### 2.1 Section-to-signal coverage

| Section      | Primary signal(s)                                                     | Evidence on page                                                                                                                                                       |
| ------------ | --------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Hero**     | Institutional Leadership, Public Service Statesmanship                | H1 "Joel Robert Klemmer"; lede "Verification dossier for executive and board review."; single CTA "View brief" → `/brief`.                                             |
| **Routes**   | All five (structural)                                                 | "Verification rails" H2; Executive Brief dominant card; Case Studies, Public Record rails with descriptions (artifact access, evidence links, verification artifacts). |
| **Claims**   | Operational Transformation, Institutional Leadership                  | "Claim summary" H2; two items with "(Public Record)"; no CTA in section.                                                                                               |
| **Doctrine** | Strategic Cognition, Systems Construction, Operational Transformation | "Frameworks and doctrine" (frameworks.section); lede "Proof-forward; not proof-dependent"; three FrameworkCards → `/[locale]/brief#doctrine`.                          |

### 2.2 Scores applied

| Dimension                        | Score | Rationale                                                                                                                                                                                                 |
| -------------------------------- | ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Strategic Cognition**          | **4** | Doctrine section with Proof-forward lede; framework cards link to Brief#doctrine. Method vs claim balance clear. Minor: only three framework cards on Home (expand context is at Brief).                  |
| **Systems Construction**         | **4** | Verification rails section with three rails; descriptions set proof expectation; IA order fixed (hero → routes → claims → doctrine). Minor: no explicit "structure" label beyond "Verification rails."    |
| **Operational Transformation**   | **4** | Claim summary with two items; each cites "(Public Record)"; no CTA in section; primary CTA remains Hero → Brief. Minor: only two claims on Home (more at Brief/proof).                                    |
| **Institutional Leadership**     | **4** | H1 = full name; lede orients to "executive and board review"; Executive Brief dominant; single primary CTA. Minor: i18n uses "View brief" (some copy banks use "Open executive brief")—consistency check. |
| **Public Service Statesmanship** | **4** | Public Record rail; every claim has "(Public Record)"; hero has no standalone claims; tone quiet ("Verification dossier," "Verification rails," "Claim summary"). Minor: ensure all locales match tone.   |

### 2.3 Aggregate

- **Mean score (current): 4.0 / 5.0**
- **Per-dimension range:** 4–4 (no dimension below 4 or at 5).

---

## 3. Gap Analysis

### 3.1 Strengths

- **Proof-forward discipline:** Hero does not make standalone claims; claims cite (Public Record); doctrine lede states "Proof-forward; not proof-dependent."
- **CTA alignment:** Single primary CTA to Brief; doctrine cards expand context to same destination; rails distinct and non-duplicative.
- **Signal coverage:** All five signals represented structurally; no on-page signal labels (UASIL-compliant).
- **Anchors and IA:** Section IDs `#routes`, `#doctrine`; fixed HOME_IA_ORDER; H2 and rail titles give clear orientation.

### 3.2 Gaps (no code prescribed)

| Gap                        | Dimension(s)               | Severity | Description                                                                                                                                     |
| -------------------------- | -------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| **No dimension at 5**      | All                        | Low      | No single dimension reaches "fully expressed; proof-forward; no duplication; tone and anchors align" with zero minor gaps.                      |
| **Doctrine depth on Home** | Strategic Cognition        | Low      | Only three framework cards; full doctrine lives on Brief. Acceptable by design; could be documented as intentional cap.                         |
| **Claim count on Home**    | Operational Transformation | Low      | Two claim items; evaluator must go to Brief/proof for full set. Aligns with "summary" but could be reviewed if more operational weight desired. |
| **CTA label consistency**  | Institutional Leadership   | Low      | "View brief" vs "Open executive brief" in copy bank; ensure pgf-validate and locale copy align.                                                 |
| **Explicit structure cue** | Systems Construction       | Very low | "Verification rails" implies structure; no additional "structure" or "systems" cue—acceptable per non-narrative rule.                           |

### 3.3 Risk summary

- **No critical gaps.** Current Home meets proof-forward, CTA alignment, and non-duplication expectations per home-signal-map.
- **Risks if changed without discipline:** Adding on-page signal labels (would violate UASIL); adding hero claims (would break proof-forward); multiple primary CTAs (would dilute Brief dominance).

---

## 4. Priority Recommendations

**No code changes.** Recommendations are strategic, content-governance, and documentation.

| Priority | Recommendation                                                                                                                                                                                                                           | Owner / action                     |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| **P1**   | **Lock current rubric as baseline.** Run this score after any Home content or structure change; require mean ≥ 4.0 and no dimension &lt; 3.                                                                                              | Program / Authority Signal Auditor |
| **P2**   | **Resolve CTA label consistency.** Decide canonical primary CTA label ("View brief" vs "Open executive brief"); align [authority-copy-bank](../authority-copy-bank.md) and all locale home strings; keep pgf-validate allowlist in sync. | Content / i18n                     |
| **P3**   | **Document doctrine cap.** In home-signal-map or this doc, state that Home shows up to three framework cards by design; full doctrine at Brief#doctrine. Reduces ambiguity for future changes.                                           | Docs / authority                   |
| **P4**   | **Re-score after major IA or copy changes.** If routes/claims/doctrine order or section copy changes, re-run Section 2 and update scores and gap table.                                                                                  | Authority Signal Auditor           |
| **P5**   | **Consider 4→5 path (optional).** To push any dimension to 5: eliminate the "minor" noted in 2.2 (e.g. explicit CTA canonical label; doc the three-card doctrine cap). Not required for compliance.                                      | Product / authority                |

---

## 5. Verification

- **Rubric:** Use Section 1 as checklist when scoring; record scores in Section 2 table.
- **Gaps:** Update Section 3 if new gaps appear (e.g. after new sections or copy).
- **Recommendations:** Track P1–P5 in program or backlog; no code changes in this doc.
- **Pipeline:** `nx run web:pgf-validate` and `nx run web:verify` remain the enforcement layer for H1/lede/CTA uniqueness and authority-signals-validate; this score is diagnostic only.

---

_Executive Perception Score v1.0 — Diagnostic framework for Home authority signals._

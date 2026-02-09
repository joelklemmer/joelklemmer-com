# Home Authority Signal Map

**Purpose:** Audit of the Home page against the five authority signals with proof-forward discipline. Ensures each section’s signal expression, proof expectation, CTA alignment, and non-duplication are documented. Reference for Authority Signal Auditor and PGF compliance.

**Signals (non-prioritized):** Strategic Cognition, Systems Construction, Operational Transformation, Institutional Leadership, Public-Service Statesmanship. Per [authority-signal-integration.md](../authority-signal-integration.md), signals are structural (no on-page labels).

**Audit status:** Home sections (hero, routes, claims, doctrine) express all five signals; proof expectations and CTA alignment are documented below. No copy or code changes required for signal clarification—anchors and microcopy suffice. Tone matches [PGF](../pgf.md); no duplication.

---

## 1. Section → Signal(s) → Proof expectation → CTA alignment → Non-duplication

| Section      | Primary signal(s) expressed                                                                                            | Proof expectation                                                                                                                                                                 | CTA alignment                                                            | Non-duplication check                                                                                                                                                |
| ------------ | ---------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **hero**     | Institutional Leadership, Public-Service Statesmanship (lede: “executive evaluation, board review, and public record”) | None on Hero; CTA routes to Brief where proof lives                                                                                                                               | Single primary CTA: “Open executive brief” → `/[locale]/brief`           | H1 = identity (“Joel Robert Klemmer”); meta.home.title = “Home” (document only). Lede and CTA unique vs other core screens (pgf-validate).                           |
| **routes**   | All five (structural): Brief = balanced vector; Case Studies / Public Record = per-entity vectors                      | Brief → claims + artifacts; Case Studies → evidence links; Public Record → artifacts. Descriptions set expectation (e.g. “Verification artifacts with dates, sources, and notes”) | Executive Brief dominant (H2 card); Verification rails = secondary links | Section title “Verification rails” unique. Route item titles/descriptions (Executive Brief, Case Studies, Public Record) distinct; no reuse of other pages’ H1/lede. |
| **claims**   | Operational Transformation, Institutional Leadership (recovery plan, sponsor review, delivery governance)              | Each item cites “(Public Record)”; reader expects proof at `/proof`                                                                                                               | No CTA in section; summary only. Primary CTA remains Hero → Brief        | “Claim summary” unique. Claim text does not duplicate routes or doctrine headings.                                                                                   |
| **doctrine** | Strategic Cognition, Systems Construction, Operational Transformation (frameworks: strategy, governance, delivery)     | Led by section lede: “Proof-forward; not proof-dependent.” Methods, not claims; cards link to Brief#doctrine                                                                      | Cards link to `/[locale]/brief#doctrine` (expand context)                | “Frameworks and doctrine” unique. Framework titles/summaries from frameworks.json; no overlap with home hero/routes/claims copy.                                     |

---

## 2. Proof-forward discipline

- **Hero:** No standalone claims; orient only. Single CTA to Brief.
- **Routes:** Each rail describes what proof the destination offers (Brief: “indexed claims, and artifact access”; Case Studies: “evidence links”; Public Record: “Verification artifacts”).
- **Claims:** Explicit “(Public Record)” in each item; no unlinked assertions.
- **Doctrine:** “Proof-forward; not proof-dependent” in lede; cards are entry points to Brief doctrine, not proof substitutes.

---

## 3. CTA alignment

| CTA / link                          | Role               | Target                              | Duplication                                                         |
| ----------------------------------- | ------------------ | ----------------------------------- | ------------------------------------------------------------------- |
| Hero: “Open executive brief”        | Primary CTA        | `/[locale]/brief`                   | Single primary CTA; allowlist in pgf-validate if reused elsewhere.  |
| Routes: Executive Brief card        | Dominant entry     | `/[locale]/brief`                   | Same destination, different pattern (card vs button); acceptable.   |
| Routes: Case Studies, Public Record | Verification rails | `/[locale]/work`, `/[locale]/proof` | Labels match nav/destinations; no duplicate CTA label.              |
| Doctrine: each FrameworkCard        | Expand context     | `/[locale]/brief#doctrine`          | Same destination; card purpose is “expand,” not duplicate Hero CTA. |

---

## 4. Tone and anchors (PGF)

- **Tone:** Lede and section copy use quiet authority: “Authority verification dossier,” “Verification rails,” “Claim summary,” “Proof-forward; not proof-dependent.” No hype, no exclamation points, short clauses. Matches [PGF](../pgf.md).
- **Anchors:** Section IDs `#routes`, `#doctrine` provide structural anchors. No visible “authority signal” labels (per UASIL non-narrative rule). Section headings (H2) and route/framework titles give evaluators clear orientation without marketing language.

---

## 5. Copy audit outcome

- **No copy duplication:** H1, section titles, and primary CTA are unique; pgf-validate enforces core-screen H1/lede and primary CTA uniqueness.
- **No missing anchors:** Hero (H1 + lede), routes (H2 + rail labels), claims (H2 + list), doctrine (H2 + lede) suffice for orientation. No minimal copy change required to “clarify” signals; clarity comes from structure and existing microcopy.
- **Recommendation:** No change to Home copy for signal clarification. Adding explicit signal names would violate UASIL (no on-page labels). Current microcopy already states purpose (verification, rails, claim summary, proof-forward doctrine).

---

## 6. Verification

- `nx run web:pgf-validate` — H1/lede/CTA uniqueness.
- `nx run web:verify` — full pipeline including authority-signals-validate (entity bindings; Home routes to those entities).
- Home does not bind as a content entity in authority-mapping; signal coverage is achieved via routing to Brief, Case Studies, Public Record, and doctrine (frameworks).

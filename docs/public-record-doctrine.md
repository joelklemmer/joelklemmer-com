# Public record doctrine: how to read and verification method

This document describes the **verification method** and **how to read** the Public Record list and entry pages. It matches the implementation in `libs/screens` (ProofEntryScreen, PublicRecordScreen) and is runtime-visible via section structure and data attributes.

## Three-layer disclosure

All Public Record entry pages use a consistent **multi-layer disclosure** pattern: minimal surface at the top, dense depth below.

| Layer              | Purpose                                  | Content                                                                                                                                                                                                                                    |
| ------------------ | ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Scan**           | At-a-glance summary; proof–claim binding | Title, claim supported (lede), artifact type · date · source one-liner, “Substantiates:” links to Brief claims                                                                                                                             |
| **Substantiation** | Verification and linkage                 | Artifact metadata (claim supported, type, date, source, verification note, claim link), verification method/confidence/date (if present), source block (if object), “Supports claims”, “Referenced by case studies”, “Referenced by books” |
| **Artifact**       | Files and body                           | Attachments (download link, SHA-256 prefix, copy-full-hash button), then MDX body                                                                                                                                                          |

Proof is **not isolated**: the scan layer explicitly binds this record to the claims it substantiates (“Substantiates: …”) so credibility weight is distributed where claims appear.

## Doctrine blocks (no marketing tone)

- **List page**: A “How to read this list” block states that each row is a verification artifact (scan layer), that opening an entry shows full substantiation and linked files, and that claims are indexed on the Brief page with proof bound to those claims.
- **Entry page**: A “How to read this page” block states the three-layer disclosure (at a glance → substantiation → artifacts and body), that verification method and confidence are stated when available, and that claims linked here are indexed on the Brief page.

Copy for these blocks is in i18n: `proof.doctrine.listHeading` / `proof.doctrine.listBody` (list) and `publicRecord.doctrine.howToReadHeading` / `publicRecord.doctrine.howToReadBody` (entry).

## Runtime visibility and testing

- **List**: `[data-layer="scan"]` wraps the card list. `[data-doctrine="how-to-read-list"]` wraps the doctrine block.
- **Entry**: `[data-layer="scan"]`, `[data-layer="substantiation"]`, `[data-layer="artifact"]` wrap the three layers. `[data-doctrine="how-to-read"]` wraps the doctrine block.
- **Attachments**: Each attachment row has `data-attachment-id` and `data-attachment-sha` (full 64-char hash). The copy-full-hash button is a `<button>` with an aria-label from `publicRecord.attachments.copyHash`.

Playwright tests in `apps/web-e2e/src/presentation-integrity/proof-density.spec.ts` assert presence of these layers, doctrine, and attachment row/copy button.

## Enforced rules (unchanged)

- Proof manifest and entry–manifest consistency (attachment id, filename, sha256) are validated by `tools/validate-content.ts` and `tools/verify-proof-attachments.ts`.
- Attachment ids are unique within an entry (schema). No additional validator was added for “non-duplication” beyond existing rules; see [Public Record subsystem](public-record-subsystem.md) for the non-duplication guidance.

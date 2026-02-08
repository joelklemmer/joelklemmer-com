# Sprint 2: Proof Attachments Pipeline — Implementation Report

## Summary

Proof Attachments Pipeline is implemented end-to-end. All 8 Public Record entries have at least one real attachment; manifest and content validation enforce integrity; ProofEntryScreen renders attachments with label, filename, SHA-256 copy, and download link. Identity sameAs is fixed for production (env example, JSON-LD omits when absent). Verify pipeline order unchanged; all gates green.

## Changed and New Files

### New tools

- **tools/proof/add-proof-attachment.ts** — CLI: `--file`, `--recordId`, `--labelKey`, optional `--output-filename`, `--allow-duplicate-sha`. Computes SHA-256, copies into `apps/web/public/proof/files/`, appends/updates `manifest.json` with id, filename, sha256, labelKey, recordIds, kind. Enforces deterministic filenames (lowercase, hyphenated, no spaces).
- **tools/verify-proof-attachments.ts** — Validates: every manifest item has a referencing Public Record entry (no orphans); every attachment labelKey used in entries exists in `publicRecord.attachments.labels.<key>` for en, uk, es, he. Exported `runVerifyProofAttachments()`; invoked from content-validate. File existence and SHA are already enforced by `getProofManifest()` (RELEASE_READY when set).

### Modified

- **libs/content/src/lib/proof-files.ts** — Manifest item schema: added optional `labelKey`, `recordIds`; `kind` optional for backward compatibility.
- **libs/content/src/lib/schemas.ts** — No change (attachment schema already had id, filename, sha256, labelKey).
- **tools/validate-content.ts** — Import `runVerifyProofAttachments`; after existing proof manifest vs entry checks, call `runVerifyProofAttachments()` inside the same `if (proofManifest)` block. No new verify stage; no reorder.
- **libs/screens/src/lib/ProofEntryScreen.tsx** — Attachment link: added `download={att.filename}` and `aria-label={t('attachments.download')}: ${att.filename}` for download affordance and WCAG.
- **libs/seo/src/lib/seo.ts** — `getPersonJsonLd`: build object without `sameAs` when `getIdentitySameAs()` returns empty; only add `sameAs` when array length > 0 so JSON-LD omits it when absent.
- **libs/i18n/src/messages/{en,uk,es,he}/publicRecord.json** — `attachments.download` and `attachments.labels.{scope,artifact,summary,evidence,disclosure,adoption,graph,bundle}` in all four locales.
- **content/public-record/*.mdx** (8 files) — Each has an `attachments` array with one item: id, filename, sha256, labelKey.

### New content and config

- **apps/web/public/proof/manifest.json** — Populated with 8 items (id, filename, sha256, labelKey, recordIds, kind). Source of truth for attachment index.
- **apps/web/public/proof/files/*.txt** — Eight starter primary artifacts (TXT), one per record; defensible, quiet authority, no placeholders.
- **docs/proof/attachments-standard.md** — Accepted file types, redaction rules, provenance metadata, naming and integrity rules, reviewer checklist.
- **.env.example** — Documents `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_IDENTITY_SAME_AS` (e.g. LinkedIn), `RELEASE_READY`.

## Integrity and PGF Enforcement

- **Integrity**: Manifest is the source of truth. `getProofManifest()` (content lib) validates schema, ensures each manifest file exists and SHA-256 matches (strict when RELEASE_READY=1). `validate-content` ensures entry attachment ids exist in manifest and filename/sha256 match; `runVerifyProofAttachments` ensures no orphan manifest items and all used labelKeys exist in all locales.
- **PGF**: Starter artifacts are short, factual, no hype. Attachments standard and reviewer checklist require PGF compliance and no duplication. ProofEntryScreen uses existing focus ring and semantic structure; download link is keyboard and screen-reader friendly.

## Verify Pipeline

- Proof attachment verification runs only inside existing **content-validate** (no new target, no stage reorder). content-validate → governance → i18n → pgf → intelligence → content-os → sitemap → seo → test → build → restore-generated-typings → a11y unchanged.
- **pnpm nx run web:verify --verbose** passes with all gates green.

## Identity sameAs

- **.env.example** documents `NEXT_PUBLIC_IDENTITY_SAME_AS` with example (e.g. LinkedIn). Production can set one or more comma-separated URLs.
- **getPersonJsonLd** omits `sameAs` from the JSON-LD object when the resolved array is empty, so search engines do not receive an empty sameAs. Local builds and a11y runner remain unchanged (empty env still warns; a11y injects placeholder when needed).

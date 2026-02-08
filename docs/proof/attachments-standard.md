# Proof attachments standard

This document defines the canonical format, integrity rules, and review process for proof attachments used by the Public Record subsystem.

## Accepted file types

- **PDF** strongly preferred for reports, summaries, and formal artifacts.
- **PNG** allowed for screenshots or visual evidence only.
- **TXT** allowed for logs, exports, or plain-text summaries.

No other types are accepted. Use lowercase extensions in filenames.

## Redaction rules

- Remove or redact: personal data (beyond what is already public), confidential commercial terms, internal identifiers that could expose systems or people.
- Mark redactions inside the artifact: use a consistent note (e.g. “[Redacted: reason]”) so readers know what was removed and why.
- Do not add redaction notes in site copy only; the artifact itself must carry the note where content was removed.
- When in doubt, prefer a short redaction note over leaving sensitive material in.

## Provenance metadata

Represent source consistently in Public Record frontmatter:

- **sourceName**: Name of the source (e.g. “Engagement summary”, “Institutional security page”).
- **sourceType**: One of `internal`, `external`, `public`, `media`.
- **sourceUrl**: Optional; valid URL when the source is linkable.

Proof manifest items do not duplicate provenance; the Public Record entry holds the source. Attachment metadata in the manifest is limited to `id`, `filename`, `sha256`, `labelKey`, and optional `recordIds`.

## Naming rules

- **Stable filenames**: lowercase, hyphenated, no spaces. Use only `a-z`, `0-9`, and hyphen. Extension in lowercase (e.g. `.pdf`, `.txt`, `.png`).
- **Deterministic**: the same logical artifact should keep the same filename across updates when possible; when replacing, update the manifest and entry to the new filename and SHA-256.
- **No placeholders**: filenames must refer to real files. No “sample”, “template”, or “coming-soon” in the name.

## Integrity rules

- **SHA-256 required**: every attachment has a 64-character lowercase hex checksum. The manifest is the source of truth; entry frontmatter must match.
- **Manifest**: `apps/web/public/proof/manifest.json` lists every attachment with `id`, `filename`, `sha256`, and optionally `labelKey`, `recordIds`, `kind`.
- **Files on disk**: every manifest entry must have a file at `apps/web/public/proof/files/<filename>`. When `RELEASE_READY=1`, missing files or checksum mismatch fail content validation.
- **Entry–manifest consistency**: each Public Record entry’s `attachments` array must reference only manifest ids; `filename` and `sha256` must match the manifest.

## Reviewer checklist

Before publishing or merging proof attachments:

1. **PGF compliance**: no hype, no exclamation points, short paragraphs, quiet authority. Apply to artifact content and any site copy that references it.
2. **No duplication**: do not duplicate the same claim or evidence across multiple attachments without clear differentiation (e.g. summary vs full report).
3. **Authority calibration**: claims in artifacts must be defensible and consistent with the Public Record entry and linked claims.
4. **No legal exposure**: redact or omit anything that could create legal or confidentiality risk; document redactions inside the artifact.
5. **Label keys**: every attachment `labelKey` must exist under `publicRecord.attachments.labels.<key>` in all locales (en, uk, es, he).
6. **Binding**: every manifest item must be referenced by at least one Public Record entry (no orphan manifest entries).

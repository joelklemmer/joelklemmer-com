# Playbook — Add proof entry

Add a public record (proof) entry: one MDX file, optional claim linkage, optional attachments. Proof entries live in `content/public-record/` (or `content/proof/`; sitemap-data resolves both). Follow every step.

## 1. Create the MDX file

- **Path:** `content/public-record/<slug>.mdx` (preferred) or `content/proof/<slug>.mdx`. Use a URL-safe slug; it becomes the route segment for `/publicrecord/<slug>` and `/proof/<slug>`.
- **Frontmatter:** Must satisfy `publicRecordFrontmatterSchema` in `libs/content/src/lib/schemas.ts`.

Required fields:

- `title` (string)
- `artifactType` (string, e.g. "Recovery plan summary")
- `source` (string or `{ sourceType: 'internal'|'external'|'public'|'media', sourceName: string, sourceUrl?: string }`)
- `date` (string)
- `verificationNotes` (string)
- `claimSupported` (string; human-readable label for the claim this supports)
- `locale` (one of en, uk, es, he)
- `slug` (string; must match filename stem or be consistent)

Optional: `id` (stable id; if omitted, slug is used as record id), `canonical`, `verification` (`{ method, confidence, verifiedDate? }`), `attachments`.

**Attachments:** If present, each entry must have `id`, `filename`, `sha256` (64 hex chars), `labelKey`. Attachment ids must be unique within the entry. `labelKey` must exist in `libs/i18n/src/messages/<locale>/publicRecord.json` under `attachments.labels.<id>` (or the key path implied by labelKey).

**Commands:** None (file creation).

**Failure:** content-validate fails with frontmatter or attachment error. **Corrective action:** Fix field types and values per schema; ensure sha256 is 64 hex; add attachment labelKey to publicRecord.json for all locales.

---

## 2. Link to claim (optional)

If this entry supports a claim in the brief:

- **libs/content/src/lib/claims.ts:** Add a new entry to `claimRegistry` or add this record’s id to an existing entry’s `recordIds`. Stable id = frontmatter `id` if set, else `slug` (from `getPublicRecordId`).
- **libs/i18n:** Ensure every claim has `labelKey` and `summaryKey` in brief.json for all locales, and `claims.categories.<category>` exists. Add those keys if you added a new claim.

**Commands:**

```bash
nx run web:content-validate
nx run web:i18n-validate
nx run web:pgf-validate
```

**Expected output:** `Content validation passed.` / `i18n validation passed.` / `PGF validation passed.`

**Failure:** recordIds reference missing record; or missing brief key. **Corrective action:** Create the proof entry first (step 1); then add recordIds. Add missing brief keys for the new claim in all locales.

---

## 3. Case study proofRefs (if applicable)

If a case study should reference this record, add its slug (or stable id if proofRefs use id) to the case study’s `proofRefs` array in frontmatter. content-validate ensures every proofRef exists in public-record (or proof) dir.

**Commands:**

```bash
nx run web:content-validate
```

**Expected output:** `Content validation passed.`

**Failure:** proofRefs reference missing record. **Corrective action:** Add the proof entry or fix the proofRef string to match an existing slug/id.

---

## 4. Attachment files and artifacts

If you declared attachments, ensure:

- The file exists at the path referenced by the app (e.g. under `apps/web/public/artifacts/` or the path used by ProofEntryScreen for attachment links).
- The sha256 in frontmatter matches the file (content-validate may check artifact integrity; see libs/content artifacts manifest).
- For each attachment `labelKey`, add the label in `libs/i18n/src/messages/<locale>/publicRecord.json` (e.g. under `attachments.labels.summary` or the key you use).

**Commands:**

```bash
nx run web:content-validate
```

**Failure:** Artifact missing or checksum mismatch. **Corrective action:** Add file and/or fix sha256; update artifacts manifest if the repo uses one.

---

## Verify targets to run

```bash
nx run web:content-validate
nx run web:i18n-validate
nx run web:pgf-validate
nx run web:sitemap-validate
nx run web:verify
```

Sitemap validator will pick up the new slug from `getPublicRecordSlugsSync()` and expect more URLs (2 per slug per locale: /publicrecord/<slug>, /proof/<slug>).

---

## Documentation updates required

- New artifact type or attachment convention: [docs/proof/attachments-standard.md](../proof/attachments-standard.md).
- New claim: Document in [docs/brief-subsystem.md](../brief-subsystem.md) or claim registry if you add a new category or semantic.

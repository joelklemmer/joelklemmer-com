# Module 05 — Proof and claims

Public record (proof) entries, claim registry, and how they connect. Use when adding proof entries or new claims.

## Commands to run

```bash
nx run web:content-validate
```

Validates public record frontmatter, attachment schema (id, filename, sha256, labelKey), claim registry recordIds, and proofRefs in case studies.

```bash
nx run web:pgf-validate
```

Validates claim registry labelKey/summaryKey uniqueness and CTA uniqueness.

```bash
nx run web:i18n-validate
```

Validates that every claim’s labelKey, summaryKey, and claims.categories.<category> exist in brief.json for all locales.

```bash
nx run web:sitemap-validate
```

Ensures public record slugs (from content/public-record or content/proof) are included in sitemap for all locales.

## Expected outputs

- **content-validate:** `Content validation passed.` Exit 0.
- **pgf-validate:** `PGF validation passed.` Exit 0.
- **i18n-validate:** `i18n validation passed.` Exit 0.
- **sitemap-validate:** `Sitemap validation passed: N URLs across 4 locales.` Exit 0.

## Failure modes and corrective actions

| Failure                                     | Cause                                                                                                                  | Corrective action                                                                                                                                                                                                                    |
| ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| content-validate: public record frontmatter | Invalid or missing required field (title, artifactType, source, date, verificationNotes, claimSupported, locale, slug) | Fix frontmatter per `publicRecordFrontmatterSchema` in libs/content/src/lib/schemas.ts. source can be string or { sourceType, sourceName, sourceUrl }. verification optional but if present method/confidence/verifiedDate required. |
| content-validate: attachments               | Duplicate attachment id, or missing id/filename/sha256/labelKey, or sha256 not 64 hex chars                            | Unify attachment ids; ensure each attachment has id, filename, sha256 (64 hex), labelKey. Add labelKey to publicRecord.json attachments.labels for each id.                                                                          |
| content-validate: claim registry recordIds  | recordIds in claims.ts point to non-existent public record (by id or slug)                                             | Add the public record MDX or change recordIds to existing getPublicRecordId() values.                                                                                                                                                |
| content-validate: proofRefs in case study   | proofRefs array references slug/id not in public-record (or proof) dir                                                 | Add the record or fix proofRefs to existing slugs.                                                                                                                                                                                   |
| i18n-validate: brief claim keys             | New claim added but brief.json missing labelKey/summaryKey or claims.categories.<category>                             | Add keys to all locales’ brief.json.                                                                                                                                                                                                 |
| pgf-validate: duplicate claim keys          | New claim reuses existing labelKey or summaryKey                                                                       | Use unique labelKey and summaryKey per claim.                                                                                                                                                                                        |

## Verify targets to run

After adding or changing proof entries or claims:

1. `nx run web:content-validate`
2. `nx run web:pgf-validate`
3. `nx run web:i18n-validate`
4. `nx run web:sitemap-validate`
5. `nx run web:verify`

## Documentation updates required

- New claim category: Add to CLAIM_CATEGORIES in `libs/content/src/lib/claims.ts` and add `claims.categories.<id>` in all locales’ brief.json. Document in [docs/brief-subsystem.md](../brief-subsystem.md) or proof docs if you extend claim semantics.
- Attachment labelKey: Ensure each attachment id’s labelKey exists in `libs/i18n/src/messages/<locale>/publicRecord.json` under attachments.labels. Document attachment standard in [docs/proof/attachments-standard.md](../proof/attachments-standard.md) if you change the schema.

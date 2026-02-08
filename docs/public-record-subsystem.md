# Public Record subsystem

The Public Record is a **verification-only** evidence system. It is not narrative or marketing. Entries are artifacts with dates, sources, and verification notes, linked to indexed claims and to case studies that reference them.

## Purpose

- **Evidence only**: dates, sources, artifact type, verification notes.
- **Deterministic IDs**: stable `recordId` (frontmatter `id` or `slug`) for linking.
- **Bidirectional links**: each entry shows which claims it supports and which case studies reference it.

## What belongs in Public Record

- **Allowed**: Recovery plans, reports, summaries, official documents, engagement summaries—with clear source and date.
- **Not allowed**: Marketing copy, CTAs, “proof” hype, or narrative that is not citation-backed.

## Content location

- **Preferred**: `content/public-record/*.mdx`
- **Fallback**: `content/proof/*.mdx` (if `public-record` does not exist)

## Required frontmatter fields

| Field               | Required | Description                                                                         |
| ------------------- | -------- | ----------------------------------------------------------------------------------- |
| `title`             | Yes      | Short title of the artifact.                                                        |
| `artifactType`      | Yes      | Type label (e.g. "Recovery plan summary", "Report").                                |
| `source`            | Yes      | URL or citation string.                                                             |
| `date`              | Yes      | ISO or `yyyy-mm-dd`.                                                                |
| `verificationNotes` | Yes      | Short note on how it was verified.                                                  |
| `claimSupported`    | Yes      | Human-readable label of the claim (linkage is via claim registry).                  |
| `locale`            | Yes      | One of: `en`, `uk`, `es`, `he`.                                                     |
| `slug`              | Yes      | URL segment (unique per entry).                                                     |
| `id`                | No       | Stable record ID; if omitted, `slug` is used. Must be unique across the collection. |
| `canonical`         | No       | Override canonical URL if needed.                                                   |

### Optional evidence metadata (frontmatter)

When present, these blocks must validate strictly. Omit them for backward compatibility.

**`verification`** (object, optional):

| Field          | Required | Description                                                                                 |
| -------------- | -------- | ------------------------------------------------------------------------------------------- |
| `method`       | Yes      | Enum: `observation` \| `correspondence` \| `deliverable` \| `policy` \| `audit` \| `record` |
| `confidence`   | Yes      | Enum: `low` \| `medium` \| `high`                                                           |
| `verifiedDate` | No       | ISO date (YYYY-MM-DD); must be ≤ today.                                                     |

**`source`** (when an object instead of a string): can be used in addition to or instead of the legacy `source` string. If provided as object:

| Field        | Required | Description                                           |
| ------------ | -------- | ----------------------------------------------------- |
| `sourceType` | Yes      | Enum: `internal` \| `external` \| `public` \| `media` |
| `sourceName` | Yes      | Name of the source.                                   |
| `sourceUrl`  | No       | Valid URL.                                            |

**`attachments`** (array, optional): governed by `apps/web/public/proof/manifest.json`. Each item:

| Field      | Required | Description                                                                         |
| ---------- | -------- | ----------------------------------------------------------------------------------- |
| `id`       | Yes      | Unique within the entry; must exist in proof manifest.                              |
| `filename` | Yes      | Must match manifest; file must live in `apps/web/public/proof/files/`.              |
| `sha256`   | Yes      | 64 hex chars; must match file contents.                                             |
| `labelKey` | Yes      | i18n key under `publicRecord.attachments.labels.<key>` (must exist in all locales). |

### Example frontmatter

```yaml
title: 'Recovery plan delivered within two weeks'
claimSupported: 'Delivered a recovery plan within two weeks'
artifactType: 'Recovery plan summary'
source: 'Engagement summary'
date: '2026-01-18'
verificationNotes: 'Summary reviewed by sponsor'
locale: 'en'
slug: 'recovery-plan-two-weeks'
# id: 'recovery-plan-two-weeks'  # optional; slug used if missing
```

## How IDs work

- **recordId** = `frontmatter.id ?? frontmatter.slug`. Must be **unique** across all Public Record entries.
- **Claim registry** (`libs/content/src/lib/claims.ts`): each claim has `recordIds: string[]`. Those must match existing `recordId`s.
- **Case studies**: frontmatter `proofRefs: string[]` lists record IDs (or slugs) that the case study references. Each must exist in Public Record.

Build and content validation will **fail** if:

- Duplicate `recordId` in the collection.
- A claim references a missing `recordId`.
- A case study `proofRefs` entry does not match any Public Record `recordId`.

## How to add an entry and connect it

1. Create `content/public-record/your-entry.mdx` (or under `content/proof/` if using fallback).
2. Set required frontmatter; set `slug` and optionally `id` (must be unique).
3. **Link to claims**: In `libs/content/src/lib/claims.ts`, add this entry’s `recordId` (or slug) to the appropriate claim’s `recordIds` array.
4. **Link from case studies**: In any case study MDX, add this entry’s `recordId` (or slug) to frontmatter `proofRefs`.

The entry page will then show:

- **Supports claims**: claims that list this record in `recordIds`.
- **Referenced by case studies**: case studies that list this record in `proofRefs` (up to 6).

## How to add an attachment

1. Place the file in `apps/web/public/proof/files/` (e.g. `summary.pdf`).
2. Compute SHA-256 on Windows PowerShell:

   ```powershell
   Get-FileHash -Path "apps\web\public\proof\files\summary.pdf" -Algorithm SHA256 | Select-Object -ExpandProperty Hash
   ```

   Use the **lowercase** hex string in both the manifest and the entry frontmatter.

3. Add an item to `apps/web/public/proof/manifest.json` under `items`:
   `{"id": "my-entry-summary", "filename": "summary.pdf", "sha256": "<64 hex>", "kind": "public-record"}`.
4. In the Public Record entry frontmatter, add an `attachments` array (or append to it):
   `- id: my-entry-summary`, `filename: summary.pdf`, `sha256: <same 64 hex>`, `labelKey: summary` (or another key you add to `publicRecord.attachments.labels` in all locales).
5. Add the label in all locale files: `libs/i18n/src/messages/{en,uk,es,he}/publicRecord.json` under `attachments.labels.<labelKey>` (e.g. `"summary": "Summary (PDF)"`).
6. Run `nx run web:content-validate` and `nx run web:i18n-validate`.

## RELEASE_READY behavior (proof files)

- **`RELEASE_READY=0`** (default, e.g. local dev and most CI): Missing proof files or checksum mismatch **warn** only; content validation still passes.
- **`RELEASE_READY=1`** (e.g. release build): Missing proof files or checksum mismatch **fail** content validation. Proof manifest schema and entry–manifest consistency (attachment ids, filename/sha256 match) are always validated.

## How sitemap inclusion works

- The app sitemap includes **all locales** (`en`, `uk`, `es`, `he`).
- For each locale it includes:
  - Static paths (e.g. `/brief`, `/publicrecord`, `/contact`, …).
  - Dynamic paths: `/[locale]/publicrecord/[slug]` and `/[locale]/casestudies/[slug]` for every Public Record and case study slug.
- Slugs come from the content loaders. If content is missing for a locale, the route may still be included; canonical tags point to the canonical locale (usually `en`) when set.

Sitemap integrity is checked at build time by `nx run web:sitemap-validate`.

## Quality gates

Run these to validate content, i18n, sitemap, SEO, and full pipeline:

- `nx run web:content-validate` — frontmatter, proofRefs, claim registry, artifacts, media, proof manifest and attachment consistency.
- `nx run web:i18n-validate` — translation keys including `publicRecord` namespace.
- `nx run web:sitemap-validate` — dynamic URLs and locale coverage.
- `nx run web:seo-validate` — canonical and hreflang for core routes.
- `nx run web:verify` — lint, content-validate, i18n-validate, sitemap-validate, seo-validate, test, build, a11y.

See [Quality gates](quality-gates.md) for details.

## Artifact and media governance

- **Artifacts**: `apps/web/public/artifacts/manifest.json` lists artifacts; each has `id`, `title`, `filename`, `version`, `date`, `sha256`, `required`.
- **Production**: Missing **required** artifacts or checksum mismatch **fails** the build. Optional artifacts only **warn** in dev.
- **Media**: `apps/web/public/media/manifest.json`; image assets must have `altText` in production.
- To compute SHA-256 (e.g. for new artifacts) on Windows PowerShell:

  ```powershell
  Get-FileHash -Path "apps\web\public\artifacts\your-file.pdf" -Algorithm SHA256 | Select-Object -ExpandProperty Hash
  ```

  Use the lowercase hex string in the manifest.

- **Proof attachments**: `apps/web/public/proof/manifest.json` lists proof files; each item has `id`, `filename`, `sha256`, `kind: "public-record"`. Files live in `apps/web/public/proof/files/`. See [RELEASE_READY behavior](#release_ready-behavior-proof-files) and [How to add an attachment](#how-to-add-an-attachment).

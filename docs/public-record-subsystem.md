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

## How sitemap inclusion works

- The app sitemap includes **all locales** (`en`, `uk`, `es`, `he`).
- For each locale it includes:
  - Static paths (e.g. `/brief`, `/publicrecord`, `/contact`, …).
  - Dynamic paths: `/[locale]/publicrecord/[slug]` and `/[locale]/casestudies/[slug]` for every Public Record and case study slug.
- Slugs come from the content loaders. If content is missing for a locale, the route may still be included; canonical tags point to the canonical locale (usually `en`) when set.

Sitemap integrity is checked at build time by `nx run web:sitemap-validate`.

## Quality gates

Run these to validate content, i18n, sitemap, SEO, and full pipeline:

- `nx run web:content-validate` — frontmatter, proofRefs, claim registry, artifacts, media.
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

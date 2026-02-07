# Case Studies subsystem

Case studies function as **work products** in the authority-verification ecosystem: institutional evidence with context, constraints, actions, outcomes, and mandatory links to Public Record. They are not portfolio or marketing content.

## Purpose

- **Institutional evidence**: context, constraints, actions, outcomes; no hype; short paragraphs.
- **Tight coupling**: every case study must reference at least one Public Record entry (`proofRefs`); optional link to claims (`claimRefs`) with “Supports claims” links to `/brief#claim-<id>`.
- **Public Record relationship**: Public Record entry pages show “Referenced by case studies”; case study entry pages show “Verification” links to those records.

## Content location

- `content/case-studies/*.mdx`

## Governed frontmatter schema

Defined in `libs/content/src/lib/schemas.ts` as `caseStudyFrontmatterSchema`.

### Required

| Field         | Type     | Description                                                                                       |
| ------------- | -------- | ------------------------------------------------------------------------------------------------- |
| `title`       | string   | Short title.                                                                                      |
| `date`        | string   | ISO date `YYYY-MM-DD`.                                                                            |
| `locale`      | string   | One of supported locales; default `en`.                                                           |
| `slug`        | string   | URL segment (unique per entry).                                                                   |
| `summary`     | string   | 1–2 sentences; no marketing adjectives.                                                           |
| `context`     | string   | Short paragraph describing context.                                                               |
| `constraints` | string[] | At least one item.                                                                                |
| `actions`     | string[] | At least one item.                                                                                |
| `outcomes`    | string[] | At least one item.                                                                                |
| `proofRefs`   | string[] | At least one; each must match a Public Record `recordId` (from `getPublicRecordId(frontmatter)`). |

### Optional

| Field       | Type     | Description                                                                      |
| ----------- | -------- | -------------------------------------------------------------------------------- |
| `id`        | string   | Stable ID; if omitted, `slug` is used. Must be unique.                           |
| `claimRefs` | string[] | Each must match a claim ID in `libs/content/src/lib/claims.ts` (claim registry). |
| `tags`      | string[] | Max 6.                                                                           |
| `featured`  | boolean  | For ordering/highlighting.                                                       |
| `order`     | number   | Sort order.                                                                      |
| `canonical` | string   | Override canonical URL if needed.                                                |

### Stable case study ID

- **caseStudyId** = `frontmatter.id ?? frontmatter.slug`. Must be **unique** across all case studies.
- Helper: `getCaseStudyId(frontmatter)` in `libs/content/src/lib/schemas.ts`.

## Linking rules

- **proofRefs**: Every value must equal the `recordId` of an existing Public Record entry (`getPublicRecordId(recordFrontmatter)`). Validated by `web:content-validate`.
- **claimRefs**: Every value must equal the `id` of an entry in the claim registry (`libs/content/src/lib/claims.ts`). Validated by `web:content-validate`.
- Case study entry page renders:
  - **Verification**: `LinkListSection` to Public Record pages (resolved from `proofRefs`).
  - **Supports claims**: `LinkListSection` to `/[locale]/brief#claim-<id>` for each `claimRef` (labels from claim registry).

## Loaders and query helpers

In `libs/content/src/lib/content.ts`:

- `getCaseStudyEntries()` – all raw entries.
- `getCaseStudyList(locale)` – list for a locale, sorted by date desc.
- `getCaseStudyEntry(locale, slug)` – single entry by slug.
- `getCaseStudyByIdOrSlug(locale, idOrSlug)` – by stable id or slug.
- `getCaseStudySlugs()`, `getAllCaseStudyIds()` – for sitemap and validation.
- `getCaseStudiesByRecordId(recordId)` – case studies that reference a Public Record (e.g. for “Referenced by case studies” on Public Record page).
- `getCaseStudiesByClaimId(claimId)` – case studies that reference a claim (optional use on Brief).

Public Record resolution uses `getPublicRecordId(frontmatter)` consistently.

## How to add a case study

1. Create `content/case-studies/your-slug.mdx`.
2. Set required frontmatter: `title`, `date` (YYYY-MM-DD), `locale`, `slug`, `summary`, `context` (string), `constraints`, `actions`, `outcomes`, `proofRefs` (at least one existing Public Record `recordId`).
3. Optionally set `claimRefs` to claim registry IDs, `tags` (max 6), `id` (if different from slug).
4. Optionally add an MDX body; it is rendered as “Narrative notes” below the structured sections.
5. Run `pnpm nx run web:content-validate` to ensure proofRefs and claimRefs are valid and case study IDs are unique.

## Validation

- **Content**: `pnpm nx run web:content-validate`
  - Validates every case study file against `caseStudyFrontmatterSchema`.
  - Enforces unique `caseStudyId`.
  - Enforces each `proofRef` exists in Public Record IDs.
  - Enforces each `claimRef` exists in claim registry IDs.
  - Fails hard on any violation (authority integrity).
- **i18n**: `pnpm nx run web:i18n-validate` – validates any `labelKey` and UI keys used by case study screens.
- **Sitemap**: `pnpm nx run web:sitemap-validate` – case study URLs included for all locales.
- **SEO**: `pnpm nx run web:seo-validate`.

Full gate: `pnpm nx run web:verify --verbose`.

## Style rules

- **Quiet, proof-forward**: No hype, no exclamation points; short paragraphs.
- **Structured first**: Context, constraints, actions, and outcomes are the primary evidence; narrative body is optional.
- **Verification required**: Every case study must have at least one `proofRef` to Public Record.

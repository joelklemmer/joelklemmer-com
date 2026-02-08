# Executive Brief subsystem

## Purpose and evaluator intent

The `/brief` (Executive Brief) page is the gravity hub for evaluator review. It gives structured access to:

- Identity and scope (who and what is in scope)
- A short "read path" so evaluators can reach Claims, Case Studies, and Public Record in under 30 seconds
- Indexed claims backed by Public Record artifacts
- Selected outcomes (only what is provable)
- Highlighted case studies and public record entries
- The Executive Brief PDF artifact (manifest-backed)
- A single contact pathway

No marketing, testimonials, or hype. All copy is restrained and evidence-forward.

## Section list and what belongs in each

The `/brief` page is built from these sections in order:

1. **Identity & Scope** – 2–4 dense sentences: scope (executive evaluation, institutional review, policy credibility), method (evidence-led briefing), and verification (public record linked to claims). No exclamation; no sales language.

2. **Evaluator Read Path** – A compact block: "If you are evaluating for credibility or verification, use these routes." Three links: See Claims Index, See Case Studies, See Public Record. Keeps evaluators on a 30-second path.

3. **Claims Index** – Rendered **only** from the claims registry. Each claim shows: label, one-line summary, and links to supporting Public Record artifacts. Default view shows the "featured" set (up to 9); if the registry has more claims, the "All claims" expander note can be shown.

4. **Selected Outcomes** – Only provable outcomes. If something is unprovable, omit it or qualify it. Short list from i18n; no fluff.

5. **Highlighted Case Studies** – Pulled from content (case-studies), max 3, with links to each case study page.

6. **Public Record Highlights** – Pulled from content (proof/public-record), 6–10 entries max, with links to each public record entry.

7. **Artifacts** – Executive Brief PDF from the artifacts manifest. Displays: title, version, date, download link. If the artifact is missing: in dev, show "Artifact not published yet"; in production, the build fails when the artifact is required in the manifest.

8. **Contact pathway** – Single restrained link to the contact page. No CTA styling.

All text is localized via next-intl (brief namespace). No hardcoded strings.

## How to add a claim (registry + recordIds)

Claims live in a **single registry** in `libs/content/src/lib/claims.ts`.

### Category enum (governance)

Claim categories are a **constrained enum** (max 6), enforced at build time. Every claim must have a `category` from this set. Labels are evaluator-grade, non-marketing rubric language.

| Category ID             | Purpose               |
| ----------------------- | --------------------- |
| `operational_delivery`  | Operational delivery  |
| `risk_recovery`         | Risk recovery         |
| `stakeholder_alignment` | Stakeholder alignment |
| `program_governance`    | Program governance    |
| `evidence_verification` | Evidence verification |
| `delivery_capability`   | Delivery capability   |

i18n key for the label: `claims.categories.<category>` (e.g. `claims.categories.operational_delivery`). All locales must define every category in use.

### lastVerified (derived)

**Last verified** is **not** stored in the registry. It is derived at runtime as the **maximum `date`** among the Public Record entries linked to the claim (`recordIds`). The brief UI displays this as “Last verified”. No manual date is allowed; content-validate does not enforce a lastVerified field on claims.

### Registry entry shape

Each entry has:

- `id` – unique string (e.g. `recovery-plan-speed`)
- `labelKey` – next-intl key for the claim label (brief namespace, e.g. `claims.items.recoveryPlan.label`)
- `summaryKey` – next-intl key for the one-line summary (brief namespace, e.g. `claims.items.recoveryPlan.summary`)
- `recordIds` – array of public record entry IDs or slugs that support this claim (must exist in content)
- `category` – **required**; one of the category enum values above (e.g. `operational_delivery`)
- `featured` – optional; if not `false`, the claim is in the default "top set" on the Brief (max 9 featured)
- `order` – optional number for sort order

**Example claim registry entry:**

```ts
{
  id: 'recovery-plan-speed',
  labelKey: 'claims.items.recoveryPlan.label',
  summaryKey: 'claims.items.recoveryPlan.summary',
  recordIds: ['recovery-plan-two-weeks'],
  category: 'operational_delivery',
  confidenceTier: 'high',
  featured: true,
  order: 0,
}
```

**Rules (enforced at build / content-validate):**

- Every claim must have a `category` from the enum (max 6 categories total in code).
- Every claim must have at least one `recordId`.
- Every `recordId` must match an existing public record entry (by `id` or `slug` in frontmatter).
- Total claims ≤ 12; featured ≤ 9 (soft warning in dev, hard fail in production build).
- `labelKey`, `summaryKey`, and `claims.categories.<category>` must exist in **all** locales (i18n-validate).

**Steps to add a claim:**

1. Add a public record entry (e.g. in `content/proof/*.mdx` or `content/public-record/*.mdx`) with a stable `slug` and optionally `id` in frontmatter.
2. In `libs/content/src/lib/claims.ts`, add an entry to `claimRegistry` with `id`, `labelKey`, `summaryKey`, `recordIds`, `category` (from the enum), and optionally `featured` and `order`.
3. In every locale’s `libs/i18n/src/messages/<locale>/brief.json`, add the corresponding keys for `labelKey`, `summaryKey`, and `claims.categories.<category>` (if that category is not yet present).
4. Run `nx run web:content-validate` and `nx run web:i18n-validate` to confirm.

Public record entry pages show a "Supports Claims" section that lists any claims referencing that entry, with links to `/brief#claim-<id>`.

## How to publish or replace the Executive Brief PDF (manifest + file)

The Executive Brief PDF is **manifest-backed**. The app does not hardcode the file; it reads from `apps/web/public/artifacts/manifest.json`.

**Required artifact id:** `executive-brief-pdf`.

**Manifest entry shape:** Each item in `manifest.json` has at least: `id`, `title`, `filename`, `version`, `date`, `sha256`, `required`. For the brief PDF:

- `id`: `"executive-brief-pdf"`
- `filename`: actual file name (e.g. `executive-brief.pdf`)
- `sha256`: checksum of the file (build fails if the file on disk does not match in production)

**To publish or replace the PDF:**

1. Place or replace the PDF file in `apps/web/public/artifacts/` (e.g. `executive-brief.pdf`).
2. Compute its SHA-256 checksum (e.g. `sha256sum executive-brief.pdf` or equivalent).
3. In `apps/web/public/artifacts/manifest.json`, ensure there is an item with `id: "executive-brief-pdf"` and update `filename`, `version`, `date`, and `sha256` to match the new file.
4. Run `nx run web:content-validate` (which validates the manifest and file presence/checksum). In production builds, a missing or checksum-mismatched required artifact will fail the build.

No code changes are required to swap the PDF; only the manifest and the file in `public/artifacts/` need to be updated.

# Institutional Pages Subsystem

## Purpose

Institutional pages (privacy, terms, accessibility, security) are governed policy artifacts. They are not marketing content. They follow a strict frontmatter schema, review cadence, and contact pathway requirements so they read like controlled policy and meet Fortune-10–style governance expectations.

## In scope

- `/privacy` — Privacy notice
- `/terms` — Terms of use
- `/accessibility` — Accessibility commitment and practices
- `/security` — Security posture and vulnerability disclosure

FAQ, Now, Media, Press, and Bio are not part of this subsystem unless they share schema or utilities.

## Content location

- **MDX:** `content/institutional/<id>.mdx` (e.g. `privacy.mdx`, `terms.mdx`, `accessibility.mdx`, `security.mdx`).
- **Schema and loaders:** `libs/content/src/lib/schemas.ts` (`institutionalPageFrontmatterSchema`), `libs/content/src/lib/content.ts` (`getInstitutionalPage`, `getInstitutionalPages`, `getInstitutionalPageIds`).
- **Rendering:** `libs/screens/src/lib/InstitutionalScreen.tsx` (governance header + MDX body). Route pages in `apps/web/src/app/[locale]/<page>/page.tsx` remain thin and delegate to the screen.

## Frontmatter schema

Required fields:

| Field              | Type   | Description                                                                  |
| ------------------ | ------ | ---------------------------------------------------------------------------- |
| `id`               | string | Stable id; must match filename (e.g. `privacy` for `privacy.mdx`).           |
| `titleKey`         | string | i18n key segment for title (e.g. `privacy` → `institutional.privacy.title`). |
| `descriptionKey`   | string | i18n key for meta description.                                               |
| `version`          | string | Policy version (e.g. `1.0`).                                                 |
| `effectiveDate`    | string | YYYY-MM-DD. Must be ≤ `lastReviewedDate`.                                    |
| `lastReviewedDate` | string | YYYY-MM-DD.                                                                  |
| `nextReviewDate`   | string | YYYY-MM-DD. Must be ≥ `lastReviewedDate`.                                    |
| `owner`            | string | Responsible party (e.g. name).                                               |
| `jurisdiction`     | string | Applicable jurisdiction; do not claim legal advice.                          |
| `scope`            | string | Short scope statement.                                                       |

Optional: `contactEmail`, `accessibilityContactEmail`, `securityContactEmail`, `vulnerabilityDisclosureUrl`, `changelog` (array of strings).

Validation (in `tools/validate-content.ts` and `tools/validate-governance.ts`) enforces schema and date rules. With `RELEASE_READY=1`, `nextReviewDate` may not be in the past.

## Review cadence

- **Recommendation:** At least annual review; after material changes, update version and dates.
- Update `lastReviewedDate` when the page is substantively reviewed, and set `nextReviewDate` to the next planned review.
- Use `changelog` in frontmatter for a short history of material changes if desired.

## Versioning and changelog

- Bump `version` when making material changes (e.g. 1.0 → 1.1).
- Set `effectiveDate` to the date the new version takes effect.
- After review, set `lastReviewedDate` and `nextReviewDate` accordingly.
- Optional: add an entry to `changelog` (e.g. `"1.1: Clarified cookie usage"`).

## Translation and canonical language

- **i18n:** Titles, descriptions, and governance labels (Version, Effective date, etc.) are in the `institutional` namespace for all locales (`en`, `uk`, `es`, `he`). See `libs/i18n/src/messages/<locale>/institutional.json`.
- **MDX body:** Currently canonical English only. No per-locale MDX files for institutional pages. Fallback: when the locale is not the default, a notice is shown and the content is displayed in the default language. Do not claim full localization of policy text unless MDX is actually localized.

## Quality gates and commands

- **Content:** `pnpm nx run web:content-validate` — Validates all MDX frontmatter (including institutional) and enforces id/filename match and date rules.
- **Governance:** `pnpm nx run web:governance-validate` — Validates institutional frontmatter and that each body references a contact pathway (e.g. `/contact` or "Contact page").
- **i18n:** `pnpm nx run web:i18n-validate` — Ensures `institutional` namespace exists and is complete in all locales.
- **Sitemap:** `pnpm nx run web:sitemap-validate` — Confirms institutional routes are included per locale.
- **SEO:** `pnpm nx run web:seo-validate` — Confirms canonical and hreflang for institutional routes.
- **Full verify:** `pnpm nx run web:verify --verbose` — Runs format, lint, content, governance, i18n, sitemap, seo, test, build, restore-generated-typings, and a11y.

## Contact pathway

Each institutional page body must reference a contact pathway (e.g. link to `/contact` or "Contact page"). Governance validation fails if the body does not contain such a reference. Do not invent email addresses; use "Use the Contact page" or equivalent if no dedicated institutional email exists.

# Books subsystem

## Purpose and tone

The Books area is an **authority-verification surface**, not marketing. Books act as intellectual authority anchors: metadata and verification links only. No sales copy, no “buy now” CTAs, no testimonials, no “as seen on” or author-brand fluff. Tone is public-service professional; the Books page should feel like a briefing appendix.

## Content location

- **Collection**: `content/books/*.mdx`

## Frontmatter schema

Defined in `libs/content/src/lib/schemas.ts` (`bookFrontmatterSchema`). Required and optional fields:

| Field               | Required | Description                                                                          |
| ------------------- | -------- | ------------------------------------------------------------------------------------ |
| `title`             | Yes      | Book title.                                                                          |
| `publicationDate`   | Yes      | `YYYY-MM-DD`.                                                                        |
| `formats`           | Yes      | Array of: `Hardcover`, `Paperback`, `Kindle`, `Audiobook`, `eBook`, `PDF`.           |
| `language`          | Yes      | Language code (e.g. `en`).                                                           |
| `summary`           | Yes      | Short, restrained summary.                                                           |
| `proofRefs`         | Yes      | Array of Public Record IDs. **Every** ID must exist in the Public Record collection. |
| `locale`            | Yes      | One of: `en`, `uk`, `es`, `he`.                                                      |
| `slug`              | Yes      | URL segment (unique per book).                                                       |
| `id`                | No       | Stable book ID; if omitted, `slug` is used. Must be unique across books.             |
| `subtitle`          | No       | Subtitle.                                                                            |
| `author`            | No       | Default can be localized; e.g. "Joel R. Klemmer".                                    |
| `publisher`         | No       | Omit if self-published; then proofRefs must still reference verification artifacts.  |
| `isbn10` / `isbn13` | No       | ISBNs when applicable.                                                               |
| `canonical`         | No       | Override canonical URL if needed.                                                    |
| `excerptRefs`       | No       | Optional links to Writing posts for excerpts.                                        |

**Deterministic book ID**: `bookId = frontmatter.id ?? frontmatter.slug`. Must be **unique** across the collection.

## Proof binding

- **proofRefs** must reference **Public Record** entry IDs (i.e. `id` or `slug` from `content/proof/*.mdx` or `content/public-record/*.mdx`).
- Each value in `proofRefs` must match an existing Public Record `recordId` (`getPublicRecordId(entry)` = `id ?? slug`).
- Build and content validation **fail** if any `proofRef` does not exist in the Public Record.
- Do not add unverified claims (bestseller, rankings, awards, endorsements) unless supported by a Public Record artifact; prefer omitting those fields.

## Loaders and reverse mapping

In `libs/content/src/lib/content.ts`:

- `getBookEntries()` – all book entries (schema-validated).
- `getBookList(locale)` – books for locale, sorted by `publicationDate` desc.
- `getBookEntry(locale, slug)` – single book by slug.
- `getBookByIdOrSlug(locale, idOrSlug)` – by bookId or slug.
- `getBookSlugs()` – all slugs.
- `getAllBookIds()` – all stable book IDs (for validation).
- `getBooksByRecordId(recordId)` – books that reference the given Public Record ID (for “Referenced by Books” on Public Record entry pages).

## Referenced by Books

On each **Public Record** entry page (`ProofEntryScreen`), a “Referenced by Books” section lists books whose `proofRefs` include that record’s `recordId`. Labels live in `publicRecord.referencedByBooks.heading` and `publicRecord.referencedByBooks.empty` (all locales).

## Sitemap and SEO

- **Sitemap**: `apps/web/src/app/sitemap.ts` includes `/books` and `/[locale]/books/[slug]` for all locales. Slugs come from `getBookSlugs()`; sync helpers in `libs/content/src/lib/sitemap-data.ts` (`getBookSlugsSync()`) are used by `tools/validate-sitemap.ts`.
- **SEO**: Core routes in `tools/validate-seo.ts` include `/books`. Canonical and hreflang follow the same pattern as other dynamic routes.

## How to add a book

1. **Create Public Record artifacts** (if not already present) for every verification source (e.g. ISBN listing, publisher page, retailer listing). Add entries under `content/proof/*.mdx` or `content/public-record/*.mdx` with stable `slug` and optional `id`.
2. **Create** `content/books/your-book.mdx` with required frontmatter and **proofRefs** listing those Public Record IDs.
3. **Run**:
   - `nx run web:content-validate` – schema, unique bookId, proofRefs → Public Record.
   - `nx run web:i18n-validate` – books namespace and meta.books in all locales.
   - `nx run web:sitemap-validate` – book URLs in sitemap.
   - `nx run web:verify` – full pipeline.

## Quality gates

- `nx run web:content-validate` – books schema, unique bookId, every proofRef exists as Public Record ID.
- `nx run web:i18n-validate` – books namespace and meta.books; publicRecord.referencedByBooks.
- `nx run web:sitemap-validate` – book index and dynamic book URLs per locale.
- `nx run web:seo-validate` – canonical/hreflang for core routes (includes `/books`).
- `nx run web:verify` – lint, content-validate, i18n-validate, sitemap-validate, seo-validate, test, build, a11y.

See [Quality gates](quality-gates.md) for details.

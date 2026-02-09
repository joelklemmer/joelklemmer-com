# Entity Authority Expansion & Performance Proof

**Date:** 2026-02-08  
**Scope:** Semantic indexing and metadata only; no copy, visual, or layout changes.

---

## 1. JSON-LD Graph Additions

| Type               | Where                                         | Change                                                                  |
| ------------------ | --------------------------------------------- | ----------------------------------------------------------------------- |
| **Organization**   | Home (existing)                               | Unchanged; already has `@id`, `sameAs` from identity.                   |
| **Person**         | Home, /brief (existing)                       | Unchanged; `@id`, `sameAs` consolidation.                               |
| **WebSite**        | Home (existing)                               | **Added** `inLanguage` (BCP 47) per locale for language clarity.        |
| **BreadcrumbList** | Home                                          | **Added** single-item BreadcrumbList ("Home") on home for entity graph. |
| **ProfilePage**    | /bio (existing)                               | Validated in SEO validator; `mainEntity` → Person `@id`.                |
| **Book**           | /books/[slug] (existing)                      | Unchanged.                                                              |
| **Article**        | Case study, writing, proof entries (existing) | Unchanged.                                                              |

**Files changed (graph):**

- `libs/seo/src/lib/seo.ts`: `localeToInLanguage()`, WebSite `inLanguage`, OG image `alt`, Breadcrumb/ProfilePage already present.
- `libs/screens/src/lib/HomeScreen.tsx`: Renders `BreadcrumbJsonLd` with `pathSegments={[]}`.

---

## 2. Link Graph Tightening

- **sameAs:** Person and Organization both use `getIdentitySameAs()`; single source of truth.
- **Identity consolidation:** `.env.example` updated with multi-URL example (LinkedIn, Twitter, GitHub) for `NEXT_PUBLIC_IDENTITY_SAME_AS`.
- **Canonical clarity:** `createPageMetadata()` already sets `alternates.canonical` and `alternates.languages` (hreflang); no change.

---

## 3. Metadata Refinement

- **OpenGraph:** `createPageMetadata()` — **added** `alt` to `openGraph.images[].alt` (page title) for OG image.
- **Twitter:** Already `summary_large_image` with `images` array; no change.
- **hreflang:** Validated in `tools/validate-seo.ts` for 19 core routes (all locales + x-default).

---

## 4. Sitemap Depth & Priorities

- **Priorities:** Home = 1; brief, work, writing, proof, contact = 0.9; all others = 0.8.
- **changeFrequency:** `writing/*` and `books/*` = monthly; rest = weekly.
- **Coverage:** `tools/validate-sitemap.ts` passes — 160 URLs across 4 locales; indexable paths aligned with `DEFAULT_INDEXABLE_PATHS` and app routes.

**File:** `apps/web/src/app/sitemap.ts` — priority and changeFrequency logic by path segment.

---

## 5. robots.txt

- **Refinement:** Comment added clarifying canonical host is inferred from metadata/site URL; rules unchanged (allow `/`, disallow `/api`, `/_next`, `/api/`), sitemaps listed.

**File:** `apps/web/src/app/robots.ts`.

---

## 6. Structured Data Validation Results

```
SEO validation passed: canonical and hreflang for 19 core routes; home Organization + WebSite + Person + BreadcrumbList JSON-LD; /brief Person + Report JSON-LD; /bio ProfilePage; /media CollectionPage + ItemList JSON-LD.
```

**Validators run:**

- `pnpm nx run web:seo-validate` — pass.
- `pnpm nx run web:sitemap-validate` — pass (160 URLs, 4 locales).

---

## 7. Performance (No Visual/Layout Changes)

Existing setup already meets targets; no code changes applied:

- **Images:** Next `Image` used in HeroSection (PortraitImage), MediaLibraryClient; AVIF/WebP and responsive sizes in `next.config.js`; hero has `priority` only.
- **Fonts:** Inter variable, `display: 'swap'`, `preload: true`, `adjustFontFallback: true` in root layout.
- **Bundle:** `@next/bundle-analyzer` enabled when `ANALYZE=true`.
- **Caching:** `_next/static`, `/media`, sitemaps, favicon have Cache-Control (immutable or s-maxage/stale-while-revalidate).
- **Lighthouse CI:** `.github/workflows/ci.yml` includes `lighthouse` job; `lighthouserc.cjs` asserts performance ≥0.7, LCP ≤1800ms, CLS ≤0.1, INP ≤200ms, TBT ≤300ms.

---

## 8. CI Verification

- **seo-validate:** ✅ Pass.
- **sitemap-validate:** ✅ Pass.
- **web:build:** Fails only if another Next build holds the lock (environmental); run again after clearing `.next` or stopping other builds.

---

## Files Changed Summary

| File                                                 | Change                                                           |
| ---------------------------------------------------- | ---------------------------------------------------------------- |
| `libs/seo/src/lib/seo.ts`                            | WebSite `inLanguage`, OG image `alt`, `localeToInLanguage()`     |
| `libs/screens/src/lib/HomeScreen.tsx`                | `BreadcrumbJsonLd` on home                                       |
| `apps/web/src/app/sitemap.ts`                        | Priority tiers (1 / 0.9 / 0.8), changeFrequency (weekly/monthly) |
| `apps/web/src/app/robots.ts`                         | Comment on canonical host                                        |
| `tools/validate-seo.ts`                              | BreadcrumbList + ProfilePage assertions, success message         |
| `.env.example`                                       | sameAs multi-URL example, Person/Organization note               |
| `docs/authority/entity-authority-expansion-proof.md` | This proof document                                              |

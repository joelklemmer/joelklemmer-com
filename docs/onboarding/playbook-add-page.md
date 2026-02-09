# Playbook — Add page

Add a new route and its surface: either a **static/institutional page** (e.g. new legal page) or a **primary route** (in intent map, contentOS, meta). Follow every step; order matters.

## Scope

- **Static page:** New segment under `apps/web/src/app/[locale]/` (e.g. `/faq`, `/security`). Sitemap and optionally nav/footer; no contentOS intents unless you make it primary.
- **Primary page:** Same as above but also appears in page intent map, contentOS intents, and meta as a core screen (home, brief, work, books, publicrecord, contact). Requires updates to validate-content-os and possibly validate-pgf.

---

## 1. Add the route

Create the page component and optional layout.

- **Path:** `apps/web/src/app/[locale]/<segment>/page.tsx` (e.g. `apps/web/src/app/[locale]/faq/page.tsx`).
- Use existing patterns: `generateMetadata` from a screen lib or local, async page with locale. For static content from MDX, use the same pattern as `apps/web/src/app/[locale]/privacy/page.tsx` (institutional) or similar.
- If the page uses a screen from `@joelklemmer/screens`, export `generateMetadata` and `generateStaticParams` from that screen if dynamic.

**Commands:** None for this step (file creation).

**Failure:** Build or lint fails. **Corrective action:** Fix TypeScript/ESLint errors; ensure imports resolve (path aliases from tsconfig.base.json).

---

## 2. Add to sitemap and validator

Sitemap builder and sitemap validator must include the new path.

- **Files:**
  - `libs/seo/src/lib/sitemap-builder.ts` — add the path to `DEFAULT_INDEXABLE_PATHS` (e.g. `'/faq'`). Used by `apps/web/src/app/sitemap.ts`.
  - `tools/validate-sitemap.ts` — add the same path to the `indexablePaths` array (e.g. `'/faq'`). Used to compute expected sitemap entry count.

**Commands:**

```bash
nx run web:sitemap-validate
```

**Expected output:** `Sitemap validation passed: N URLs across 4 locales.` (N increases by 4 per new path.)

**Failure:** Expected count mismatch. **Corrective action:** Ensure both files have the same path; no trailing slash; path is the segment only (e.g. `/faq` not `/en/faq`).

---

## 3. Meta and optional nav/footer

- **Meta (required for primary pages; recommended for all):** Add `libs/i18n/src/messages/<locale>/meta.json` entry, e.g. `"faq": { "title": "...", "description": "..." }`. For **primary** pages this is required by content-os-validate (META_KEYS).
- **Nav/footer:** If the page should appear in nav or footer, add the label to `libs/i18n/src/messages/<locale>/nav.json` or `footer.json` (e.g. `footer.links.faq`). Ensure the key is in the schema in `tools/validate-i18n.ts` (navSchema, footerSchema) or validation will fail.

**Commands:**

```bash
nx run web:i18n-validate
```

**Expected output:** `i18n validation passed.`

**Failure:** Missing required key (e.g. meta.faq.title). **Corrective action:** Add the key to all four locales (en, es, he, uk).

---

## 4. Primary route only: intent map and contentOS

Only if this page is a **primary** route (in the Content OS intent map).

- **docs/page-intent-map.md:** Add a row to the table: Route, 10s intent, 60s intent, Primary CTA, Proof expectation, Audience. Add any new contentOS keys to the “contentOS intents” list.
- **tools/validate-content-os.ts:** Add the route to `REQUIRED_ROUTES` (e.g. `'/faq'`). Add contentOS intent keys to `CONTENT_OS_INTENT_KEYS` (e.g. `'intents.faq.tenSecond'`, `'intents.faq.sixtySecond'`). Add the page to `META_KEYS` (e.g. `'faq'`).
- **libs/i18n/src/messages/<locale>/contentOS.json:** Add `intents.faq.tenSecond` and `intents.faq.sixtySecond` for every locale.

**Commands:**

```bash
nx run web:content-os-validate
```

**Expected output:** `Content OS validation passed.`

**Failure:** Missing route in intent map or missing contentOS key. **Corrective action:** Add the route to the markdown table; add keys to CONTENT_OS_INTENT_KEYS and to all contentOS.json files.

---

## 5. PGF (primary pages with CTAs)

If the page has a primary CTA (e.g. contact pathways, mailto), ensure it’s unique or on the PGF allowlist. New page H1/lede (meta title/description) must not duplicate another core screen.

**Commands:**

```bash
nx run web:pgf-validate
```

**Expected output:** `PGF validation passed.`

**Failure:** Duplicate H1, lede, or CTA label. **Corrective action:** Differentiate copy in meta.json (and home/contact if CTA); or add repeated CTA to allowlist in validate-pgf.ts.

---

## Verify targets to run

```bash
nx run web:i18n-validate
nx run web:sitemap-validate
nx run web:content-os-validate   # always for primary; optional for static
nx run web:pgf-validate           # if primary or new CTAs
nx run web:verify
```

---

## Documentation updates required

- **New primary route:** [docs/page-intent-map.md](../page-intent-map.md) (table + contentOS list). [docs/quality-gates.md](../quality-gates.md) if you changed REQUIRED_ROUTES or META_KEYS.
- **New nav/footer entry:** No doc change if keys already in schema; if you extended nav/footer schema in validate-i18n, note in quality-gates i18n section.

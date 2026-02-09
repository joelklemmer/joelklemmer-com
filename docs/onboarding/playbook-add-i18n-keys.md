# Playbook — Add i18n keys

Add or extend message keys used by the app. Keys are in `libs/i18n/src/messages/<locale>/*.json`. Validators enforce required keys per namespace. Follow every step.

## 1. Identify namespace and schema

- **Namespace** = JSON file name (e.g. `common`, `nav`, `meta`, `brief`, `publicRecord`, `contentOS`, `contact`, `home`).
- **Required keys** are defined by Zod schemas in `tools/validate-i18n.ts`. If your key is part of a required structure (e.g. `meta.faq.title`), the schema must require it or validation will not enforce it. Optional keys can be added without schema change; required keys need a schema update.

**Adding a new key to an existing structure (optional):** Add the key to all four locale files. No validator change unless you want it required.

**Adding a required key:** Add the key to the schema in `tools/validate-i18n.ts` (e.g. extend `metaSchema` with `faq: pageSchema`), then add the key to all locale files.

---

## 2. Add key to all locales

- **Paths:** `libs/i18n/src/messages/en/<namespace>.json`, same for `es`, `he`, `uk`.
- Use the same structure in each locale (nesting and key names). Values can differ (translations).
- Default locale is `en`; content-os-validate scans default-locale for placeholder blocklist (lorem, placeholder, sample, coming soon, tbd, to be added, draft). Avoid those in en.

**Commands:**

```bash
nx run web:i18n-validate
```

**Expected output:** `i18n validation passed.`

**Failure:** Missing or empty key in one or more locales. **Corrective action:** Add the key to the reported file(s); ensure no typo in key path.

---

## 3. Claim or pathway keys (if applicable)

- **Brief claims:** If the key is a claim’s `labelKey` or `summaryKey` (from `libs/content/src/lib/claims.ts`), it must exist in every locale’s `brief.json` at that path. Validator iterates `claimRegistry` and checks `brief.<labelKey>` and `brief.<summaryKey>`, and `brief.claims.categories.<category>`.
- **Contact pathways:** If the key is used by `contactPathways` (labelKey, descriptionKey, subjectTemplateKey, ctaKey), add it to every locale’s `contact.json` and ensure `tools/validate-i18n.ts` validates it (validateContactPathwayKeys).

**Commands:**

```bash
nx run web:i18n-validate
```

**Failure:** Missing or empty brief.claims… or contact.pathways… **Corrective action:** Add the key in all locales at the path the claim or pathway expects.

---

## 4. contentOS and meta (if primary page or meta)

- **contentOS:** If you added a primary page, add `intents.<route>.tenSecond` and `intents.<route>.sixtySecond` to every locale’s `contentOS.json`. Also add the keys to `CONTENT_OS_INTENT_KEYS` in `tools/validate-content-os.ts`.
- **meta:** If you added a new core page, add `meta.<page>.title` and `meta.<page>.description` to every locale’s `meta.json`. Add the page to `META_KEYS` in `tools/validate-content-os.ts` and to the meta schema in `tools/validate-i18n.ts` if you want i18n-validate to enforce it.

**Commands:**

```bash
nx run web:i18n-validate
nx run web:content-os-validate
```

**Expected output:** `i18n validation passed.` / `Content OS validation passed.`

**Failure:** content-os fails on missing intent or meta. **Corrective action:** Add the key to contentOS.json and meta.json for all locales; update validate-content-os.ts constants.

---

## 5. PGF (if new CTA or page title/description)

If the new keys are used for primary CTA labels or page meta (H1/lede), PGF requires no duplicate H1/lede and unique primary CTAs (or on allowlist).

**Commands:**

```bash
nx run web:pgf-validate
```

**Expected output:** `PGF validation passed.`

**Failure:** Duplicate title, description, or CTA label. **Corrective action:** Differentiate copy or add CTA to allowlist in validate-pgf.ts.

---

## Verify targets to run

```bash
nx run web:i18n-validate
nx run web:content-os-validate   # if you touched contentOS or meta for primary pages
nx run web:pgf-validate         # if you added CTAs or meta
nx run web:verify
```

---

## Documentation updates required

- New required schema key: Document in [docs/quality-gates.md](../quality-gates.md) “i18n validate” section. If you added a namespace or extended meta/contentOS, note the new keys.
- contentOS intents: [docs/page-intent-map.md](../page-intent-map.md) “contentOS intents” section.

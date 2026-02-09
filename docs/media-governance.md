# Media Authority Elevation — Governance

Media governance for JoelKlemmer.com: file naming, alt doctrine, EXIF policy, responsive variants, and trust-consistent rendering. Enforced by validators and runtime (dev) warnings.

---

## 1. Asset governance

### 1.1 File naming

- **Canonical prefix:** Every media filename must include `joel-klemmer`.
- **Master pattern:** `joel-klemmer__<kind>__<descriptor>__YYYY-MM__NN.webp`
  - `kind`: `portrait` | `author` | `identity` | `speaking`
  - `descriptor`: lowercase, hyphenated (e.g. `studio-graphite`, `bookstore-stack`)
  - `YYYY-MM`: date segment; `NN`: sequence number
- **Manifest:** The manifest `file` field must reference the **master** file only (no variant suffix).

### 1.2 Responsive variants (derivatives)

Predictable suffixes only:

| Variant | Suffix         | Use case                  |
| ------- | -------------- | ------------------------- |
| Master  | (none)         | Canonical asset; manifest |
| Thumb   | `__thumb.webp` | List/grid thumbnails      |
| Card    | `__card.webp`  | Cards, previews           |
| Hero    | `__hero.webp`  | Hero sections, LCP        |

- Resolution/sizing: thumb/card/hero are produced by the ingest/derivative pipeline; tokens and components consume them.
- **Rule:** Manifest entries point to master; validators ensure required derivatives exist for Tier A visible assets (see `validate-media-derivatives.ts`).

### 1.3 EXIF policy

- **Preserve where feasible:** Copyright, creator, and date may be preserved for institutional attribution.
- **Strip for delivery:** Orientation and non-essential EXIF may be stripped in derivatives to avoid layout/weight issues.
- **Documentation:** Any bulk EXIF strip or preserve decision is documented in the ingest/derivative tooling (e.g. `tools/ingest-media.ts`).

---

## 2. Trust signaling

- **Portrait treatment:** Consistent across pages (same component: `PortraitImage`; face-safe cropping, 4:5 aspect, center-top).
- **Institutional tone:** Avoid “brand-y” visuals; imagery must read as institutional briefing room, not marketing.
- **Tiers:** Tier A (authority core) visible and indexable; Tier B indexable but not featured; Tier C excluded from manifest/sitemap. See `libs/content/src/lib/media.ts` and `docs/program/authority-platform-program.md`.

---

## 3. Accessibility — Alt text doctrine

- **Required:** Every image in the manifest and every portrait/hero used in the app must have non-empty, descriptive `alt`.
- **Content OS / i18n:** Where alt is user-facing (e.g. home hero), use a translation key (e.g. `hero.portraitAlt`) so alt is localized and single-sourced; no duplication of the same phrase in multiple places.
- **Non-duplication:** Avoid reusing the same alt string for distinctly different images; prefer one alt per distinct scene/subject.
- **Placeholders forbidden:** Alt must not be generic placeholders (e.g. "image", "photo", "picture", "placeholder", "todo"). Validator fails on these; `PortraitImage` warns in development.

---

## 4. Enforceable rules (validators)

| Validator                          | What it enforces                                                                            |
| ---------------------------------- | ------------------------------------------------------------------------------------------- |
| `validate-media-manifest.ts`       | Schema, completeness (alt, descriptor, canonical prefix), file existence                    |
| `validate-media-authority.ts`      | Tier A/B metadata, signals, thumb presence, Tier C exclusion                                |
| `validate-media-derivatives.ts`    | Tier A visible: thumb (and hero/card when in `recommendedUse`) on disk                      |
| **`validate-media-governance.ts`** | **Alt doctrine (required, no placeholder); master-only filenames; strict filename pattern** |

All run as part of `web:verify` and CI. Any failure fails the build.

---

## 5. Runtime (UI components)

- **PortraitImage** (`libs/ui`): In development, warns to the console when `alt` is missing or placeholder-like. No throw; production unchanged.
- **MediaLibraryClient:** Uses manifest `alt` for each asset; list uses thumb derivative only.

---

## 6. Asset-to-page mapping

| Page / context      | Asset source                                 | Variant / notes     |
| ------------------- | -------------------------------------------- | ------------------- |
| Home hero           | Fixed path + i18n alt key                    | `__hero.webp`       |
| Media library       | `getMediaManifest()` → visible               | Thumb in list       |
| OG images           | `/media/og/joel-klemmer__og__<slug>__*.webp` | Per-page slug       |
| Case studies / etc. | Manifest or page-specific                    | Card/hero as needed |

Home hero path is defined in `HomeScreen` and `apps/web/src/app/[locale]/page.tsx`; OG paths in `libs/seo/src/lib/seo.ts`.

---

## 7. Workflows

1. **Ingest:** Add masters under `apps/web/public/media/<kind>/` with the naming convention; run ingest/derivative tooling to generate thumb/card/hero and update manifest.
2. **Alt:** Add or update `alt` (and optional `caption`) in manifest; for UI-driven copy use i18n keys and reference in screens.
3. **Verify:** Run `nx run web:verify` (includes all media validators) before merge.
4. **Prune:** Tier C assets are excluded from manifest/sitemap; use `tools/prune-media-tier-c.ts` and related tooling for lifecycle.

---

## 8. References

- Manifest schema and helpers: `libs/content/src/lib/media.ts`
- Governance constants and validators: `MEDIA_GOVERNANCE_*`, `validateMediaGovernanceMasterFilename`, `validateMediaGovernanceAlt` in same file
- Program and verify pipeline: `docs/program/authority-platform-program.md`, `apps/web/project.json` (verify target)
- Checklist (short form): `docs/media-publishing-checklist.md`

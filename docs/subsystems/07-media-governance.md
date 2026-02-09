# Media Governance — Subsystem Doctrine

**Authority:** File naming, alt doctrine, EXIF policy, responsive variants, and trust-consistent rendering. Enforced by validators and runtime (dev) warnings.

**Scope:** Media manifest, Tier A/B/C, derivatives (thumb, card, hero), PortraitImage and MediaLibraryClient, OG images, and all validators (manifest, authority, derivatives, governance).

---

## 1. Engineering goals

- **Asset governance:** Every media filename includes canonical prefix `joel-klemmer`. Master pattern: `joel-klemmer__<kind>__<descriptor>__YYYY-MM__NN.webp`. Manifest `file` field references master only; derivatives use predictable suffixes (**thumb.webp, **card.webp, \_\_hero.webp).
- **Trust signaling:** Portrait treatment consistent (PortraitImage; face-safe cropping, 4:5, center-top). Institutional tone; no “brand-y” visuals. Tiers: A (authority core, visible and indexable), B (indexable, not featured), C (excluded from manifest/sitemap).
- **Accessibility:** Every image in manifest and every portrait/hero in the app has non-empty, descriptive alt. No placeholders (“image”, “photo”, “picture”, “placeholder”, “todo”). Alt localized via i18n where user-facing; one alt per distinct scene/subject.
- **Enforceable rules:** Validators run in web:verify and CI. No bypass; failures fail the build.

---

## 2. Observable runtime behaviors

- **Manifest:** Schema and completeness (alt, descriptor, canonical prefix); file existence. validate-media-manifest enforces.
- **Authority:** Tier A/B metadata, signals, thumb presence; Tier C exclusion. validate-media-authority enforces.
- **Derivatives:** Tier A visible assets have required derivatives (thumb; hero/card when in recommendedUse) on disk. validate-media-derivatives enforces.
- **Governance:** Alt required and non-placeholder; master-only filenames; strict filename pattern. validate-media-governance enforces.
- **Runtime UI:** PortraitImage warns in development when alt missing or placeholder-like; production unchanged. MediaLibraryClient uses manifest alt and thumb in list.
- **Asset-to-page:** Home hero (fixed path + i18n alt, \_\_hero.webp); Media library (getMediaManifest() → visible, thumb in list); OG (per-page slug pattern); case studies/books as needed (card/hero).

---

## 3. Metrics of success

| Metric          | Target                                                      | How measured                   |
| --------------- | ----------------------------------------------------------- | ------------------------------ |
| Manifest schema | Valid; complete alt, descriptor, prefix; files exist        | validate-media-manifest        |
| Tier A/B/C      | Correct metadata and visibility; Tier C excluded            | validate-media-authority       |
| Derivatives     | Tier A visible have thumb (and hero/card when required)     | validate-media-derivatives     |
| Alt doctrine    | Required, no placeholder; master-only names; strict pattern | validate-media-governance      |
| Dev warnings    | PortraitImage warns on missing/placeholder alt              | Dev console (no throw in prod) |
| Verify pipeline | All media validators pass in web:verify                     | CI and nx run web:verify       |

---

## 4. Extension rules

- **New asset:** Add master under apps/web/public/media/<kind>/ with naming convention; run ingest/derivative tooling to generate thumb/card/hero and update manifest. Add or update alt (and optional caption) in manifest; use i18n key for UI-driven copy.
- **New kind or variant:** Extend manifest schema and governance constants if needed; update validators and docs. Keep derivative suffixes predictable (no ad-hoc suffixes).
- **New page using media:** Use PortraitImage or MediaLibraryClient; supply alt from manifest or i18n. Do not load master in list views (thumb only).
- **Tier change:** Update manifest and run authority/derivatives validators; use prune-media-tier-c tooling for Tier C lifecycle.

---

## 5. Anti-degradation constraints

- **Do not** ship images without non-empty, descriptive alt; do not use placeholder strings (image, photo, picture, placeholder, todo). Validator fails; PortraitImage warns in dev.
- **Do not** reference variant files in manifest `file` field; manifest points to master only.
- **Do not** bypass or disable media validators in verify; all four (manifest, authority, derivatives, governance) must pass.
- **Do not** add Tier A visible assets without required derivatives (at least thumb; hero/card when in recommendedUse).
- **Do not** use non-canonical filenames (missing joel-klemmer prefix or violating master pattern) for manifest entries.
- **Do not** duplicate the same alt for distinctly different images; prefer one alt per distinct scene/subject. Do not duplicate the same phrase across multiple places—use i18n keys.

---

## 6. References

- [Media governance](../media-governance.md)
- [Media publishing checklist](../media-publishing-checklist.md)
- Manifest and helpers: `libs/content/src/lib/media.ts`
- Validators: validate-media-manifest, validate-media-authority, validate-media-derivatives, validate-media-governance
- Program and verify: `docs/program/authority-platform-program.md`, web:verify

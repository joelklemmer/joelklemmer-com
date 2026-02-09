# Module 06 — Tokens and media

Design tokens (libs/tokens), token validators, and media manifest/governance. Use when changing UI tokens or adding/changing media assets.

## Commands to run

```bash
nx run web:tokens-validate
```

Checks that `libs/tokens/src/lib/tokens.css` exists and contains all required token groups (color foundations, spacing, typography, authority signal, motion, media list thumb). Script: `tools/validate-tokens.ts`.

```bash
nx run web:token-drift-validate
```

Checks for literal colors and non-token Tailwind usage in components. Script: `tools/validate-token-drift.ts`.

```bash
nx run web:media-manifest-validate
nx run web:media-derivatives-validate
nx run web:media-authority-validate
nx run web:media-governance-validate
```

Manifest schema and completeness; derivatives (thumb/card/hero) for Tier A; authority tier and signals; alt doctrine and filename rules. Scripts in `tools/validate-media-*.ts`.

## Expected outputs

- **tokens-validate:** Exit 0; no stdout required by script (throws if file missing or group incomplete).
- **token-drift-validate:** Exit 0; script reports no literal colors or non-token classes in scanned paths.
- **media-manifest-validate:** Message that manifest validation passed with asset count.
- **media-derivatives-validate:** Pass message for derivative presence.
- **media-authority-validate:** Pass message for authority rules.
- **media-governance-validate:** `Media governance validation passed: N assets (alt doctrine, filenames, master-only).` Exit 0.

## Failure modes and corrective actions

| Failure                                         | Cause                                                                                                         | Corrective action                                                                                                                                                       |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| tokens-validate: file not found                 | tokens.css missing or wrong path                                                                              | Create or move file to libs/tokens/src/lib/tokens.css; script resolves path from process.cwd().                                                                         |
| tokens-validate: missing token                  | A required CSS variable from REQUIRED_TOKEN_GROUPS is absent                                                  | Add the variable to tokens.css. See tools/validate-tokens.ts for exact list (e.g. --color-bg, --space-4, --font-sans, --authority-spacing-density, --media-thumb-size). |
| token-drift-validate: literal color             | Component uses hex/rgb/hsl literal or Tailwind color not from theme                                           | Replace with token (e.g. var(--color-accent)) or Tailwind class that uses theme (e.g. text-accent).                                                                     |
| token-drift-validate: non-token Tailwind        | Tailwind class not in allowed set (e.g. arbitrary value)                                                      | Use design token or add to allowed list in validator if intentional.                                                                                                    |
| media-manifest-validate: schema or completeness | Manifest JSON missing required field (id, file, kind, alt, etc.) or file not on disk                          | Update manifest (apps/web/public/media/manifest.json or path used by getMediaManifest) and ensure file paths point to master files.                                     |
| media-derivatives-validate: missing derivative  | Tier A visible asset missing thumb (or hero/card when in recommendedUse)                                      | Run ingest/derivative pipeline to generate **thumb.webp (and **hero/\_\_card if required); or add asset to correct tier.                                                |
| media-authority-validate: tier or signal error  | Tier C in sitemap-eligible or authority rules violated                                                        | Adjust authorityTier and signals in manifest; Tier C excluded from sitemap.                                                                                             |
| media-governance-validate: alt                  | Missing or placeholder alt                                                                                    | Add non-empty, descriptive alt in manifest; no "image", "photo", "placeholder", etc.                                                                                    |
| media-governance-validate: filename             | Manifest file field uses variant suffix or doesn’t match joel-klemmer**<kind>**<descriptor>**YYYY-MM**NN.webp | Use master filename only in manifest; follow naming in [docs/media-governance.md](../media-governance.md).                                                              |

## Verify targets to run

After token or media changes:

1. `nx run web:tokens-validate` and `nx run web:token-drift-validate`
2. `nx run web:media-manifest-validate` then derivatives, authority, governance
3. `nx run web:verify`

## Documentation updates required

- New required token group: Update REQUIRED_TOKEN_GROUPS in `tools/validate-tokens.ts` and [docs/quality-gates.md](../quality-gates.md). Token semantics in [libs/tokens README](../../libs/tokens/README.md) or [docs/authority/theme-spec.md](../authority/theme-spec.md).
- Media naming or tier rules: Update [docs/media-governance.md](../media-governance.md) and [docs/media-publishing-checklist.md](../media-publishing-checklist.md). Manifest schema in `libs/content/src/lib/media.ts`.

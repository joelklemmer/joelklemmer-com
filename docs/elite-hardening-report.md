# Elite hardening report

## Architecture validation report

### New Nx targets

- `nx run web:content-validate` – validates content schemas, proofRefs, claim registry, artifacts, and media manifests. Runs `tools/validate-content.ts` via **tsx** (Node 20+ compatible; no `@swc-node/register`).
- `nx run web:i18n-validate` – validates chrome + critical meta translation completeness. Runs `tools/validate-i18n.ts` via **tsx**.
- `nx run web:a11y` – Playwright + axe-core smoke scans across required routes/locales.
- `nx run web:test` – placeholder target (prints “no tests configured”).
- `nx run web:verify` – runs in order: lint → content-validate → i18n-validate → test → build → a11y; fails on first failure. Use before PRs. See `docs/quality-gates.md` and `docs/dev-workflow.md`.

### Validation locations

- Content schemas: `libs/content/src/lib/schemas.ts`
- Content + integrity checks: `tools/validate-content.ts` (executed with `npx tsx --tsconfig tsconfig.base.json`; **tsx** is a devDependency)
- Claim registry: `libs/content/src/lib/claims.ts`
- Artifacts manifest validation: `libs/content/src/lib/artifacts.ts`
- Media manifest validation: `libs/content/src/lib/media.ts`
- i18n completeness checks: `tools/validate-i18n.ts`
- sameAs identity validation: `libs/seo/src/lib/identity.ts`
- A11y scans: `apps/web-e2e/src/a11y/a11y.spec.ts`

### CI gates

Workflow runs (see `.github/workflows/ci.yml`):

- `nx run web:lint`
- `nx run web:content-validate` (tsx runner)
- `nx run web:i18n-validate` (tsx runner)
- `nx run web:test`
- `nx run web:build`
- `nx run web:a11y`

For a single local pre-PR check, use: `nx run web:verify`. See `docs/quality-gates.md` and `docs/dev-workflow.md`.

### sameAs configuration

Set `NEXT_PUBLIC_IDENTITY_SAME_AS` to a comma-separated list of verified URLs:

```
NEXT_PUBLIC_IDENTITY_SAME_AS="https://example.com/profile,https://another.com/handle"
```

Production builds will fail if the list is empty or contains invalid URLs.

### Artifact publishing workflow

- Update `apps/web/public/artifacts/manifest.json` with each artifact entry.
- Ensure each artifact file exists in `apps/web/public/artifacts/`.
- Update checksums in `apps/web/public/artifacts/sha256.json` and `manifest.json`.
- Set `RELEASE_READY=false` to skip required-asset enforcement during pre-release builds.

### Media kit publishing workflow

- Update `apps/web/public/media/manifest.json` with asset entries only.
- Place files in `apps/web/public/media/` matching `filename`.
- Checksums are enforced in production, missing files fail in all environments.
- See `docs/media-publishing-checklist.md` for naming, types, and alt text rules.

### Content pending vs enforced

- Enforced: content frontmatter schemas, proofRefs integrity, claim registry bindings, i18n completeness, sameAs anchors, artifacts/media manifest integrity.
- Pending content: media kit assets list (manifest currently empty).

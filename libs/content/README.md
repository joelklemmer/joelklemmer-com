# @joelklemmer/content

## System role

Single source of truth for structured content: claims registry, contact pathways, artifacts, media manifest, proof/public record, briefing contracts, and MDX loading. Used by validators, SEO, intelligence, and app screens. **Validation-only entry point** (`@joelklemmer/content/validate`) exists so tools can run under Node/tsx without pulling in `next-mdx-remote` (ESM-only deps).

## Architectural boundaries

- **Tag:** `type:lib`. May depend only on other `type:lib` libraries.
- **No deep imports:** Use `@joelklemmer/content` or `@joelklemmer/content/validate` only.
- **Boundary:** Content data and schemas only. No UI, no routing, no i18n message text (only keys/structures). Route files in `apps/web` must not import this lib directly; they use `screens` and `sections` which depend on content.

## Public interfaces

- **Main** (`src/index.ts`): `content`, `claims`, `briefing-contracts`, `contact`, `schemas`, `artifacts`, `media`, `proof-files` (and MDX loaders where applicable).
- **Validate** (`src/validate.ts`): Same domains without next-mdx-remote—e.g. `claimRegistry`, `contactPathways`, `getArtifactsManifest`, `getMediaManifest`, `getProofManifest`, frontmatter schemas, `validateClaimRegistry`, etc. Used by `tools/validate-*.ts`.

## Dependency constraints

- May depend only on `type:lib` libs. Content is filesystem- and schema-driven; validators and apps resolve content root via `tools` or app config.

## Example usage

```ts
// In app/screens (via sections or data loaders)
import { getClaimRegistry, getPublicRecordEntries } from '@joelklemmer/content';

// In tools/ validators
import { claimRegistry, getMediaManifest, institutionalPageFrontmatterSchema } from '@joelklemmer/content/validate';
```

## Interaction with verify pipeline

- **content-validate** (`tools/validate-content.ts`): Uses `@joelklemmer/content/validate` for manifests, frontmatter, claim registry.
- **i18n-validate, pgf-validate, governance-validate, briefing-contracts-validate, authority-signals-validate, frameworks-validate, home-validate, sitemap-validate, image-sitemap-validate, media-manifest, media-derivatives, media-authority, media-governance, verify-proof-attachments**: Depend on `@joelklemmer/content` or `@joelklemmer/content/validate`.
- **seo-validate**: Uses `@joelklemmer/content/validate` for media manifest.
- **intelligence-validate**: Uses `@joelklemmer/content/validate` for graph data.
- **experience-intelligence-validate**: Uses `@joelklemmer/content/validate`.
- Changing content schemas or validate exports may require updating these tools and the verify sequence in `apps/web/project.json`.

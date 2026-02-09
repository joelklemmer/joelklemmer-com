# @joelklemmer/screens

## System role

Full-page screens and metadata: Home, Brief, Work, Case Studies, Proof, Public Record, Contact, and all other route-level pages. Each screen exports the screen component and optional metadata (e.g. `briefMetadata`, `proofEntryStaticParams`). **Route files in `apps/web` may only import from `@joelklemmer/screens` and `@joelklemmer/sections`;** screens are the sole composition layer for app routes.

## Architectural boundaries

- **Tags:** `type:lib`, `type:screen`. May depend only on other `type:lib` libraries.
- **No deep imports:** Use `@joelklemmer/screens` only.
- **Boundary:** One screen per route (or per dynamic segment); screens compose sections and optionally use content/i18n/seo for data and metadata. No route definitions (routes live in `apps/web/src/app`); screens are the implementation of each page. Thin route files (max lines/lines-per-function) are enforced by lint.

## Public interfaces

- **Root** (`src/index.ts`): Re-exports `./lib/screens`.
- **screens.ts:** HomeScreen, BriefScreen, WorkScreen, CaseStudiesScreen, ProofScreen, PublicRecordScreen, ContactScreen, and all other *Screen components; *Metadata and \*StaticParams where applicable (e.g. proofEntryMetadata, caseStudyEntryStaticParams).

## Dependency constraints

- Depends on `sections`, `ui`, and other `type:lib` (content, i18n, seo, authority-telemetry, etc.). Must not be imported by `sections` or `ui` to avoid cycles.

## Example usage

```tsx
// In apps/web/src/app/[locale]/brief/page.tsx
import { BriefScreen, briefMetadata } from '@joelklemmer/screens';

export const metadata = briefMetadata;
export default function BriefPage() {
  return <BriefScreen />;
}
```

## Interaction with verify pipeline

- Verify runs content, home, PGF, authority, sitemap, SEO, and other validators that assert data and structure used by screens. E2E and presentation-integrity tests hit routes that render these screens. Changing screen props or metadata shape may require route and validator updates.

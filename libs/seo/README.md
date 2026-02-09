# @joelklemmer/seo

## System role

SEO and structured data: canonical URLs, hreflang alternates, JSON-LD (WebSite, Person, Report, breadcrumb, media/profile pages). Consumed by app layout and pages (via metadata builders) and by sitemap/SEO validators. No UI; pure data and URL builders.

## Architectural boundaries

- **Tag:** `type:lib`. May depend only on other `type:lib` libraries.
- **No deep imports:** Use `@joelklemmer/seo` only.
- **Boundary:** SEO and identity metadata only. No content authoring, no i18n copy (may use locale for URLs). Route files do not import this directly; metadata is built in screens or layout that depend on seo.

## Public interfaces

- **Root** (`src/index.ts`): `seo`, `identity`, `sitemap-builder`.
- **Typical exports:** `getCanonicalUrl`, `getHrefLangs`, `hreflangAlternates`, `getWebSiteJsonLd`, `getPersonJsonLd`, `getBriefPageJsonLd`, `getBreadcrumbListJsonLd`, `getMediaPageJsonLd`, `getProfilePageJsonLd`, `getOrganizationJsonLd`, `buildSitemapEntries`, etc.

## Dependency constraints

- May depend only on `type:lib` (e.g. `content` or `i18n` for locale/content when building URLs and JSON-LD). No dependency on `screens`, `sections`, or app routes.

## Example usage

```ts
import { getCanonicalUrl, getPersonJsonLd, buildSitemapEntries } from '@joelklemmer/seo';

const url = getCanonicalUrl(pathname, locale, baseUrl);
const jsonLd = getPersonJsonLd(baseUrl, locale);
```

## Interaction with verify pipeline

- **seo-validate** (`tools/validate-seo.ts`): Uses this lib for canonical, hreflang, and JSON-LD assertions.
- **sitemap-validate** (`tools/validate-sitemap.ts`): Uses `buildSitemapEntries` and `locales` (i18n).
- Changing canonical or JSON-LD contracts requires updating `validate-seo.ts` and any docs that describe required structured data.

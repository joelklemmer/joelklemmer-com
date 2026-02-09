# Duplication and Fragmentation Map

**Scope:** libs/, apps/, tools/. Evidence: file paths and grep/imports.

## 1. Sitemap / URL generation

| Concern                          | Locations                                                                              | Notes                                                 |
| -------------------------------- | -------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| Sitemap entry building           | `libs/seo/src/lib/sitemap-builder.ts` (buildSitemapEntries)                            | Single source; used by app + validator                |
| Sitemap slug data (sync, no MDX) | `libs/content/src/lib/sitemap-data.ts` (getPublicRecordSlugs, getCaseStudySlugs, etc.) | Used by sitemap builder and tools/validate-sitemap.ts |
| Sitemap route                    | `apps/web/src/app/sitemap.ts`                                                          | Uses buildSitemapEntries + content                    |
| Sitemap validation               | `tools/validate-sitemap.ts`                                                            | Uses same buildSitemapEntries; asserts required URLs  |
| Image sitemap route              | `apps/web/src/app/sitemap-images/route.ts`                                             | Uses getMediaManifestSitemapEligible (content)        |
| Image sitemap validation         | `tools/validate-image-sitemap.ts`                                                      | Same eligibility; asserts count and fields            |

**Verdict:** No duplication; shared libs/seo and libs/content. Fragmentation: sitemap logic split between seo (builder) and content (slug data, media eligibility).

## 2. Content root resolution

| Pattern                                                          | Files                                                                                                                          |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `contentRootCandidates` / `process.cwd()` + `content` or `../..` | tools/validate-authority-signals.ts, validate-intelligence.ts, validate-content.ts; libs/content (sitemap-data.ts, content.ts) |

**Verdict:** Repeated content-root resolution in multiple tools and content lib; no single canonical root constant exported.

## 3. Authority-related libs (fragmentation)

| Lib                     | Purpose (from tsconfig paths / imports)                                                                                        |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| authority-signals       | Signal definitions / mapping inputs                                                                                            |
| authority-mapping       | getMappingDiagnostics, getStructuredMapping, computeSignalEntropyScore, topology (used by authority-signals-validate, screens) |
| authority-density       | DensityViewProvider, density UI (screens, sections)                                                                            |
| authority-orchestration | surfacePriorityMatrix, orchestration (brief actions, screens)                                                                  |
| authority-telemetry     | TelemetryProvider, events, noOpProvider (web layout, CaseStudyEngagementTracker)                                               |

**Verdict:** Fragmentation by concern (signals, mapping, density, orchestration, telemetry). No duplicate implementations; some overlap in “authority” naming.

## 4. Validation: tools vs libs

| Validation logic            | In lib (exported)                                                   | In tools (script)                                                                                                       |
| --------------------------- | ------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Content frontmatter/schemas | libs/content/src/validate.ts, schemas                               | tools/validate-content.ts, validate-intelligence.ts, validate-authority-signals.ts import content/validate              |
| Intelligence graph/index    | libs/intelligence/src/validate.ts                                   | tools/validate-intelligence.ts uses it                                                                                  |
| Authority mapping           | libs/authority-mapping                                              | tools/validate-authority-signals.ts uses it                                                                             |
| Media manifest              | libs/content/validate (auditManifestCompleteness, getMediaManifest) | tools/validate-media-manifest.ts, validate-media-derivatives.ts, validate-media-authority.ts, validate-image-sitemap.ts |

**Verdict:** Validators in tools call into libs; core rules live in libs. Duplication: multiple tools each resolving content root and loading MDX/frontmatter similarly.

## 5. Telemetry: app vs lib

| Location                          | Role                                                                                     |
| --------------------------------- | ---------------------------------------------------------------------------------------- |
| libs/authority-telemetry          | Provider, events, noOpProvider; no dependencies (graph)                                  |
| apps/web/src/lib/telemetry/\*.tsx | CaseStudyEngagementTracker, RouteViewTracker, BriefOpenTracker (use authority-telemetry) |

**Verdict:** Single telemetry lib; app-only wrappers for specific events. No duplication.

## 6. i18n / locale

| Location                                 | Role                                                           |
| ---------------------------------------- | -------------------------------------------------------------- |
| libs/i18n                                | defaultLocale, locales, loadMessages, getMessages, isRtlLocale |
| apps/web/src/i18n/routing.ts, request.ts | Next/next-intl wiring; imports @joelklemmer/i18n               |

**Verdict:** Single i18n lib; app wires for Next. No duplication.

## 7. Proof / public record

| Location                               | Role                                                           |
| -------------------------------------- | -------------------------------------------------------------- |
| libs/content proof-files.ts            | getProofManifest, getProofManifestById (public proof manifest) |
| libs/content content.ts                | getPublicRecordSlugs, public-record vs proof dir resolution    |
| libs/content sitemap-data.ts           | getPublicRecordSlugs (sync, for sitemap)                       |
| content/public-record or content/proof | MDX source of truth                                            |

**Verdict:** Proof/public-record split between “manifest” (proof files) and “public record” (MDX). Naming overlap (proof vs public-record) but single content lib.

## 8. File path summary (duplication/fragmentation)

- **Content root resolution:** tools/validate-\*.ts (multiple), libs/content (sitemap-data, content).
- **Sitemap:** libs/seo/sitemap-builder.ts, libs/content/sitemap-data.ts, libs/content/media.ts (sitemap eligibility).
- **Authority:** libs/authority-signals, authority-mapping, authority-density, authority-orchestration, authority-telemetry (all distinct; no file-level duplication).
- **Validate entry points:** 24+ tools/validate-\*.ts scripts; orchestration only in apps/web project.json verify/validate targets.

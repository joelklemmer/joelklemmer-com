# Performance optimization summary

Enterprise-grade performance and Core Web Vitals hardening **without** visual, token, or routing changes.

## Proof required

For every change or audit, provide:

| Proof                    | How                                                                                                                 |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------- |
| **Bundle diff**          | Run `pnpm run build:analyze` before/after; compare report or chunk sizes.                                           |
| **Lighthouse scores**    | CI job `lighthouse` (artifact `lighthouse-reports`); or local `pnpm exec lhci autorun --config=./lighthouserc.cjs`. |
| **Web Vitals summary**   | LCP &lt; 1.8s, CLS ≈ 0, INP &lt; 200ms; see table below and `lighthouserc.cjs` assertions.                          |
| **Files changed**        | List in PR or in “Files changed” section below; no visual/layout/token/route edits.                                 |
| **Verify remains green** | `pnpm nx run web:build`, verify-fast (or equivalent), and `lighthouse` job must pass.                               |

## Target metrics

| Metric | Target                |
| ------ | --------------------- |
| LCP    | < 1.8s                |
| CLS    | ≈ 0                   |
| INP    | < 200ms               |
| TTFB   | Minimized via caching |

## Implemented changes

### 1) Image optimization

- **Next/Image** used everywhere applicable: `PortraitImage` (hero), `MediaLibraryClient` (thumbnails).
- **Responsive sizes** defined in `PortraitImage` and media thumbs; `next.config.js`: `deviceSizes`, `imageSizes` set.
- **AVIF/WebP** enabled in `next.config.js`: `images.formats: ['image/avif', 'image/webp']`.
- **Priority** only on the LCP hero: `HeroSection` accepts `imagePriority` (default `false`); only `HomeScreen` passes `imagePriority`. Other hero visuals (e.g. ProofEntryScreen, BookEntryScreen) do not use `priority`. Media library thumbs use `loading="lazy"` only.
- **No layout shifts**: explicit `width`/`height` and aspect-ratio wrappers; `sizes` attribute set.

### 2) Font optimization

- **Inter variable** in `apps/web/src/app/layout.tsx`: `subsets: ['latin']`, `display: 'swap'`, `preload: true`, `adjustFontFallback: true`. Redundant `preconnect`/`dns-prefetch` to `fonts.googleapis.com`/`gstatic` removed (next/font self-hosts; no external font CDN).

### 3) Bundle analysis

- **Next bundle analyzer** enabled via `@next/bundle-analyzer`; runs when `ANALYZE=true`.
- **Script**: `pnpm run build:analyze` (uses `cross-env` for Windows).
- Use to identify heavy imports and remove unused deps; no automated removal (manual audit).

### 4) Route prefetch tuning

- **Strategic prefetch**: footer links use `prefetch={false}` (`FooterSection`); primary nav links use `prefetch={false}` (`Nav`); locale switcher links use `prefetch={false}` (`LanguageSwitcherPopover`, `LanguageMenu`). Hero CTA / above-the-fold links keep default prefetch where desired.

### 5) HTTP caching headers

- **Immutable static assets**: `/_next/static/:path*` → `Cache-Control: public, max-age=31536000, immutable`.
- **Media**: `/media/:path*` → `max-age=31536000, immutable`.
- **Favicon**: `/favicon.ico` → `public, max-age=31536000, immutable`.
- Sitemaps: existing `max-age=3600`, `stale-while-revalidate=86400`.

### 6) Lighthouse CI

- **Config**: `lighthouserc.cjs` at repo root.
- **Collect**: production server `cd apps/web && pnpm exec next start --port 3000` (after CI build). URLs: `/en`, `/en/brief`, `/en/media`.
- **Assert**: performance (error ≥ 0.7), accessibility (error ≥ 0.9), LCP (error ≤ 1800ms), CLS (error ≤ 0.1), INP (error ≤ 200ms), TBT (warn ≤ 300ms).
- **CI**: `.github/workflows/ci.yml` — job `lighthouse` runs build then `lhci autorun`, uploads reports to `tmp/lighthouse`.
- **Local**: `nx run web:lighthouse-budget` runs the same LHCI flow.

## Files changed

| File                                          | Change                                                                                                    |
| --------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `apps/web/next.config.js`                     | `images.formats`, `deviceSizes`, `imageSizes`; `_next/static`, `/favicon.ico` cache; `withBundleAnalyzer` |
| `apps/web/src/app/layout.tsx`                 | Inter: `preload`, `display: swap`, `adjustFontFallback`; removed font preconnect/dns-prefetch             |
| `libs/sections/src/lib/HeroSection.tsx`       | `imagePriority` prop (default false); only home hero gets `priority` on `PortraitImage`                   |
| `libs/screens/src/lib/HomeScreen.tsx`         | `imagePriority` passed to `HeroSection` for LCP hero                                                      |
| `libs/sections/src/lib/FooterSection.tsx`     | `prefetch={false}` on footer links                                                                        |
| `libs/ui/src/lib/Nav.tsx`                     | `prefetch={false}` on primary nav links                                                                   |
| `libs/ui/src/lib/LanguageSwitcherPopover.tsx` | `prefetch={false}` on locale links                                                                        |
| `libs/ui/src/lib/LanguageMenu.tsx`            | `prefetch={false}` on locale links                                                                        |
| `lighthouserc.cjs`                            | Production server for collect; performance error ≥ 0.7; CLS error; INP error ≤ 200ms; TBT warn            |
| `.github/workflows/ci.yml`                    | Job `lighthouse`: build + lhci autorun + artifact upload                                                  |
| `tools/lighthouse-budget-stub.ts`             | Real `lhci autorun` invocation                                                                            |
| `package.json`                                | `build:analyze` script; devDeps: `@lhci/cli`, `cross-env`                                                 |

## Verification

- **Build**: `pnpm nx run web:build` — must stay green.
- **Lighthouse (local)**: Ensure build exists, then `pnpm exec lhci autorun --config=./lighthouserc.cjs` or `nx run web:lighthouse-budget`.
- **Bundle report**: `pnpm run build:analyze`; inspect output and remove unused deps as needed.
- **CI**: Push and confirm `verify-fast`, `build`, `a11y`, and `lighthouse` jobs pass; download `lighthouse-reports` artifact for scores.

## Proof checklist

- [x] Bundle analyzer enabled; script and env documented.
- [x] Lighthouse CI config and pipeline job added; assertions for performance and Core Web Vitals (LCP, CLS, INP).
- [x] INP &lt; 200ms asserted in `lighthouserc.cjs` (`interaction-to-next-paint`).
- [x] No visual, layout, token, or routing changes.
- [x] **Lighthouse scores**: CI job `lighthouse` runs `lhci autorun` and uploads reports to artifact `lighthouse-reports`; local: `pnpm exec lhci autorun --config=./lighthouserc.cjs` or `nx run web:lighthouse-budget` (after build).
- [x] **Bundle diff**: Run `pnpm run build:analyze` before/after heavy-import cleanup for diff.

---

## Proof required (runbook)

Use these commands to produce evidence that performance hardening is in place and CI remains green.

### 1. Build (verify green)

```bash
pnpm nx run web:build --verbose
```

Must complete with exit code 0. No visual, layout, token, or routing changes.

### 2. Bundle diff

- **Baseline:** `pnpm run build:analyze` (opens or writes bundle report with `ANALYZE=true`).
- **After changes:** Run again and compare chunk sizes and heavy imports. Remove unused deps as needed.
- **Files:** Report output under `apps/web/.next` (analyzer UI or static report depending on config).

### 3. Lighthouse scores and Web Vitals summary

**CI (automatic):** The `lighthouse` job in `.github/workflows/ci.yml` runs after install:

1. Build: `pnpm nx run web:build`
2. Run: `pnpm exec lhci autorun --config=./lighthouserc.cjs`
3. Upload artifact: `tmp/lighthouse` → `lighthouse-reports` (7-day retention).

**Local:**

```bash
pnpm nx run web:build
pnpm exec lhci autorun --config=./lighthouserc.cjs
```

Or use the Nx target (same effect):

```bash
pnpm nx run web:build
pnpm nx run web:lighthouse-budget
```

**Web vitals summary (from LHCI report):**

| Metric      | Target     | Assertion                                     |
| ----------- | ---------- | --------------------------------------------- |
| LCP         | &lt; 1.8s  | `largest-contentful-paint` max 1800ms (error) |
| CLS         | ≈ 0        | `cumulative-layout-shift` max 0.1 (error)     |
| INP         | &lt; 200ms | `interaction-to-next-paint` max 200 (error)   |
| TBT         | —          | `total-blocking-time` max 300ms (warn)        |
| Performance | ≥ 0.7      | `categories:performance` minScore 0.7 (error) |

Reports are written to `tmp/lighthouse/` (JSON + HTML). Open the HTML for numeric scores.

### 4. Files changed (reference)

| Area               | Files                                                                                                                                                                                                                                     |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Image optimization | `apps/web/next.config.js` (formats, sizes), `libs/ui/src/lib/PortraitImage.tsx`, `libs/sections/src/lib/HeroSection.tsx`, `libs/screens/src/lib/MediaLibraryClient.tsx`, `libs/screens/src/lib/HomeScreen.tsx`                            |
| Font optimization  | `apps/web/src/app/layout.tsx` (Inter: subset, preload, display swap)                                                                                                                                                                      |
| Bundle analysis    | `apps/web/next.config.js` (withBundleAnalyzer), `package.json` (build:analyze, @next/bundle-analyzer)                                                                                                                                     |
| Prefetch           | `libs/sections/src/lib/FooterSection.tsx`, `libs/ui/src/lib/Nav.tsx`, `libs/ui/src/lib/LanguageMenu.tsx`, `libs/ui/src/lib/LanguageSwitcherPopover.tsx`, `libs/screens/src/lib/HomeScreen.tsx`, `libs/sections/src/lib/FrameworkCard.tsx` |
| Caching            | `apps/web/next.config.js` (headers: \_next/static, media, favicon, sitemaps)                                                                                                                                                              |
| Lighthouse CI      | `lighthouserc.cjs`, `.github/workflows/ci.yml` (lighthouse job), `tools/lighthouse-budget-stub.ts`, `apps/web/project.json` (lighthouse-budget target)                                                                                    |

### 5. Verify remains green

- `pnpm nx run web:build` — success.
- Push to trigger CI: `verify-fast`, `build`, `a11y`, `visual`, `lighthouse` all pass.
- Lighthouse job fails the run if performance &lt; 0.7 or LCP/CLS assertions are violated.

## Web vitals summary (targets)

| Metric      | Target     | Assertion (lighthouserc.cjs)                  |
| ----------- | ---------- | --------------------------------------------- |
| LCP         | &lt; 1.8s  | `largest-contentful-paint` max 1800ms (error) |
| CLS         | ≈ 0        | `cumulative-layout-shift` max 0.1 (error)     |
| INP         | &lt; 200ms | `interaction-to-next-paint` max 200 (error)   |
| Performance | —          | `categories:performance` minScore 0.7 (error) |

## Final stabilization (2025-02-08)

**Objective:** Zero defects before commit; full green pipeline; no warnings; performance hardening without visual/layout/token changes.

**Files changed (this pass):**

| File                                       | Change                                                                                                                  |
| ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| `apps/web/next-env.d.ts`                   | Fixed routes.d.ts import path (`.next/.next` → `.next`) so TypeScript resolves correctly; CI restores this after build. |
| `.github/workflows/ci.yml`                 | Build and Lighthouse build steps: set `BASELINE_BROWSER_MAPPING_IGNORE_OLD_DATA=1` for warning-free pipeline.           |
| `package.json`                             | `build` script: `cross-env BASELINE_BROWSER_MAPPING_IGNORE_OLD_DATA=1 nx build web` for local no-warning builds.        |
| `docs/authority/known-warnings.md`         | Noted that CI suppresses baseline-browser-mapping notice via env.                                                       |
| `apps/web-e2e/.../i18n-rtl-stress.spec.ts` | Format fix (Prettier) from `nx format:write`.                                                                           |
| `apps/web/src/app/[locale]/page.tsx`       | Route file: removed `@joelklemmer/seo`; `generateMetadata` now only calls `homeMetadata()` from screens.                |
| `apps/web/src/app/[locale]/layout.tsx`     | Removed unused eslint-disable before `PRIMARY_NAV_ENTRIES` (sections allowed in route files).                           |
| `libs/screens/src/lib/HomeScreen.tsx`      | Added `getCriticalPreloadLinks` + `HOME_HERO_IMAGE_PATH`; metadata includes `criticalPreloadLinks` so route stays thin. |

**Verification:** Format check, lint, all validators, and production build run successfully. Lighthouse CI already in pipeline (`lighthouserc.cjs` + job `lighthouse`) with performance ≥ 0.7, LCP ≤ 1800ms, CLS ≤ 0.1, INP ≤ 200ms (warn). Bundle analyzer: `pnpm run build:analyze`. No design, layout, tokens, or routing changes.

---

## Verify remains green

After any change, confirm:

- [ ] `pnpm nx run web:build` succeeds (no layout/token/route changes).
- [ ] `pnpm run ci:validate` (or equivalent verify-fast steps) passes.
- [ ] `pnpm nx run web:lighthouse-budget` passes (or CI job `lighthouse`); no regression in performance or Web Vitals.
- [ ] If bundle changed: run `pnpm run build:analyze` and confirm no unexpected heavy imports.

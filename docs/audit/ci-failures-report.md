# CI Failures Report — Lighthouse and Visual

**Generated:** 2026-02-09 (diagnostics run; no gates weakened, no fixes applied)  
**Purpose:** Exact, copy-pastable evidence for making Lighthouse and Visual pass. No thresholds lowered. No tests skipped.

---

## 1) Executive summary

- **Lighthouse:** Fails on all three configured URLs (`/en`, `/en/brief`, `/en/media`). Failures are driven by:
  - **Explicit config assertions:** `largest-contentful-paint` (LCP) and `interaction-to-next-paint` (INP) — LCP actual ~3,165–3,242 ms (expected ≤1,800 ms); INP audit did not run (auditRan 0).
  - **Preset assertions (lighthouse:recommended):** `aria-allowed-role`, `bf-cache`, `meta-description`, `canonical` (brief only), `target-size`, `unused-javascript`, plus insights (e.g. `legacy-javascript-insight`, `network-dependency-tree-insight`, `lcp-discovery-insight`, `image-delivery-insight` on /en, `forced-reflow-insight` on /en/brief).
  - Category scores in the run were often above thresholds (e.g. performance 0.81–0.94, accessibility 0.96, SEO 0.91–0.92), but the **assertion layer** fails due to the above audits.
- **Visual:** 8 tests failed: 1 layout (hero viewport), 1 proof-density (attachment row `data-attachment-sha` expectation), 1 responsive (masthead height), 5 snapshot diffs (home viewport, masthead, brief viewport, RTL home viewport, media filter row). Evidence: snapshot diffs and assertion errors from Playwright output; diff images written under `dist/.playwright/` (or equivalent test-output path).

**Evidence source:** One full local run of `pnpm nx run web:lighthouse --verbose` and `pnpm nx run web:visual --verbose` with `RATE_LIMIT_MODE=off`, artifacts in `tmp/lighthouse`, `.lighthouseci/assertion-results.json`, and Playwright test output.

---

## 2) Lighthouse failures

### 2.1 URLs tested

| URL (normalized) | Base URL in run | Runs |
|------------------|-----------------|------|
| `/en` | `http://127.0.0.1:61672` | 3 |
| `/en/brief` | `http://127.0.0.1:61672` | 3 |
| `/en/media` | `http://127.0.0.1:61672` and `http://127.0.0.1:62094` | 3 |

Config: `lighthouserc.serverless.cjs` — `numberOfRuns: 3`, URLs from `LHCI_BASE_URL` + `/en`, `/en/brief`, `/en/media`. Artifacts: `tmp/lighthouse/*.report.json`, `tmp/lighthouse/*.report.html`, `.lighthouseci/assertion-results.json`.

### 2.2 Assertions failing (table)

From `.lighthouseci/assertion-results.json`. Each row is one failing assertion (one URL × one audit).

| URL | Audit ID | Assertion name | Expected | Actual | Severity |
|-----|----------|----------------|----------|--------|----------|
| /en | interaction-to-next-paint | auditRan | ≥1 | 0 | error |
| /en | aria-allowed-role | minScore | ≥0.9 | 0 | error |
| /en | bf-cache | minScore | ≥0.9 | 0 | error |
| /en | image-delivery-insight | minScore | ≥0.9 | 0.5 | error |
| /en | label-content-name-mismatch | minScore | ≥0.9 | 0 | error |
| /en | largest-contentful-paint | maxNumericValue | ≤1800 | 3165.192 (values: 3404.5, 3165.2, 3242.8) | error |
| /en | lcp-discovery-insight | minScore | ≥0.9 | 0 | error |
| /en | legacy-javascript-insight | minScore | ≥0.9 | 0.5 (values: 0, 0.5, 0) | error |
| /en | meta-description | minScore | ≥0.9 | 0 | error |
| /en | network-dependency-tree-insight | minScore | ≥0.9 | 0 | error |
| /en | target-size | minScore | ≥0.9 | 0 | error |
| /en | unused-javascript | maxLength | ≤0 | 2 | error |
| /en | legacy-javascript | maxLength | ≤0 | 1 | warn |
| /en | render-blocking-insight | maxLength | ≤0 | 2 | warn |
| /en | render-blocking-resources | maxLength | ≤0 | 2 | warn |
| /en/brief | interaction-to-next-paint | auditRan | ≥1 | 0 | error |
| /en/brief | aria-allowed-role | minScore | ≥0.9 | 0 | error |
| /en/brief | bf-cache | minScore | ≥0.9 | 0 | error |
| /en/brief | canonical | minScore | ≥0.9 | 0 | error |
| /en/brief | forced-reflow-insight | minScore | ≥0.9 | 0 | error |
| /en/brief | largest-contentful-paint | maxNumericValue | ≤1800 | 3019.02 (values: 3171.6, 3019.0, 3163.9) | error |
| /en/brief | legacy-javascript-insight | minScore | ≥0.9 | 0.5 | error |
| /en/brief | target-size | minScore | ≥0.9 | 0 | error |
| /en/brief | unused-javascript | maxLength | ≤0 | 2 | error |
| /en/brief | legacy-javascript | maxLength | ≤0 | 1 | warn |
| /en/media | interaction-to-next-paint | auditRan | ≥1 | 0 | error |
| /en/media | aria-allowed-role | minScore | ≥0.9 | 0 | error |
| /en/media | bf-cache | minScore | ≥0.9 | 0 | error |
| /en/media | dom-size | minScore | ≥0.9 | 0.5 | warn |
| /en/media | largest-contentful-paint | maxNumericValue | ≤1800 | 3163.62–3164.67 | error |
| /en/media | legacy-javascript-insight | minScore | ≥0.9 | 0 | error |
| /en/media | meta-description | minScore | ≥0.9 | 0 | error |
| /en/media | network-dependency-tree-insight | minScore | ≥0.9 | 0 | error |
| /en/media | target-size | minScore | ≥0.9 | 0 | error |
| /en/media | unused-javascript | maxLength | ≤0 | 2 | error |
| /en/media | legacy-javascript | maxLength | ≤0 | 1 | warn |
| /en/media | render-blocking-insight | maxLength | ≤0 | 2 | warn |
| /en/media | render-blocking-resources | maxLength | ≤0 | 2 | warn |

### 2.3 Key audits driving failures (Top 10)

These are the audits that cause assertion failures across the most URLs or are explicit in `lighthouserc.serverless.cjs`:

| Rank | Audit ID | Category | How it fails | URLs affected |
|------|----------|----------|--------------|---------------|
| 1 | largest-contentful-paint | performance | maxNumericValue: expected ≤1800 ms, actual ~3019–3165 ms | /en, /en/brief, /en/media |
| 2 | interaction-to-next-paint | performance | auditRan: 0 (audit did not run) | /en, /en/brief, /en/media |
| 3 | aria-allowed-role | accessibility | minScore: 0 (ARIA roles on incompatible elements) | /en, /en/brief, /en/media |
| 4 | bf-cache | performance | minScore: 0 (back/forward cache prevented) | /en, /en/brief, /en/media |
| 5 | target-size | accessibility | minScore: 0 (touch targets size/spacing) | /en, /en/brief, /en/media |
| 6 | unused-javascript | performance | maxLength: 2 (reduce unused JS) | /en, /en/brief, /en/media |
| 7 | legacy-javascript-insight | performance | minScore 0 or 0.5 | /en, /en/brief, /en/media |
| 8 | network-dependency-tree-insight | performance | minScore: 0 | /en, /en/brief, /en/media |
| 9 | meta-description | SEO | minScore: 0 (document meta description) | /en, /en/media (brief has canonical fail) |
| 10 | canonical | SEO | minScore: 0 (valid rel=canonical) | /en/brief only |

Additional URL-specific: **label-content-name-mismatch** (/en), **image-delivery-insight** (/en), **lcp-discovery-insight** (/en), **forced-reflow-insight** (/en/brief), **dom-size** (/en/media).

### 2.4 Per-route evidence (links to artifacts)

- **Representative reports (from manifest):**
  - `/en`: `tmp/lighthouse/127_0_0_1-en-2026_02_09_11_36_05.report.html` (and same base `.report.json`)
  - `/en/brief`: `tmp/lighthouse/127_0_0_1-en_brief-2026_02_09_11_36_41.report.html`
  - `/en/media`: `tmp/lighthouse/127_0_0_1-en_media-2026_02_09_11_37_17.report.html`
- **LCP:** In `127_0_0_1-en-2026_02_09_11_36_05.report.json`, `audits['largest-contentful-paint'].numericValue` ≈ 3242.77 ms; `audits['largest-contentful-paint-element']` exists (node reference; LCP element is in the LCP chain).
- **Assertion machine-readable:** `.lighthouseci/assertion-results.json` (full list of failed assertions with url, auditId, name, expected, actual, level).
- **Manifest:** `tmp/lighthouse/manifest.json` (url, summary scores, jsonPath, htmlPath per run).

---

## 3) Visual failures

### 3.1 Specs failing (table)

| Spec | Test (describe/it) | Route(s) | Failure type | Artifact paths |
|------|-------------------|----------|--------------|----------------|
| i18n-rtl-stress.spec.ts | i18n + RTL layout stress › hero does not overflow viewport across locales and viewports | /en (en @ mobile) | Layout / viewport | Error: "en @ mobile: hero section must be within viewport"; context: `dist/.playwright/apps/web-e2e/test-output/i18n-rtl-stress-.../error-context.md` |
| proof-density.spec.ts | Proof density layering and doctrine › entry with attachments has attachment row and copy-hash button | /en/publicrecord/[slug] | Assertion (expect Promise vs string) | `expect(row.getAttribute('data-attachment-sha')).toBe(firstAtt.sha256)` — received Promise {}; context: `dist/.playwright/.../proof-density-.../error-context.md` |
| responsive-layout.spec.ts | responsive layout stability › masthead remains single-row and within bounds | — | Assertion (height) | Expected masthead height ≤200, received 395.34 |
| visual-regression.spec.ts | visual regression › home top viewport | /en | Snapshot diff | Expected: `apps/web-e2e/src/presentation-integrity/visual-regression.spec.ts-snapshots/home-viewport-chromium-win32.png`; Received: `.../test-output/.../home-viewport-actual.png`; Diff: `.../home-viewport-diff.png` |
| visual-regression.spec.ts | visual regression › masthead region | /en | Snapshot diff | Expected: `.../masthead-chromium-win32.png`; Received/Diff in same test-output folder |
| visual-regression.spec.ts | visual regression › brief top viewport | /en/brief | Snapshot diff | Expected: `.../brief-viewport-chromium-win32.png`; 24090 pixels different (ratio 0.03); Diff: `.../brief-viewport-diff.png` |
| visual-regression.spec.ts | visual regression › RTL home top viewport | /he | Snapshot diff | Expected: `.../rtl-home-viewport-chromium-win32.png`; 102557 pixels different (ratio 0.11); Diff: `.../rtl-home-viewport-diff.png` |
| visual-regression.spec.ts | visual regression › media library filter row | /en/media | Snapshot diff | Expected: `.../media-filter-row-chromium-win32.png`; size mismatch (e.g. 1280×5403 vs 1280×5404) and pixel diff; Diff: `.../media-filter-row-diff.png` |

### 3.2 Diff artifact references

- **Location:** Playwright writes to `dist/.playwright/apps/web-e2e/test-output/<test-name>-chromium/` (exact path may vary by Nx/Playwright version; from run: `dist\.playwright\apps\web-e2e\test-output\...`).
- **Files per snapshot failure:** `<snapshot-name>-actual.png`, `<snapshot-name>-diff.png`, and optionally `error-context.md`.
- **Baselines:** `apps/web-e2e/src/presentation-integrity/visual-regression.spec.ts-snapshots/*-chromium-win32.png` (home-viewport, masthead, brief-viewport, rtl-home-viewport, media-filter-row). Do not commit new diff images; reference for fix-phase only.

### 3.3 Determinism assessment (what makes it flaky)

- **Snapshot diffs:** Likely drivers: (1) **Font/antialiasing** — different OS (e.g. Windows vs CI Linux) or font loading; (2) **Layout/spacing** — 1px height (e.g. media filter row 5403 vs 5404) or subpixel; (3) **Locale/RTL** — RTL home has large pixel diff (0.11), so RTL layout or assets may differ by environment; (4) **Viewport/hero** — hero “not within viewport” at en @ mobile suggests layout or scroll/measure timing.
- **proof-density:** Test bug: `row.getAttribute('data-attachment-sha')` returns a Promise; assertion compares Promise to string. Fix: await attribute then expect (no baseline change).
- **Masthead height:** Fixed expectation 200px vs actual ~395px — either design changed or selector/viewport; not necessarily flaky but a hard failure until updated or layout fixed.

---

## 4) Route ownership map

For each Lighthouse/Visual failing URL:

| URL | Route composer (page) | Screen / section | Metadata keys (source) | Suspected weight / notes (evidence) |
|-----|------------------------|------------------|-------------------------|-------------------------------------|
| /en | `apps/web/src/app/[locale]/page.tsx` | `HomeScreen` (`@joelklemmer/screens`), sections: `HeroSection`, `ListSection`, `FrameworkCard` | `homeMetadata()` → `createPageMetadata({ title: meta.home.title, description: meta.home.description, pathname: '/', ogImageSlug: 'home', criticalPreloadLinks: heroImageHref })` | Hero image: `HOME_HERO_IMAGE_PATH` = `/media/portraits/joel-klemmer__portrait__studio-graphite__2026-01__01__hero.webp`; LCP ~3242 ms; meta-description/canonical from `libs/seo` `createPageMetadata` |
| /en/brief | `apps/web/src/app/[locale]/brief/page.tsx` | `BriefScreen`, `HeroSection` | `briefMetadata` → `createPageMetadata` (title/description/pathname for brief) | LCP ~3019–3164 ms; canonical fails (brief); forced-reflow-insight |
| /en/media | `apps/web/src/app/[locale]/media/page.tsx` | `MediaLibraryScreen`, `HeroSection`, media grid | `mediaLibraryMetadata` → `createPageMetadata({ pathname: '/media', ogImageSlug: 'media' })` | LCP ~3164 ms; meta-description fails; dom-size warn; many media items (DOM weight) |

**Metadata:** All use `libs/seo` `createPageMetadata()`; description and `alternates.canonical` are set in code. Lighthouse still reports meta-description and canonical failures — verify Next.js output (e.g. `<meta name="description">` and `<link rel="canonical">`) in built HTML.

**Heavy resources:** Home: hero image (preload in `getCriticalPreloadLinks`). Brief/Media: shared layout, fonts, and (media) many images in grid. Render-blocking and unused-JS affect all three.

---

## 5) Inputs required for fix phase

- **LHCI assertions (from artifacts):**
  - `largest-contentful-paint`: maxNumericValue **≤ 1800** ms (actual ~3020–3165 ms).
  - `interaction-to-next-paint`: audit must run (auditRan ≥ 1); currently 0 (investigate INP collection).
  - `categories:performance` minScore 0.7; `categories:accessibility` minScore 0.9 (from `lighthouserc.serverless.cjs`); category scores in this run were often above these; failure is from the granular assertions above.
  - Exact list of all failing assertions: use `.lighthouseci/assertion-results.json` (and no change to preset/assertions in config when fixing).
- **URLs:** All three URLs fail consistently in this local run; need same run on CI (Linux) to confirm reproducibility and whether LCP/INP differ (e.g. Linux vs Windows).
- **CI environment:** `.github/workflows/ci.yml` — lighthouse job runs on `ubuntu-latest`, `SKIP_LH_BUILD=1`, `LHCI_COLLECT__NUMBER_OF_RUNS=1`; visual job runs on `ubuntu-latest`, `PORT=3000`, `RATE_LIMIT_MODE=off`. Confirm whether failures reproduce on Linux and whether snapshot baselines are Linux-generated (e.g. `-linux` vs `-win32`).
- **Fonts/images:** Hero image is local (`/media/portraits/...`). Fonts: check for local vs remote and sizes (render-blocking and LCP).
- **Env for identity/SEO:** `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_IDENTITY_SAME_AS` (and any baseUrl used by `createPageMetadata`) must be set so canonical and meta tags render correctly in production build; runners use `https://example.invalid` (see `tools/run-lighthouse.ts` and `ci.yml`).

---

## 6) Repro commands (local + CI)

**Local (PowerShell):**

```powershell
# Optional: clear Nx cache (may hit EBUSY on Windows)
pnpm nx reset

# Lighthouse (build + server + lhci; dynamic port)
$env:RATE_LIMIT_MODE = 'off'
pnpm nx run web:lighthouse --verbose

# Visual (build + server + Playwright visual suite)
$env:RATE_LIMIT_MODE = 'off'
pnpm nx run web:visual --verbose
```

**CI (from `.github/workflows/ci.yml`):**

- **Lighthouse:** After build job, `pnpm nx run web:lighthouse --verbose` with `RATE_LIMIT_MODE=off`, `SKIP_LH_BUILD=1`, `LHCI_COLLECT__NUMBER_OF_RUNS=1`, `LHCI_UPLOAD__TARGET=filesystem`, `LHCI_UPLOAD__OUTPUT_DIR=tmp/lighthouse`. Artifact: `tmp/lighthouse` → `lighthouse-reports`.
- **Visual:** After build, `pnpm nx run web:visual --verbose` with `RATE_LIMIT_MODE=off`, `PORT=3000`. Playwright uses `BASE_URL` from runner (reuse existing server).

---

## 7) Appendices: raw excerpts

### A. LHCI config assertions (lighthouserc.serverless.cjs)

```js
assert: {
  preset: 'lighthouse:recommended',
  assertions: {
    'categories:performance': ['error', { minScore: 0.7 }],
    'categories:accessibility': ['error', { minScore: 0.9 }],
    'largest-contentful-paint': ['error', { maxNumericValue: 1800 }],
    'cumulative-layout-shift': ['error', { maxNumericValue: 0.05 }],
    'interaction-to-next-paint': ['error', { maxNumericValue: 200 }],
    'total-blocking-time': ['error', { maxNumericValue: 300 }],
    'first-contentful-paint': ['error', { maxNumericValue: 1800 }],
    'server-response-time': ['error', { maxNumericValue: 600 }],
    'total-byte-weight': ['error', { maxNumericValue: 2500000 }],
  },
},
```

### B. Sample assertion-results.json entries (one per URL pattern)

```json
{"name":"maxNumericValue","expected":1800,"actual":3165.192,"values":[3404.5319999999992,3165.192,3242.7682],"operator":"<=","passed":false,"auditId":"largest-contentful-paint","level":"error","url":"http://127.0.0.1:61672/en"}
{"name":"minScore","expected":0.9,"actual":0,"values":[0,0,0],"operator":">=","passed":false,"auditId":"meta-description","level":"error","url":"http://127.0.0.1:61672/en"}
{"name":"minScore","expected":0.9,"actual":0,"values":[0,0,0],"operator":">=","passed":false,"auditId":"canonical","level":"error","url":"http://127.0.0.1:61672/en/brief"}
```

### C. Visual failure excerpt (proof-density)

```
Expected: "2e02aa7e3f49cceb39d5fe1b39d7d9975c4efac2c46ea00e02aa7d6ab1a90764"
Received: Promise {}
  at proof-density.spec.ts:65:59
  await expect(row.getAttribute('data-attachment-sha')).toBe(firstAtt.sha256);
```

### D. LCP from report (en)

From `127_0_0_1-en-2026_02_09_11_36_05.report.json`: `audits['largest-contentful-paint'].numericValue` = 3242.7682; `audits['largest-contentful-paint-element']` present with node reference (LCP element in viewport). LCP metric savings suggestion: 750 ms.

---

**No-fix pledge:** No lighthouse thresholds, budgets, or visual baselines were changed in this run. No tests or audits were skipped. This document is evidence-only for the fix phase.

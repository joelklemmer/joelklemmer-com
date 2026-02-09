# Lighthouse and Visual Fix Report (Final Evidence)

**Date:** 2026-02-09  
**Source:** [CI Failures Report](ci-failures-report.md)  
**Constraints:** No thresholds lowered, no audits disabled, no URLs removed, no visual tests deleted.

---

## 1) Failing audit/test: before → fix → after

### 1.1 Canonical (score 0 on /en/brief)

| Stage   | Evidence |
|--------|----------|
| **Before** | Lighthouse: "Multiple conflicting URLs (http://127.0.0.1:PORT/en, https://example.invalid/en/brief)". Root and segment both emitted canonical; segment could use build-time env when static. |
| **Fix** | (1) Root layout: single source for canonical — removed raw `<link rel="canonical">` from `<head>`, kept only `generateMetadata()` returning `alternates.canonical` from request (pathname + host + proto). (2) Home, brief, media pages: `export const dynamic = 'force-dynamic'` so `generateMetadata()` always runs with request headers and `getRequestBaseUrl()` returns the served origin. |
| **After** | Canonical in HTML is request-derived only; no duplicate or example.invalid canonical. Validator: `web:head-invariants-validate` asserts `<link rel="canonical" href>` exists and `href` starts with `http` on /en and /en/brief. |

### 1.2 Meta description (score 0 on /en, /en/media; brief had description)

| Stage   | Evidence |
|--------|----------|
| **Before** | Meta description missing or not in initial HTML in some runs. |
| **Fix** | Root `generateMetadata()` returns `description: DEFAULT_META_DESCRIPTION`; no raw `<meta name="description">` in layout so Next Metadata API is the single source. |
| **After** | `web:head-invariants-validate` asserts `<meta name="description" content="...">` exists and content length > 30 on /en and /en/brief. |

### 1.3 Interaction-to-next-paint (INP) — auditRan 0

| Stage   | Evidence |
|--------|----------|
| **Before** | `interaction-to-next-paint` audit missing in report (auditRan 0); LHCI asserts `auditRan >= 1` and `maxNumericValue <= 200`. |
| **Fix** | **Not changed in this pass.** Lighthouse 12.6.1 in **navigation** mode does not run the INP audit (no interactions in a single load). Option A: Upgrade to Lighthouse 13 + Node ≥22 (Lighthouse 13 requires Node ≥22.19; project uses Node 20). Option B: Use **timespan** mode with deterministic interactions (Puppeteer + `lighthouse` Node API: `startTimespan` → scripted clicks/tabs → `endTimespan`), then feed LHRs into LHCI assert/upload. LHCI’s collect runner explicitly deletes `gatherMode` from settings, so a custom collect script is required for option B. |
| **After** | INP still does not run in standard LHCI navigation collect. To make INP pass: (1) add a custom step that runs Lighthouse in timespan mode with a small interaction script and writes LHRs to the same output dir, then run `lhci assert` / `lhci upload`, or (2) when the project allows Node 22+, add pnpm override `lighthouse: ^13.0.0` and re-run. |

### 1.4 Hero overflow (no scroll-container workaround)

| Stage   | Evidence |
|--------|----------|
| **Before** | `.hero-authority` had `max-height: 100vh; overflow-y: auto` (scroll-container workaround). |
| **Fix** | Removed `max-height` and `overflow-y: auto`. Reduced mobile hero: `.hero-authority` padding `var(--space-6)`; `.hero-authority-plate` on mobile `padding: var(--space-4)`, `min-height: min(320px, 50vh)`. Tablet+ unchanged (768px+ restores larger padding and min-height). |
| **After** | Hero fits viewport on mobile without internal scrolling; no scroll-container workaround. |

### 1.5 Proof-density.spec.ts (getAttribute Promise)

| Stage   | Evidence |
|--------|----------|
| **Before** | `expect(row.getAttribute('data-attachment-sha')).toBe(firstAtt.sha256)` — `getAttribute` returns a Promise; assertion compared Promise to string. |
| **Fix** | Already fixed in codebase: `const sha = await row.getAttribute('data-attachment-sha'); expect(sha).toBe(firstAtt.sha256);` |
| **After** | No code change; test is correct. |

### 1.6 Other audits (aria-allowed-role, target-size, bf-cache, LCP, insights)

No code changes in this pass. Fixes require: (1) Fresh report JSON to identify exact nodes for aria-allowed-role and target-size. (2) bf-cache: root `force-dynamic` causes Cache-Control: no-store; removing it would require another way to keep lang/dir correct per request. (3) LCP ≤1800 ms: hero image, fonts, and render-blocking/unused JS need further performance work (next/image, next/font, code-splitting, DOM reduction on /en/media). (4) Insights (e.g. legacy-javascript-insight, network-dependency-tree-insight): follow Lighthouse suggestions without lowering assertions.

---

## 2) Files changed

| File | Change |
|------|--------|
| `apps/web/src/app/layout.tsx` | Removed duplicate `<link rel="canonical">` from `<head>`. Canonical and description only from root `generateMetadata()`. |
| `apps/web/src/app/[locale]/page.tsx` | Added `export const dynamic = 'force-dynamic'` so metadata uses request baseUrl. |
| `apps/web/src/app/[locale]/brief/page.tsx` | Added `export const dynamic = 'force-dynamic'`. |
| `apps/web/src/app/[locale]/media/page.tsx` | Added `export const dynamic = 'force-dynamic'`. |
| `apps/web/src/styles/20-layout.css` | `.hero-authority`: removed `max-height: 100vh` and `overflow-y: auto`. `.hero-authority-plate` mobile: `padding: var(--space-4)`, `min-height: min(320px, 50vh)`. |
| `tools/validate-head-invariants.ts` | New: starts server, fetches /en and /en/brief, asserts meta description (length > 30) and canonical (href starts with http). |
| `apps/web/project.json` | New target `head-invariants-validate`; added to verify commands (after restore-generated-typings) and to build job in CI. |
| `.github/workflows/ci.yml` | Build job: after "Repo must be clean", added step "Head invariants (meta description + canonical)" with `RATE_LIMIT_MODE=off`. |

---

## 3) Commands run and key excerpts

```powershell
# Head invariants (after build)
$env:RATE_LIMIT_MODE = 'off'
pnpm nx run web:head-invariants-validate --verbose

# Full verify (includes head-invariants after build)
pnpm nx run web:verify --verbose

# Lighthouse (unchanged; INP still fails until timespan or LH13)
$env:RATE_LIMIT_MODE = 'off'
pnpm nx run web:lighthouse --verbose

# Visual
$env:RATE_LIMIT_MODE = 'off'
pnpm nx run web:visual --verbose
```

CI: Head invariants run in the **build** job after build and "Repo must be clean". Lighthouse and visual run in their own jobs (unchanged).

---

## 4) Why INP does not exist yet and how to make it pass

- **Cause:** In Lighthouse 12, the `interaction-to-next-paint` audit is not populated in **navigation** mode (single page load, no user interactions). LHCI runs in navigation mode and strips `gatherMode` from settings, so timespan cannot be enabled via config.
- **Ways to make INP exist and pass (no assertion changes):**
  1. **Timespan collect:** Implement a custom collect (e.g. in `tools/`) that: (a) starts the server, (b) for each URL uses Puppeteer + `lighthouse` Node API: `startTimespan(page)`, perform a small set of deterministic interactions (e.g. tab, click primary CTA), `endTimespan()`, (c) writes each LHR into the same directory LHCI uses (e.g. `.lighthouseci` or `tmp/lighthouse`), (d) runs `lhci assert` and `lhci upload` (no collect). Requires adding `puppeteer` (and optionally explicit `lighthouse@12.6.1`) as devDependencies.
  2. **Upgrade Node + Lighthouse:** When the project allows Node ≥22.19, add pnpm override `lighthouse: ^13.0.0` and re-run; confirm in report JSON that `audits['interaction-to-next-paint']` exists with `numericValue` and passes ≤200.

---

## 5) Snapshot strategy for CI (Linux)

- **Current:** Baselines are `*-chromium-win32.png`; CI runs on ubuntu-latest (Linux). Cross-platform snapshot diffs are expected (fonts, antialiasing, subpixel layout).
- **Strategy:** (1) **Determinism first:** `waitForStableViewport(page)` (e.g. `document.fonts.ready`) and `reducedMotion: 'reduce'` are in place; disable animations in test mode if needed; avoid time-dependent UI in snapshotted regions. (2) **Platform-aware baselines:** Either generate and commit Linux baselines (run visual with updateSnapshots on a Linux runner, then commit the new snapshots) so CI compares like-to-like, or use a snapshot config that names/store baselines by platform (e.g. `*-chromium-linux.png` on CI). (3) **No blind accept:** Update snapshots only after determinism is ensured and the change is intentional; document the reason in the report or commit message.

---

## 6) Summary

- **Canonical and meta description:** Fixed via single source in root `generateMetadata()` and force-dynamic on home/brief/media so request baseUrl is used; head-invariants validator added and wired into verify and build job.
- **Hero:** Scroll-container workaround removed; mobile hero sizing reduced so it fits viewport without internal scroll.
- **Proof-density:** Already correct (await getAttribute then expect).
- **INP:** Still not run in standard LHCI; requires custom timespan collect (Puppeteer + Lighthouse Node API) or Node 22+ and Lighthouse 13.
- **No thresholds or assertions lowered; no audits or URLs removed; no visual tests deleted.**

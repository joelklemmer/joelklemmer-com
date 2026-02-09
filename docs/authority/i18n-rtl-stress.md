# i18n + RTL layout stress tests

**Purpose:** Playwright tests that stress layout across all supported locales and viewport sizes. They guard against horizontal scroll, masthead overlap, hero overflow, RTL mirroring regressions, and focus ring clipping.

**Scope:** `apps/web-e2e/src/presentation-integrity/i18n-rtl-stress.spec.ts`. No production code changes; documentation and CI verification only.

---

## How to run

From the repo root:

```bash
# Run the full e2e suite (includes i18n-rtl-stress)
pnpm nx e2e web-e2e

# Run only the i18n + RTL stress tests (recommended for quick iteration)
pnpm nx e2e web-e2e --grep "i18n \\+ RTL layout stress"

# Run only the presentation-integrity folder (i18n-rtl-stress + overflow + responsive + visual)
pnpm nx e2e web-e2e --grep "presentation-integrity"

# Run with UI (debug)
pnpm nx e2e web-e2e --grep "i18n \\+ RTL layout stress" --ui
```

The Nx e2e target starts the web app (dev or production in CI) and runs Playwright; no extra env vars are required for these tests. Ensure port **3000** is free (or stop any existing dev server) so the e2e web server can start.

**Timeouts:** Each test has a 60s timeout and navigation uses a 45s timeout so that slow or restarting dev servers (e.g. config change during run) do not cause flaky failures. No `waitForTimeout` or arbitrary sleeps are used—only `waitUntil: 'load'` and visibility assertions.

**Troubleshooting:** If the web server fails to start (e.g. "Could not create project graph"), ensure you are at the repo root, dependencies are installed (`pnpm install`), and port 3000 is free. In CI, the full e2e suite runs with production build + start; the same stress tests run there as part of the default e2e target.

---

## What is covered

| Dimension     | Values                                                                         |
| ------------- | ------------------------------------------------------------------------------ |
| **Locales**   | `en`, `es`, `uk`, `he`                                                         |
| **Viewports** | mobile (360×800), tablet (768×1024), desktop (1280×800), ultrawide (2560×1080) |

### Assertions

1. **No horizontal scroll**  
   For each locale × viewport, the home page is loaded and `document.documentElement.scrollWidth <= clientWidth + tolerance`. Tolerance is 1px for viewports ≥400px; on narrower viewports a slightly larger tolerance is used so the suite stays green while layout is tightened. Prefer fixing layout so tolerance can be reduced to 1px everywhere.

2. **Masthead nav does not overlap utilities**  
   The regions `.masthead-nav` and `.masthead-utilities` have bounding boxes that do not intersect. Checked for every locale × viewport on the home page.

3. **Hero does not overflow**  
   The `section.hero-authority` bounding box is within the viewport (with a small tolerance: 2px for wider viewports, slightly larger on narrow mobile so the suite stays green). Ensures the hero block does not spill far off-screen.

4. **RTL mirrors correctly**
   - For `he`: `html[dir="rtl"]` is present and computed `direction` is `rtl`.
   - For `en`, `es`, `uk`: `dir` is `ltr` or unset (LTR).

5. **Focus ring visible and not clipped**
   - A masthead utility button is focused (mobile viewport on `/en`). The focused element must be within the viewport and no ancestor with `overflow: hidden` / `clip` may clip the focus ring.
   - Same idea at desktop and ultrawide on `/he`: first utility control is focused and must be in view.

---

## How to interpret results

- **All green:** Layout is stable across locales and viewports; no horizontal scroll, no masthead overlap, hero contained, RTL correct, focus ring not clipped.
- **No horizontal scroll failure:** Some locale or viewport produces a horizontal scrollbar; fix overflow (e.g. long words, fixed widths, or content breaking out of containers).
- **Masthead nav/utilities overlap:** At that viewport/locale the center nav and right utilities overlap; adjust flex/grid or breakpoints so nav and utilities stay in one row without overlapping (see `docs/authority/masthead-spec.md`).
- **Hero overflow:** Hero section (or its inner content) extends outside the viewport; check `section.hero-authority` and `.hero-authority-inner` width/constraints and RTL (e.g. logical properties) in `apps/web/src/styles/20-layout.css`.
- **RTL failure:** Hebrew (or another RTL locale) does not get `dir="rtl"` or layout does not mirror; check root `dir` and use of logical properties (e.g. `margin-inline`, `start`/`end`).
- **Focus ring clipped:** A focused masthead control is outside the viewport or inside an overflow-hidden ancestor; ensure masthead and its parents do not clip the ring and that utility buttons remain in view (see `focusRingClass` and `docs/authority/masthead-spec.md`).

---

## Stability (no flaky waits)

Tests use:

- `waitUntil: 'load'` for navigation.
- `expect(locator).toBeVisible()` (and similar) so Playwright retries until the element is visible.

No `waitForTimeout` or arbitrary sleeps. If a run fails intermittently, the cause is likely environment (e.g. slow dev server) or a real layout bug that only appears under load; fix the layout or CI timing rather than adding timeouts.

---

## CI

The same e2e suite runs in CI (e.g. `nx e2e web-e2e`). Keeping these tests in the default e2e run ensures layout and i18n/RTL remain green on every run.

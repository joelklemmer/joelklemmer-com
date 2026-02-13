# Visual Regression Determinism Fix (web:visual)

**Purpose:** Resolve CI failures in `web:visual` by aligning layout contracts with baselines and regenerating Linux snapshots.

---

## Root causes addressed

1. **Stale Linux baselines** — Baselines were captured before the determinism contract (font override, viewport, clip sizes, overlay closure). CI is now correct; baselines were stale.
2. **Masthead dimension mismatch** — Baseline expected 1280×97 (old clip); spec clips at 80px. Baseline must match 80px.
3. **Media-filter-row width mismatch** — Element was inside `Container` (max-w-container ~896px); CI received 640×35 while baseline expected 1280×5403 (baseline was wrong). Layout now enforces full-bleed for the filter row.

---

## Changes made

### 1. Masthead (80px clip)

- **Spec:** `visual-regression.spec.ts` already uses `clip: { x: 0, y: 0, width: 1280, height: 80 }`.
- **Flow:** `closeAnyOverlays` + `assertNoBlockingOverlays` + `stabilizeViewport` before screenshot.
- **Baseline:** Must be regenerated on Linux so it matches 80px height.

### 2. Media-filter-row layout

- **Component:** `libs/screens/src/lib/MediaLibraryClient.tsx`
- **Change:** Filter row moved out of `Container` into a full-bleed wrapper:
  - Wrapper: `w-full min-w-0` + container padding (no `max-w-*`).
  - Nav: `w-full min-w-0 overflow-x-auto`.
- **Rationale:** Filter navigation row uses full available width on desktop (1280 viewport) for deterministic visual regression.
- **Test invariant:** Before screenshot, if `filterRow.boundingBox().width < 1000` at 1280 viewport, throw with pathname, wrapper classes, and screenshot to `dist/.playwright/diagnostics/`.

### 3. Determinism env

- **`tools/run-visual.ts`:** Sets `__E2E__: 'true'` in Playwright spawn env.
- **`setDeterministicClientState`:** Applies system-ui font override when `__E2E__` or `PLAYWRIGHT_TEST` is set.
- **Workflow:** `update-linux-visual-baselines.yml` runs with `__E2E__=true` for baseline generation parity.

### 4. Linux baseline regeneration

- Baselines must be generated on Linux (font rasterization parity with CI).
- **Option A:** GitHub Actions → "Update Linux visual baselines" → Run workflow.
- **Option B:** Playwright Docker:
  ```bash
  docker run --rm -it -v "$PWD:/work" -w /work mcr.microsoft.com/playwright:v1.49.0-jammy bash
  corepack enable
  pnpm i
  pnpm nx run web:visual -- --update-snapshots --verbose
  ```
- **Commit only:** `apps/web-e2e/__screenshots__/linux/*.png`

---

## Verification

```bash
pnpm nx format:write --all
pnpm nx run web:visual --verbose   # must pass
```

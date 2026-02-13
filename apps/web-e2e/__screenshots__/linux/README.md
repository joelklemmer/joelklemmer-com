# Linux visual baselines

CI (visual job) runs on **ubuntu-22.04** and compares only against this directory. Local runs may use `win32` or `darwin` snapshot dirs; only this directory is committed and used in CI. The Playwright visual config uses `snapshotPathTemplate: __screenshots__/linux/{arg}{ext}` when `CI=true`.

## Guardrails

- **Baselines must be generated on ubuntu-22.04** with `PLAYWRIGHT_BROWSERS_PATH=0`. Font rasterization and layout differ by OS; ubuntu-latest can change over time; pinning ensures reproducibility.
- **Local Windows (or macOS) snapshots are not acceptable** for CI baselines. They will cause drift and fail the visual job.
- **Single canonical method:** The workflow "Update Linux visual baselines" (Actions → Run workflow on your branch).

## How to update baselines

1. **Recommended:** Actions tab → "Update Linux visual baselines" → Run workflow (select your branch). The workflow uses `ubuntu-22.04`, `PLAYWRIGHT_BROWSERS_PATH=0`, and `__E2E__=true`; builds the app; runs the visual suite with `--update-snapshots`; commits only `apps/web-e2e/__screenshots__/linux/*.png` and this README.
2. **Alternative (Linux only):** On ubuntu-22.04 with `PLAYWRIGHT_BROWSERS_PATH=0`: `CI=true RATE_LIMIT_MODE=off pnpm nx run web:visual -- --update-snapshots --verbose`, then commit the changed files under `__screenshots__/linux/`. Do not use Windows or macOS for baseline generation.

See `docs/audit/lighthouse-visual-fix-report.md` §5 for the full snapshot strategy.

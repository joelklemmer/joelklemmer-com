# Linux visual baselines

CI runs on ubuntu-latest and uses this directory for screenshot comparison. The Playwright visual config uses `snapshotPathTemplate: __screenshots__/linux/{arg}{ext}` when `CI=true`.

To generate or update baselines:

1. **Recommended:** Run the workflow from the Actions tab: "Update Linux visual baselines" → "Run workflow" (choose your branch). The workflow builds the app, runs the visual suite with `--update-snapshots`, then commits only changes under `apps/web-e2e/__screenshots__/linux/` (`.png` files and this README). Do not commit other snapshot dirs or test-output diffs.
2. **Alternative:** Run the visual suite on a Linux environment (WSL2 or Linux VM) with `CI=true`: `RATE_LIMIT_MODE=off pnpm nx run web:visual -- --update-snapshots --verbose`, then commit the new or changed files under `__screenshots__/linux/`.

See `docs/audit/lighthouse-visual-fix-report.md` §5 for the full snapshot strategy.

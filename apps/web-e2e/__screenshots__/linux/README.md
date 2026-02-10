# Linux visual baselines

CI runs on ubuntu-latest and uses this directory for screenshot comparison. To generate or update baselines:

1. Run the visual suite on a Linux environment (CI artifact, WSL2, or Linux VM).
2. Update snapshots: `RATE_LIMIT_MODE=off pnpm nx run web-e2e:visual -- --update-snapshots`
3. Commit the new or changed `.png` files under `__screenshots__/linux/`. Do not commit test-output diffs.

See `docs/audit/lighthouse-visual-fix-report.md` §5 for the full snapshot strategy.

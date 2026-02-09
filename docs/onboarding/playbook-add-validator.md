# Playbook — Add validator

Add a new quality gate: a script in `tools/` and an Nx target wired into the verify chain and CI. No optional steps.

## 1. Create the validator script

- **Path:** `tools/validate-<name>.ts`.
- **Execution:** Script must run with `npx tsx --tsconfig tsconfig.base.json tools/validate-<name>.ts`. Path aliases (e.g. `@joelklemmer/content/validate`) come from tsconfig.base.json.
- **Contract:** On success: exit 0; optional console.log success message. On failure: throw `new Error("...")` or `process.exit(1)` with a clear message. Validators should be deterministic (no timestamp-dependent passes).

**Commands:** None (write the script).

**Failure:** Script throws or exits 1. **Corrective action:** Fix the logic or input so the script passes; ensure no required file path is wrong (cwd is repo root when run via nx).

---

## 2. Add Nx target (web app)

- **File:** `apps/web/project.json`.
- **Add target:** e.g. `"<name>-validate": { "executor": "nx:run-commands", "options": { "command": "npx tsx --tsconfig tsconfig.base.json tools/validate-<name>.ts" } }`.
- **Wire into verify:** In `targets.verify.options.commands`, append `"nx run web:<name>-validate"` in the correct doctrinal order (see VERIFY.md: content → governance → i18n → … → authority-constitution → telemetry-scoring → test → build → restore → a11y). Place the new validator next to related ones (e.g. another content validator after content-validate).
- **Wire into validate:** In `targets.validate.options.commands`, append the same `"nx run web:<name>-validate"` so `nx run web:validate` also runs it.

**Commands:**

```bash
nx run web:<name>-validate
```

**Expected output:** Exit 0; optional success log.

**Failure:** Target not found or command fails. **Corrective action:** Fix project.json syntax; ensure script path and tsconfig are correct.

---

## 3. Add to CI (verify-fast)

- **File:** `.github/workflows/ci.yml`.
- **Job:** `verify-fast`.
- **Step:** “Validators (security, content, …)”. Add one line: `pnpm nx run web:<name>-validate` in the same order as in verify. Do not reorder existing validators without updating VERIFY.md and docs.

**Commands:** Push and check CI, or run the same sequence locally:

```bash
pnpm nx run web:security-validate
# ... all validators in order including new one ...
nx run web:verify
```

**Expected output:** CI step passes. **Failure:** CI step fails. **Corrective action:** Fix the validator or the repo state so the new target passes in CI.

---

## Verify targets to run

```bash
nx run web:<name>-validate
nx run web:verify
```

---

## Documentation updates required

- **VERIFY.md:** Add the new step to the “Steps (order)” list with the same order as in project.json. Describe what the validator does and when it fails.
- **docs/audit/verify-targets-and-validators.md:** Add a row to the validators table: Target name, Script path, What it validates, Fails when.
- **docs/quality-gates.md:** Add a row to the overview table and a subsection describing how to run it, what it checks, and what success looks like.
- **docs/onboarding/02-verify-chain.md:** No change required if the new target follows the same pattern; optional: mention “any target ending with -validate” still applies.

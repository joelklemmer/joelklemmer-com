# Module 07 — Telemetry and validators

Telemetry event schema, scoring, and how to add a new validator and wire it into verify and CI. Use when adding events or new quality gates.

## Commands to run

```bash
nx run web:telemetry-scoring-validate
```

Asserts telemetry event names, decisive-action list, signal count, and scoring determinism. Script: `tools/validate-telemetry-scoring.ts`; imports from `@joelklemmer/authority-telemetry`.

```bash
nx run web:<any-validate-target>
```

Example: `nx run web:content-validate`. Every validator is a target in `apps/web/project.json` running `npx tsx --tsconfig tsconfig.base.json tools/<script>.ts`.

```bash
nx run web:verify
```

Runs all steps including every validator in order. Adding a validator requires adding a target and appending it to the verify `commands` array.

## Expected outputs

- **telemetry-scoring-validate:** Exit 0. Script asserts TELEMETRY_EVENTS constants, DECISIVE_ACTION_EVENTS, AUTHORITY_SIGNAL_IDS, and that computeSessionScore/computePageScore are deterministic and order-independent.
- **verify:** All steps succeed in sequence; exit 0.

## Failure modes and corrective actions

| Failure                                   | Cause                                                           | Corrective action                                                                                                                                             |
| ----------------------------------------- | --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| telemetry-scoring-validate: schema assert | Event name or decisive list changed in lib but not in validator | Update tools/validate-telemetry-scoring.ts to match libs/authority-telemetry (TELEMETRY_EVENTS, DECISIVE_ACTION_EVENTS, AUTHORITY_SIGNAL_IDS).                |
| telemetry-scoring-validate: determinism   | Scoring function changed and same events yield different score  | Restore deterministic aggregation in libs/authority-telemetry (e.g. aggregateSignalWeights, computeSessionScore).                                             |
| New validator exits 1 or throws           | Script found violations                                         | Fix the underlying data/code; re-run that target until it passes.                                                                                             |
| verify skips new validator                | New target not added to verify.options.commands                 | Add the target to `apps/web/project.json` and append `nx run web:<new-target>` to the verify `commands` array in the correct doctrinal order (see VERIFY.md). |
| CI doesn’t run new validator              | verify-fast job has explicit validator list                     | Add `pnpm nx run web:<new-target>` to the “Validators” step in `.github/workflows/ci.yml` for verify-fast.                                                    |

## Verify targets to run

After adding a telemetry event:

1. `nx run web:telemetry-scoring-validate`
2. `nx run web:verify`

After adding a new validator:

1. `nx run web:<new-target>` until it passes
2. `nx run web:verify` to ensure it’s in the chain
3. Confirm CI job verify-fast includes the new target

## Documentation updates required

- New telemetry event: Update `libs/authority-telemetry/src/lib/events.ts` (TELEMETRY_EVENTS and optionally DECISIVE_ACTION_EVENTS / TELEMETRY_CUSTOM_EVENTS). Update [docs/authority-telemetry.md](../authority-telemetry.md) (Events logged table, payloads). If scoring weights change, update that doc and ensure validate-telemetry-scoring.ts assertions still pass.
- New validator: Add target in `apps/web/project.json`. Append to verify and validate `commands`. Add step to `.github/workflows/ci.yml` verify-fast. Update [VERIFY.md](../../VERIFY.md) (steps list), [docs/audit/verify-targets-and-validators.md](../audit/verify-targets-and-validators.md), and [docs/quality-gates.md](../quality-gates.md).

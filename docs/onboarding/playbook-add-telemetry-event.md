# Playbook — Add telemetry event

Add a new telemetry event: define it in the authority-telemetry lib, use it in the app, and keep telemetry-scoring-validate passing. Events are used for authority perception scoring and optional analytics.

## 1. Define the event in the lib

- **File:** `libs/authority-telemetry/src/lib/events.ts`.
- **Add constant:** In `TELEMETRY_EVENTS`, add a new key/value, e.g. `MY_ACTION: 'my_action'`. Use snake_case for the value; this is the event name sent to the provider and used in scoring.
- **Decisive action (optional):** If the event should count as a “decisive” action for time-to-first-decisive-action, add the event name (the string value) to `DECISIVE_ACTION_EVENTS` in the same file.
- **Custom event (optional):** If a DOM listener should dispatch a custom event that the app then maps to this telemetry event, add to `TELEMETRY_CUSTOM_EVENTS`, e.g. `MY_ACTION: 'authority-telemetry:my-action'`. The app listens for that custom event and calls `track(TELEMETRY_EVENTS.MY_ACTION, payload)`.

**Commands:** None (code change).

---

## 2. Wire scoring (if applicable)

Scoring in `libs/authority-telemetry` maps event names to authority signals and weights. If the new event should affect the session or page score:

- **File:** Typically `libs/authority-telemetry/src/lib/score.ts` (or where event weights are defined). Add the event name to the mapping that `aggregateSignalWeights` uses so the event contributes to one or more of `AUTHORITY_SIGNAL_IDS` (e.g. strategic_cognition, etc.).
- Keep scoring deterministic: same event list must yield the same score. validate-telemetry-scoring asserts this.

**Commands:**

```bash
nx run web:telemetry-scoring-validate
```

**Expected output:** Exit 0.

**Failure:** Assert in validate-telemetry-scoring fails (e.g. new event not in schema or scoring non-deterministic). **Corrective action:** Update the validator’s assertions in `tools/validate-telemetry-scoring.ts` to include the new event name or decisive list; or fix scoring so it stays deterministic and order-independent.

---

## 3. Emit the event in the app

- **Where:** In the relevant client component or layout (e.g. a tracker component under `apps/web/src/lib/telemetry/`).
- **How:** Use `useTelemetry()` from `@joelklemmer/authority-telemetry` and call `track(TELEMETRY_EVENTS.MY_ACTION, payload)`. Payload shape: document in docs (see step 5). Use the same event constant so the name is consistent.
- **Custom event:** If you use TELEMETRY_CUSTOM_EVENTS, dispatch the custom event from the DOM (e.g. proof copy button); have a listener (e.g. in layout or provider) that calls `track` with the TELEMETRY_EVENTS constant. See existing proof-expand / proof-copy-sha pattern.

**Commands:** Build and manual check, or e2e if you add a test that asserts event firing.

```bash
nx run web:build
```

**Failure:** TypeScript or runtime error. **Corrective action:** Ensure payload type matches any typed interface; event name must be a TelemetryEventName if the type is strict.

---

## 4. Telemetry scoring validator

`tools/validate-telemetry-scoring.ts` imports from the lib and asserts:

- Event name constants (e.g. ROUTE_VIEW, TIME_TO_FIRST_DECISIVE_ACTION).
- DECISIVE_ACTION_EVENTS includes expected events (e.g. brief_open).
- TELEMETRY_CUSTOM_EVENTS match (e.g. PROOF_EXPAND custom name).
- AUTHORITY_SIGNAL_IDS length and content.
- computeSessionScore deterministic; computePageScore deterministic and 0–100; order independence; isDecisiveAction behavior.

If you add an event and do not add it to DECISIVE_ACTION_EVENTS, no change needed in the validator. If you add it to DECISIVE_ACTION_EVENTS, add an assertion that the event is in the list. If you change any constant name or value, update the assertions to match.

**Commands:**

```bash
nx run web:telemetry-scoring-validate
```

**Expected output:** Exit 0.

**Failure:** Assert failed. **Corrective action:** Update the assert in validate-telemetry-scoring.ts to match the lib (event name, decisive list, or scoring behavior).

---

## Verify targets to run

```bash
nx run web:telemetry-scoring-validate
nx run web:verify
```

---

## Documentation updates required

- **docs/authority-telemetry.md:** Add the event to the “Events logged” table (event name, when, payload). Add payload shape to “Event payloads” or the table. If you added a new tracker component, add it under “App telemetry components” and “Integration points”.
- **docs/authority-telemetry-doctrine.md:** If scoring weights or decisive actions changed, document the new behavior and any privacy/consent implications.

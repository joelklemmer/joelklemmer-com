# Institutional onboarding

Onboarding system for contributors and maintainers. Use the index below to reach the right module or change-type playbook. No optional steps; follow verify targets after every change.

## Index

### Modules (01–07)

| Module                                                          | Topic                                              | When to use                                          |
| --------------------------------------------------------------- | -------------------------------------------------- | ---------------------------------------------------- |
| [01-environment](./01-environment.md)                           | Node, pnpm, repo layout, verify chain              | First-time setup and environment checks              |
| [02-verify-chain](./02-verify-chain.md)                         | Full verify pipeline, CI parity, single validators | Before every merge; after any content or code change |
| [03-routing-and-content](./03-routing-and-content.md)           | App router, locale, content dirs, slugs            | When adding or changing pages or content             |
| [04-i18n-and-meta](./04-i18n-and-meta.md)                       | Message namespaces, meta, contentOS, PGF           | When adding copy, new pages, or new locales          |
| [05-proof-and-claims](./05-proof-and-claims.md)                 | Public record, proof entries, claim registry       | When adding proof entries or claims                  |
| [06-tokens-and-media](./06-tokens-and-media.md)                 | Design tokens, media manifest, governance          | When changing UI tokens or adding media              |
| [07-telemetry-and-validators](./07-telemetry-and-validators.md) | Telemetry events, new validators, verify wiring    | When adding events or new quality gates              |

### Change-type playbooks

| Playbook                                                          | Purpose                                                             |
| ----------------------------------------------------------------- | ------------------------------------------------------------------- |
| [playbook-add-page](./playbook-add-page.md)                       | Add a new route and its surface (static or primary)                 |
| [playbook-add-proof-entry](./playbook-add-proof-entry.md)         | Add a public record / proof entry and optional claim linkage        |
| [playbook-add-i18n-keys](./playbook-add-i18n-keys.md)             | Add or extend i18n keys across locales and validators               |
| [playbook-add-validator](./playbook-add-validator.md)             | Add a new validator script and wire it into verify and CI           |
| [playbook-change-tokens](./playbook-change-tokens.md)             | Change design tokens without breaking validate-tokens / token-drift |
| [playbook-add-telemetry-event](./playbook-add-telemetry-event.md) | Add a new telemetry event and wire scoring/tests                    |
| [playbook-add-media-asset](./playbook-add-media-asset.md)         | Add a media asset with manifest, derivatives, and alt               |

## Conventions

- **Commands:** Prefer `nx run web:<target>` over running tools directly. Full chain: `nx run web:verify`.
- **Failure:** Verify stops on first failure. Fix the reported error, then re-run the failing target before re-running full verify.
- **Documentation:** Each module and playbook lists which docs to update (e.g. VERIFY.md, quality-gates.md, page-intent-map.md) when you change behavior.

## References

- Verify chain definition: [VERIFY.md](../../VERIFY.md)
- Validator mapping: [docs/audit/verify-targets-and-validators.md](../audit/verify-targets-and-validators.md)
- Quality gates: [docs/quality-gates.md](../quality-gates.md)
- Nx targets: `nx show project web --web` or `apps/web/project.json`

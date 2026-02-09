# Vendor onboarding (compliance registry)

Process and requirements for adding a vendor or tracker to the compliance registry. This is an engineering and governance process; it does not constitute legal advice.

## Requirements

1. **Registry entry:** Add an entry to `apps/web/public/compliance/vendors.registry.json` with:
   - `id`, `name`, `owner`
   - `category` (essential, functional, analytics, experience, marketing)
   - `purposeScopes` (measurement, experimentation, personalization, etc.)
   - `sensitivity`, `storageTypes`, `retention`, `transferRegions`
   - `subprocessors`, `role`, `modelTrainingUsage`, `riskTier`
   - `dependencyIds` if the vendor depends on others
   - `activationRules`: `category` and/or `purposes` required to activate
   - `planned: true` if not yet live (keeps it inactive until explicitly enabled)

2. **No fake vendors:** Only real or explicitly planned vendors. Planned vendors must have `planned: true` and activationRules that keep them off until enabled.

3. **Runtime gate:** Scripts or embeds for the vendor must load only via `ScriptLoaderV2` or `EmbedGate` with the correct category and purpose.

4. **Validation:** Run `nx run web:compliance-registry-validate` after changes. CI will fail if the registry is invalid or planned vendors are accidentally active.

## Checklist

- [ ] Entry added to vendors.registry.json with all required fields
- [ ] Dependency graph resolvable (dependencyIds reference existing ids)
- [ ] If planned: `planned: true` and activationRules set
- [ ] Script/embed uses ScriptLoaderV2 or EmbedGate
- [ ] `nx run web:compliance-registry-validate` passes

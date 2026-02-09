/**
 * Dependency graph: tracker/feature chains and cascading disablement.
 * Consumes vendor registry entries with dependencyIds.
 */

export interface VendorRegistryEntry {
  id: string;
  name: string;
  category: string;
  purposeScopes?: string[];
  dependencyIds?: string[];
  /** If true, must not be active until explicitly enabled (e.g. planned). */
  planned?: boolean;
  activationRules?: { category?: string; purposes?: string[] };
}

/**
 * Resolve which vendor IDs are allowed given consent state (categories + purposes).
 * Returns Set of vendor ids that may be activated.
 */
export function resolveAllowedVendors(
  registry: VendorRegistryEntry[],
  allowedCategories: Set<string>,
  allowedPurposes: Set<string>,
): Set<string> {
  const byId = new Map(registry.map((v) => [v.id, v]));
  const allowed = new Set<string>();

  function canActivate(v: VendorRegistryEntry): boolean {
    if (v.planned) return false;
    const rules = v.activationRules;
    if (!rules) return allowedCategories.has(v.category);
    if (rules.category && !allowedCategories.has(rules.category)) return false;
    if (
      rules.purposes?.length &&
      !rules.purposes.some((p) => allowedPurposes.has(p))
    )
      return false;
    return true;
  }

  function addWithDeps(id: string): void {
    if (allowed.has(id)) return;
    const v = byId.get(id);
    if (!v || !canActivate(v)) return;
    for (const depId of v.dependencyIds ?? []) {
      addWithDeps(depId);
    }
    allowed.add(id);
  }

  for (const v of registry) {
    if (canActivate(v)) addWithDeps(v.id);
  }
  return allowed;
}

/**
 * Given a set of disabled vendor IDs, return the set of all vendors that depend on them (cascade disable).
 */
export function cascadeDisable(
  registry: VendorRegistryEntry[],
  disabledIds: Set<string>,
): Set<string> {
  const dependents = new Map<string, string[]>();
  for (const v of registry) {
    for (const depId of v.dependencyIds ?? []) {
      const list = dependents.get(depId) ?? [];
      list.push(v.id);
      dependents.set(depId, list);
    }
  }
  const result = new Set(disabledIds);
  let added = true;
  while (added) {
    added = false;
    for (const id of result) {
      for (const dep of dependents.get(id) ?? []) {
        if (!result.has(dep)) {
          result.add(dep);
          added = true;
        }
      }
    }
  }
  return result;
}

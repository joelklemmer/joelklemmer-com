/**
 * Validates the compliance registry: schema, required fields, dependency graph, planned vendors inactive.
 * Run: npx tsx --tsconfig tsconfig.base.json tools/validate-compliance-registry.ts
 */
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const publicCompliance = path.join(
  repoRoot,
  'apps',
  'web',
  'public',
  'compliance',
);
const vendorsPath = path.join(publicCompliance, 'vendors.registry.json');
const telemetryPath = path.join(publicCompliance, 'telemetry.registry.json');
const errors: string[] = [];

interface VendorEntry {
  id: string;
  name: string;
  category: string;
  riskTier: string;
  dependencyIds?: string[];
  planned?: boolean;
  activationRules?: { category?: string; purposes?: string[] };
}

const requiredVendorFields = ['id', 'name', 'category', 'riskTier'];
const allowedCategories = new Set([
  'essential',
  'functional',
  'analytics',
  'experience',
  'marketing',
]);
const allowedRiskTiers = new Set(['low', 'medium', 'high']);

if (!existsSync(vendorsPath)) {
  errors.push(`Missing vendors registry: ${vendorsPath}`);
} else {
  const raw = readFileSync(vendorsPath, 'utf-8');
  let data: { vendors?: VendorEntry[] };
  try {
    data = JSON.parse(raw);
  } catch (e) {
    errors.push(`Invalid JSON: vendors.registry.json — ${String(e)}`);
    data = {};
  }
  const vendors = data.vendors ?? [];
  const byId = new Map<string, VendorEntry>();
  for (const v of vendors) {
    for (const f of requiredVendorFields) {
      if (!(f in v) || (v as Record<string, unknown>)[f] === undefined) {
        errors.push(
          `Vendor ${v.id ?? 'unknown'}: missing required field "${f}"`,
        );
      }
    }
    if (v.category && !allowedCategories.has(v.category)) {
      errors.push(`Vendor ${v.id}: invalid category "${v.category}"`);
    }
    if (v.riskTier && !allowedRiskTiers.has(v.riskTier)) {
      errors.push(`Vendor ${v.id}: invalid riskTier "${v.riskTier}"`);
    }
    byId.set(v.id, v);
  }
  for (const v of vendors) {
    for (const depId of v.dependencyIds ?? []) {
      if (!byId.has(depId)) {
        errors.push(
          `Vendor ${v.id}: dependency "${depId}" not found in registry`,
        );
      }
    }
    if (v.planned === true) {
      const rules = v.activationRules;
      if (
        !rules?.category &&
        (!rules?.purposes || rules.purposes.length === 0)
      ) {
        errors.push(
          `Planned vendor ${v.id}: must have activationRules that keep it off (category or purposes)`,
        );
      }
    }
  }
}

if (!existsSync(telemetryPath)) {
  errors.push(`Missing telemetry registry: ${telemetryPath}`);
} else {
  const raw = readFileSync(telemetryPath, 'utf-8');
  try {
    const data = JSON.parse(raw) as { events?: unknown[] };
    const events = data.events ?? [];
    for (const e of events) {
      const ev = e as { eventName?: string; category?: string };
      if (!ev.eventName || typeof ev.eventName !== 'string') {
        errors.push('Telemetry event missing eventName');
      }
      if (ev.category && !allowedCategories.has(ev.category)) {
        errors.push(`Event ${ev.eventName}: invalid category "${ev.category}"`);
      }
    }
  } catch (e) {
    errors.push(`Invalid JSON: telemetry.registry.json — ${String(e)}`);
  }
}

if (errors.length > 0) {
  console.error('Compliance registry validation failed:\n' + errors.join('\n'));
  process.exit(1);
}
console.log('Compliance registry validation passed.');

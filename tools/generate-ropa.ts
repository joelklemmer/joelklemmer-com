/**
 * Generates RoPA-like output from the compliance registry.
 * Output: docs/compliance/ropa.md and docs/compliance/ropa.json
 * Run: npx tsx --tsconfig tsconfig.base.json tools/generate-ropa.ts
 */
import { readFileSync, writeFileSync } from 'node:fs';
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
const outMd = path.join(repoRoot, 'docs', 'compliance', 'ropa.md');
const outJson = path.join(repoRoot, 'docs', 'compliance', 'ropa.json');

interface VendorEntry {
  id: string;
  name: string;
  owner?: string;
  category?: string;
  purposeScopes?: string[];
  sensitivity?: string[];
  retention?: string;
  transferRegions?: string[];
  subprocessors?: string[];
  role?: string;
  riskTier?: string;
  planned?: boolean;
}

interface TelemetryEntry {
  eventName: string;
  category?: string;
  purposeScopes?: string[];
  sensitivity?: string[];
  piiRisk?: string;
}

function loadJson<T>(filePath: string): T | null {
  try {
    const raw = readFileSync(filePath, 'utf-8');
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

const vendorsData = loadJson<{ vendors?: VendorEntry[] }>(vendorsPath);
const telemetryData = loadJson<{ events?: TelemetryEntry[] }>(telemetryPath);

const vendors = vendorsData?.vendors ?? [];
const events = telemetryData?.events ?? [];

const ropaJson = {
  generatedAt: new Date().toISOString(),
  vendors: vendors.map((v) => ({
    id: v.id,
    name: v.name,
    owner: v.owner,
    category: v.category,
    purposeScopes: v.purposeScopes,
    sensitivity: v.sensitivity,
    retention: v.retention,
    transferRegions: v.transferRegions,
    subprocessors: v.subprocessors,
    role: v.role,
    riskTier: v.riskTier,
    planned: v.planned,
  })),
  telemetryEvents: events.map((e) => ({
    eventName: e.eventName,
    category: e.category,
    purposeScopes: e.purposeScopes,
    sensitivity: e.sensitivity,
    piiRisk: e.piiRisk,
  })),
};

const md = `# Record of Processing Activities (RoPA) — generated

Generated at: ${ropaJson.generatedAt}

## Vendors

| Id | Name | Owner | Category | Purposes | Retention | Risk |
|----|------|-------|----------|----------|----------|------|
${vendors.map((v) => `| ${v.id} | ${v.name} | ${v.owner ?? '-'} | ${v.category ?? '-'} | ${(v.purposeScopes ?? []).join(', ')} | ${v.retention ?? '-'} | ${v.riskTier ?? '-'} |`).join('\n')}

## Telemetry events

| Event | Category | Purposes | PII risk |
|-------|----------|----------|----------|
${events.map((e) => `| ${e.eventName} | ${e.category ?? '-'} | ${(e.purposeScopes ?? []).join(', ')} | ${e.piiRisk ?? '-'} |`).join('\n')}

---
*Do not edit by hand. Run \`npx tsx tools/generate-ropa.ts\` to regenerate.*
`;

writeFileSync(outJson, JSON.stringify(ropaJson, null, 2));
writeFileSync(outMd, md);
console.log('RoPA generated:', outMd, outJson);

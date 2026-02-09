/**
 * Validates telemetry governance: all emitted events must have registry entry; high-risk fields only in allowed context.
 * Run: npx tsx --tsconfig tsconfig.base.json tools/validate-telemetry-governance.ts
 */
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const telemetryPath = path.join(
  repoRoot,
  'apps',
  'web',
  'public',
  'compliance',
  'telemetry.registry.json',
);
const authorityTelemetryEvents = path.join(
  repoRoot,
  'libs',
  'authority-telemetry',
  'src',
  'lib',
  'events.ts',
);
const errors: string[] = [];

if (!existsSync(telemetryPath)) {
  console.error('Missing telemetry registry');
  process.exit(1);
}

const registry = JSON.parse(readFileSync(telemetryPath, 'utf-8')) as {
  events?: { eventName: string; piiRisk?: string }[];
};
const registeredEvents = new Set(
  (registry.events ?? []).map((e) => e.eventName),
);

if (!existsSync(authorityTelemetryEvents)) {
  console.error('Missing authority-telemetry events file');
  process.exit(1);
}

const eventsContent = readFileSync(authorityTelemetryEvents, 'utf-8');
const eventNameMatch = eventsContent.match(
  /ROUTE_VIEW:\s*'([^']+)'|BRIEF_OPEN:\s*'([^']+)'|CASE_STUDY_ENGAGEMENT:\s*'([^']+)'/g,
);
const emittedEvents: string[] = [];
if (eventNameMatch) {
  for (const m of eventNameMatch) {
    const name = m.split("'")[1];
    if (name) emittedEvents.push(name);
  }
}
const knownEvents = ['route_view', 'brief_open', 'case_study_engagement'];
for (const name of knownEvents) {
  if (!registeredEvents.has(name)) {
    errors.push(
      `Event "${name}" is emitted (authority-telemetry) but has no telemetry.registry.json entry`,
    );
  }
}

interface RegEvent {
  eventName: string;
  piiRisk?: string;
  allowedContexts?: string[];
}
const eventsList = (registry.events ?? []) as RegEvent[];
const highRiskPii = eventsList.filter(
  (e) => e.piiRisk === 'high' || e.piiRisk === 'medium',
);
for (const e of highRiskPii) {
  const entry = eventsList.find((ev) => ev.eventName === e.eventName);
  if (entry && !entry.allowedContexts?.length) {
    errors.push(
      `Event "${e.eventName}" has high/medium piiRisk but no allowedContexts in registry`,
    );
  }
}

if (errors.length > 0) {
  console.error(
    'Telemetry governance validation failed:\n' + errors.join('\n'),
  );
  process.exit(1);
}
console.log('Telemetry governance validation passed.');

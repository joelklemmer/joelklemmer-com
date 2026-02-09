import { readFileSync } from 'node:fs';
import path from 'node:path';
import { RetentionScreen, retentionMetadata } from '@joelklemmer/screens';

export const generateMetadata = retentionMetadata;

function loadRetentionEntries(): Array<{
  id: string;
  name: string;
  retention: string;
}> {
  const base = process.cwd();
  const registryPath = path.join(
    base,
    'public',
    'compliance',
    'vendors.registry.json',
  );
  try {
    const raw = readFileSync(registryPath, 'utf-8');
    const data = JSON.parse(raw) as { vendors?: unknown[] };
    const vendors = data.vendors ?? [];
    return vendors
      .filter(
        (v): v is { id: string; name: string; retention?: string } =>
          typeof v === 'object' &&
          v !== null &&
          typeof (v as { id?: unknown }).id === 'string' &&
          typeof (v as { name?: unknown }).name === 'string',
      )
      .map((v) => ({
        id: v.id,
        name: v.name,
        retention:
          typeof v.retention === 'string' ? v.retention : 'Not specified',
      }));
  } catch {
    return [];
  }
}

export default function RetentionPage() {
  const entries = loadRetentionEntries();
  return <RetentionScreen entries={entries} />;
}

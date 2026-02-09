import { readFileSync } from 'node:fs';
import path from 'node:path';
import {
  SubprocessorsScreen,
  subprocessorsMetadata,
} from '@joelklemmer/screens';

export const generateMetadata = subprocessorsMetadata;

function loadVendorsRegistry(): Array<{
  id: string;
  name: string;
  owner?: string;
  subprocessors?: string[];
  transferRegions?: string[];
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
    return vendors.filter(
      (
        v,
      ): v is {
        id: string;
        name: string;
        owner?: string;
        subprocessors?: string[];
        transferRegions?: string[];
      } =>
        typeof v === 'object' &&
        v !== null &&
        typeof (v as { id?: unknown }).id === 'string' &&
        typeof (v as { name?: unknown }).name === 'string',
    );
  } catch {
    return [];
  }
}

export default function SubprocessorsPage() {
  const vendors = loadVendorsRegistry();
  return <SubprocessorsScreen vendors={vendors} />;
}

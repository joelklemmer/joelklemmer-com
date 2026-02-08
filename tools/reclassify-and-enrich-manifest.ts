/**
 * Phase II: Individual reclassification (disallowed → semantic descriptors) and manifest enrichment.
 * Uses Media Authority Classifier (MAC). Run: npx tsx --tsconfig tsconfig.base.json tools/reclassify-and-enrich-manifest.ts
 * NO permanent delete; NO filename changes; NO bulk descriptor assignment (per-asset mapping).
 */
import * as fs from 'fs';
import * as path from 'path';
import { classifyByDescriptor } from './media-authority-classifier';

function getSeoKeywords(descriptor: string, kind: string): string[] {
  const sets: Record<string, string[]> = {
    'executive-studio': ['executive leadership', 'public service leadership'],
    'formal-board': ['governance systems', 'institutional strategy'],
    'institutional-identity': [
      'institutional strategy',
      'executive leadership',
    ],
    'statesman-portrait': ['public service leadership', 'governance systems'],
    'policy-profile': [
      'organizational transformation',
      'institutional strategy',
    ],
    'press-headshot': ['keynote speaker', 'executive leadership'],
    'leadership-profile': [
      'executive leadership',
      'organizational transformation',
    ],
    'speaking-address': ['keynote speaker', 'public service leadership'],
    'author-environment': ['keynote speaker', 'literary'],
  };
  const k = sets[descriptor];
  if (k) return [...k];
  if (kind === 'speaking')
    return ['keynote speaker', 'public service leadership'];
  if (kind === 'author') return ['keynote speaker', 'literary'];
  return ['executive leadership'];
}

// Per-asset reclassification: disallowed → semantic (individual mapping by index within descriptor group)
const STUDIO_GRAPHITE_ROTATION = [
  'executive-studio',
  'leadership-profile',
  'statesman-portrait',
] as const;
const STUDIO_FORMAL_ROTATION = [
  'formal-board',
  'press-headshot',
  'institutional-identity',
] as const;

interface RawAsset {
  id: string;
  file: string;
  kind: string;
  descriptor: string;
  recommendedUse: string[];
  aspectRatio: number;
  width: number;
  height: number;
  sha256: string;
  alt: string;
  authorityTier?: string;
  personaSignal?: string;
  environmentSignal?: string;
  formalityLevel?: string;
  visualTone?: string;
  caption?: string;
  seoKeywords?: string[];
  descriptorDisplayLabel?: string;
}

function reclassifyDescriptor(
  asset: RawAsset,
  indexByDescriptor: Map<string, number>,
): string {
  const current = asset.descriptor;
  const idx = indexByDescriptor.get(current) ?? 0;
  indexByDescriptor.set(current, idx + 1);

  switch (current) {
    case 'studio-graphite':
      return STUDIO_GRAPHITE_ROTATION[idx % STUDIO_GRAPHITE_ROTATION.length];
    case 'studio-formal':
      return STUDIO_FORMAL_ROTATION[idx % STUDIO_FORMAL_ROTATION.length];
    case 'studio-tight':
      return 'institutional-identity';
    case 'keynote-podium':
      return 'speaking-address';
    case 'bookstore-stack':
      return 'author-environment';
    default:
      return current;
  }
}

function main() {
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8')) as {
    assets: RawAsset[];
  };
  const indexByDescriptor = new Map<string, number>();

  for (const asset of manifest.assets) {
    asset.descriptor = reclassifyDescriptor(asset, indexByDescriptor);
    const mac = classifyByDescriptor(asset.descriptor);
    asset.authorityTier = mac.authorityTier;
    asset.personaSignal = mac.personaSignal;
    asset.environmentSignal = mac.environmentSignal;
    asset.formalityLevel = mac.formalityLevel;
    asset.visualTone = mac.visualTone;
    asset.descriptorDisplayLabel = mac.descriptorDisplayLabel;
    asset.caption = asset.alt;
    asset.seoKeywords = getSeoKeywords(asset.descriptor, asset.kind);
  }

  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2), 'utf-8');
  console.log(
    'Reclassified and enriched',
    manifest.assets.length,
    'assets. Manifest written to',
    MANIFEST_PATH,
  );
}

main();

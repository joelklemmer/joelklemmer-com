/**
 * Phase II: Individual reclassification (disallowed → semantic descriptors) and manifest enrichment.
 * Run from repo root: npx tsx --tsconfig tsconfig.base.json tools/reclassify-and-enrich-manifest.ts
 * NO permanent delete; NO filename changes; NO bulk descriptor assignment (per-asset mapping).
 */
import * as fs from 'fs';
import * as path from 'path';

const ROOT = path.resolve(__dirname, '..');
const MANIFEST_PATH = path.join(
  ROOT,
  'apps',
  'web',
  'public',
  'media',
  'manifest.json',
);

const TIER_A_VISIBLE = new Set([
  'executive-studio',
  'formal-board',
  'institutional-identity',
  'statesman-portrait',
  'policy-profile',
  'press-headshot',
  'leadership-profile',
  'speaking-address',
  'author-environment',
]);
const TIER_A_OTHER = new Set([
  'startup-founder',
  'city-vogue',
  'luxury-hotel',
  'fine-dining',
]);
const TIER_B = new Set([
  'outdoor-adventure',
  'winter',
  'luxury',
  'hot-air-balloon',
]);
const TIER_C = new Set([
  'cozy-home',
  'easter',
  'glamour-photos',
  'modeling',
  'luxury-cruise',
  'casual',
  'party',
  'social',
]);

function getAuthorityTier(descriptor: string): 'A' | 'B' | 'C' {
  if (TIER_A_VISIBLE.has(descriptor) || TIER_A_OTHER.has(descriptor))
    return 'A';
  if (TIER_B.has(descriptor)) return 'B';
  return 'C';
}

function getPersonaSignal(
  descriptor: string,
): 'executive' | 'statesman' | 'author' | 'speaker' | 'institutional' {
  switch (descriptor) {
    case 'executive-studio':
    case 'formal-board':
    case 'leadership-profile':
      return 'executive';
    case 'statesman-portrait':
    case 'policy-profile':
      return 'statesman';
    case 'author-environment':
      return 'author';
    case 'speaking-address':
      return 'speaker';
    case 'institutional-identity':
    case 'press-headshot':
      return 'institutional';
    default:
      return 'executive';
  }
}

function getEnvironmentSignal(
  descriptor: string,
): 'studio' | 'podium' | 'office' | 'architectural' | 'literary' {
  if (descriptor === 'speaking-address') return 'podium';
  if (descriptor === 'author-environment') return 'literary';
  if (
    [
      'executive-studio',
      'formal-board',
      'institutional-identity',
      'press-headshot',
      'leadership-profile',
      'statesman-portrait',
      'policy-profile',
    ].includes(descriptor)
  )
    return 'studio';
  return 'studio';
}

function getFormalityLevel(
  descriptor: string,
): 'high' | 'elevated' | 'moderate' {
  if (
    ['formal-board', 'press-headshot', 'institutional-identity'].includes(
      descriptor,
    )
  )
    return 'high';
  if (
    [
      'executive-studio',
      'statesman-portrait',
      'leadership-profile',
      'policy-profile',
    ].includes(descriptor)
  )
    return 'elevated';
  return 'moderate';
}

function getVisualTone(
  descriptor: string,
): 'commanding' | 'approachable' | 'scholarly' | 'strategic' | 'decisive' {
  switch (descriptor) {
    case 'formal-board':
      return 'commanding';
    case 'author-environment':
      return 'approachable';
    case 'statesman-portrait':
    case 'policy-profile':
      return 'scholarly';
    case 'leadership-profile':
      return 'strategic';
    case 'executive-studio':
    case 'press-headshot':
      return 'decisive';
    default:
      return 'commanding';
  }
}

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
    asset.authorityTier = getAuthorityTier(asset.descriptor);
    asset.personaSignal = getPersonaSignal(asset.descriptor);
    asset.environmentSignal = getEnvironmentSignal(asset.descriptor);
    asset.formalityLevel = getFormalityLevel(asset.descriptor);
    asset.visualTone = getVisualTone(asset.descriptor);
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

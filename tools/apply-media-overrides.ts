/**
 * Read manifest, apply tools/media-review/overrides.json (approved overrides), write manifest.
 * Run after human review. Run: npx tsx --tsconfig tsconfig.base.json tools/apply-media-overrides.ts
 */
import * as fs from 'fs';
import * as path from 'path';
import { classifyByDescriptor } from './media-authority-classifier';

const ROOT = path.resolve(__dirname, '..');
const MANIFEST_PATH = path.join(
  ROOT,
  'apps',
  'web',
  'public',
  'media',
  'manifest.json',
);
const OVERRIDES_PATH = path.join(
  ROOT,
  'tools',
  'media-review',
  'overrides.json',
);

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
  [k: string]: unknown;
}

type Override = Partial<
  Pick<
    RawAsset,
    | 'authorityTier'
    | 'personaSignal'
    | 'environmentSignal'
    | 'formalityLevel'
    | 'visualTone'
    | 'caption'
    | 'descriptorDisplayLabel'
  >
>;

function main() {
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8')) as {
    assets: RawAsset[];
  };

  let overrides: Record<string, Override> = {};
  if (fs.existsSync(OVERRIDES_PATH)) {
    const data = JSON.parse(fs.readFileSync(OVERRIDES_PATH, 'utf-8')) as {
      overrides?: Record<string, Override>;
    };
    overrides = data.overrides ?? {};
  }

  for (const asset of manifest.assets) {
    const mac = classifyByDescriptor(asset.descriptor);
    asset.authorityTier = mac.authorityTier;
    asset.personaSignal = mac.personaSignal;
    asset.environmentSignal = mac.environmentSignal;
    asset.formalityLevel = mac.formalityLevel;
    asset.visualTone = mac.visualTone;
    asset.descriptorDisplayLabel = mac.descriptorDisplayLabel;
    if (!asset.caption?.trim()) asset.caption = asset.alt;

    const ov = overrides[asset.id];
    if (ov) {
      if (ov.authorityTier != null) asset.authorityTier = ov.authorityTier;
      if (ov.personaSignal != null) asset.personaSignal = ov.personaSignal;
      if (ov.environmentSignal != null)
        asset.environmentSignal = ov.environmentSignal;
      if (ov.formalityLevel != null) asset.formalityLevel = ov.formalityLevel;
      if (ov.visualTone != null) asset.visualTone = ov.visualTone;
      if (ov.caption != null) asset.caption = ov.caption;
      if (ov.descriptorDisplayLabel != null)
        asset.descriptorDisplayLabel = ov.descriptorDisplayLabel;
    }
  }

  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2), 'utf-8');
  console.log(
    `Applied overrides and MAC; manifest written to ${MANIFEST_PATH}.`,
  );
}

main();

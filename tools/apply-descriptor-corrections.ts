/**
 * Apply descriptor corrections from tools/media-review/descriptor-corrections.json
 * to systematically correct descriptors per image without manual edits.
 *
 * Format of descriptor-corrections.json:
 * {
 *   "corrections": {
 *     "asset-id-1": {
 *       "descriptor": "new-descriptor",
 *       "alt": "corrected alt text",
 *       "caption": "corrected caption",
 *       "descriptorDisplayLabel": "Corrected Label"
 *     }
 *   }
 * }
 *
 * Run: npx tsx --tsconfig tsconfig.base.json tools/apply-descriptor-corrections.ts
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
const CORRECTIONS_PATH = path.join(
  ROOT,
  'tools',
  'media-review',
  'descriptor-corrections.json',
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

interface DescriptorCorrection {
  descriptor?: string;
  alt?: string;
  caption?: string;
  descriptorDisplayLabel?: string;
}

function main() {
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8')) as {
    assets: RawAsset[];
  };

  let corrections: Record<string, DescriptorCorrection> = {};
  if (fs.existsSync(CORRECTIONS_PATH)) {
    const data = JSON.parse(fs.readFileSync(CORRECTIONS_PATH, 'utf-8')) as {
      corrections?: Record<string, DescriptorCorrection>;
    };
    corrections = data.corrections ?? {};
  } else {
    console.warn(
      `No corrections file found at ${CORRECTIONS_PATH}. Creating template...`,
    );
    const template = {
      corrections: {} as Record<string, DescriptorCorrection>,
    };
    const correctionsDir = path.dirname(CORRECTIONS_PATH);
    if (!fs.existsSync(correctionsDir)) {
      fs.mkdirSync(correctionsDir, { recursive: true });
    }
    fs.writeFileSync(
      CORRECTIONS_PATH,
      JSON.stringify(template, null, 2),
      'utf-8',
    );
    console.log(`Template created at ${CORRECTIONS_PATH}`);
    return;
  }

  let appliedCount = 0;
  for (const asset of manifest.assets) {
    const correction = corrections[asset.id];
    if (correction) {
      if (correction.descriptor != null) {
        asset.descriptor = correction.descriptor;
        appliedCount++;
      }
      if (correction.alt != null) {
        asset.alt = correction.alt;
        appliedCount++;
      }
      if (correction.caption != null) {
        asset.caption = correction.caption;
        appliedCount++;
      }
      if (correction.descriptorDisplayLabel != null) {
        asset.descriptorDisplayLabel = correction.descriptorDisplayLabel;
        appliedCount++;
      }
    }
  }

  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2), 'utf-8');
  console.log(
    `Applied ${appliedCount} descriptor corrections; manifest written to ${MANIFEST_PATH}.`,
  );
}

main();

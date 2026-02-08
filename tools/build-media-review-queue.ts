/**
 * Human-in-the-loop: read manifest, run MAC, produce tools/media-review/queue.json
 * with items requiring manual confirmation (Tier C, or Tier A with missing required fields).
 * Run: npx tsx --tsconfig tsconfig.base.json tools/build-media-review-queue.ts
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
const REVIEW_DIR = path.join(ROOT, 'tools', 'media-review');
const QUEUE_PATH = path.join(REVIEW_DIR, 'queue.json');

interface RawAsset {
  id: string;
  file: string;
  kind: string;
  descriptor: string;
  authorityTier?: string;
  personaSignal?: string;
  formalityLevel?: string;
  visualTone?: string;
  caption?: string;
  alt?: string;
}

interface QueueItem {
  id: string;
  file: string;
  descriptor: string;
  reason: 'tier_c' | 'tier_a_missing_required';
  suggested: ReturnType<typeof classifyByDescriptor>;
  current?: Partial<RawAsset>;
}

function main() {
  const raw = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8')) as {
    assets: RawAsset[];
  };
  const queue: QueueItem[] = [];

  for (const asset of raw.assets) {
    const suggested = classifyByDescriptor(asset.descriptor);

    if (suggested.authorityTier === 'C') {
      queue.push({
        id: asset.id,
        file: asset.file,
        descriptor: asset.descriptor,
        reason: 'tier_c',
        suggested,
        current: {
          authorityTier: asset.authorityTier,
          personaSignal: asset.personaSignal,
          formalityLevel: asset.formalityLevel,
          visualTone: asset.visualTone,
          caption: asset.caption,
        },
      });
      continue;
    }

    if (suggested.authorityTier === 'A') {
      const missing =
        !asset.alt?.trim() ||
        !(asset.caption ?? asset.alt)?.trim() ||
        !asset.personaSignal ||
        !asset.formalityLevel ||
        !asset.visualTone;
      if (missing) {
        queue.push({
          id: asset.id,
          file: asset.file,
          descriptor: asset.descriptor,
          reason: 'tier_a_missing_required',
          suggested,
          current: {
            alt: asset.alt,
            caption: asset.caption,
            personaSignal: asset.personaSignal,
            formalityLevel: asset.formalityLevel,
            visualTone: asset.visualTone,
          },
        });
      }
    }
  }

  if (!fs.existsSync(REVIEW_DIR)) fs.mkdirSync(REVIEW_DIR, { recursive: true });
  fs.writeFileSync(
    QUEUE_PATH,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        count: queue.length,
        items: queue,
      },
      null,
      2,
    ),
    'utf-8',
  );
  console.log(`Wrote ${queue.length} items to ${QUEUE_PATH}`);
}

main();

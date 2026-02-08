/**
 * Flag Tier C (authority dilution) media for review.
 * Copies flagged files to tools/media-review-delete/ and logs to tools/media-prune-log.json.
 * Does NOT permanently delete or remove from manifest until review confirmation.
 *
 * Run: npx tsx --tsconfig tsconfig.base.json tools/prune-media-tier-c.ts
 */
import * as fs from 'fs';
import * as path from 'path';
import {
  getMediaManifest,
  isMediaTierC,
  type MediaAsset,
} from '@joelklemmer/content';

const ROOT = path.resolve(__dirname, '..');
const PUBLIC_MEDIA = path.join(ROOT, 'apps', 'web', 'public', 'media');
const REVIEW_DIR = path.join(ROOT, 'tools', 'media-review-delete');
const PRUNE_LOG = path.join(ROOT, 'tools', 'media-prune-log.json');

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function copyFile(src: string, dest: string) {
  ensureDir(path.dirname(dest));
  fs.copyFileSync(src, dest);
}

function main() {
  const manifest = getMediaManifest();
  const tierC = manifest.assets.filter((a: MediaAsset) =>
    isMediaTierC(a.descriptor),
  );
  if (tierC.length === 0) {
    console.log('No Tier C assets in manifest.');
    return;
  }
  ensureDir(REVIEW_DIR);
  const log: Array<{
    id: string;
    file: string;
    descriptor: string;
    copiedAt: string;
  }> = [];
  if (fs.existsSync(PRUNE_LOG)) {
    const existing = JSON.parse(fs.readFileSync(PRUNE_LOG, 'utf-8'));
    if (Array.isArray(existing)) log.push(...existing);
  }
  const loggedIds = new Set(log.map((e) => e.id));
  for (const asset of tierC) {
    const relativePath = asset.file.startsWith('/')
      ? asset.file.slice(1)
      : asset.file;
    const srcPath = path.join(ROOT, relativePath);
    if (!fs.existsSync(srcPath)) {
      console.warn(`Skip (missing): ${srcPath}`);
      continue;
    }
    const destPath = path.join(REVIEW_DIR, path.basename(relativePath));
    copyFile(srcPath, destPath);
    if (!loggedIds.has(asset.id)) {
      log.push({
        id: asset.id,
        file: asset.file,
        descriptor: asset.descriptor,
        copiedAt: new Date().toISOString(),
      });
      loggedIds.add(asset.id);
    }
  }
  fs.writeFileSync(PRUNE_LOG, JSON.stringify(log, null, 2));
  console.log(`Logged ${log.length} Tier C entries. Copies in ${REVIEW_DIR}.`);
}

main();

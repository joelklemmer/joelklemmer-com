/**
 * Media asset ingestion: extract → classify → canonical naming → WebP + derivatives → manifest.
 * Run from repo root: npx tsx --tsconfig tsconfig.base.json tools/ingest-media.ts
 * Source: tools/tmp/photos (extracted from Photos.zip). Do not commit zip or tmp.
 */
import * as fs from 'fs';
import * as path from 'path';
import { createHash } from 'crypto';
import sharp from 'sharp';

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'tools', 'tmp', 'photos', 'Argon');
const MEDIA = path.join(ROOT, 'apps', 'web', 'public', 'media');
const DEFAULT_DATE = '2026-01';

const MASTER_MAX_WIDTH = 2400;
const MASTER_QUALITY = 85;
const HERO_WIDTH = 1600;
const CARD_WIDTH = 1200;
const THUMB_SIZE = 512;

type Category =
  | 'portrait'
  | 'speaking'
  | 'author'
  | 'identity'
  | 'book'
  | 'og'
  | 'ui';
type Kind = 'portrait' | 'speaking' | 'author' | 'identity';
type RecommendedUse = 'hero' | 'avatar' | 'card' | 'press' | 'books';

interface ManifestEntry {
  id: string;
  file: string;
  kind: Kind;
  descriptor: string;
  recommendedUse: RecommendedUse[];
  aspectRatio: number;
  width: number;
  height: number;
  sha256: string;
  alt: string;
}

/** Folder name → [category, descriptor]. Identity uses first N of Dark studio headshots. */
function getCategoryAndDescriptor(
  folderName: string,
  fileIndex: number,
  folderFiles: string[],
): { category: Category; descriptor: string } {
  const slug = folderName
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
  const map: Record<string, { category: Category; descriptor: string }> = {
    'dark-studio-headshots': {
      category: 'portrait',
      descriptor: 'studio-graphite',
    },
    headshots: { category: 'portrait', descriptor: 'studio-formal' },
    'keynote-speaker-photos': {
      category: 'speaking',
      descriptor: 'keynote-podium',
    },
    'bookstore-photos': { category: 'author', descriptor: 'bookstore-stack' },
    'casual-photos': { category: 'portrait', descriptor: 'casual' },
    'city-vogue-photos': { category: 'portrait', descriptor: 'city-vogue' },
    'cozy-home-photos': { category: 'portrait', descriptor: 'cozy-home' },
    'easter-photos': { category: 'portrait', descriptor: 'easter' },
    'fine-dining-photos': { category: 'portrait', descriptor: 'fine-dining' },
    glamour: { category: 'portrait', descriptor: 'glamour' },
    'hot-air-ballon-photos': {
      category: 'portrait',
      descriptor: 'hot-air-balloon',
    },
    'luxury-cruise-photos': {
      category: 'portrait',
      descriptor: 'luxury-cruise',
    },
    'luxury-hotel-photos': { category: 'portrait', descriptor: 'luxury-hotel' },
    'luxury-photos': { category: 'portrait', descriptor: 'luxury' },
    'modeling-photos': { category: 'portrait', descriptor: 'modeling' },
    'outdoor-adventure-photos': {
      category: 'portrait',
      descriptor: 'outdoor-adventure',
    },
    'startup-founder-photos': {
      category: 'portrait',
      descriptor: 'startup-founder',
    },
    'winter-photos': { category: 'portrait', descriptor: 'winter' },
  };
  const normalized = slug.replace(/^photos$/, '');
  let out = map[slug] ?? map[normalized];
  if (!out) out = { category: 'portrait', descriptor: slug || 'editorial' };

  // Identity: first 5 from Dark studio headshots (tight crops for avatar)
  if (slug === 'dark-studio-headshots' && fileIndex < 5) {
    return { category: 'identity', descriptor: 'studio-tight' };
  }
  return out;
}

function sha256Path(filePath: string): string {
  const buf = fs.readFileSync(filePath);
  return createHash('sha256').update(buf).digest('hex');
}

function altFor(kind: Kind, descriptor: string): string {
  const base = 'Joel Klemmer';
  const alts: Record<string, string> = {
    'studio-graphite': 'Studio portrait of Joel Klemmer in a dark suit.',
    'studio-formal': 'Formal headshot of Joel Klemmer.',
    'studio-tight': 'Close-up portrait of Joel Klemmer.',
    'keynote-podium': 'Joel Klemmer speaking at a keynote event.',
    'bookstore-stack': 'Joel Klemmer at a bookstore with his books.',
    casual: 'Casual portrait of Joel Klemmer.',
    'city-vogue': 'Portrait of Joel Klemmer in an urban setting.',
    'cozy-home': 'Portrait of Joel Klemmer in a casual indoor setting.',
    easter: 'Portrait of Joel Klemmer.',
    'fine-dining': 'Portrait of Joel Klemmer in a formal setting.',
    glamour: 'Portrait of Joel Klemmer.',
    'hot-air-balloon': 'Portrait of Joel Klemmer.',
    'luxury-cruise': 'Portrait of Joel Klemmer.',
    'luxury-hotel': 'Portrait of Joel Klemmer.',
    luxury: 'Portrait of Joel Klemmer.',
    modeling: 'Portrait of Joel Klemmer.',
    'outdoor-adventure': 'Portrait of Joel Klemmer in an outdoor setting.',
    'startup-founder': 'Portrait of Joel Klemmer.',
    winter: 'Portrait of Joel Klemmer.',
  };
  return (
    alts[descriptor] ?? `${base} in ${descriptor.replace(/-/g, ' ')} context.`
  );
}

function recommendedUseFor(kind: Kind, descriptor: string): RecommendedUse[] {
  if (kind === 'identity') return ['avatar'];
  if (kind === 'speaking') return ['card', 'press'];
  if (kind === 'author') return ['card', 'books'];
  if (descriptor === 'studio-graphite' || descriptor === 'studio-formal')
    return ['hero', 'card', 'press'];
  return ['card'];
}

async function processImage(
  srcPath: string,
  category: Category,
  descriptor: string,
  yyyyMm: string,
  nn: string,
  manifest: ManifestEntry[],
): Promise<void> {
  const categoryDir = path.join(
    MEDIA,
    category === 'portrait'
      ? 'portraits'
      : category === 'author'
        ? 'author'
        : category === 'speaking'
          ? 'speaking'
          : category === 'identity'
            ? 'identity'
            : 'portraits',
  );
  const baseName = `joel-klemmer__${category}__${descriptor}__${yyyyMm}__${nn}`;
  const masterPath = path.join(categoryDir, `${baseName}.webp`);

  const kind: Kind =
    category === 'portrait'
      ? 'portrait'
      : category === 'book'
        ? 'author'
        : (category as Kind);
  const createDerivatives = [
    'portrait',
    'speaking',
    'author',
    'identity',
  ].includes(category);

  let img = sharp(srcPath);
  const meta = await img.metadata();
  const w = meta.width ?? 0;
  const h = meta.height ?? 0;
  if (w === 0 || h === 0) {
    console.warn('Skip (no dimensions):', srcPath);
    return;
  }

  // Master: max 2400px, quality 85, strip EXIF for consistency
  await img
    .resize(MASTER_MAX_WIDTH, undefined, { withoutEnlargement: true })
    .webp({ quality: MASTER_QUALITY })
    .rotate() // respect orientation
    .toFile(masterPath);

  const masterMeta = await sharp(masterPath).metadata();
  const mw = masterMeta.width ?? w;
  const mh = masterMeta.height ?? h;
  const aspectRatio = mw / mh;
  const sha = sha256Path(masterPath);

  const folderName =
    category === 'portrait'
      ? 'portraits'
      : category === 'author'
        ? 'author'
        : category === 'speaking'
          ? 'speaking'
          : category === 'identity'
            ? 'identity'
            : 'portraits';
  const publicPath = `/media/${folderName}/${baseName}.webp`;
  const stableId = `${category}-${descriptor}-${yyyyMm}-${nn}`.replace(
    /__/g,
    '-',
  );

  manifest.push({
    id: stableId,
    file: publicPath,
    kind: kind,
    descriptor,
    recommendedUse: recommendedUseFor(kind, descriptor),
    aspectRatio: Math.round(aspectRatio * 100) / 100,
    width: mw,
    height: mh,
    sha256: sha,
    alt: altFor(kind, descriptor),
  });

  if (createDerivatives) {
    const base = path.join(categoryDir, baseName);
    const pipeline = sharp(masterPath);

    // Hero: 1600px wide
    await pipeline
      .clone()
      .resize(HERO_WIDTH, undefined, { withoutEnlargement: true })
      .webp({ quality: 84 })
      .toFile(`${base}__hero.webp`);

    // Card: 1200px wide (3:2 crop-safe; resize only, no aggressive crop)
    await sharp(masterPath)
      .resize(CARD_WIDTH, undefined, { withoutEnlargement: true })
      .webp({ quality: 84 })
      .toFile(`${base}__card.webp`);

    // Thumb: 512 square centered crop
    const thumbPipe = sharp(masterPath);
    const thumbMeta = await thumbPipe.metadata();
    const tw = thumbMeta.width!;
    const th = thumbMeta.height!;
    const size = Math.min(THUMB_SIZE, tw, th);
    const left = Math.floor((tw - size) / 2);
    const top = Math.floor((th - size) / 2);
    await thumbPipe
      .extract({ left, top, width: size, height: size })
      .resize(THUMB_SIZE, THUMB_SIZE)
      .webp({ quality: 82 })
      .toFile(`${base}__thumb.webp`);
  }
}

function ensureDir(p: string) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

async function main() {
  if (!fs.existsSync(SRC)) {
    console.error(
      'Source not found. Extract Photos.zip to tools/tmp/photos first.',
    );
    process.exit(1);
  }

  [
    path.join(MEDIA, 'portraits'),
    path.join(MEDIA, 'speaking'),
    path.join(MEDIA, 'author'),
    path.join(MEDIA, 'identity'),
    path.join(MEDIA, 'og'),
  ].forEach(ensureDir);

  const manifest: ManifestEntry[] = [];
  const descriptorCount: Record<string, number> = {};

  const folders = fs
    .readdirSync(SRC, { withFileTypes: true })
    .filter((d) => d.isDirectory());
  for (const dir of folders) {
    const folderPath = path.join(SRC, dir.name);
    const files = fs
      .readdirSync(folderPath)
      .filter((f) => /\.(jpg|jpeg|png|webp)$/i.test(f));
    if (files.length === 0) continue;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const { category, descriptor } = getCategoryAndDescriptor(
        dir.name,
        i,
        files,
      );
      const key = `${category}-${descriptor}`;
      descriptorCount[key] = (descriptorCount[key] ?? 0) + 1;
      const nn = String(descriptorCount[key]).padStart(2, '0');
      const srcPath = path.join(folderPath, file);
      await processImage(
        srcPath,
        category,
        descriptor,
        DEFAULT_DATE,
        nn,
        manifest,
      );
    }
  }

  const manifestPath = path.join(MEDIA, 'manifest.json');
  fs.writeFileSync(
    manifestPath,
    JSON.stringify({ assets: manifest }, null, 2),
    'utf-8',
  );
  console.log('Manifest written:', manifestPath, 'entries:', manifest.length);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

/**
 * Generate 1200x630 OpenGraph images from best portrait. Minimal, token-aligned.
 * Run: npx tsx --tsconfig tsconfig.base.json tools/generate-og.ts
 */
import * as fs from 'fs';
import * as path from 'path';
import sharp from 'sharp';

const ROOT = path.resolve(__dirname, '..');
const MEDIA = path.join(ROOT, 'apps', 'web', 'public', 'media');
const OG_WIDTH = 1200;
const OG_HEIGHT = 630;
const SOURCE = path.join(
  MEDIA,
  'portraits',
  'joel-klemmer__portrait__studio-graphite__2026-01__01.webp',
);
const OG_SLUGS = [
  'home',
  'brief',
  'publicrecord',
  'casestudies',
  'books',
  'media',
];

async function main() {
  if (!fs.existsSync(SOURCE)) {
    console.warn('Source portrait not found, skipping OG generation.');
    return;
  }
  const ogDir = path.join(MEDIA, 'og');
  if (!fs.existsSync(ogDir)) fs.mkdirSync(ogDir, { recursive: true });

  const img = sharp(SOURCE);
  const meta = await img.metadata();
  const w = meta.width!;
  const h = meta.height!;
  const aspect = OG_WIDTH / OG_HEIGHT;
  const currentAspect = w / h;
  let pipeline: sharp.Sharp;
  if (currentAspect > aspect) {
    const cropH = Math.min(h, Math.round(w / aspect));
    const top = Math.max(0, Math.floor((h - cropH) / 2));
    pipeline = sharp(SOURCE).extract({ left: 0, top, width: w, height: cropH });
  } else {
    const cropW = Math.min(w, Math.round(h * aspect));
    const left = Math.max(0, Math.floor((w - cropW) / 2));
    pipeline = sharp(SOURCE).extract({ left, top: 0, width: cropW, height: h });
  }
  const buf = await pipeline
    .resize(OG_WIDTH, OG_HEIGHT)
    .webp({ quality: 86 })
    .toBuffer();

  for (const slug of OG_SLUGS) {
    const outPath = path.join(
      ogDir,
      `joel-klemmer__og__${slug}__2026-01__01.webp`,
    );
    fs.writeFileSync(outPath, buf);
    console.log('Wrote', outPath);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

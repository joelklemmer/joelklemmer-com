/**
 * Generate favicon and app icons from canonical headshot.
 * Run: npx tsx --tsconfig tsconfig.base.json tools/generate-icons.ts
 * Requires: sharp (already a project dep)
 */
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const sharp = require('sharp') as typeof import('sharp');

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const publicDir = path.join(projectRoot, 'apps', 'web', 'public');
const iconsDir = path.join(publicDir, 'icons');

const SOURCE_IMAGE = path.join(
  publicDir,
  'media',
  'portraits',
  'joel-klemmer__portrait__studio-graphite__2026-01__01.webp',
);

const ICONS = [
  { name: 'favicon-16x16.png', size: 16 },
  { name: 'favicon-32x32.png', size: 32 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'android-chrome-192x192.png', size: 192 },
  { name: 'android-chrome-512x512.png', size: 512 },
] as const;

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

async function generatePngs() {
  if (!fs.existsSync(SOURCE_IMAGE)) {
    console.warn(
      `Source image not found: ${SOURCE_IMAGE}. Creating placeholder icons.`,
    );
    await createPlaceholderIcons();
    return;
  }

  ensureDir(iconsDir);
  const pipeline = sharp(SOURCE_IMAGE).resize(512, 512, { fit: 'cover' });

  for (const { name, size } of ICONS) {
    const outPath = path.join(iconsDir, name);
    await pipeline.clone().resize(size, size).png().toFile(outPath);
    console.log(`Wrote ${path.relative(projectRoot, outPath)}`);
  }
}

async function createPlaceholderIcons() {
  ensureDir(iconsDir);
  const buffer = await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 3,
      background: { r: 30, g: 30, b: 35 },
    },
  })
    .png()
    .toBuffer();

  const pipeline = sharp(buffer);
  for (const { name, size } of ICONS) {
    const outPath = path.join(iconsDir, name);
    await pipeline.clone().resize(size, size).png().toFile(outPath);
    console.log(`Wrote placeholder ${path.relative(projectRoot, outPath)}`);
  }
}

/** ICO can embed PNG. Format: 6-byte header + 16-byte dir entry + PNG bytes. */
async function generateFaviconIco() {
  const favicon32 = path.join(iconsDir, 'favicon-32x32.png');
  const favicon16 = path.join(iconsDir, 'favicon-16x16.png');
  const outPath = path.join(iconsDir, 'favicon.ico');

  if (!fs.existsSync(favicon32) || !fs.existsSync(favicon16)) {
    console.warn('Skipping favicon.ico: 16/32 PNGs missing');
    return;
  }

  const png16 = await sharp(favicon16).png().toBuffer();
  const png32 = await sharp(favicon32).png().toBuffer();

  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(2, 4);

  const offset = 6 + 16 * 2;
  const dir16 = Buffer.alloc(16);
  dir16[0] = 16;
  dir16[1] = 16;
  dir16[2] = 0;
  dir16[3] = 0;
  dir16[4] = 1;
  dir16[5] = 0;
  dir16.writeUInt16LE(32, 6);
  dir16.writeUInt32LE(png16.length, 8);
  dir16.writeUInt32LE(offset, 12);

  const dir32 = Buffer.alloc(16);
  dir32[0] = 32;
  dir32[1] = 32;
  dir32[2] = 0;
  dir32[3] = 0;
  dir32[4] = 1;
  dir32[5] = 0;
  dir32.writeUInt16LE(32, 6);
  dir32.writeUInt32LE(png32.length, 8);
  dir32.writeUInt32LE(offset + png16.length, 12);

  const ico = Buffer.concat([header, dir16, dir32, png16, png32]);
  fs.writeFileSync(outPath, ico);
  console.log(`Wrote ${path.relative(projectRoot, outPath)}`);
}

async function generateSafariPinnedTab() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" fill="#1e1e23"/><text x="16" y="22" font-family="system-ui,sans-serif" font-size="18" font-weight="600" fill="white" text-anchor="middle">J</text></svg>`;
  const outPath = path.join(iconsDir, 'safari-pinned-tab.svg');
  fs.writeFileSync(outPath, svg);
  console.log(`Wrote ${path.relative(projectRoot, outPath)}`);
}

async function main() {
  await generatePngs();
  await generateSafariPinnedTab();
  try {
    await generateFaviconIco();
  } catch (e) {
    console.warn('favicon.ico generation skipped:', (e as Error).message);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

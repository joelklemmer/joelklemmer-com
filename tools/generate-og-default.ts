/**
 * Generate default OG image (1200x630) from canonical headshot.
 * Run: npx tsx --tsconfig tsconfig.base.json tools/generate-og-default.ts
 */
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const sharp = require('sharp') as typeof import('sharp');

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const publicDir = path.join(projectRoot, 'apps', 'web', 'public');
const ogDir = path.join(publicDir, 'og');

const SOURCE = path.join(
  publicDir,
  'media',
  'portraits',
  'joel-klemmer__portrait__studio-graphite__2026-01__01.webp',
);

const WIDTH = 1200;
const HEIGHT = 630;

async function main() {
  if (!fs.existsSync(SOURCE)) {
    const placeholder = await sharp({
      create: {
        width: WIDTH,
        height: HEIGHT,
        channels: 3,
        background: { r: 30, g: 30, b: 35 },
      },
    })
      .png()
      .toBuffer();
    if (!fs.existsSync(ogDir)) fs.mkdirSync(ogDir, { recursive: true });
    const outPath = path.join(ogDir, 'default.png');
    fs.writeFileSync(outPath, placeholder);
    console.log(`Wrote placeholder ${path.relative(projectRoot, outPath)}`);
    return;
  }

  if (!fs.existsSync(ogDir)) fs.mkdirSync(ogDir, { recursive: true });
  const outPath = path.join(ogDir, 'default.png');

  await sharp(SOURCE)
    .resize(WIDTH, HEIGHT, { fit: 'cover', position: 'center' })
    .png()
    .toFile(outPath);

  console.log(`Wrote ${path.relative(projectRoot, outPath)}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
